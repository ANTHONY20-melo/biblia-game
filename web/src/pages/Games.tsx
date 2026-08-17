import { Link } from 'react-router-dom'
import { Gamepad2, Target, BookOpen, Brain, Puzzle, Swords, ArrowRight, Star, Zap, Trophy } from 'lucide-react'

const ALL_GAMES = [
  {
    id: 'quiz',
    title: 'Quiz Bíblico',
    desc: 'Responda perguntas de múltipla escolha sobre todos os livros da Bíblia.',
    icon: '🎯',
    color: 'from-blue-500 to-blue-600',
    link: '/games/quiz',
    difficulty: 'Todos os níveis',
    xp: '+100 XP por acerto',
  },
  {
    id: 'true-false',
    title: 'Verdadeiro ou Falso',
    desc: 'Determine se afirmações bíblicas são verdadeiras ou falsas.',
    icon: '⚡',
    color: 'from-amber-500 to-orange-500',
    link: '/games/quiz?type=true_false',
    difficulty: 'Fácil a Difícil',
    xp: '+100 XP por acerto',
  },
  {
    id: 'who-said',
    title: 'Quem Disse?',
    desc: 'Identifique quem disse cada frase bíblica famosa.',
    icon: '💬',
    color: 'from-emerald-500 to-teal-500',
    link: '/games/quiz?type=who_said',
    difficulty: 'Médio a Especialista',
    xp: '+100 XP por acerto',
  },
  {
    id: 'fill-blank',
    title: 'Complete o Versículo',
    desc: 'Preencha a lacuna nos versículos mais conhecidos da Bíblia.',
    icon: '📖',
    color: 'from-purple-500 to-violet-500',
    link: '/games/quiz?type=fill_blank',
    difficulty: 'Médio a Difícil',
    xp: '+150 XP por acerto',
  },
  {
    id: 'character',
    title: 'Quem é o Personagem?',
    desc: 'Identifique personagens bíblicos a partir de pistas.',
    icon: '👤',
    color: 'from-pink-500 to-rose-500',
    link: '/games/quiz?category=Personagens',
    difficulty: 'Todos os níveis',
    xp: '+100 XP por acerto',
  },
  {
    id: 'books',
    title: 'Livros da Bíblia',
    desc: 'Teste seu conhecimento sobre os livros do Antigo e Novo Testamento.',
    icon: '📚',
    color: 'from-indigo-500 to-blue-500',
    link: '/games/quiz?category=Livros',
    difficulty: 'Fácil a Especialista',
    xp: '+100 XP por acerto',
  },
]

const DIFFICULTIES = [
  { key: 'easy', label: 'Fácil', color: 'text-emerald-500', desc: 'Perguntas básicas para começar' },
  { key: 'medium', label: 'Médio', color: 'text-amber-500', desc: 'Conhecimento intermediário' },
  { key: 'hard', label: 'Difícil', color: 'text-red-500', desc: 'Perguntas mais específicas' },
  { key: 'expert', label: 'Especialista', color: 'text-purple-500', desc: 'Para usuários avançados' },
  { key: 'master', label: 'Mestre da Bíblia', color: 'text-gold-500', desc: 'Perguntas extremamente difíceis' },
]

export default function Games() {
  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="section-title text-4xl mb-3">
          Central de <span className="text-gold-500">Jogos</span>
        </h1>
        <p className="text-navy-500 dark:text-gray-400 max-w-xl mx-auto">
          Escolha entre diferentes modos de jogo e teste seus conhecimentos bíblicos de várias formas.
        </p>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {ALL_GAMES.map((game, i) => (
          <Link
            key={game.id}
            to={game.link}
            className="card-glow group animate-slide-up"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform`}>
                {game.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-lg text-navy-900 dark:text-white group-hover:text-gold-500 transition-colors">
                  {game.title}
                </h3>
                <p className="text-sm text-navy-500 dark:text-gray-400 mt-1">{game.desc}</p>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="badge-navy text-[10px]">{game.difficulty}</span>
                  <span className="badge-gold text-[10px]">{game.xp}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-gold-500 text-sm font-medium mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
              Jogar agora <ArrowRight size={14} />
            </div>
          </Link>
        ))}
      </div>

      {/* Difficulty Levels */}
      <div className="mb-16">
        <h2 className="section-title text-center mb-8">Níveis de Dificuldade</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {DIFFICULTIES.map((d, i) => (
            <Link
              key={d.key}
              to={`/games/quiz?difficulty=${d.key}`}
              className="card text-center group animate-slide-up hover:border-gold-500/30"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className={`text-xl font-display font-bold ${d.color} mb-2`}>{d.label}</div>
              <p className="text-xs text-navy-500 dark:text-gray-400">{d.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* XP System */}
      <div className="card !bg-gradient-to-br from-navy-900 to-navy-950 text-center">
        <h2 className="text-2xl font-display font-bold text-white mb-4">
          Sistema de XP e Progressão
        </h2>
        <p className="text-navy-300 mb-6 max-w-lg mx-auto">
          Quanto mais você joga, mais XP ganha. Suba de nível e desbloqueie conquistas exclusivas.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {[
            { icon: '🎯', label: 'Acerto', value: '+100 XP' },
            { icon: '⚡', label: 'Bônus Velocidade', value: '+50 XP' },
            { icon: '📅', label: 'Desafio Diário', value: '+500 XP' },
            { icon: '🏆', label: 'Perfeição', value: '+250 XP' },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-navy-800/50 rounded-xl p-4">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-gold-400 font-bold">{value}</div>
              <div className="text-xs text-navy-400">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
