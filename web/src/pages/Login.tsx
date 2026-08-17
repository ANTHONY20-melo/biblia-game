import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch { /* error shown in store */ }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-4xl">✝️</span>
            <span className="font-display font-bold text-2xl text-white">BÍBLIA <span className="text-gold-400">GAME</span></span>
          </Link>
          <p className="text-navy-400 mt-3">Entre na sua conta e continue jogando</p>
        </div>

        {/* Form */}
        <div className="card !bg-navy-900/50 !border-navy-700/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-navy-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); clearError() }}
                  className="input-field !pl-10 !bg-navy-800 !border-navy-700 !text-white placeholder:text-navy-500"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-300 mb-1.5">Senha</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearError() }}
                  className="input-field !pl-10 !pr-10 !bg-navy-800 !border-navy-700 !text-white placeholder:text-navy-500"
                  placeholder="Sua senha"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-500 hover:text-navy-300">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? <div className="animate-spin w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full" /> : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-navy-400">
              Não tem conta?{' '}
              <Link to="/register" className="text-gold-400 hover:text-gold-300 font-medium">Criar conta</Link>
            </p>
          </div>
        </div>

        {/* Demo */}
        <div className="mt-4 text-center text-xs text-navy-500">
          <p>Conta de teste: admin@bibliagame.com / admin123</p>
        </div>
      </div>
    </div>
  )
}
