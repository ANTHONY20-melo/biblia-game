import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { Calendar, CheckCircle, XCircle, Clock, ArrowRight, Flame, Trophy, Star } from 'lucide-react'

type Question = {
  id: string; text: string; type: string; options?: string[];
  answer: string; explanation: string; book: string; chapter?: number; verse?: number;
}

export default function DailyChallenge() {
  const { user } = useAuthStore()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(10)
  const [completed, setCompleted] = useState(false)
  const [xpEarned, setXpEarned] = useState(0)
  const [loading, setLoading] = useState(true)
  const [streak, setStreak] = useState(0)
  const [timer, setTimer] = useState(0)
  const [feedback, setFeedback] = useState<{ correct: boolean; correctAnswer: string; explanation: string } | null>(null)
  // LOG-07: Input para fill_blank
  const [fillBlankInput, setFillBlankInput] = useState('')

  useEffect(() => {
    api.dailyChallenge().then(data => {
      setTotal(data.total || 10)
      setScore(data.score || 0)
      setCompleted(data.completed)
      setXpEarned(data.xpEarned || 0)
      setQuestions(data.questions || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!completed && questions.length > 0 && !isAnswered) {
      const iv = setInterval(() => setTimer(t => t + 1), 1000)
      return () => clearInterval(iv)
    }
  }, [completed, isAnswered, questions])

  const answerQuestion = useCallback(async (answer: string) => {
    if (isAnswered || !questions[currentIndex]) return
    setSelectedAnswer(answer)
    setIsAnswered(true)

    try {
      const result = await api.dailyAnswer({
        questionId: questions[currentIndex].id,
        answer,
        timeSpent: timer
      })
      setFeedback({ correct: result.correct, correctAnswer: result.correctAnswer, explanation: result.explanation })
      if (result.correct) setScore(s => s + 1)
      setXpEarned(x => x + (result.xpEarned || 0))
      if (result.completed) setCompleted(true)
    } catch {}
  }, [isAnswered, currentIndex, questions, timer])

  const nextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      setCompleted(true)
    } else {
      setCurrentIndex(i => i + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
      setFeedback(null)
      setTimer(0)
      setFillBlankInput('')
    }
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  if (loading) return (
    <div className="page-container max-w-2xl mx-auto">
      <div className="skeleton h-48 rounded-2xl" />
    </div>
  )

  // Completed state
  if (completed || questions.length === 0) {
    const pct = total > 0 ? Math.round((score / total) * 100) : 0
    return (
      <div className="page-container max-w-2xl mx-auto animate-fade-in text-center">
        <div className="card">
          <div className="text-6xl mb-4">{pct >= 80 ? '🏆' : pct >= 60 ? '⭐' : '📅'}</div>
          <h1 className="section-title text-2xl mb-2">Desafio do Dia</h1>
          {completed ? (
            <>
              <p className="text-navy-500 dark:text-gray-400 mb-6">Parabéns! Você completou o desafio de hoje!</p>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-navy-50 dark:bg-navy-800 rounded-xl">
                  <div className="text-2xl font-bold text-emerald-500">{score}/{total}</div>
                  <div className="text-xs text-navy-500">Acertos</div>
                </div>
                <div className="p-4 bg-navy-50 dark:bg-navy-800 rounded-xl">
                  <div className="text-2xl font-bold text-gold-500">+{xpEarned}</div>
                  <div className="text-xs text-navy-500">XP Total</div>
                </div>
                <div className="p-4 bg-navy-50 dark:bg-navy-800 rounded-xl">
                  <div className="text-2xl font-bold text-orange-500">🔥</div>
                  <div className="text-xs text-navy-500">Volte amanhã!</div>
                </div>
              </div>
            </>
          ) : (
            // LOG-08: Corrigido "Voltante" → "Volte"
            <p className="text-navy-500 dark:text-gray-400">Volte amanhã para um novo desafio!</p>
          )}
        </div>
      </div>
    )
  }

  const currentQ = questions[currentIndex]

  // LOG-07: Gerar opções para true_false e fill_blank
  const getDisplayOptions = (): string[] => {
    if (currentQ.options && currentQ.options.length > 0) {
      return currentQ.options
    }
    if (currentQ.type === 'true_false') {
      return ['True', 'False']
    }
    return []
  }

  const displayOptions = getDisplayOptions()
  const isFillBlank = currentQ.type === 'fill_blank'

  return (
    <div className="page-container max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-xl text-navy-900 dark:text-white flex items-center gap-2">
            <Calendar size={20} className="text-gold-500" /> Desafio do Dia
          </h1>
          <p className="text-sm text-navy-500 dark:text-gray-400">Pergunta {currentIndex + 1} de {questions.length}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 badge-navy">
            <Clock size={14} />
            <span className="font-mono font-bold">{formatTime(timer)}</span>
          </div>
          <div className="badge-gold">
            <span>{score}/{total}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="progress-bar mb-6">
        <div className="progress-fill" style={{ width: `${((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="card !p-8">
        <h2 className="text-xl font-display font-bold text-navy-900 dark:text-white mb-6">{currentQ.text}</h2>

        <div className="space-y-3">
          {isFillBlank ? (
            // LOG-07: Input de texto para fill_blank
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={fillBlankInput}
                onChange={e => setFillBlankInput(e.target.value)}
                disabled={isAnswered}
                placeholder="Digite sua resposta..."
                className="input-field flex-1"
                onKeyDown={e => {
                  if (e.key === 'Enter' && fillBlankInput.trim() && !isAnswered) {
                    answerQuestion(fillBlankInput.trim())
                  }
                }}
              />
              {!isAnswered && (
                <button
                  onClick={() => fillBlankInput.trim() && answerQuestion(fillBlankInput.trim())}
                  disabled={!fillBlankInput.trim()}
                  className="btn-primary px-6"
                >
                  Enviar
                </button>
              )}
            </div>
          ) : (
            // LOG-06: Corrigido — comparar com .toLowerCase().trim()
            displayOptions.map((opt, i) => {
              const letter = String.fromCharCode(65 + i)
              const isSelected = selectedAnswer === opt
              const isCorrect = opt.toLowerCase().trim() === currentQ.answer.toLowerCase().trim()

              let cls = 'border-navy-200 dark:border-navy-700 hover:border-gold-500/50 hover:bg-gold-500/5'
              if (isAnswered && isCorrect) cls = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
              if (isAnswered && isSelected && !isCorrect) cls = 'border-red-400 bg-red-50 dark:bg-red-900/20'
              if (isAnswered && !isCorrect && !isSelected) cls = 'border-navy-200 dark:border-navy-700 opacity-50'

              return (
                <button key={i} onClick={() => answerQuestion(opt)} disabled={isAnswered}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${cls}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    isAnswered && isCorrect ? 'bg-emerald-500 text-white' :
                    isAnswered && isSelected ? 'bg-red-500 text-white' :
                    'bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-gray-300'
                  }`}>
                    {isAnswered && isCorrect ? <CheckCircle size={18} /> :
                     isAnswered && isSelected ? <XCircle size={18} /> : letter}
                  </div>
                  <span className="font-medium text-navy-800 dark:text-gray-200">{opt}</span>
                </button>
              )
            })
          )}
        </div>

        {feedback && (
          <div className="mt-6 animate-slide-up">
            <div className={`p-4 rounded-xl ${feedback.correct ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
              <p className={`font-bold mb-1 ${feedback.correct ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                {feedback.correct ? '✅ Correto! +100 XP' : '❌ Incorreto'}
              </p>
              <p className="text-sm text-navy-600 dark:text-gray-300">{feedback.explanation}</p>
              <p className="text-xs text-gold-500 mt-2">📖 {currentQ.book}{currentQ.chapter ? ` ${currentQ.chapter}` : ''}{currentQ.verse ? `:${currentQ.verse}` : ''}</p>
            </div>
            <button onClick={nextQuestion} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
              {currentIndex + 1 >= questions.length ? 'Ver Resultado' : <>Próxima <ArrowRight size={18} /></>}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
