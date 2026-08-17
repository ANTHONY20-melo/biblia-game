import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Award, Lock, CheckCircle } from 'lucide-react'

export default function Achievements() {
  const [achievements, setAchievements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.myAchievements().then(a => { setAchievements(a); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const unlocked = achievements.filter(a => a.unlocked)
  const locked = achievements.filter(a => !a.unlocked)

  // Group by category
  const groups = achievements.reduce((acc, a) => {
    const cat = a.category || 'outros'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(a)
    return acc
  }, {} as Record<string, any[]>)

  const categoryLabels: Record<string, string> = {
    inicio: '🚀 Início',
    acertos: '🎯 Acertos',
    streak: '🔥 Sequência',
    batalha: '⚔️ Batalha',
    conhecimento: '📚 Conhecimento',
    diario: '📅 Desafio Diário',
  }

  if (loading) return (
    <div className="page-container max-w-4xl mx-auto">
      <div className="skeleton h-12 w-64 mx-auto mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-32 rounded-xl" />)}</div>
    </div>
  )

  return (
    <div className="page-container max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="section-title text-3xl mb-2">
          <span className="text-gold-500">Conquistas</span>
        </h1>
        <p className="text-navy-500 dark:text-gray-400">
          {unlocked.length} de {achievements.length} desbloqueadas
        </p>
        <div className="progress-bar w-64 mx-auto mt-3">
          <div className="progress-fill" style={{ width: `${achievements.length > 0 ? (unlocked.length / achievements.length) * 100 : 0}%` }} />
        </div>
      </div>

      {Object.entries(groups as Record<string, any[]>).map(([cat, items]) => (
        <div key={cat} className="mb-10">
          <h2 className="font-display font-bold text-lg text-navy-900 dark:text-white mb-4">
            {categoryLabels[cat] || cat}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((ach, i) => (
              <div key={ach.id}
                className={`card animate-slide-up ${ach.unlocked ? 'border-gold-500/30 hover:border-gold-500/50' : 'opacity-60'}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`text-3xl ${ach.unlocked ? '' : 'grayscale'}`}>{ach.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-navy-900 dark:text-white text-sm">{ach.name}</h3>
                      {ach.unlocked ? (
                        <CheckCircle size={14} className="text-emerald-500" />
                      ) : (
                        <Lock size={14} className="text-navy-400" />
                      )}
                    </div>
                    <p className="text-xs text-navy-500 dark:text-gray-400 mt-0.5">{ach.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="badge-gold text-[10px]">+{ach.xpReward} XP</span>
                      {ach.unlockedAt && (
                        <span className="text-[10px] text-navy-400">
                          {new Date(ach.unlockedAt).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
