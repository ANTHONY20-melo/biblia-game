import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middlewares/auth'
import { prisma } from '../prisma'
import { calculateLevel } from '../services/xpService'

const router = Router()

// Perfil público de qualquer usuário
router.get('/:id', async (req, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        profile: true,
        achievements: { include: { achievement: true }, orderBy: { unlockedAt: 'desc' }, take: 10 }
      },
      select: {
        id: true, name: true, avatar: true, xp: true, level: true, title: true,
        streak: true, createdAt: true, profile: true, achievements: true
      }
    })

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado.' })
      return
    }

    const levelInfo = calculateLevel(user.xp)
    res.json({ ...user, ...levelInfo })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar perfil.' })
  }
})

// Buscar usuário por nome (para batalha)
router.get('/search/:name', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      where: { name: { contains: req.params.name, mode: 'insensitive' }, id: { not: req.userId! } },
      select: { id: true, name: true, avatar: true, level: true, title: true },
      take: 10
    })
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: 'Erro na busca.' })
  }
})

export default router
