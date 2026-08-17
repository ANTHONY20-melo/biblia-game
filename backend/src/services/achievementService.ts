import { prisma } from '../server'

interface AchievementDef {
  name: string
  description: string
  icon: string
  category: string
  requirement: number
  xpReward: number
}

const ACHIEVEMENTS: AchievementDef[] = [
  // ─── INÍCIO ───
  { name: 'Primeiro Passo', description: 'Complete seu primeiro quiz', icon: '🎯', category: 'inicio', requirement: 1, xpReward: 500 },
  { name: 'Primeira Vitória', description: 'Acerte 100% em um quiz', icon: '⭐', category: 'inicio', requirement: 1, xpReward: 1000 },
  { name: 'Estudante Dedicado', description: 'Jogue 10 quizzes', icon: '📚', category: 'inicio', requirement: 10, xpReward: 750 },
  { name: 'Aluno da Palavra', description: 'Jogue 50 quizzes', icon: '📖', category: 'inicio', requirement: 50, xpReward: 2000 },

  // ─── ACERTOS ───
  { name: 'Centenário', description: 'Acerte 100 perguntas', icon: '💯', category: 'acertos', requirement: 100, xpReward: 1500 },
  { name: 'Quinhentário', description: 'Acerte 500 perguntas', icon: '💎', category: 'acertos', requirement: 500, xpReward: 3000 },
  { name: 'Milhar', description: 'Acerte 1000 perguntas', icon: '👑', category: 'acertos', requirement: 1000, xpReward: 5000 },
  { name: 'Perfeccionista', description: 'Acerte todas as perguntas em 5 quizzes', icon: '✨', category: 'acertos', requirement: 5, xpReward: 2000 },

  // ─── SEQUÊNCIA ───
  { name: 'Fogo Aceso', description: 'Jogue 3 dias seguidos', icon: '🔥', category: 'streak', requirement: 3, xpReward: 500 },
  { name: 'Chama Viva', description: 'Jogue 7 dias seguidos', icon: '🔥', category: 'streak', requirement: 7, xpReward: 1000 },
  { name: 'Incêndio de Fé', description: 'Jogue 30 dias seguidos', icon: '🔥', category: 'streak', requirement: 30, xpReward: 3000 },
  { name: 'Fiel por 100 Dias', description: 'Jogue 100 dias seguidos', icon: '🔥', category: 'streak', requirement: 100, xpReward: 10000 },

  // ─── BATALHA ───
  { name: 'Primeira Batalha', description: 'Vença uma batalha bíblica', icon: '⚔️', category: 'batalha', requirement: 1, xpReward: 1000 },
  { name: 'Guerreiro da Fé', description: 'Vença 10 batalhas', icon: '🛡️', category: 'batalha', requirement: 10, xpReward: 2500 },
  { name: 'Campeão', description: 'Vença 50 batalhas', icon: '🏆', category: 'batalha', requirement: 50, xpReward: 5000 },

  // ─── CONHECIMENTO ───
  { name: 'Conhecedor do AT', description: 'Acerte 50 perguntas do Antigo Testamento', icon: '📜', category: 'conhecimento', requirement: 50, xpReward: 2000 },
  { name: 'Conhecedor do NT', description: 'Acerte 50 perguntas do Novo Testamento', icon: '✝️', category: 'conhecimento', requirement: 50, xpReward: 2000 },
  { name: 'Mestre da Bíblia', description: 'Alcance nível 10', icon: '🎓', category: 'conhecimento', requirement: 10, xpReward: 5000 },
  { name: 'Sábio dos Sábios', description: 'Alcance nível 15', icon: '🌟', category: 'conhecimento', requirement: 15, xpReward: 10000 },

  // ─── DESAFIO DIÁRIO ───
  { name: 'Desafiador', description: 'Complete o desafio diário', icon: '📅', category: 'diario', requirement: 1, xpReward: 500 },
  { name: 'Mensal', description: 'Complete desafios diários por 30 dias', icon: '🗓️', category: 'diario', requirement: 30, xpReward: 5000 },
]

export async function seedAchievements() {
  for (const ach of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { name: ach.name },
      update: ach,
      create: ach
    })
  }
  return ACHIEVEMENTS.length
}

export async function checkAndAwardAchievements(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true, achievements: true }
  })

  if (!user) return []

  const unlockedIds = new Set(user.achievements.map(ua => ua.achievementId))
  const allAchievements = await prisma.achievement.findMany()
  const newAchievements: any[] = []

  // Estatísticas do usuário
  const totalGames = user.profile?.totalGames || 0
  const totalCorrect = await prisma.gameAnswer.aggregate({
    where: { session: { userId }, correct: true },
    _count: true
  })
  const totalWins = user.profile?.wins || 0

  for (const ach of allAchievements) {
    if (unlockedIds.has(ach.id)) continue

    let unlocked = false

    switch (ach.category) {
      case 'inicio':
        if (ach.name.includes('Primeiro Passo') && totalGames >= 1) unlocked = true
        if (ach.name.includes('Estudante') && totalGames >= ach.requirement) unlocked = true
        if (ach.name.includes('Aluno') && totalGames >= ach.requirement) unlocked = true
        break
      case 'acertos':
        if (totalCorrect._count >= ach.requirement) unlocked = true
        break
      case 'streak':
        if (user.streak >= ach.requirement) unlocked = true
        break
      case 'batalha':
        if (totalWins >= ach.requirement) unlocked = true
        break
      case 'conhecimento':
        if (ach.name.includes('Nível') && user.level >= ach.requirement) unlocked = true
        break
      case 'diario':
        const dailyCount = await prisma.dailyChallenge.count({
          where: { userId, completed: true }
        })
        if (dailyCount >= ach.requirement) unlocked = true
        break
    }

    if (unlocked) {
      await prisma.userAchievement.create({
        data: { userId, achievementId: ach.id }
      })
      await prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: ach.xpReward } }
      })
      newAchievements.push(ach)
    }
  }

  return newAchievements
}
