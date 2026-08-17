import { create } from 'zustand'
import { api } from '../lib/api'

interface User {
  id: string
  email: string
  name: string
  xp: number
  level: number
  title: string
  avatar?: string
  streak: number
  coins: number
  role: string
  profile?: {
    bio?: string
    church?: string
    totalGames: number
    wins: number
    losses: number
    accuracy: number
  }
  achievements?: any[]
}

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null

  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  loadUser: () => Promise<void>
  updateProfile: (data: any) => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,

  login: async (email, password) => {
    try {
      set({ error: null })
      const { user, accessToken } = await api.login({ email, password })
      localStorage.setItem('token', accessToken)
      set({ user })
    } catch (err: any) {
      set({ error: err.message })
      throw err
    }
  },

  register: async (email, password, name) => {
    try {
      set({ error: null })
      const { user, accessToken } = await api.register({ email, password, name })
      localStorage.setItem('token', accessToken)
      set({ user })
    } catch (err: any) {
      set({ error: err.message })
      throw err
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null })
  },

  loadUser: async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      set({ loading: false })
      return
    }

    try {
      const user = await api.me()
      set({ user, loading: false })
    } catch {
      localStorage.removeItem('token')
      set({ user: null, loading: false })
    }
  },

  updateProfile: async (data) => {
    const user = await api.updateProfile(data)
    set({ user })
  },

  clearError: () => set({ error: null }),
}))
