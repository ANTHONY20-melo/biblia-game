import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { Server } from 'socket.io'

import authRoutes from './routes/auth'
import quizRoutes from './routes/quiz'
import questionRoutes from './routes/questions'
import userRoutes from './routes/users'
import rankingRoutes from './routes/ranking'
import achievementRoutes from './routes/achievements'
import bibleRoutes from './routes/bible'
import dailyRoutes from './routes/daily'
import { prisma } from './prisma'

export { prisma }

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:5173', methods: ['GET', 'POST'] }
})

// ─── MIDDLEWARES GLOBAIS ─────────────────────────────────

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }))
app.use(express.json({ limit: '1mb' }))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' }
})
app.use('/api/', limiter)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Muitas tentativas de login. Aguarde 15 minutos.' }
})
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

// ─── ROTAS ──────────────────────────────────────────────

app.use('/api/auth', authRoutes)
app.use('/api/quiz', quizRoutes)
app.use('/api/questions', questionRoutes)
app.use('/api/users', userRoutes)
app.use('/api/ranking', rankingRoutes)
app.use('/api/achievements', achievementRoutes)
app.use('/api/bible', bibleRoutes)
app.use('/api/daily', dailyRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ─── SOCKET.IO (Batalha multiplayer futuro) ──────────────

io.on('connection', (socket) => {
  console.log(`⚡ Jogador conectado: ${socket.id}`)

  socket.on('join-room', (roomId: string) => {
    socket.join(roomId)
    io.to(roomId).emit('player-joined', { playerId: socket.id })
  })

  socket.on('answer', (data: { roomId: string; answer: string; time: number }) => {
    io.to(data.roomId).emit('opponent-answered', { playerId: socket.id, time: data.time })
  })

  socket.on('disconnect', () => {
    console.log(`👋 Jogador desconectado: ${socket.id}`)
  })
})

// ─── INICIAR SERVIDOR ───────────────────────────────────

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║     ⛪  BÍBLIA GAME — BACKEND  ⛪       ║
  ║  "Conheça a Palavra. Desafie seus       ║
  ║   conhecimentos. Viva a Bíblia."        ║
  ╠══════════════════════════════════════════╣
  ║  🌐 Server: http://localhost:${String(PORT).padEnd(5)} ║
  ║  📡 WebSocket: habilitado               ║
  ║  🔐 Auth: JWT + Rate Limiting           ║
  ╚══════════════════════════════════════════╝
  `)
})

export { io }
