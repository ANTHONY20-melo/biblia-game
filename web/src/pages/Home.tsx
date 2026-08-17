import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Trophy, Gamepad2, BookOpen, Calendar, Star, ArrowRight, Flame, Target, Sparkles, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { api } from '../lib/api'

const GAMES = [
  { id: 'quiz', title: 'Quiz Bíblico', desc: 'Teste seus conhecimentos com perguntas de múltipla escolha', icon: '🎯', color: 'from-blue-500 to-blue-600', link: '/games/quiz' },
  { id: 'daily', title: 'Desafio do Dia', desc: '10 perguntas diárias para manter a chama acesa', icon: '📅', color: 'from-orange-500 to-red-500', link: '/daily' },
  { id: 'ranking', title: 'Ranking', desc: 'Veja sua posição entre os melhores jogadores', icon: '🏆', color: 'from-yellow-500 to-amber-600', link: '/ranking' },
  { id: 'bible', title: 'Bíblia Interativa', desc: 'Navegue pelos livros e capítulos da Bíblia', icon: '📖', color: 'from-emerald-500 to-teal-600', link: '/bible' },
  { id: 'achievements', title: 'Conquistas', desc: 'Desbloqueie badges e ganhe XP extra', icon: '🏆', color: 'from-purple-500 to-violet-600', link: '/achievements' },
  { id: 'characters', title: 'Quem é o Personagem?', desc: 'Identifique personagens bíblicos pelas pistas', icon: '👤', color: 'from-pink-500 to-rose-500', link: '/games/quiz?category=Personagens' },
]

export default function Home() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    api.rankingGlobal().then(r => setStats({ topPlayers: r.slice(0, 5) })).catch(() => {})
  }, [])

  return (
    <div className="animate-fade-in">
      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-9xl font-display text-gold-500/20">✝</div>
          <div className="absolute bottom-10 right-10 text-9xl font-display text-gold-500/10">✝</div>
        </div>
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gold-500/30 rounded-full animate-float"
              style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%`, animationDelay: `${i * 0.5}s`, animationDuration: `${3 + i * 0.5}s` }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 badge-gold mb-6 animate-slide-up">
            <Sparkles size={14} />
            <span>Plataforma de Jogos Bíblicos</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 animate-slide-up text-balance" style={{ animationDelay: '0.1s' }}>
            QUANTO VOCÊ CONHECE
            <br />
            A <span className="text-gold-400">BÍBLIA</span>?
          </h1>

          <p className="text-lg md:text-xl text-navy-300 max-w-2xl mx-auto mb-10 animate-slide-up text-balance" style={{ animationDelay: '0.2s' }}>
            Teste seus conhecimentos, desafie seus amigos e descubra novos detalhes da Palavra de Deus.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Link to={user ? '/games/quiz' : '/register'} className="btn-primary text-lg !px-8 !py-4 flex items-center gap-2">
              <Gamepad2 size={20} />
              JOGAR AGORA
            </Link>
            <Link to="/games" className="btn-secondary text-lg !px-8 !py-4 flex items-center gap-2">
              EXPLORAR JOGOS
              <ArrowRight size={20} />
            </Link>
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-16 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            {[
              { label: 'Perguntas', value: '100+', icon: '❓' },
              { label: 'Livros', value: '66', icon: '📖' },
              { label: 'Conquistas', value: '20', icon: '🏆' },
              { label: 'Níveis', value: '20', icon: '⭐' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="text-center">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-2xl font-display font-bold text-gold-400">{value}</div>
                <div className="text-xs text-navy-400 uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── GAMES GRID ───────────────────────────────────── */}
      <section className="page-container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Central de Jogos</h2>
            <p className="text-navy-500 dark:text-gray-400 mt-1">Escolha seu desafio e comece a jogar</p>
          </div>
          <Link to="/games" className="btn-ghost text-sm hidden sm:flex items-center gap-1">
            Ver todos <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GAMES.map((game, i) => (
            <Link
              key={game.id}
              to={game.link}
              className="card-glow group cursor-pointer animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                {game.icon}
              </div>
              <h3 className="font-display font-bold text-lg text-navy-900 dark:text-white mb-2 group-hover:text-gold-500 transition-colors">
                {game.title}
              </h3>
              <p className="text-sm text-navy-500 dark:text-gray-400">{game.desc}</p>
              <div className="flex items-center gap-1 text-gold-500 text-sm font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                Jogar <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────── */}
      <section className="bg-navy-50 dark:bg-navy-900/50 py-16">
        <div className="page-container">
          <h2 className="section-title text-center mb-12">Como Funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Escolha um Jogo', desc: 'Quiz, desafio diário, batalha e mais', icon: '🎮' },
              { step: '2', title: 'Responda Perguntas', desc: 'Teste seus conhecimentos bíblicos', icon: '📝' },
              { step: '3', title: 'Ganhe XP e Suba de Nível', desc: 'Desbloqueie conquistas e compete no ranking', icon: '🏆' },
            ].map(({ step, title, desc, icon }) => (
              <div key={step} className="text-center card animate-slide-up" style={{ animationDelay: `${parseInt(step) * 0.15}s` }}>
                <div className="text-4xl mb-3">{icon}</div>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gold-500 text-navy-950 font-bold text-sm mb-3">
                  {step}
                </div>
                <h3 className="font-display font-bold text-lg text-navy-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-navy-500 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TOP RANKING PREVIEW ──────────────────────────── */}
      {stats?.topPlayers && stats.topPlayers.length > 0 && (
        <section className="page-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Ranking Global</h2>
              <p className="text-navy-500 dark:text-gray-400 mt-1">Os melhores jogadores da Bíblia Game</p>
            </div>
            <Link to="/ranking" className="btn-ghost text-sm flex items-center gap-1">
              Ver completo <ChevronRight size={16} />
            </Link>
          </div>

          <div className="card overflow-hidden">
            {stats.topPlayers.map((p: any, i: number) => (
              <div key={p.id || i} className={`flex items-center gap-4 px-4 py-3 ${i > 0 ? 'border-t border-navy-100 dark:border-navy-800' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  i === 0 ? 'bg-gold-500 text-navy-950' : i === 1 ? 'bg-gray-300 text-gray-700' : i === 2 ? 'bg-amber-600 text-white' : 'bg-navy-100 dark:bg-navy-800 text-navy-500'
                }`}>
                  {i + 1}
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-navy-950 font-bold text-sm">
                  {p.user?.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-navy-900 dark:text-white text-sm truncate">{p.user?.name || 'Jogador'}</p>
                  <p className="text-xs text-navy-500 dark:text-gray-400">Nível {p.user?.level || 1} • {p.user?.title || 'Aprendiz'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gold-500 text-sm">{(p.xp || 0).toLocaleString()} XP</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── FOOTER ───────────────────────────────────────── */}
      <footer className="bg-navy-950 text-navy-400 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">✝️</span>
            <span className="font-display font-bold text-white">BÍBLIA <span className="text-gold-400">GAME</span></span>
          </div>
          <p className="text-sm mb-2">"Conheça a Palavra. Desafie seus conhecimentos. Viva a Bíblia."</p>
          <p className="text-xs text-navy-600">© 2026 Bíblia Game. Feito com fé e código.</p>
        </div>
      </footer>
    </div>
  )
}
