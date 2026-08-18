import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middlewares/auth'
import { prisma } from '../prisma'
import { awardXP, XP_REWARDS } from '../services/xpService'

const router = Router()

// Obter desafio diário
router.get('/today', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date().toISOString().slice(0, 10)

    let progress = await prisma.dailyChallenge.findUnique({
      where: { userId_date: { userId: req.userId!, date: today } }
    })

    if (!progress) {
      // Buscar 10 perguntas aleatórias para o desafio
      const questions = await prisma.$queryRawUnsafe<any[]>(
        `SELECT id, text, type, "optionA", "optionB", "optionC", "optionD", answer, explanation,
                book, chapter, verse, difficulty, category, xp
         FROM questions WHERE active = true ORDER BY RANDOM() LIMIT 10`
      )

      progress = await prisma.dailyChallenge.create({
        data: {
          userId: req.userId!,
          date: today,
          total: questions.length,
        }
      })

      res.json({
        date: today,
        completed: false,
        score: 0,
        total: questions.length,
        xpEarned: 0,
        questions: questions.map(q => ({
          ...q,
          options: q.type === 'multiple_choice' || q.type === 'who_said'
            ? [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean)
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

    const questions = await prisma.$queryRawUnsafe<any[]>(
      `SELECT id, text, type, "optionA", "optionB", "optionC", "optionD", answer, explanation,
              book, chapter, verse, difficulty, category, xp
       FROM questions WHERE active = true ${ids.length > 0 ? `AND id NOT IN (${ids.map(id => `'${id}'`).join(',')})` : ''}
       ORDER BY RANDOM() LIMIT ${10 - progress.score}`
    )

    res.json({
      date: today,
      completed: false,
      score: progress.score,
      total: progress.total,
      xpEarned: progress.xpEarned,
      questions: questions.map(q => ({
        ...q,
        options: q.type === 'multiple_choice' || q.type === 'who_said'
          ? [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean)
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

    const correct = question.answer.toLowerCase().trim() === answer.toLowerCase().trim()

    // Criar sessão de jogo para a resposta
    const session = await prisma.gameSession.findFirst({
      where: { userId: req.userId!, gameType: 'daily', createdAt: { gte: new Date(today) } }
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
