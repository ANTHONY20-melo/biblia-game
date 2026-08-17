const API_BASE = '/api'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token')

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Erro na requisição')
  }

  return data as T
}

export const api = {
  // ─── AUTH ───
  register: (body: { email: string; password: string; name: string }) =>
    request<{ user: any; accessToken: string }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<{ user: any; accessToken: string }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  me: () => request<any>('/auth/me'),

  updateProfile: (body: any) =>
    request<any>('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),

  // ─── QUIZ ───
  generateQuiz: (params: { difficulty?: string; book?: string; type?: string; count?: number }) => {
    const qs = new URLSearchParams()
    if (params.difficulty) qs.set('difficulty', params.difficulty)
    if (params.book) qs.set('book', params.book)
    if (params.type) qs.set('type', params.type)
    if (params.count) qs.set('count', String(params.count))
    return request<any>(`/quiz/generate?${qs}`)
  },

  submitQuiz: (body: { answers: any[]; difficulty?: string; book?: string; gameType?: string }) =>
    request<any>('/quiz/submit', { method: 'POST', body: JSON.stringify(body) }),

  quizHistory: (page = 1) => request<any>(`/quiz/history?page=${page}`),

  quizStats: () => request<any>('/quiz/stats'),

  // ─── RANKING ───
  rankingGlobal: () => request<any[]>('/ranking/global'),
  rankingWeekly: () => request<any[]>('/ranking/weekly'),
  myRankingPosition: () => request<any>('/ranking/my-position'),

  // ─── ACHIEVEMENTS ───
  allAchievements: () => request<any[]>('/achievements'),
  myAchievements: () => request<any[]>('/achievements/my'),
  checkAchievements: () => request<any>('/achievements/check', { method: 'POST' }),

  // ─── BIBLE ───
  bibleBooks: () => request<any[]>('/bible/books'),
  bibleBooksOld: () => request<any[]>('/bible/books/old'),
  bibleBooksNew: () => request<any[]>('/bible/books/new'),

  // ─── DAILY ───
  dailyChallenge: () => request<any>('/daily/today'),
  dailyAnswer: (body: { questionId: string; answer: string; timeSpent?: number }) =>
    request<any>('/daily/answer', { method: 'POST', body: JSON.stringify(body) }),

  // ─── USERS ───
  userProfile: (id: string) => request<any>(`/users/${id}`),
  searchUsers: (name: string) => request<any[]>(`/users/search/${encodeURIComponent(name)}`),
}
