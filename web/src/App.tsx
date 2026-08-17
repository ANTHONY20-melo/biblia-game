import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Games from './pages/Games'
import Quiz from './pages/Quiz'
import Ranking from './pages/Ranking'
import Profile from './pages/Profile'
import Achievements from './pages/Achievements'
import DailyChallenge from './pages/DailyChallenge'
import Bible from './pages/Bible'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore()
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full" /></div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const { loadUser, loading } = useAuthStore()
  const { dark } = useThemeStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  useEffect(() => {
    loadUser()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-parchment-50 dark:bg-navy-950">
        <div className="text-center animate-fade-in">
          <div className="text-6xl mb-4">✝️</div>
          <div className="animate-spin w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-navy-600 dark:text-gray-400 font-display">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/daily" element={<ProtectedRoute><DailyChallenge /></ProtectedRoute>} />
          <Route path="/bible" element={<Bible />} />
          <Route path="/profile/:id" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
