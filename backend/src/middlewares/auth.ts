import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { prisma } from '../prisma'

export interface AuthRequest extends Request {
  userId?: string
  userRole?: string
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token de acesso não fornecido.' })
    return
  }

  const token = header.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string }
    req.userId = decoded.userId
    req.userRole = decoded.role
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado.' })
  }
}

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  // CFG-03: Buscar role atualizada do banco em vez de confiar no JWT stale
  if (!req.userId) {
    res.status(401).json({ error: 'Autenticação necessária.' })
    return
  }

  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { role: true }
  })

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    res.status(403).json({ error: 'Acesso restrito a administradores.' })
    return
  }

  req.userRole = user.role
  next()
}

export function generateTokens(userId: string, role: string) {
  const accessToken = jwt.sign({ userId, role }, process.env.JWT_SECRET!, { expiresIn: '7d' })
  const refreshToken = jwt.sign({ userId, role }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '30d' })
  return { accessToken, refreshToken }
}
