import { Router, Response } from 'express'
import { prisma } from '../server'

const router = Router()

// Listar todos os livros
router.get('/books', async (_req, res: Response): Promise<void> => {
  try {
    const books = await prisma.bibleBook.findMany({ orderBy: { order: 'asc' } })
    res.json(books)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar livros.' })
  }
})

// Livros do antigo testamento
router.get('/books/old', async (_req, res: Response): Promise<void> => {
  try {
    const books = await prisma.bibleBook.findMany({
      where: { testament: 'old' },
      orderBy: { order: 'asc' }
    })
    res.json(books)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar livros.' })
  }
})

// Livros do novo testamento
router.get('/books/new', async (_req, res: Response): Promise<void> => {
  try {
    const books = await prisma.bibleBook.findMany({
      where: { testament: 'new' },
      orderBy: { order: 'asc' }
    })
    res.json(books)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar livros.' })
  }
})

// Perguntas por livro
router.get('/books/:book/questions', async (req, res: Response): Promise<void> => {
  try {
    const { book } = req.params
    const difficulty = req.query.difficulty as string

    const where: any = { book, active: true }
    if (difficulty) where.difficulty = difficulty

    const count = await prisma.question.count({ where })
    res.json({ book, count, hasQuestions: count > 0 })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar perguntas do livro.' })
  }
})

export default router
