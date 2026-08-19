import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middlewares/auth'
import { prisma } from '../prisma'
import { awardXP, XP_REWARDS } from '../services/xpService'

const router = Router()

// Normaliza respostas de true_false: UI mostra "Verdadeiro"/"Falso", banco guarda "True"/"False"
function normalizeAnswer(type: string | undefined, answer: string): string {
  const t = (answer || '').trim().toLowerCase()
  if (type === 'true_false') {
    if (t === 'verdadeiro' || t === 'true' || t === 'v') return 'true'
    if (t === 'falso' || t === 'false' || t === 'f') return 'false'
  }
  return t
}

// Obter desafio diário
router.get('/today', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date().toISOString().slice(0, 10)

    let progress = await prisma.dailyChallenge.findUnique({
      where: { userId_date: { userId: req.userId!, date: today } }
    })

    if (!progress) {
      // CRIT-01: NÃO enviar campo 'answer' ao client (anti-cheating)
      // CRIT-02: Usar parâmetros prepared (neste caso sem parâmetros, mas seguro)
      const questions = await prisma.$queryRawUnsafe<unknown[]>(
        `SELECT id, text, type, "optionA", "optionB", "optionC", "optionD", answer, explanation,
                book, chapter, verse, difficulty, category, xp
         FROM questions WHERE active = true ORDER BY RANDOM() LIMIT 10`
      )

      const typedQuestions = questions as Record<string, unknown>[]

      progress = await prisma.dailyChallenge.create({
        data: {
          userId: req.userId!,
          date: today,
          total: typedQuestions.length,
        }
      })

      res.json({
        date: today,
        completed: false,
        score: 0,
        total: typedQuestions.length,
        xpEarned: 0,
        questions: typedQuestions.map(q => ({
          ...q,
          options: q.type === 'multiple_choice' || q.type === 'who_said'
            ? [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean)
            : q.type === 'true_false'
              ? ['True', 'False']
              : undefined
        }))
      })
      return
    }

    if (progress.completed) {
      res.json({
        date: today,
        completed: true,
        score: progress.score,
        total: progress.total,
        xpEarned: progress.xpEarned
      })
      return
    }

    // Buscar perguntas restantes
    const answeredIds = await prisma.gameAnswer.findMany({
      where: { session: { userId: req.userId!, gameType: 'daily' } },
      select: { questionId: true }
    })
    const ids = answeredIds.map(a => a.questionId)

    // CRIT-02: Usar parâmetros prepared para IDs (prevenir SQL injection)
    const remaining = 10 - progress.score
    let questions: unknown[]

    if (ids.length > 0) {
      const params: unknown[] = [...ids, remaining]
      const placeholders = ids.map((_, i) => `$${i + 1}`).join(',')
      questions = await prisma.$queryRawUnsafe<unknown[]>(
        `SELECT id, text, type, "optionA", "optionB", "optionC", "optionD", answer, explanation,
                book, chapter, verse, difficulty, category, xp
         FROM questions WHERE active = true AND id NOT IN (${placeholders})
         ORDER BY RANDOM() LIMIT $${ids.length + 1}`,
        ...params
      )
    } else {
      questions = await prisma.$queryRawUnsafe<unknown[]>(
        `SELECT id, text, type, "optionA", "optionB", "optionC", "optionD", answer, explanation,
                book, chapter, verse, difficulty, category, xp
         FROM questions WHERE active = true
         ORDER BY RANDOM() LIMIT $1`,
        remaining
      )
    }

    const typedQuestions = questions as Record<string, unknown>[]

    res.json({
      date: today,
      completed: false,
      score: progress.score,
      total: progress.total,
      xpEarned: progress.xpEarned,
      questions: typedQuestions.map(q => ({
        ...q,
        options: q.type === 'multiple_choice' || q.type === 'who_said'
          ? [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean)
          : q.type === 'true_false'
            ? ['True', 'False']
            : undefined
      }))
    })
  } catch (error) {
    console.error('Erro ao buscar desafio diário:', error)
    res.status(500).json({ error: 'Erro ao buscar desafio diário.' })
  }
})

// Submeter resposta do desafio diário
router.post('/answer', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { questionId, answer, timeSpent } = req.body
    const today = new Date().toISOString().slice(0, 10)

    const question = await prisma.question.findUnique({ where: { id: questionId } })
    if (!question) {
      res.status(404).json({ error: 'Pergunta não encontrada.' })
      return
    }

    const correct = normalizeAnswer(question.type, question.answer) === normalizeAnswer(question.type, answer)

    // API-03: Usar início do dia UTC corretamente
    const startOfDay = new Date(today + 'T00:00:00.000Z')

    // Criar sessão de jogo para a resposta
    const session = await prisma.gameSession.findFirst({
      where: { userId: req.userId!, gameType: 'daily', createdAt: { gte: startOfDay } }
    })

    let sessionId: string
    if (!session) {
      const newSession = await prisma.gameSession.create({
        data: { userId: req.userId!, gameType: 'daily', difficulty: 'daily' }
      })
      sessionId = newSession.id
    } else {
      sessionId = session.id
    }

    await prisma.gameAnswer.create({
      data: {
        sessionId,
        questionId,
        userAnswer: answer,
        correct,
        xpEarned: correct ? XP_REWARDS.correct_answer : 0,
        timeSpent
      }
    })

    // Atualizar progresso
    const progress = await prisma.dailyChallenge.update({
      where: { userId_date: { userId: req.userId!, date: today } },
      data: {
        score: correct ? { increment: 1 } : undefined,
        completed: false
      }
    })

    // Verificar se completou
    if (progress.score >= progress.total) {
      // Completou! Dar XP bônus
      const bonusXP = XP_REWARDS.daily_complete
      await prisma.dailyChallenge.update({
        where: { userId_date: { userId: req.userId!, date: today } },
        data: { completed: true, xpEarned: { increment: bonusXP } }
      })

      await awardXP(req.userId!, bonusXP, 'Desafio diário completo')

      res.json({ correct, xpEarned: XP_REWARDS.correct_answer + bonusXP, completed: true, explanation: question.explanation, correctAnswer: question.answer })
      return
    }

    res.json({ correct, xpEarned: correct ? XP_REWARDS.correct_answer : 0, completed: false, explanation: question.explanation, correctAnswer: question.answer })
  } catch (error) {
    console.error('Erro ao responder desafio diário:', error)
    res.status(500).json({ error: 'Erro ao processar resposta.' })
  }
})

export default router
