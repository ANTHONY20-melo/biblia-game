import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../prisma'
import { generateTokens, AuthRequest } from '../middlewares/auth'

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, senha e nome são obrigatórios.' })
      return
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' })
      return
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      res.status(409).json({ error: 'Este email já está cadastrado.' })
      return
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        profile: { create: {} }
      },
      select: { id: true, email: true, name: true, xp: true, level: true, title: true, createdAt: true }
    })

    const tokens = generateTokens(user.id, 'player')

    res.status(201).json({ user, ...tokens })
  } catch (error) {
    console.error('Erro no registro:', error)
    res.status(500).json({ error: 'Erro interno do servidor.' })
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: 'Email e senha são obrigatórios.' })
      return
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { profile: true }
    })

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: 'Email ou senha incorretos.' })
      return
    }

    // Atualizar último acesso e verificar streak
    const now = new Date()
    const lastActive = user.lastActiveAt
    let newStreak = user.streak

    if (lastActive) {
      const diffMs = now.getTime() - lastActive.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      if (diffDays === 1) {
        newStreak = user.streak + 1
      } else if (diffDays > 1) {
        newStreak = 1
      }
    } else {
      newStreak = 1
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: now, streak: newStreak }
    })

    const tokens = generateTokens(user.id, user.role)

    const { password: _, ...safeUser } = user
    res.json({ user: safeUser, ...tokens })
  } catch (error) {
    console.error('Erro no login:', error)
    res.status(500).json({ error: 'Erro interno do servidor.' })
  }
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      include: {
        profile: true,
        achievements: { include: { achievement: true } }
      }
    })

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado.' })
      return
    }

    const { password: _, ...safeUser } = user
    res.json(safeUser)
  } catch (error) {
    console.error('Erro ao buscar perfil:', error)
    res.status(500).json({ error: 'Erro interno do servidor.' })
  }
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, bio, church, avatar } = req.body

    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar }),
        ...(bio !== undefined || church !== undefined ? {
          profile: {
            upsert: {
              create: { bio: bio || '', church: church || '' },
              update: { ...(bio !== undefined && { bio }), ...(church !== undefined && { church }) }
            }
          }
        } : {})
      },
      include: { profile: true },
      select: {
        id: true, email: true, name: true, xp: true, level: true,
        title: true, avatar: true, streak: true, coins: true, createdAt: true,
        profile: true
      }
    })

    res.json(user)
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    res.status(500).json({ error: 'Erro interno do servidor.' })
  }
}
