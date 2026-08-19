import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { Clock, CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy, Zap, Target } from 'lucide-react'

type Question = {
  id: string; text: string; type: string; options?: string[];
  optionA?: string; optionB?: string; optionC?: string; optionD?: string;
  answer: string; explanation: string; book: string; chapter?: number; verse?: number;
  difficulty: string; category: string; xp?: number;
}

// Normaliza respostas de true_false: UI mostra "Verdadeiro"/"Falso", banco guarda "True"/"False"
function normalizeAnswer(type: string | undefined, answer: string): string {
  const t = (answer || '').trim().toLowerCase()
  if (type === 'true_false') {
    if (t === 'verdadeiro' || t === 'true' || t === 'v') return 'true'
    if (t === 'falso' || t === 'false' || t === 'f') return 'false'
  }
  return t
}

function isAnswerCorrect(type: string | undefined, selected: string, correct: string): boolean {
  return normalizeAnswer(type, selected) === normalizeAnswer(type, correct)
}

export default function Quiz() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()

  // Config
  const difficulty = searchParams.get('difficulty') || 'all'
  const bookFilter = searchParams.get('book') || undefined
  const typeFilter = searchParams.get('type') || undefined

  // State
  const [phase, setPhase] = useState<'config' | 'playing' | 'result'>('config')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [answers, setAnswers] = useState<any[]>([])
  const [timer, setTimer] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const timerRef = useRef<number | null>(null)

  // Timer
  useEffect(() => {
    if (phase === 'playing' && !isAnswered) {
      timerRef.current = window.setInterval(() => setTimer(t => t + 1), 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase, isAnswered])

  // Start quiz
  const startQuiz = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.generateQuiz({
        difficulty: difficulty !== 'all' ? difficulty : undefined,
        book: bookFilter,
        type: typeFilter,
        count: 10
      })
      if (!data.questions || data.questions.length === 0) {
        alert('Nenhuma pergunta encontrada para esta configuração.')
        setLoading(false)
        return
      }
      setQuestions(data.questions)
      setPhase('playing')
      setCurrentIndex(0)
      setAnswers([])
      setTimer(0)
    } catch (err: any) {
      alert('Erro ao carregar perguntas: ' + err.message)
    }
    setLoading(false)
  }, [difficulty, bookFilter, typeFilter])

  // Countdown before start
  useEffect(() => {
    if (phase === 'playing' && questions.length > 0 && currentIndex === 0 && answers.length === 0) {
      setCountdown(3)
      const iv = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) { clearInterval(iv); return 0 }
          return c - 1
        })
      }, 800)
      return () => clearInterval(iv)
    }
  }, [phase, questions])

  // Select answer
  const selectAnswer = (answer: string) => {
    if (isAnswered) return
    setSelectedAnswer(answer)
    setIsAnswered(true)
    if (timerRef.current) clearInterval(timerRef.current)

    const q = questions[currentIndex]
    const correct = isAnswerCorrect(q.type, answer, q.answer)
    setAnswers(prev => [...prev, {
      questionId: q.id,
      answer,
      normalizedAnswer: normalizeAnswer(q.type, answer),
      correct,
      timeSpent: timer,
      correctAnswer: q.answer,
      explanation: q.explanation,
      book: q.book,
      chapter: q.chapter,
      verse: q.verse
    }])
  }

  // Next question or submit
  const nextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      submitQuiz()
    } else {
      setCurrentIndex(i => i + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
      setTimer(0)
    }
  }

  // Submit
  const submitQuiz = async () => {
    setLoading(true)
    try {
      const data = await api.submitQuiz({
        answers: answers.map(a => ({ questionId: a.questionId, answer: a.normalizedAnswer || a.answer, timeSpent: a.timeSpent })),
        difficulty: difficulty !== 'all' ? difficulty : undefined,
        book: bookFilter,
        gameType: typeFilter || 'quiz'
      })
      setResult({ ...data, allAnswers: answers })
      setPhase('result')
    } catch (err: any) {
      alert('Erro ao enviar respostas: ' + err.message)
    }
    setLoading(false)
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const currentQ = questions[currentIndex]
  const progress = questions.length > 0 ? ((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100 : 0

  // ─── CONFIG PHASE ──────────────────────────────
  if (phase === 'config') {
    return (
      <div className="page-container max-w-2xl mx-auto animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="section-title text-3xl mb-2">Quiz Bíblico</h1>
          <p className="text-navy-500 dark:text-gray-400">10 perguntas para testar seus conhecimentos</p>
        </div>

        <div className="card space-y-6">
          <div className="text-center">
            <p className="text-sm text-navy-500 dark:text-gray-400 mb-2">Dificuldade</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['all', 'easy', 'medium', 'hard', 'expert', 'master'].map(d => (
                <button key={d} onClick={() => navigate(`/games/quiz?difficulty=${d}${typeFilter ? '&type=' + typeFilter : ''}${bookFilter ? '&book=' + bookFilter : ''}`)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    difficulty === d ? 'bg-gold-500 text-navy-950' : 'bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-gray-300 hover:bg-navy-200'
                  }`}>
                  {d === 'all' ? 'Todos' : d === 'easy' ? 'Fácil' : d === 'medium' ? 'Médio' : d === 'hard' ? 'Difícil' : d === 'expert' ? 'Especialista' : 'Mestre'}
                </button>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button onClick={startQuiz} disabled={loading} className="btn-primary text-lg !px-10 !py-4">
              {loading ? <div className="animate-spin w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full inline-block" /> : '▶ COMEÇAR QUIZ'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── COUNTDOWN ─────────────────────────────────
  if (countdown > 0) {
    return (
      <div className="page-container max-w-2xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-fade-in">
          <div className="text-8xl font-display font-bold text-gold-500 animate-pulse">{countdown}</div>
          <p className="text-navy-500 dark:text-gray-400 mt-4 text-lg">Prepare-se...</p>
        </div>
      </div>
    )
  }

  // ─── RESULT PHASE ──────────────────────────────
  if (phase === 'result' && result) {
    const pct = result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0
    const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '⭐' : pct >= 40 ? '💪' : '📚'
    const msg = pct >= 80 ? 'Incrível! Você é um verdadeiro conhecedor da Bíblia!' :
                pct >= 60 ? 'Muito bem! Continue estudando!' :
                pct >= 40 ? 'Bom esforço! Cada dia aprendendo mais!' :
                'Não desanime! A Bíblia tem muito para ensinar!'

    return (
      <div className="page-container max-w-3xl mx-auto animate-fade-in">
        {/* Header do resultado */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">{emoji}</div>
          <h1 className="section-title text-3xl mb-2">Resultado do Quiz</h1>
          <p className="text-navy-500 dark:text-gray-400">{msg}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: '🎯', label: 'Acertos', value: `${result.correct}/${result.total}`, color: 'text-emerald-500' },
            { icon: '📊', label: 'Precisão', value: `${pct}%`, color: 'text-blue-500' },
            { icon: '⭐', label: 'XP Ganho', value: `+${result.xpEarned}`, color: 'text-gold-500' },
            { icon: '📈', label: 'Nível', value: `${result.level}`, color: 'text-purple-500' },
          ].map(({ icon, label, value, color }) => (
            <div key={label} className="card text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <div className={`text-xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-navy-500 dark:text-gray-400">{label}</div>
            </div>
          ))}
        </div>

        {result.perfectBonus && (
          <div className="bg-gold-500/10 border border-gold-500/30 rounded-xl p-4 text-center mb-8">
            <p className="text-gold-600 dark:text-gold-400 font-bold">✨ Bônus de Perfeição! +250 XP</p>
          </div>
        )}

        {/* Respostas detalhadas */}
        <div className="space-y-4 mb-8">
          <h2 className="font-display font-bold text-xl text-navy-900 dark:text-white">Revisão das Respostas</h2>
          {result.answers?.map((a: any, i: number) => (
            <div key={i} className={`card ${a.correct ? 'border-emerald-300 dark:border-emerald-700' : 'border-red-300 dark:border-red-700'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  a.correct ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600' : 'bg-red-100 dark:bg-red-900/50 text-red-600'
                }`}>
                  {a.correct ? <CheckCircle size={18} /> : <XCircle size={18} />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-navy-900 dark:text-white text-sm">{a.questionText || `Pergunta ${i + 1}`}</p>
                  <p className="text-xs mt-1">
                    <span className="text-navy-500">Sua resposta: </span>
                    <span className={a.correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                      {a.userAnswer}
                    </span>
                    {!a.correct && (
                      <span className="text-emerald-600 dark:text-emerald-400 ml-2">
                        (Correto: {a.correctAnswer})
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-navy-500 dark:text-gray-400 mt-1 italic">{a.explanation}</p>
                  {a.book && (
                    <p className="text-xs text-gold-500 mt-1">📖 {a.book}{a.chapter ? ` ${a.chapter}` : ''}{a.verse ? `:${a.verse}` : ''}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => { setPhase('config'); setResult(null); setQuestions([]) }} className="btn-primary flex items-center gap-2">
            <RotateCcw size={18} /> Jogar Novamente
          </button>
          <button onClick={() => navigate('/ranking')} className="btn-secondary flex items-center gap-2">
            <Trophy size={18} /> Ver Ranking
          </button>
        </div>
      </div>
    )
  }

  // ─── PLAYING PHASE ─────────────────────────────
  if (!currentQ) return null

  return (
    <div className="page-container max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-navy-500 dark:text-gray-400">Pergunta {currentIndex + 1} de {questions.length}</p>
          <div className="progress-bar w-48 mt-1">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 badge-navy">
            <Clock size={14} />
            <span className="font-mono font-bold">{formatTime(timer)}</span>
          </div>
          <div className="badge-gold">
            <Target size={14} />
            <span>{answers.filter(a => a.correct).length}/{answers.length}</span>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="card !p-8 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="badge-gold text-[10px]">{currentQ.difficulty}</span>
          <span className="badge-navy text-[10px]">{currentQ.category}</span>
          {currentQ.book && (
            <span className="text-xs text-navy-400">
              📖 {currentQ.book}{currentQ.chapter ? ` ${currentQ.chapter}` : ''}{currentQ.verse ? `:${currentQ.verse}` : ''}
            </span>
          )}
        </div>

        <h2 className="text-xl md:text-2xl font-display font-bold text-navy-900 dark:text-white mb-8">
          {currentQ.text}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {(() => {
            let options: string[] = []
            if (currentQ.options && currentQ.options.length > 0) {
              options = currentQ.options
            } else if (currentQ.type === 'true_false') {
              options = ['Verdadeiro', 'Falso']
            } else if (currentQ.type === 'who_said' || currentQ.type === 'character') {
              options = [currentQ.optionA, currentQ.optionB, currentQ.optionC, currentQ.optionD].filter(Boolean) as string[]
            }
            return options.map((opt, i) => {
              const letter = String.fromCharCode(65 + i)
              const isSelected = selectedAnswer === opt
              const isCorrect = isAnswerCorrect(currentQ.type, opt, currentQ.answer)
              const showResult = isAnswered

              let optClass = 'border-navy-200 dark:border-navy-700 hover:border-gold-500/50 hover:bg-gold-500/5'
              if (showResult && isCorrect) optClass = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
              if (showResult && isSelected && !isCorrect) optClass = 'border-red-400 bg-red-50 dark:bg-red-900/20'
              if (showResult && !isCorrect && !isSelected) optClass = 'border-navy-200 dark:border-navy-700 opacity-50'

              return (
                <button
                  key={i}
                  onClick={() => selectAnswer(opt)}
                  disabled={isAnswered}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 text-left ${optClass}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    showResult && isCorrect ? 'bg-emerald-500 text-white' :
                    showResult && isSelected ? 'bg-red-500 text-white' :
                    'bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-gray-300'
                  }`}>
                    {showResult && isCorrect ? <CheckCircle size={18} /> :
                     showResult && isSelected ? <XCircle size={18} /> :
                     letter}
                  </div>
                  <span className="font-medium text-navy-800 dark:text-gray-200">{opt}</span>
                </button>
              )
            })
          })()}
        </div>

        {/* Feedback after answer */}
        {isAnswered && (
          <div className="mt-6 animate-slide-up">
            <div className={`p-4 rounded-xl ${
              isAnswerCorrect(currentQ.type, selectedAnswer || '', currentQ.answer)
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <p className={`font-bold mb-1 ${
                isAnswerCorrect(currentQ.type, selectedAnswer || '', currentQ.answer)
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-red-700 dark:text-red-400'
              }`}>
                {isAnswerCorrect(currentQ.type, selectedAnswer || '', currentQ.answer) ? '✅ Correto!' : '❌ Incorreto!'}
              </p>
              <p className="text-sm text-navy-600 dark:text-gray-300">{currentQ.explanation}</p>
              <p className="text-xs text-gold-500 mt-2">📖 {currentQ.book}{currentQ.chapter ? ` ${currentQ.chapter}` : ''}{currentQ.verse ? `:${currentQ.verse}` : ''}</p>
            </div>

            <button onClick={nextQuestion} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
              {currentIndex + 1 >= questions.length ? (
                <>{loading ? <div className="animate-spin w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full" /> : <><Trophy size={18} /> Ver Resultado</>}</>
              ) : (
                <>Próxima <ArrowRight size={18} /></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
