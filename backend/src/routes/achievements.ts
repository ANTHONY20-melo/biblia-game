import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middlewares/auth'
import { prisma } from '../prisma'
import { checkAndAwardAchievements, seedAchievements } from '../services/achievementService'

const router = Router()

// Listar todas as conquistas
router.get('/', async (_req, res: Response): Promise<void> => {
  try {
    const achievements = await prisma.achievement.findMany({ orderBy: { category: 'asc' } })
    res.json(achievements)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar conquistas.' })
  }
})

// Conquistas do usuário
router.get('/my', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [allAchievements, userAchievements] = await Promise.all([
      prisma.achievement.findMany({ orderBy: { category: 'asc' } }),
      prisma.userAchievement.findMany({
        where: { userId: req.userId! },
        include: { achievement: true }
      })
    ])

    const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId))

    const result = allAchievements.map(ach => ({
      ...ach,
      unlocked: unlockedIds.has(ach.id),
      unlockedAt: userAchievements.find(ua => ua.achievementId === ach.id)?.unlockedAt || null
    }))

    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar conquistas.' })
  }
})

// Verificar e conceder conquistas (chamado após cada jogo)
router.post('/check', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const newAchievements = await checkAndAwardAchievements(req.userId!)
    res.json({ newAchievements })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao verificar conquistas.' })
  }
})

// Seed (admin)
router.post('/seed', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.userRole !== 'admin' && req.userRole !== 'super_admin') {
      res.status(403).json({ error: 'Apenas admins.' })
      return
    }
    const count = await seedAchievements()
    res.json({ message: `${count} conquistas criadas/atualizadas.` })
  } catch (error) {
    res.status(500).json({ error: 'Erro no seed.' })
  }
})

export default router
