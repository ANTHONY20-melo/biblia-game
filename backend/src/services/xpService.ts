import { AuthRequest } from '../middlewares/auth'
import { prisma } from '../server'

// ─── XP E NÍVEIS ────────────────────────────────────────

const LEVEL_THRESHOLDS = [
  0, 200, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000,
  20000, 26000, 33000, 41000, 50000, 60000, 72000, 85000, 100000, 120000
]

const LEVEL_TITLES = [
  'Aprendiz', 'Discípulo', 'Estudante', 'Conhecedor', 'Mestre',
  'Mestre da Palavra', 'Guardião da Palavra', 'Erudito Bíblico',
  'Sábio da Fé', 'Profeta da Sabedoria', 'Luminar da Palavra',
  'Colunista da Fé', 'Pilheiro da Escritura', 'Centurião da Bíblia',
  'General da Fé', 'Lenda Bíblica', 'Mestre Supremo', 'Luminar Eterno',
  'Guardião Supremo', 'Mestre da Bíblia'
]

export function calculateLevel(xp: number): { level: number; title: string; currentXP: number; nextLevelXP: number; progress: number } {
  let level = 1
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1
      break
    }
  }

  const currentLevelXP = LEVEL_THRESHOLDS[level - 1] || 0
  const nextLevelXP = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 25000
  const progress = nextLevelXP > currentLevelXP
    ? Math.min(((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100, 100)
    : 100

  return {
    level: Math.min(level, LEVEL_TITLES.length),
    title: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)],
    currentXP: xp - currentLevelXP,
    nextLevelXP: nextLevelXP - currentLevelXP,
    progress: Math.round(progress)
  }
}

// ─── GANHAR XP ──────────────────────────────────────────

export async function awardXP(userId: string, amount: number, reason: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: amount } }
  })

  const levelInfo = calculateLevel(user.xp)

  // Verificar se subiu de nível
  if (levelInfo.level > user.level) {
    await prisma.user.update({
      where: { id: userId },
      data: { level: levelInfo.level, title: levelInfo.title }
    })
  }

  // Atualizar ranking global
  await prisma.ranking.upsert({
    where: { userId_period: { userId, period: 'global' } },
    create: { userId, period: 'global', xp: amount },
    update: { xp: { increment: amount } }
  })

  return { ...levelInfo, xpAwarded: amount, reason }
}

// ─── RECOMPENSAS DE JOGO ────────────────────────────────

export const XP_REWARDS = {
  correct_answer: 100,
  speed_bonus: 50,
  daily_complete: 500,
  daily_streak_3: 200,
  daily_streak_7: 500,
  daily_streak_30: 1500,
  daily_streak_100: 5000,
  battle_win: 300,
  achievement_unlock: 1000,
  perfect_game: 250,       // 100% acerto no quiz
  all_books_quiz: 500,     // quiz de todos os livros
}

export async function recordGameSession(
  userId: string,
  gameType: string,
  answers: { questionId: string; userAnswer: string; correct: boolean; timeSpent?: number }[],
  difficulty?: string,
  bookFilter?: string
) {
  const correctCount = answers.filter(a => a.correct).length
  const totalCount = answers.length

  // Calcular XP
  let totalXP = correctCount * XP_REWARDS.correct_answer

  // Bônus de velocidade
  const fastAnswers = answers.filter(a => a.timeSpent && a.timeSpent < 10 && a.correct)
  totalXP += fastAnswers.length * XP_REWARDS.speed_bonus

  // Bônus de perfeição
  if (correctCount === totalCount && totalCount > 0) {
    totalXP += XP_REWARDS.perfect_game
  }

  // Bônus de dificuldade
  const diffMultiplier: Record<string, number> = { easy: 1, medium: 1.5, hard: 2, expert: 3, master: 5 }
  totalXP = Math.round(totalXP * (diffMultiplier[difficulty || 'easy'] || 1))

  // Criar sessão
  const session = await prisma.gameSession.create({
    data: {
      userId,
      gameType,
      difficulty,
      bookFilter,
      score: correctCount * 100,
      totalXP,
      correct: correctCount,
      total: totalCount,
      completed: true,
      answers: {
        create: answers.map(a => ({
          questionId: a.questionId,
          userAnswer: a.userAnswer,
          correct: a.correct,
          xpEarned: a.correct ? XP_REWARDS.correct_answer : 0,
          timeSpent: a.timeSpent
        }))
      }
    }
  })

  // Dar XP
  const levelInfo = await awardXP(userId, totalXP, `Jogo: ${gameType}`)

  // Atualizar stats do perfil
  await prisma.profile.update({
    where: { userId },
    data: {
      totalGames: { increment: 1 },
      wins: correctCount >= totalCount * 0.6 ? { increment: 1 } : undefined,
      losses: correctCount < totalCount * 0.6 ? { increment: 1 } : undefined,
    }
  })

  // Recalcular precisão
  const profile = await prisma.profile.findUnique({ where: { userId } })
  if (profile && profile.totalGames > 0) {
    const totalCorrect = await prisma.gameAnswer.aggregate({
      where: { session: { userId }, correct: true },
      _count: true
    })
    const totalAnswered = await prisma.gameAnswer.aggregate({
      where: { session: { userId } },
      _count: true
    })
    await prisma.profile.update({
      where: { userId },
      data: { accuracy: totalAnswered._count > 0 ? (totalCorrect._count / totalAnswered._count) * 100 : 0 }
    })
  }

  return {
    sessionId: session.id,
    correct: correctCount,
    total: totalCount,
    score: correctCount * 100,
    xpEarned: totalXP,
    ...levelInfo,
    perfectBonus: correctCount === totalCount && totalCount > 0,
    speedBonus: fastAnswers.length
  }
}
