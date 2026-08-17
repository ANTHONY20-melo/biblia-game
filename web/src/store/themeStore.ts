import { create } from 'zustand'

interface ThemeState {
  dark: boolean
  toggle: () => void
  setDark: (value: boolean) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  dark: typeof window !== 'undefined'
    ? localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    : false,

  toggle: () => set((state) => {
    const newDark = !state.dark
    localStorage.setItem('theme', newDark ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', newDark)
    return { dark: newDark }
  }),

  setDark: (value) => {
    localStorage.setItem('theme', value ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', value)
    set({ dark: value })
  },
}))
