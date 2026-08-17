import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middlewares/auth'
import { prisma } from '../server'

const router = Router()

// Ranking global
router.get('/global', async (_req, res: Response): Promise<void> => {
  try {
    const rankings = await prisma.ranking.findMany({
      where: { period: 'global' },
      include: { user: { select: { id: true, name: true, avatar: true, level: true, title: true } } },
      orderBy: { xp: 'desc' },
      take: 100
    })

    res.json(rankings.map((r, i) => ({ ...r, position: i + 1 })))
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar ranking.' })
  }
})

// Ranking semanal
router.get('/weekly', async (req, res: Response): Promise<void> => {
  try {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const weekKey = startOfWeek.toISOString().slice(0, 10)

    // Buscar sessões da semana e agrupar por XP
    const sessions = await prisma.gameSession.findMany({
      where: { createdAt: { gte: startOfWeek } },
      include: { user: { select: { id: true, name: true, avatar: true, level: true, title: true } } }
    })

    const userXP = new Map<string, { user: any; xp: number; games: number; correct: number; total: number }>()

    for (const s of sessions) {
      const existing = userXP.get(s.userId)
      if (existing) {
        existing.xp += s.totalXP
        existing.games += 1
        existing.correct += s.correct
        existing.total += s.total
      } else {
        userXP.set(s.userId, { user: s.user, xp: s.totalXP, games: 1, correct: s.correct, total: s.total })
      }
    }

    const sorted = Array.from(userXP.entries())
      .sort(([, a], [, b]) => b.xp - a.xp)
      .slice(0, 100)
      .map(([userId, data], i) => ({
        position: i + 1,
        userId,
        ...data,
        accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
        week: weekKey
      }))

    res.json(sorted)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar ranking semanal.' })
  }
})

// Posição do usuário
router.get('/my-position', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRanking = await prisma.ranking.findUnique({
      where: { userId_period: { userId: req.userId!, period: 'global' } }
    })

    if (!userRanking) {
      res.json({ position: null, xp: 0 })
      return
    }

    const position = await prisma.ranking.count({
      where: { period: 'global', xp: { gt: userRanking.xp } }
    })

    res.json({ position: position + 1, xp: userRanking.xp })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar posição.' })
  }
})

export default router
