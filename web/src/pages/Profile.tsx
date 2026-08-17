import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { Trophy, Target, Calendar, Award, Gamepad2, TrendingUp, Star, BookOpen } from 'lucide-react'

export default function Profile() {
  const { id } = useParams()
  const { user: currentUser } = useAuthStore()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const targetId = id || currentUser?.id

  useEffect(() => {
    if (!targetId) { setLoading(false); return }
    api.userProfile(targetId).then(p => { setProfile(p); setLoading(false) }).catch(() => setLoading(false))
  }, [targetId])

  if (loading) return (
    <div className="page-container max-w-4xl mx-auto">
      <div className="skeleton h-48 rounded-2xl mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
    </div>
  )

  if (!profile) return (
    <div className="page-container text-center py-16">
      <div className="text-5xl mb-4">👤</div>
      <p className="text-navy-500 dark:text-gray-400">Perfil não encontrado.</p>
    </div>
  )

  const pct = profile.nextLevelXP > 0 ? Math.round((profile.currentXP / profile.nextLevelXP) * 100) : 0

  return (
    <div className="page-container max-w-4xl mx-auto animate-fade-in">
      {/* Header Profile */}
      <div className="card !p-0 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-navy-800 to-navy-900 p-8 text-center relative">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 left-4 text-8xl text-gold-500">✝</div>
          </div>
          <div className="relative">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-navy-950 font-display font-bold text-3xl mb-4 ring-4 ring-gold-500/30">
              {profile.name?.charAt(0) || '?'}
            </div>
            <h1 className="text-2xl font-display font-bold text-white">{profile.name}</h1>
            <p className="text-gold-400 font-medium mt-1">{profile.title} • Nível {profile.level}</p>
            {profile.streak > 0 && (
              <p className="text-sm text-navy-300 mt-1">🔥 {profile.streak} dias seguidos</p>
            )}
          </div>
        </div>

        {/* XP Progress */}
        <div className="p-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-navy-500 dark:text-gray-400">Progresso do Nível</span>
            <span className="font-bold text-gold-500">{profile.xp?.toLocaleString()} XP</span>
          </div>
          <div className="progress-bar h-4">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-navy-400 mt-1">
            {profile.currentXP} / {profile.nextLevelXP} XP para o próximo nível
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Gamepad2, label: 'Jogos', value: profile.profile?.totalGames || 0, color: 'text-blue-500' },
          { icon: Trophy, label: 'Vitórias', value: profile.profile?.wins || 0, color: 'text-emerald-500' },
          { icon: Target, label: 'Precisão', value: `${Math.round(profile.profile?.accuracy || 0)}%`, color: 'text-gold-500' },
          { icon: Calendar, label: 'Sequência', value: `${profile.streak || 0} dias`, color: 'text-orange-500' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card text-center animate-slide-up">
            <Icon size={24} className={`mx-auto mb-2 ${color}`} />
            <div className="text-xl font-bold text-navy-900 dark:text-white">{value}</div>
            <div className="text-xs text-navy-500 dark:text-gray-400">{label}</div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      {profile.achievements && profile.achievements.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-xl text-navy-900 dark:text-white mb-4 flex items-center gap-2">
            <Award size={20} className="text-gold-500" /> Conquistas Recentes
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {profile.achievements.slice(0, 8).map((ua: any) => (
              <div key={ua.id} className="card text-center py-4 !p-4">
                <div className="text-3xl mb-2">{ua.achievement?.icon}</div>
                <p className="font-medium text-navy-900 dark:text-white text-xs">{ua.achievement?.name}</p>
                {ua.unlockedAt && (
                  <p className="text-[10px] text-navy-400 mt-1">{new Date(ua.unlockedAt).toLocaleDateString('pt-BR')}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
