import { Router, Request, Response } from 'express'
import { authenticate, AuthRequest } from '../middlewares/auth'
import { generateQuiz, submitQuizAnswers } from '../services/quizService'
import { prisma } from '../server'

const router = Router()

// Gerar quiz
router.get('/generate', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { difficulty, book, type, count } = req.query
    const quiz = await generateQuiz(req.userId!, {
      difficulty: difficulty as string,
      book: book as string,
      type: type as string,
      count: count ? parseInt(count as string) : 10
    })
    res.json(quiz)
  } catch (error) {
    console.error('Erro ao gerar quiz:', error)
    res.status(500).json({ error: 'Erro ao gerar quiz.' })
  }
})

// Submeter respostas
router.post('/submit', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { answers, difficulty, book, gameType } = req.body

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      res.status(400).json({ error: 'Respostas são obrigatórias.' })
      return
    }

    const result = await submitQuizAnswers(
      req.userId!,
      gameType || 'quiz',
      answers,
      difficulty,
      book
    )

    res.json(result)
  } catch (error) {
    console.error('Erro ao submeter quiz:', error)
    res.status(500).json({ error: 'Erro ao processar respostas.' })
  }
})

// Histórico de jogos
router.get('/history', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = 20
    const skip = (page - 1) * limit

    const [sessions, total] = await Promise.all([
      prisma.gameSession.findMany({
        where: { userId: req.userId! },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.gameSession.count({ where: { userId: req.userId! } })
    ])

    res.json({ sessions, total, pages: Math.ceil(total / limit) })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar histórico.' })
  }
})

// Estatísticas do usuário
router.get('/stats', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!

    const [totalSessions, totalCorrect, totalAnswered, byDifficulty, byType] = await Promise.all([
      prisma.gameSession.count({ where: { userId } }),
      prisma.gameAnswer.aggregate({ where: { session: { userId }, correct: true }, _count: true }),
      prisma.gameAnswer.aggregate({ where: { session: { userId } }, _count: true }),
      prisma.gameSession.groupBy({
        by: ['difficulty'],
        where: { userId },
        _count: true,
        _avg: { score: true }
      }),
      prisma.gameSession.groupBy({
        by: ['gameType'],
        where: { userId },
        _count: true,
        _avg: { score: true }
      })
    ])

    res.json({
      totalSessions,
      totalCorrect: totalCorrect._count,
      totalAnswered: totalAnswered._count,
      accuracy: totalAnswered._count > 0 ? Math.round((totalCorrect._count / totalAnswered._count) * 100) : 0,
      byDifficulty,
      byType
    })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas.' })
  }
})

export default router
