import { Router, Response } from 'express'
import { authenticate, AuthRequest, requireAdmin } from '../middlewares/auth'
import { prisma } from '../prisma'

const router = Router()

// Listar perguntas (admin)
router.get('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = 50
    const skip = (page - 1) * limit

    const where: any = {}
    if (req.query.book) where.book = req.query.book
    if (req.query.difficulty) where.difficulty = req.query.difficulty
    if (req.query.category) where.category = req.query.category
    if (req.query.type) where.type = req.query.type

    const [questions, total] = await Promise.all([
      prisma.question.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.question.count({ where })
    ])

    res.json({ questions, total, pages: Math.ceil(total / limit) })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar perguntas.' })
  }
})

// Criar pergunta (admin)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { text, type, optionA, optionB, optionC, optionD, answer, explanation, book, chapter, verse, difficulty, category, xp } = req.body

    if (!text || !type || !answer || !book) {
      res.status(400).json({ error: 'Campos obrigatórios: text, type, answer, book' })
      return
    }

    const question = await prisma.question.create({
      data: { text, type, optionA, optionB, optionC, optionD, answer, explanation, book, chapter, verse, difficulty, category, xp }
    })

    res.status(201).json(question)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar pergunta.' })
  }
})

// Criar perguntas em lote (admin)
router.post('/bulk', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { questions } = req.body
    if (!questions || !Array.isArray(questions)) {
      res.status(400).json({ error: 'Array de perguntas obrigatório.' })
      return
    }

    const created = await prisma.question.createMany({
      data: questions.map((q: any) => ({
        text: q.text,
        type: q.type || 'multiple_choice',
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        answer: q.answer,
        explanation: q.explanation || '',
        book: q.book,
        chapter: q.chapter,
        verse: q.verse,
        difficulty: q.difficulty || 'easy',
        category: q.category || 'Geral',
        xp: q.xp || 100
      })),
      skipDuplicates: true
    })

    res.status(201).json({ created: created.count })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar perguntas em lote.' })
  }
})

// Estatísticas gerais de perguntas (requer autenticação)
router.get('/stats', authenticate, async (_req, res: Response): Promise<void> => {
  try {
    const [total, byDifficulty, byBook, byType] = await Promise.all([
      prisma.question.count({ where: { active: true } }),
      prisma.question.groupBy({ by: ['difficulty'], where: { active: true }, _count: true }),
      prisma.question.groupBy({ by: ['book'], where: { active: true }, _count: true, orderBy: { _count: { book: 'desc' } } }),
      prisma.question.groupBy({ by: ['type'], where: { active: true }, _count: true })
    ])

    res.json({ total, byDifficulty, byBook: byBook.slice(0, 20), byType })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas.' })
  }
})

export default router
