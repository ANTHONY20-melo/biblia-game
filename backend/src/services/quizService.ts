import { prisma } from '../server'

interface QuizOptions {
  difficulty?: string
  book?: string
  type?: string
  count?: number
}

export async function generateQuiz(userId: string, options: QuizOptions) {
  const count = Math.min(options.count || 10, 50)

  // Construir filtro
  const where: any = { active: true }

  if (options.difficulty && options.difficulty !== 'all') {
    where.difficulty = options.difficulty
  }

  if (options.book) {
    where.book = options.book
  }

  if (options.type) {
    where.type = options.type
  }

  // Buscar perguntas aleatórias
  const questions = await prisma.$queryRawUnsafe<any[]>(
    `SELECT id, text, type, "optionA", "optionB", "optionC", "optionD", answer, explanation,
            book, chapter, verse, difficulty, category, xp
     FROM questions
     WHERE active = true
       ${options.difficulty && options.difficulty !== 'all' ? `AND difficulty = '${options.difficulty}'` : ''}
       ${options.book ? `AND book = '${options.book}'` : ''}
       ${options.type ? `AND type = '${options.type}'` : ''}
     ORDER BY RANDOM()
     LIMIT ${count}`
  )

  // Embaralhar alternativas para múltipla escolha
  const prepared = questions.map(q => {
    if (q.type === 'multiple_choice' || q.type === 'who_said') {
      const options = [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean)
      // Embaralhar
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]]
      }
      return { ...q, options, optionA: undefined, optionB: undefined, optionC: undefined, optionD: undefined }
    }
    return q
  })

  return {
    sessionId: `quiz_${userId}_${Date.now()}`,
    questions: prepared,
    total: prepared.length,
    difficulty: options.difficulty || 'all'
  }
}

export async function submitQuizAnswers(
  userId: string,
  gameType: string,
  answers: { questionId: string; answer: string; timeSpent?: number }[],
  difficulty?: string,
  book?: string
) {
  // Buscar respostas corretas
  const questionIds = answers.map(a => a.questionId)
  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } }
  })

  const questionMap = new Map(questions.map(q => [q.id, q]))

  const evaluatedAnswers = answers.map(a => {
    const question = questionMap.get(a.questionId)
    if (!question) return { questionId: a.questionId, userAnswer: a.answer, correct: false, timeSpent: a.timeSpent }

    const correct = question.answer.toLowerCase().trim() === a.answer.toLowerCase().trim()
    return {
      questionId: a.questionId,
      userAnswer: a.answer,
      correct,
      timeSpent: a.timeSpent || 0
    }
  })

  const correctCount = evaluatedAnswers.filter(a => a.correct).length
  const total = evaluatedAnswers.length

  // Calcular XP base
  let baseXP = correctCount * 100

  // Bônus de velocidade (respostas < 10s)
  const fastCorrect = evaluatedAnswers.filter(a => a.correct && a.timeSpent && a.timeSpent < 10)
  const speedBonus = fastCorrect.length * 50

  // Bônus de perfeição
  const perfectBonus = (correctCount === total && total > 0) ? 250 : 0

  // Multiplicador de dificuldade
  const multipliers: Record<string, number> = { easy: 1, medium: 1.5, hard: 2, expert: 3, master: 5 }
  const multiplier = multipliers[difficulty || 'easy'] || 1

  const totalXP = Math.round((baseXP + speedBonus + perfectBonus) * multiplier)

  // Salvar sessão
  const session = await prisma.gameSession.create({
    data: {
      userId,
      gameType,
      difficulty,
      bookFilter: book,
      score: correctCount * 100,
      totalXP,
      correct: correctCount,
      total,
      completed: true,
      answers: {
        create: evaluatedAnswers.map(a => ({
          questionId: a.questionId,
          userAnswer: a.userAnswer,
          correct: a.correct,
          xpEarned: a.correct ? 100 : 0,
          timeSpent: a.timeSpent
        }))
      }
    }
  })

  // Atualizar XP do usuário
  const user = await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: totalXP } }
  })

  // Atualizar ranking
  await prisma.ranking.upsert({
    where: { userId_period: { userId, period: 'global' } },
    create: { userId, period: 'global', xp: totalXP },
    update: { xp: { increment: totalXP } }
  })

  // Calcular novo nível
  const { calculateLevel } = await import('../services/xpService')
  const levelInfo = calculateLevel(user.xp + totalXP)

  if (levelInfo.level > user.level) {
    await prisma.user.update({
      where: { id: userId },
      data: { level: levelInfo.level, title: levelInfo.title }
    })
  }

  // Atualizar perfil
  await prisma.profile.update({
    where: { userId },
    data: {
      totalGames: { increment: 1 },
      wins: correctCount >= total * 0.6 ? { increment: 1 } : undefined,
      losses: correctCount < total * 0.6 ? { increment: 1 } : undefined,
    }
  })

  return {
    sessionId: session.id,
    correct: correctCount,
    total,
    score: correctCount * 100,
    xpEarned: totalXP,
    baseXP,
    speedBonus,
    perfectBonus,
    multiplier,
    level: levelInfo.level,
    title: levelInfo.title,
    totalXP: user.xp + totalXP,
    answers: evaluatedAnswers.map((a, i) => {
      const q = questionMap.get(a.questionId)
      return {
        ...a,
        questionText: q?.text,
        correctAnswer: q?.answer,
        explanation: q?.explanation,
        book: q?.book,
        chapter: q?.chapter,
        verse: q?.verse
      }
    })
  }
}
