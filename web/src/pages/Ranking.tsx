import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Trophy, Medal, Crown, Star, TrendingUp } from 'lucide-react'

type Tab = 'global' | 'weekly'

export default function Ranking() {
  const [tab, setTab] = useState<Tab>('global')
  const [rankings, setRankings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const fn = tab === 'global' ? api.rankingGlobal : api.rankingWeekly
    fn().then(r => { setRankings(r); setLoading(false) }).catch(() => setLoading(false))
  }, [tab])

  const getMedal = (pos: number) => {
    if (pos === 1) return '🥇'
    if (pos === 2) return '🥈'
    if (pos === 3) return '🥉'
    return `#${pos}`
  }

  const getMedalColor = (pos: number) => {
    if (pos === 1) return 'bg-gold-500 text-navy-950'
    if (pos === 2) return 'bg-gray-300 text-gray-700'
    if (pos === 3) return 'bg-amber-600 text-white'
    return 'bg-navy-100 dark:bg-navy-800 text-navy-500'
  }

  return (
    <div className="page-container max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="section-title text-3xl mb-2">
          <span className="text-gold-500">Ranking</span> Geral
        </h1>
        <p className="text-navy-500 dark:text-gray-400">Os melhores jogadores da Bíblia Game</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {(['global', 'weekly'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === t ? 'bg-gold-500 text-navy-950' : 'bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-gray-300 hover:bg-navy-200'
            }`}>
            {t === 'global' ? '🌍 Global' : '📅 Semanal'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : rankings.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-navy-500 dark:text-gray-400">Nenhum jogador no ranking ainda. Jogue para aparecer aqui!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Top 3 */}
          {rankings.length >= 3 && (
            <div className="flex items-end justify-center gap-4 mb-8">
              {[rankings[1], rankings[0], rankings[2]].map((p, i) => {
                const pos = i === 0 ? 2 : i === 1 ? 1 : 3
                const heights = ['h-28', 'h-36', 'h-24']
                return (
                  <div key={p.userId || i} className="text-center animate-slide-up" style={{ animationDelay: `${i * 0.15}s` }}>
                    <div className={`w-14 h-14 mx-auto rounded-full bg-gradient-to-br ${pos === 1 ? 'from-gold-400 to-gold-600' : pos === 2 ? 'from-gray-300 to-gray-400' : 'from-amber-500 to-amber-700'} flex items-center justify-center text-navy-950 font-bold text-lg mb-2`}>
                      {p.user?.name?.charAt(0) || '?'}
                    </div>
                    <p className="font-medium text-navy-900 dark:text-white text-sm truncate max-w-[100px]">{p.user?.name}</p>
                    <p className="text-xs text-gold-500 font-bold">{(p.xp || 0).toLocaleString()} XP</p>
                    <div className={`${heights[i]} mt-2 rounded-t-xl bg-gradient-to-b ${pos === 1 ? 'from-gold-400/30 to-gold-500/10' : pos === 2 ? 'from-gray-300/30 to-gray-400/10' : 'from-amber-500/30 to-amber-600/10'} flex items-center justify-center text-3xl`}>
                      {getMedal(pos)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Rest */}
          {rankings.slice(rankings.length >= 3 ? 3 : 0).map((p, i) => (
            <div key={p.userId || i} className="card flex items-center gap-4 animate-slide-up" style={{ animationDelay: `${(i + 3) * 0.05}s` }}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${getMedalColor(p.position || i + 4)}`}>
                {p.position || i + 4}
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-navy-950 font-bold text-sm flex-shrink-0">
                {p.user?.name?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-navy-900 dark:text-white text-sm truncate">{p.user?.name}</p>
                <p className="text-xs text-navy-500 dark:text-gray-400">
                  Nível {p.user?.level || 1} • {p.user?.title || 'Aprendiz'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gold-500 text-sm">{(p.xp || 0).toLocaleString()} XP</p>
                {p.accuracy !== undefined && (
                  <p className="text-xs text-navy-400">{Math.round(p.accuracy)}% precisão</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
