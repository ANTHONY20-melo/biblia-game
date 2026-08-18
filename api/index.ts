import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

import authRoutes from '../backend/src/routes/auth'
import quizRoutes from '../backend/src/routes/quiz'
import questionRoutes from '../backend/src/routes/questions'
import userRoutes from '../backend/src/routes/users'
import rankingRoutes from '../backend/src/routes/ranking'
import achievementRoutes from '../backend/src/routes/achievements'
import bibleRoutes from '../backend/src/routes/bible'
import dailyRoutes from '../backend/src/routes/daily'

const app = express()

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: '*', credentials: true }))
app.use(express.json({ limit: '1mb' }))

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

// Vercel serverless handler — SEM Socket.IO (WebSocket não funciona em serverless)
export default async function handler(req: any, res: any) {
  return app(req, res)
}
