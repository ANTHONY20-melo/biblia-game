import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { Menu, X, Sun, Moon, Trophy, Gamepad2, BookOpen, Calendar, User, LogOut, ChevronDown, Award } from 'lucide-react'

const NAV_ITEMS = [
  { path: '/games', label: 'Jogos', icon: Gamepad2 },
  { path: '/bible', label: 'Bíblia', icon: BookOpen },
  { path: '/ranking', label: 'Ranking', icon: Trophy },
  { path: '/daily', label: 'Desafio', icon: Calendar },
  { path: '/achievements', label: 'Conquistas', icon: Award },
]

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { dark, toggle } = useThemeStore()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-navy-200/50 dark:border-navy-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl">✝️</span>
            <span className="font-display font-bold text-lg text-navy-900 dark:text-white tracking-wide hidden sm:block">
              BÍBLIA <span className="text-gold-500">GAME</span>
            </span>
          </Link>

          {/* Nav Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path || location.pathname.startsWith(path + '/')
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-gold-500/15 text-gold-600 dark:text-gold-400'
                      : 'text-navy-600 dark:text-gray-400 hover:bg-navy-100 dark:hover:bg-navy-800'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              )
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-navy-600 dark:text-gray-400 hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors"
              aria-label="Alternar tema"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenu(!userMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-navy-950 font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-navy-800 dark:text-gray-200 max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <div className="hidden sm:flex items-center gap-1 badge-gold text-[10px]">
                    <span>⭐</span>
                    <span>{user.level}</span>
                  </div>
                  <ChevronDown size={14} className={`text-navy-400 transition-transform ${userMenu ? 'rotate-180' : ''}`} />
                </button>

                {userMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-navy-900 rounded-xl shadow-xl border border-navy-200 dark:border-navy-700 py-2 z-50 animate-slide-up">
                      <div className="px-4 py-2 border-b border-navy-100 dark:border-navy-800">
                        <p className="font-medium text-navy-900 dark:text-white text-sm">{user.name}</p>
                        <p className="text-xs text-navy-500 dark:text-gray-400">{user.title} • Nível {user.level}</p>
                        <div className="mt-1 progress-bar h-1.5">
                          <div className="progress-fill" style={{ width: `${Math.min((user.xp % 2000) / 20, 100)}%` }} />
                        </div>
                        <p className="text-[10px] text-gold-500 mt-0.5">{user.xp.toLocaleString()} XP</p>
                      </div>
                      <Link to="/profile" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-navy-700 dark:text-gray-300 hover:bg-navy-50 dark:hover:bg-navy-800">
                        <User size={14} /> Meu Perfil
                      </Link>
                      <Link to="/achievements" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-navy-700 dark:text-gray-300 hover:bg-navy-50 dark:hover:bg-navy-800">
                        <Award size={14} /> Conquistas
                      </Link>
                      <hr className="my-1 border-navy-100 dark:border-navy-800" />
                      <button
                        onClick={() => { logout(); setUserMenu(false) }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 w-full"
                      >
                        <LogOut size={14} /> Sair
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Entrar</Link>
                <Link to="/register" className="btn-primary text-sm !px-4 !py-2">Criar Conta</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-navy-600 dark:text-gray-400 hover:bg-navy-100 dark:hover:bg-navy-800"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 animate-slide-up">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                    active ? 'bg-gold-500/15 text-gold-600' : 'text-navy-600 dark:text-gray-400'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </nav>
  )
}
