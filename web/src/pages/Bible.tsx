import { useEffect, useState, useMemo } from 'react'
import { api } from '../lib/api'
import { BookOpen, Search, ChevronRight, ChevronDown } from 'lucide-react'

// TYPE-03: BookList movido para fora do componente pai para evitar recriação a cada render
type BookItem = { id: string; name: string; chapters: number; order: number; testament: string }

type BookListProps = {
  title: string
  items: BookItem[]
  icon: string
  search: string
  expanded: string | null
  onToggle: (name: string) => void
}

function BookList({ title, items, icon, search, expanded, onToggle }: BookListProps) {
  const filtered = useMemo(() =>
    search ? items.filter(b => b.name.toLowerCase().includes(search.toLowerCase())) : items
  , [items, search])

  return (
    <div className="mb-8">
      <h2 className="font-display font-bold text-lg text-navy-900 dark:text-white mb-4 flex items-center gap-2">
        {icon} {title}
      </h2>
      <div className="space-y-2">
        {filtered.map(book => (
          <div key={book.id} className="card !p-4 group hover:border-gold-500/30 cursor-pointer"
            onClick={() => onToggle(book.name)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500 font-bold text-xs">
                  {book.order}
                </div>
                <div>
                  <p className="font-medium text-navy-900 dark:text-white text-sm">{book.name}</p>
                  <p className="text-xs text-navy-400">{book.chapters} capítulos</p>
                </div>
              </div>
              {expanded === book.name ? <ChevronDown size={16} className="text-navy-400" /> : <ChevronRight size={16} className="text-navy-400" />}
            </div>
            {expanded === book.name && (
              <div className="mt-4 pt-4 border-t border-navy-100 dark:border-navy-800 animate-slide-up">
                <p className="text-xs text-navy-500 dark:text-gray-400 mb-3">
                  Escolha um nível de dificuldade para jogar com perguntas deste livro:
                </p>
                <div className="flex flex-wrap gap-2">
                  {(['easy', 'medium', 'hard', 'expert', 'master'] as const).map(d => (
                    <a key={d}
                      href={`/games/quiz?book=${encodeURIComponent(book.name)}&difficulty=${d}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-gray-300 hover:bg-gold-500 hover:text-navy-950 transition-colors"
                    >
                      {d === 'easy' ? 'Fácil' : d === 'medium' ? 'Médio' : d === 'hard' ? 'Difícil' : d === 'expert' ? 'Especialista' : 'Mestre'}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Bible() {
  const [books, setBooks] = useState<BookItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    api.bibleBooks().then(b => { setBooks(b); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const oldTestament = useMemo(() => books.filter(b => b.testament === 'old'), [books])
  const newTestament = useMemo(() => books.filter(b => b.testament === 'new'), [books])

  if (loading) return (
    <div className="page-container max-w-4xl mx-auto">
      <div className="skeleton h-12 w-64 mx-auto mb-8" />
      <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
    </div>
  )

  return (
    <div className="page-container max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="section-title text-3xl mb-2">
          <span className="text-gold-500">Bíblia</span> Interativa
        </h1>
        <p className="text-navy-500 dark:text-gray-400">
          {books.length} livros — {oldTestament.length} no Antigo Testamento, {newTestament.length} no Novo Testamento
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8 max-w-md mx-auto">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field !pl-10"
          placeholder="Buscar livro..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <BookList title="Antigo Testamento" items={oldTestament} icon="📜" search={search} expanded={expanded} onToggle={name => setExpanded(expanded === name ? null : name)} />
        <BookList title="Novo Testamento" items={newTestament} icon="✝️" search={search} expanded={expanded} onToggle={name => setExpanded(expanded === name ? null : name)} />
      </div>
    </div>
  )
}
