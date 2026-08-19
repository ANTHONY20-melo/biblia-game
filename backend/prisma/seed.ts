import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ─── LIVROS DA BÍBLIA ───────────────────────────────────

const BIBLE_BOOKS = [
  // ANTIGO TESTAMENTO
  { name: 'Gênesis', abbrev: 'Gen', testament: 'old', chapters: 50, order: 1 },
  { name: 'Êxodo', abbrev: 'Ex', testament: 'old', chapters: 40, order: 2 },
  { name: 'Levítico', abbrev: 'Lv', testament: 'old', chapters: 27, order: 3 },
  { name: 'Números', abbrev: 'Nm', testament: 'old', chapters: 36, order: 4 },
  { name: 'Deuteronômio', abbrev: 'Dt', testament: 'old', chapters: 34, order: 5 },
  { name: 'Josué', abbrev: 'Js', testament: 'old', chapters: 24, order: 6 },
  { name: 'Juízes', abbrev: 'Jz', testament: 'old', chapters: 21, order: 7 },
  { name: 'Rute', abbrev: 'Rt', testament: 'old', chapters: 4, order: 8 },
  { name: '1 Samuel', abbrev: '1Sm', testament: 'old', chapters: 31, order: 9 },
  { name: '2 Samuel', abbrev: '2Sm', testament: 'old', chapters: 24, order: 10 },
  { name: '1 Reis', abbrev: '1Rs', testament: 'old', chapters: 22, order: 11 },
  { name: '2 Reis', abbrev: '2Rs', testament: 'old', chapters: 25, order: 12 },
  { name: '1 Crônicas', abbrev: '1Cr', testament: 'old', chapters: 29, order: 13 },
  { name: '2 Crônicas', abbrev: '2Cr', testament: 'old', chapters: 36, order: 14 },
  { name: 'Esdras', abbrev: 'Ed', testament: 'old', chapters: 10, order: 15 },
  { name: 'Neemias', abbrev: 'Ne', testament: 'old', chapters: 13, order: 16 },
  { name: 'Ester', abbrev: 'Et', testament: 'old', chapters: 10, order: 17 },
  { name: 'Jó', abbrev: 'Jó', testament: 'old', chapters: 42, order: 18 },
  { name: 'Salmos', abbrev: 'Sl', testament: 'old', chapters: 150, order: 19 },
  { name: 'Provérbios', abbrev: 'Pv', testament: 'old', chapters: 31, order: 20 },
  { name: 'Eclesiastes', abbrev: 'Ec', testament: 'old', chapters: 12, order: 21 },
  { name: 'Cânticos', abbrev: 'Ct', testament: 'old', chapters: 8, order: 22 },
  { name: 'Isaías', abbrev: 'Is', testament: 'old', chapters: 66, order: 23 },
  { name: 'Jeremias', abbrev: 'Jr', testament: 'old', chapters: 52, order: 24 },
  { name: 'Lamentações', abbrev: 'Lm', testament: 'old', chapters: 5, order: 25 },
  { name: 'Ezequiel', abbrev: 'Ez', testament: 'old', chapters: 48, order: 26 },
  { name: 'Daniel', abbrev: 'Dn', testament: 'old', chapters: 12, order: 27 },
  { name: 'Oseias', abbrev: 'Os', testament: 'old', chapters: 14, order: 28 },
  { name: 'Joel', abbrev: 'Jl', testament: 'old', chapters: 3, order: 29 },
  { name: 'Amós', abbrev: 'Am', testament: 'old', chapters: 9, order: 30 },
  { name: 'Obadias', abbrev: 'Ob', testament: 'old', chapters: 1, order: 31 },
  { name: 'Jonas', abbrev: 'Jn', testament: 'old', chapters: 4, order: 32 },
  { name: 'Miqueias', abbrev: 'Mq', testament: 'old', chapters: 7, order: 33 },
  { name: 'Naum', abbrev: 'Na', testament: 'old', chapters: 3, order: 34 },
  { name: 'Habacuque', abbrev: 'Hc', testament: 'old', chapters: 3, order: 35 },
  { name: 'Sofonias', abbrev: 'Sf', testament: 'old', chapters: 3, order: 36 },
  { name: 'Ageu', abbrev: 'Ag', testament: 'old', chapters: 2, order: 37 },
  { name: 'Zacarias', abbrev: 'Zc', testament: 'old', chapters: 14, order: 38 },
  { name: 'Malaquias', abbrev: 'Ml', testament: 'old', chapters: 4, order: 39 },
  // NOVO TESTAMENTO
  { name: 'Mateus', abbrev: 'Mt', testament: 'new', chapters: 28, order: 40 },
  { name: 'Marcos', abbrev: 'Mc', testament: 'new', chapters: 16, order: 41 },
  { name: 'Lucas', abbrev: 'Lc', testament: 'new', chapters: 24, order: 42 },
  { name: 'João', abbrev: 'Jo', testament: 'new', chapters: 21, order: 43 },
  { name: 'Atos', abbrev: 'At', testament: 'new', chapters: 28, order: 44 },
  { name: 'Romanos', abbrev: 'Rm', testament: 'new', chapters: 16, order: 45 },
  { name: '1 Coríntios', abbrev: '1Co', testament: 'new', chapters: 16, order: 46 },
  { name: '2 Coríntios', abbrev: '2Co', testament: 'new', chapters: 13, order: 47 },
  { name: 'Gálatas', abbrev: 'Gl', testament: 'new', chapters: 6, order: 48 },
  { name: 'Efésios', abbrev: 'Ef', testament: 'new', chapters: 6, order: 49 },
  { name: 'Filipenses', abbrev: 'Fp', testament: 'new', chapters: 4, order: 50 },
  { name: 'Colossenses', abbrev: 'Cl', testament: 'new', chapters: 4, order: 51 },
  { name: '1 Tessalonicenses', abbrev: '1Ts', testament: 'new', chapters: 5, order: 52 },
  { name: '2 Tessalonicenses', abbrev: '2Ts', testament: 'new', chapters: 3, order: 53 },
  { name: '1 Timóteo', abbrev: '1Tm', testament: 'new', chapters: 6, order: 54 },
  { name: '2 Timóteo', abbrev: '2Tm', testament: 'new', chapters: 4, order: 55 },
  { name: 'Tito', abbrev: 'Tt', testament: 'new', chapters: 3, order: 56 },
  { name: 'Filemom', abbrev: 'Fm', testament: 'new', chapters: 1, order: 57 },
  { name: 'Hebreus', abbrev: 'Hb', testament: 'new', chapters: 13, order: 58 },
  { name: 'Tiago', abbrev: 'Tg', testament: 'new', chapters: 5, order: 59 },
  { name: '1 Pedro', abbrev: '1Pe', testament: 'new', chapters: 5, order: 60 },
  { name: '2 Pedro', abbrev: '2Pe', testament: 'new', chapters: 3, order: 61 },
  { name: '1 João', abbrev: '1Jo', testament: 'new', chapters: 5, order: 62 },
  { name: '2 João', abbrev: '2Jo', testament: 'new', chapters: 1, order: 63 },
  { name: '3 João', abbrev: '3Jo', testament: 'new', chapters: 1, order: 64 },
  { name: 'Judas', abbrev: 'Jd', testament: 'new', chapters: 1, order: 65 },
  { name: 'Apocalipse', abbrev: 'Ap', testament: 'new', chapters: 22, order: 66 },
]

// ─── PERGUNTAS (100+) ───────────────────────────────────

const QUESTIONS = [
  // ─── FÁCIL (25 perguntas) ───
  { text: 'Quem construiu a arca?', type: 'multiple_choice', optionA: 'Moisés', optionB: 'Noé', optionC: 'Abraão', optionD: 'Davi', answer: 'Noé', explanation: 'Noé construiu a arca conforme Deus ordenou, para salvar sua família e os animais do dilúvio.', book: 'Gênesis', chapter: 6, verse: 14, difficulty: 'easy', category: 'Personagens', xp: 100 },
  { text: 'Quantos mandamentos Deus deu no Monte Sinai?', type: 'multiple_choice', optionA: '5', optionB: '7', optionC: '10', optionD: '12', answer: '10', explanation: 'Deus escreveu os Dez Mandamentos em duas tábuas de pedra.', book: 'Êxodo', chapter: 20, verse: 1, difficulty: 'easy', category: 'Leis e Mandamentos', xp: 100 },
  { text: 'Qual foi o primeiro homem criado por Deus?', type: 'multiple_choice', optionA: 'Adão', optionB: 'Abel', optionC: 'Noé', optionD: 'Abraão', answer: 'Adão', explanation: 'Adão foi o primeiro homem, formado do pó da terra pelo próprio Deus.', book: 'Gênesis', chapter: 2, verse: 7, difficulty: 'easy', category: 'Criação', xp: 100 },
  { text: '"O Senhor é o meu pastor, nada me faltará." Esse versículo está em:', type: 'multiple_choice', optionA: 'Salmos 23:1', optionB: 'Salmos 91:1', optionC: 'Isaías 40:31', optionD: 'Filipenses 4:13', answer: 'Salmos 23:1', explanation: 'O Salmo 23 é um dos mais conhecidos da Bíblia, escrito pelo rei Davi.', book: 'Salmos', chapter: 23, verse: 1, difficulty: 'easy', category: 'Versículos', xp: 100 },
  { text: 'Jesus nasceu em qual cidade?', type: 'multiple_choice', optionA: 'Jerusalém', optionB: 'Nazaré', optionC: 'Belém', optionD: 'Galileia', answer: 'Belém', explanation: 'Jesus nasceu em Belém de Judá, conforme profetizado por Miqueias.', book: 'Mateus', chapter: 2, verse: 1, difficulty: 'easy', category: 'Novo Testamento', xp: 100 },
  { text: 'Quem foi o primeiro rei de Israel?', type: 'multiple_choice', optionA: 'Davi', optionB: 'Salomão', optionC: 'Saul', optionD: 'Josué', answer: 'Saul', explanation: 'Saul foi ungido como primeiro rei de Israel por Samuel, por ordem de Deus.', book: '1 Samuel', chapter: 10, verse: 1, difficulty: 'easy', category: 'Reis', xp: 100 },
  { text: 'Quantos livros tem a Bíblia?', type: 'multiple_choice', optionA: '64', optionB: '66', optionC: '68', optionD: '72', answer: '66', explanation: 'A Bíblia é composta por 66 livros: 39 no Antigo Testamento e 27 no Novo Testamento.', book: 'Geral', category: 'Geral', xp: 100 },
  { text: '"Porque Deus amou o mundo de tal maneira..." Esse versículo é de:', type: 'multiple_choice', optionA: 'Mateus 3:16', optionB: 'João 3:16', optionC: 'Romanos 5:8', optionD: 'Efésios 2:8', answer: 'João 3:16', explanation: 'João 3:16 é considerado o versículo mais famoso da Bíblia.', book: 'João', chapter: 3, verse: 16, difficulty: 'easy', category: 'Versículos', xp: 100 },
  { text: 'Quem traiu Jesus com um beijo?', type: 'multiple_choice', optionA: 'Pedro', optionB: 'João', optionC: 'Judas', optionD: 'Tomé', answer: 'Judas',     explanation: 'Judas Iscariotes traiu Jesus com um beijo, entregando-O aos soldados.', book: 'Mateus', chapter: 26, verse: 49, difficulty: 'easy', category: 'Paixão de Cristo', xp: 100 },
  { text: 'Deus criou o mundo em quantos dias?', type: 'multiple_choice', optionA: '5', optionB: '6', optionC: '7', optionD: '8', answer: '6', explanation: 'Deus criou tudo em 6 dias e no 7º dia descansou.', book: 'Gênesis', chapter: 2, verse: 2, difficulty: 'easy', category: 'Criação', xp: 100 },
  { text: 'Qual apóstolo negou Jesus três vezes?', type: 'multiple_choice', optionA: 'Paulo', optionB: 'Pedro', optionC: 'Tiago', optionD: 'André', answer: 'Pedro', explanation: 'Pedro negou conhecer Jesus três vezes antes do canto do galo.', book: 'Mateus', chapter: 26, verse: 75, difficulty: 'easy', category: 'Apóstolos', xp: 100 },
  { text: 'O que Deus separou no terceiro dia da criação?', type: 'multiple_choice', optionA: 'Luz e trevas', optionB: 'Céus e mar', optionC: 'Terra seca e mares', optionD: 'Animais e plantas', answer: 'Terra seca e mares', explanation: 'No terceiro dia, Deus separou a terra seca dos mares e fez crescer vegetação.', book: 'Gênesis', chapter: 1, verse: 9, difficulty: 'easy', category: 'Criação', xp: 100 },
  { text: 'Quem foi engolido por um grande peixe?', type: 'multiple_choice', optionA: 'Daniel', optionB: 'Jonas', optionC: 'Eliseu', optionD: 'Abraão', answer: 'Jonas', explanation: 'Jonas ficou 3 dias e 3 noites no ventre do grande peixe, cumprindo o chamado de Deus.', book: 'Jonas', chapter: 1, verse: 17, difficulty: 'easy', category: 'Personagens', xp: 100 },
  { text: 'Qual é o maior mandamento segundo Jesus?', type: 'multiple_choice', optionA: 'Não matarás', optionB: 'Amarás o Senhor teu Deus', optionC: 'Não cobiçarás', optionD: 'Honrar pai e mãe', answer: 'Amarás o Senhor teu Deus', explanation: 'Jesus disse que o maior mandamento é amar a Deus sobre todas as coisas.', book: 'Mateus', chapter: 22, verse: 37, difficulty: 'easy', category: 'Ensinos de Jesus', xp: 100 },
  { text: 'Quem foi o pai de Abraão?', type: 'multiple_choice', optionA: 'Jacó', optionB: 'Térra', optionC: 'Isaque', optionD: 'Noé', answer: 'Térra', explanation: 'Térra era o pai de Abraão e saiu de Ur dos caldeus com sua família.', book: 'Gênesis', chapter: 11, verse: 27, difficulty: 'easy', category: 'Patriarcas', xp: 100 },
  { text: 'Jesus feeds 5000 pessoas com quantos pães e peixes?', type: 'multiple_choice', optionA: '3 pães e 2 peixes', optionB: '5 pães e 2 peixes', optionC: '7 pães e 3 peixes', optionD: '4 pães e 1 peixe', answer: '5 pães e 2 peixes', explanation: 'Um menino ofereceu 5 pães de cevada e 2 peixes, e Jesus multiplicou.', book: 'João', chapter: 6, verse: 9, difficulty: 'easy', category: 'Milagres', xp: 100 },
  { text: 'Qual rio Jesus foi batizado?', type: 'multiple_choice', optionA: 'Rio Nilo', optionB: 'Rio Eufrates', optionC: 'Rio Jordão', optionD: 'Rio Tigre', answer: 'Rio Jordão', explanation: 'Jesus foi batizado por João Batista no Rio Jordão.', book: 'Mateus', chapter: 3, verse: 13, difficulty: 'easy', category: 'Novo Testamento', xp: 100 },
  { text: 'Quem escreveu a maioria dos Salmos?', type: 'multiple_choice', optionA: 'Salomão', optionB: 'Moisés', optionC: 'Davi', optionD: 'Asafe', answer: 'Davi', explanation: 'O rei Davi é creditado como autor de cerca de 73 dos 150 Salmos.', book: 'Salmos', chapter: 1, verse: 1, difficulty: 'easy', category: 'Livros', xp: 100 },
  { text: 'Como se chamava a mãe de Jesus?', type: 'multiple_choice', optionA: 'Marta', optionB: 'Maria', optionC: 'Sara', optionD: 'Raquel', answer: 'Maria', explanation: 'Maria, esposa de José, foi escolhida por Deus para ser a mãe de Jesus.', book: 'Lucas', chapter: 1, verse: 27, difficulty: 'easy', category: 'Novo Testamento', xp: 100 },
  { text: 'Deus destruiu qual cidade com fogo e enxofre?', type: 'multiple_choice', optionB: 'Sodoma e Gomorra', optionA: 'Babilônia', optionC: 'Nínive', optionD: 'Jerusalém', answer: 'Sodoma e Gomorra', explanation: 'Deus destruiu Sodoma e Gomorra pela sua maldade, poupando apenas Ló e sua família.', book: 'Gênesis', chapter: 19, verse: 24, difficulty: 'easy', category: 'Antigo Testamento', xp: 100 },
  { text: '"Posso todas as coisas naquele que me fortalece." Quem disse isso?', type: 'multiple_choice', optionA: 'Pedro', optionB: 'Paulo', optionC: 'Tiago', optionD: 'João', answer: 'Paulo', explanation: 'Paulo escreveu esta famosa frase na carta aos Filipenses.', book: 'Filipenses', chapter: 4, verse: 13, difficulty: 'easy', category: 'Versículos', xp: 100 },
  { text: 'Quantos discípulos Jesus tinha?', type: 'multiple_choice', optionA: '10', optionB: '11', optionC: '12', optionD: '14', answer: '12', explanation: 'Jesus escolheu 12 apóstolos para serem seus discípulos mais próximos.', book: 'Mateus', chapter: 10, verse: 1, difficulty: 'easy', category: 'Apóstolos', xp: 100 },
  { text: 'Qual fruta proibida Adão e Eva comeram?', type: 'multiple_choice', optionA: 'Maçã', optionB: 'Banana', optionC: 'Laranja', optionD: 'Uva', answer: 'Maçã', explanation: 'Embora a Bíblia não especifique a fruta, a tradição cristã a identifica como uma maçã.', book: 'Gênesis', chapter: 3, verse: 6, difficulty: 'easy', category: 'Criação', xp: 100 },
  { text: 'Quem ungiu Davi como rei?', type: 'multiple_choice', optionA: 'Isaac', optionB: 'Samuel', optionC: 'Natã', optionD: 'Eliseu', answer: 'Samuel', explanation: 'O profeta Samuel ungiu Davi como rei de Israel, cumprindo a vontade de Deus.', book: '1 Samuel', chapter: 16, verse: 13, difficulty: 'easy', category: 'Reis', xp: 100 },
  { text: 'Jesus realizou seu primeiro milagre em qual ocasião?', type: 'multiple_choice', optionA: 'Curou um paralítico', optionB: 'Andou sobre as águas', optionC: 'Transformou água em vinho', optionD: 'Alimentou 5000', answer: 'Transformou água em vinho', explanation: 'O primeiro milagre de Jesus foi transformar água em vinho nas Bodas de Caná.', book: 'João', chapter: 2, verse: 11, difficulty: 'easy', category: 'Milagres', xp: 100 },
  { text: 'Quem foi arrebatado ao céu sem ver a morte?', type: 'multiple_choice', optionA: 'Elias', optionB: 'Eliseu', optionC: 'Abraão', optionD: 'Moisés', answer: 'Elias', explanation: 'O profeta Elias foi arrebatado ao céu num carro de fogo.', book: '2 Reis', chapter: 2, verse: 11, difficulty: 'easy', category: 'Profetas', xp: 100 },

  // ─── MÉDIO (25 perguntas) ───
  { text: 'Em que livro encontramos a história da torre de Babel?', type: 'multiple_choice', optionA: 'Êxodo', optionB: 'Gênesis', optionC: 'Levítico', optionD: 'Números', answer: 'Gênesis', explanation: 'A torre de Babel é narrada em Gênesis 11, quando Deus confundiu as línguas dos homens.', book: 'Gênesis', chapter: 11, verse: 4, difficulty: 'medium', category: 'Antigo Testamento', xp: 150 },
  { text: 'Qual profeta foi lançado na cova dos leões?', type: 'multiple_choice', optionA: 'Isaías', optionB: 'Jeremias', optionC: 'Daniel', optionD: 'Ezequiel', answer: 'Daniel', explanation: 'Daniel foi lançado na cova dos leões por orar a Deus, mas Deus o livrou.', book: 'Daniel', chapter: 6, verse: 16, difficulty: 'medium', category: 'Profetas', xp: 150 },
  { text: 'Quantos livros Paulo escreveu no Novo Testamento?', type: 'multiple_choice', optionA: '9', optionB: '11', optionC: '13', optionD: '15', answer: '13', explanation: 'Paulo é tradicionalmente creditado como autor de 13 epístolas no Novo Testamento.', book: 'Geral', category: 'Novo Testamento', xp: 150 },
  { text: 'Qual é o primeiro livro do Novo Testamento?', type: 'multiple_choice', optionA: 'Atos', optionB: 'Marcos', optionC: 'Mateus', optionD: 'João', answer: 'Mateus', explanation: 'Mateus é o primeiro dos quatro Evangelhos e abre o Novo Testamento.', book: 'Mateus', chapter: 1, verse: 1, difficulty: 'medium', category: 'Livros', xp: 150 },
  { text: 'Quem libertou os israelitas da escravidão no Egito?', type: 'multiple_choice', optionA: 'Josué', optionB: 'Aarão', optionC: 'Moisés', optionD: 'Aaron', answer: 'Moisés', explanation: 'Moisés, ungido por Deus, liderou o Êxodo do Egito com a ajuda de Aarão.', book: 'Êxodo', chapter: 3, verse: 10, difficulty: 'medium', category: 'Personagens', xp: 150 },
  { text: 'Em que livro Paulo fala da "armadura de Deus"?', type: 'multiple_choice', optionA: 'Romanos', optionB: 'Efésios', optionC: 'Gálatas', optionD: 'Colossenses', answer: 'Efésios', explanation: 'Paulo descreve a armadura de Deus em Efésios 6:10-18.', book: 'Efésios', chapter: 6, verse: 11, difficulty: 'medium', category: 'Epístolas', xp: 150 },
  { text: 'Qual rei construiu o Templo de Jerusalém?', type: 'multiple_choice', optionA: 'Saul', optionB: 'Davi', optionC: 'Salomão', optionD: 'Roboão', answer: 'Salomão', explanation: 'Salomão, filho de Davi, construiu o Primeiro Templo em Jerusalém.', book: '1 Reis', chapter: 6, verse: 14, difficulty: 'medium', category: 'Reis', xp: 150 },
  { text: 'O Apocalipse foi escrito por:', type: 'multiple_choice', optionA: 'Paulo', optionB: 'Pedro', optionC: 'João', optionD: 'Tiago', answer: 'João', explanation: 'O Apocalipse foi escrito por João durante seu exílio na ilha de Patmos.', book: 'Apocalipse', chapter: 1, verse: 1, difficulty: 'medium', category: 'Novo Testamento', xp: 150 },
  { text: 'Quantos capítulos tem o livro de Gênesis?', type: 'multiple_choice', optionA: '40', optionB: '45', optionC: '50', optionD: '55', answer: '50', explanation: 'Gênesis tem 50 capítulos, cobrindo desde a criação até a morte de Jacó.', book: 'Gênesis', chapter: 1, verse: 1, difficulty: 'medium', category: 'Livros', xp: 150 },
  { text: 'Quem foi o sucessor de Moisés para liderar Israel?', type: 'multiple_choice', optionA: 'Calebe', optionB: 'Josué', optionC: 'Gideão', optionD: 'Débora', answer: 'Josué', explanation: 'Josué sucedeu Moisés e liderou Israel na conquista da Terra Prometida.', book: 'Josué', chapter: 1, verse: 1, difficulty: 'medium', category: 'Personagens', xp: 150 },
  { text: 'A parábola do Filho Pródigo está em qual Evangelho?', type: 'multiple_choice', optionA: 'Mateus', optionB: 'Marcos', optionC: 'Lucas', optionD: 'João', answer: 'Lucas', explanation: 'A parábola do Filho Pródigo está em Lucas 15:11-32.', book: 'Lucas', chapter: 15, verse: 11, difficulty: 'medium', category: 'Parábolas', xp: 150 },
  { text: 'Qual cidade Paulo visitou onde havia um altar "ao deus desconhecido"?', type: 'multiple_choice', optionA: 'Corinto', optionB: 'Efeso', optionC: 'Atenas', optionD: 'Roma', answer: 'Atenas', explanation: 'Paulo visitou Atenas e usou o altar ao deus desconhecido para pregar o Evangelho.', book: 'Atos', chapter: 17, verse: 23, difficulty: 'medium', category: 'Atos dos Apóstolos', xp: 150 },
  { text: 'Em qual livro encontramos a história de Jó?', type: 'multiple_choice', optionA: 'Salmos', optionB: 'Provérbios', optionC: 'Jó', optionD: 'Eclesiastes', answer: 'Jó', explanation: 'O livro de Jó é um dos mais antigos da Bíblia e trata do sofrimento e fé.', book: 'Jó', chapter: 1, verse: 1, difficulty: 'medium', category: 'Livros', xp: 150 },
  { text: 'Quem foi a rainha que visitou Salomão?', type: 'multiple_choice', optionA: 'Cleópatra', optionB: 'Ester', optionC: 'Rainha de Sabá', optionD: 'Jezabel', answer: 'Rainha de Sabá', explanation: 'A Rainha de Sabá visitou Salomão para testar sua sabedoria com enigmas.', book: '1 Reis', chapter: 10, verse: 1, difficulty: 'medium', category: 'Personagens', xp: 150 },
  { text: 'Qual é o livro mais longo da Bíblia?', type: 'multiple_choice', optionA: 'Gênesis', optionB: 'Salmos', optionC: 'Isaías', optionD: 'Jeremias', answer: 'Salmos', explanation: 'Salmos é o maior livro da Bíblia com 150 capítulos.', book: 'Salmos', chapter: 1, verse: 1, difficulty: 'medium', category: 'Livros', xp: 150 },
  { text: 'Quem derrubou os muros de Jericó?', type: 'multiple_choice', optionA: 'Davi', optionB: 'Gideão', optionC: 'Josué', optionD: 'Samson', answer: 'Josué', explanation: 'Os muros de Jericó caíram quando o povo de Deus girou a cidade por 7 dias.', book: 'Josué', chapter: 6, verse: 20, difficulty: 'medium', category: 'Antigo Testamento', xp: 150 },
  { text: 'Qual dos filhos de Adão matou seu irmão?', type: 'multiple_choice', optionA: 'Caim', optionB: 'Abel', optionC: 'Seth', optionD: 'Enoque', answer: 'Caim', explanation: 'Caim matou seu irmão Abel por ciúmes, tornando-se o primeiro assassino da Bíblia.', book: 'Gênesis', chapter: 4, verse: 8, difficulty: 'medium', category: 'Criação', xp: 150 },
  { text: 'A Torre de Babel:', type: 'true_false', answer: 'True', explanation: 'A Torre de Babel é descrita em Gênesis 11 como uma construção humana que Deus dispersou confundindo as línguas.', book: 'Gênesis', chapter: 11, verse: 4, difficulty: 'medium', category: 'Antigo Testamento', xp: 150 },
  { text: 'Jesus foi crucificado no monte chamado Golgotha.', type: 'true_false', answer: 'True', explanation: 'Golgotha (Calvário) foi o local da crucificação de Jesus, fora dos muros de Jerusalém.', book: 'Mateus', chapter: 27, verse: 33, difficulty: 'medium', category: 'Paixão de Cristo', xp: 150 },
  { text: 'O Senhor é o meu ________, nada me faltará.', type: 'fill_blank', answer: 'Pastor', explanation: 'O Salmo 23:1 begins com "O Senhor é o meu pastor".', book: 'Salmos', chapter: 23, verse: 1, difficulty: 'medium', category: 'Versículos', xp: 150 },
  { text: '"Eu sou o caminho, a verdade e a vida." Quem disse?', type: 'who_said', optionA: 'Pedro', optionB: 'Paulo', optionC: 'Jesus', optionD: 'João', answer: 'Jesus', explanation: 'Jesus disse esta frase em João 14:6, revelando ser o único caminho ao Pai.', book: 'João', chapter: 14, verse: 6, difficulty: 'medium', category: 'Versículos', xp: 150 },
  { text: '"Não há recompensa para o malvado" — Quem disse isso?', type: 'who_said', optionA: 'Davi', optionB: 'Salomão', optionC: 'Jó', optionD: 'Paulo', answer: 'Salomão', explanation: 'Salomão escreveu em Provérbios 11:31 sobre a recompensa do justo e do ímpio.', book: 'Provérbios', chapter: 11, verse: 31, difficulty: 'medium', category: 'Provérbios', xp: 150 },
  { text: 'O livro de Atos relata os atos de:', type: 'multiple_choice', optionA: 'Jesus', optionB: 'Paulo', optionC: 'Os Apóstolos', optionD: 'Moisés', answer: 'Os Apóstolos', explanation: 'O livro de Atos descreve o início da Igreja cristã e os feitos dos apóstolos.', book: 'Atos', chapter: 1, verse: 1, difficulty: 'medium', category: 'Livros', xp: 150 },

  // ─── DIFÍCIL (25 perguntas) ───
  { text: 'Em que ano aproximadamente Jesus nasceu, considerando os registros históricos?', type: 'multiple_choice', optionA: '5 a.C.', optionB: '1 a.C.', optionC: '4 a.C.', optionD: '10 a.C.', answer: '4 a.C.', explanation: 'Estudiosos estimam que Jesus nasceu entre 6 e 4 a.C., durante o reinado de Herodes.', book: 'Mateus', chapter: 2, verse: 1, difficulty: 'hard', category: 'Cronologia', xp: 200 },
  { text: 'Qual é o versículo mais curto da Bíblia?', type: 'multiple_choice', optionA: 'Jesus chorou', optionB: 'Deus é amor', optionC: 'Regozijai-vos', optionD: 'Celebre', answer: 'Jesus chorou', explanation: '"Jesus chorou" (João 11:35) é o versículo mais curto em muitas traduções.', book: 'João', chapter: 11, verse: 35, difficulty: 'hard', category: 'Curiosidades', xp: 200 },
  { text: 'Quantos dos 12 apóstolos originais morreram de morte natural?', type: 'multiple_choice', optionA: '1', optionB: '2', optionC: '4', optionD: 'Nenhum', answer: '1', explanation: 'Tradicionalmente, apenas João morreu de morte natural; todos os outros foram martirizados.', book: 'Geral', category: 'Apóstolos', xp: 200 },
  { text: 'Qual é o único livro da Bíblia que não menciona Deus?', type: 'multiple_choice', optionA: 'Ester', optionB: 'Cânticos', optionC: 'Eclesiastes', optionD: 'Lamentações', answer: 'Ester', explanation: 'O livro de Ester não menciona o nome de Deus diretamente, embora Sua presença esteja implícita.', book: 'Ester', chapter: 1, verse: 1, difficulty: 'hard', category: 'Curiosidades', xp: 200 },
  { text: 'Qual profeta teve uma visão dos ossos secos que reviveram?', type: 'multiple_choice', optionA: 'Daniel', optionB: 'Ezequiel', optionC: 'Isaías', optionD: 'Jeremias', answer: 'Ezequiel', explanation: 'Ezequiel teve a visão do vale de ossos secos que Deus reviveu, simbolizando a restauração de Israel.', book: 'Ezequiel', chapter: 37, verse: 1, difficulty: 'hard', category: 'Profetas', xp: 200 },
  { text: 'Qual é o livro da Bíblia que menciona primeiro o nome de Satanás?', type: 'multiple_choice', optionA: 'Jó', optionB: 'Apocalipse', optionC: 'Zacarias', optionD: 'Mateus', answer: 'Jó', explanation: 'O livro de Jó é o primeiro a mencionar Satanás nominalmente (Jó 1:6-7).', book: 'Jó', chapter: 1, verse: 6, difficulty: 'hard', category: 'Curiosidades', xp: 200 },
  { text: 'Quantas vezes a Bíblia menciona o número 40?', type: 'multiple_choice', optionA: '38', optionB: '86', optionC: '146', optionD: '200', answer: '146', explanation: 'O número 40 aparece 146 vezes na Bíblia, frequentemente simbolizando provação ou preparação.', book: 'Geral', category: 'Curiosidades', xp: 200 },
  { text: 'Quem escreveu o livro de Hebreus? (autoria tradicional)', type: 'multiple_choice', optionA: 'Paulo', optionB: 'Pedro', optionC: 'Tiago', optionD: 'Desconhecido', answer: 'Paulo', explanation: 'A autoria de Hebreus é debatida; a tradição mais antiga atribui a Paulo.', book: 'Hebreus', chapter: 1, verse: 1, difficulty: 'hard', category: 'Livros', xp: 200 },
  { text: 'Qual é o último versículo da Bíblia?', type: 'multiple_choice', optionA: 'Apocalipse 21:21', optionB: 'Apocalipse 22:21', optionC: 'Apocalipse 22:10', optionD: 'Apocalipse 21:1', answer: 'Apocalipse 22:21', explanation: 'A graça do Senhor Jesus seja com todos. Amém.', book: 'Apocalipse', chapter: 22, verse: 21, difficulty: 'hard', category: 'Curiosidades', xp: 200 },
  { text: 'O evento da "Transfiguração" envolveu Jesus com quais dois personagens?', type: 'multiple_choice', optionA: 'Pedro e Paulo', optionB: 'Moisés e Elias', optionC: 'Abraão e Isaac', optionD: 'Daniel e Isaías', answer: 'Moisés e Elias', explanation: 'Jesus foi transfigurado na presença de Moisés e Elias, representando a Lei e os Profetas.', book: 'Mateus', chapter: 17, verse: 3, difficulty: 'hard', category: 'Novo Testamento', xp: 200 },
  { text: 'Qual apóstolo foi chamado de "dúvida" por não acreditar na ressurreição?', type: 'multiple_choice', optionA: 'Pedro', optionB: 'André', optionC: 'Tomé', optionD: 'Felipe', answer: 'Tomé', explanation: 'Tomé duvidou da ressurreição até ver e tocar as marcas de Jesus.', book: 'João', chapter: 20, verse: 27, difficulty: 'hard', category: 'Apóstolos', xp: 200 },
  { text: '"No princípio era o Verbo" — Esse versículo inicia qual livro?', type: 'multiple_choice', optionA: 'Mateus', optionB: 'Lucas', optionC: 'João', optionD: 'Romanos', answer: 'João', explanation: 'O Evangelho de João começa com esta declaração teológica sobre a divindade de Cristo.', book: 'João', chapter: 1, verse: 1, difficulty: 'hard', category: 'Versículos', xp: 200 },
  { text: 'Em que livro Paulo lista as "frutas do Espírito"?', type: 'multiple_choice', optionA: 'Romanos', optionB: 'Efésios', optionC: 'Gálatas', optionD: 'Filipenses', answer: 'Gálatas', explanation: 'As frutas do Espírito são listadas em Gálatas 5:22-23.', book: 'Gálatas', chapter: 5, verse: 22, difficulty: 'hard', category: 'Epístolas', xp: 200 },
  { text: 'O "Sermão do Monte" é encontrado em qual Evangelho?', type: 'multiple_choice', optionA: 'João', optionB: 'Mateus', optionC: 'Lucas', optionD: 'Marcos', answer: 'Mateus', explanation: 'O Sermão do Monte está em Mateus 5-7 e é o maior ensino ético de Jesus.', book: 'Mateus', chapter: 5, verse: 1, difficulty: 'hard', category: 'Ensinos de Jesus', xp: 200 },
  { text: 'Qual profeta foi engolido por um peixe e depois vomitado na praia?', type: 'true_false', answer: 'True', explanation: 'Jonas ficou 3 dias no ventre de um grande peixe e depois foi lançado na praia.', book: 'Jonas', chapter: 2, verse: 10, difficulty: 'hard', category: 'Profetas', xp: 200 },
  { text: '"Jesus caminhou sobre as águas" — Isso é verdade?', type: 'true_false', answer: 'True', explanation: 'Jesus caminhou sobre as águas para alcançar os discípulos que estavam no barco.', book: 'Mateus', chapter: 14, verse: 25, difficulty: 'hard', category: 'Milagres', xp: 200 },
  { text: 'O Espírito Santo desceu sobre os apóstolos no dia de:', type: 'multiple_choice', optionA: 'Páscoa', optionB: 'Pentecostes', optionC: 'Tabernáculos', optionD: 'Purim', answer: 'Pentecostes', explanation: 'O Espírito Santo desceu no dia de Pentecostes, marcando o início da Igreja.', book: 'Atos', chapter: 2, verse: 1, difficulty: 'hard', category: 'Atos dos Apóstolos', xp: 200 },
  { text: 'Em qual cidade Paulo teve sua conversão na estrada de Damasco?', type: 'multiple_choice', optionA: 'Jerusalém', optionB: 'Roma', optionC: 'Damasco', optionD: 'Corinto', answer: 'Damasco', explanation: 'Paulo (então Saulo) caiu no caminho de Damasco ao perseguir cristãos.', book: 'Atos', chapter: 9, verse: 3, difficulty: 'hard', category: 'Atos dos Apóstolos', xp: 200 },
  { text: 'Quem foi o homem que subiu ao céu sem ver a morte?', type: 'multiple_choice', optionA: 'Noé', optionB: 'Abraão', optionC: 'Enoque', optionD: 'Eliseu', answer: 'Enoque', explanation: 'Enoque andou com Deus e desapareceu, pois Deus o levou.', book: 'Gênesis', chapter: 5, verse: 24, difficulty: 'hard', category: 'Personagens', xp: 200 },
  { text: '"Antes que o mundo fosse" — Sobre quem Jesus disse isso?', type: 'who_said', optionA: 'Pedro', optionB: 'Paulo', optionC: 'João', optionD: 'Jesus', answer: 'Jesus', explanation: 'Jesus orou por seus discípulos, dizendo que Deus os amou antes da fundação do mundo.', book: 'João', chapter: 17, verse: 24, difficulty: 'hard', category: 'Versículos', xp: 200 },
  { text: '"Embora eu andasse pelo vale da sombra da morte, não temeria mal algum" — Esse versículo é de:', type: 'multiple_choice', optionA: 'Salmos 46:1', optionB: 'Salmos 23:4', optionC: 'Isaías 41:10', optionD: 'Filipenses 4:6', answer: 'Salmos 23:4', explanation: 'Salmo 23:4 é uma das passagens mais reconfortantes da Bíblia.', book: 'Salmos', chapter: 23, verse: 4, difficulty: 'hard', category: 'Versículos', xp: 200 },
  { text: 'Qual foi a última cidade que Jesus visitou antes de sua ascensão?', type: 'multiple_choice', optionA: 'Belém', optionB: 'Nazaré', optionC: 'Jerusalém', optionD: 'Galileia', answer: 'Jerusalém', explanation: 'Jesus ascendeu ao céu das montanhas da Oliveira, perto de Jerusalém.', book: 'Atos', chapter: 1, verse: 12, difficulty: 'hard', category: 'Novo Testamento', xp: 200 },
  { text: 'Em qual cidade Paulo escreveu a Carta aos Filipenses?', type: 'multiple_choice', optionA: 'Roma', optionB: 'Efeso', optionC: 'Prision', optionD: 'Atenas',     answer: 'Roma', explanation: 'Paulo escreveu Filipenses estando preso, possivelmente em Roma.', book: 'Filipenses', chapter: 1, verse: 7, difficulty: 'hard', category: 'Epístolas', xp: 200 },

  // ─── ESPECIALISTA (15 perguntas) ───
  { text: 'O "Filho do Homem" — quantas vezes Jesus se referiu a Si mesmo com esse título?', type: 'multiple_choice', optionA: '60', optionB: '81', optionC: '88', optionD: '100', answer: '81', explanation: 'Jesus usou "Filho do Homem" 81 vezes nos Evangelhos, mais que qualquer outro título.', book: 'Geral', category: 'Curiosidades', xp: 300 },
  { text: 'Qual profeta viveu 969 anos, sendo o mais velho da Bíblia?', type: 'multiple_choice', optionA: 'Matusalém', optionB: 'Noé', optionC: 'Adão', optionD: 'Seth', answer: 'Matusalém', explanation: 'Matusalém viveu 969 anos, o maior registro de idade na Bíblia.', book: 'Gênesis', chapter: 5, verse: 27, difficulty: 'expert', category: 'Curiosidades', xp: 300 },
  { text: 'A "aldeia de Nazaré" — quantos versículos mencionam Nazaré no Novo Testamento?', type: 'multiple_choice', optionA: '12', optionB: '29', optionC: '35', optionD: '42', answer: '29', explanation: 'Nazaré é mencionada 29 vezes no Novo Testamento, sendo o lar de Jesus.', book: 'Mateus', chapter: 2, verse: 23, difficulty: 'expert', category: 'Curiosidades', xp: 300 },
  { text: 'Quantas línguas foram faladas no dia de Pentecostes (Atos 2)?', type: 'multiple_choice', optionA: '7', optionB: '12', optionC: '15', optionD: '18', answer: '15', explanation: 'Atos 2 lista 15 regiões/línguas representadas no Pentecostes.', book: 'Atos', chapter: 2, verse: 9, difficulty: 'expert', category: 'Atos dos Apóstolos', xp: 300 },
  { text: 'Qual é a menção mais antiga de um "livro" na Bíblia?', type: 'multiple_choice', optionA: 'Gênesis 5:1', optionB: 'Êxodo 17:14', optionC: 'Números 5:23', optionD: 'Deuteronômio 31:24', answer: 'Gênesis 5:1', explanation: 'A primeira menção de registrar em livro está em Gênesis 5:1, o livro da genealogia.', book: 'Gênesis', chapter: 5, verse: 1, difficulty: 'expert', category: 'Curiosidades', xp: 300 },
  { text: 'Em qual livro da Bíblia aparece a primeira menção à Trindade?', type: 'multiple_choice', optionA: 'Gênesis 1:2', optionB: 'Êxodo 3:14', optionC: 'Isaías 6:3', optionD: 'Mateus 28:19', answer: 'Mateus 28:19', explanation: 'Embora a Trindade esteja implícita em todo o AT, Mateus 28:19 é a primeira menção explícita dos três.', book: 'Mateus', chapter: 28, verse: 19, difficulty: 'expert', category: 'Teologia', xp: 300 },
  { text: 'Qual é o único profeta que Jesus elogiou?', type: 'multiple_choice', optionA: 'Isaías', optionB: 'Jonas', optionC: 'Daniel', optionD: 'Elias', answer: 'Jonas', explanation: 'Jesus elogiou a geração de Jonas como sinal para a geração de Sua ressurreição.', book: 'Mateus', chapter: 12, verse: 41, difficulty: 'expert', category: 'Ensinos de Jesus', xp: 300 },
  { text: 'Quantos livros da Bíblia foram escritos originalmente em grego?', type: 'multiple_choice', optionA: '20', optionB: '23', optionC: '27', optionD: '30', answer: '27', explanation: 'Todos os 27 livros do Novo Testamento foram escritos em grego koiné.', book: 'Geral', category: 'Curiosidades', xp: 300 },
  { text: 'O "Cântico dos Cânticos" — quem é tradicionalmente considerado o autor?', type: 'multiple_choice', optionA: 'Davi', optionB: 'Salomão', optionC: 'Asafe', optionD: 'Moisés', answer: 'Salomão', explanation: 'Salomão é tradicionalmente considerado o autor do Cântico dos Cânticos.', book: 'Cânticos', chapter: 1, verse: 1, difficulty: 'expert', category: 'Livros', xp: 300 },
  { text: 'Qual evento bíblico é considerado o maior exemplo de fé do Antigo Testamento?', type: 'multiple_choice', optionA: 'Moisés no Sinai', optionB: 'Abraão oferecendo Isaque', optionC: 'Davi e Golias', optionD: 'Jonas no peixe', answer: 'Abraão oferecendo Isaque', explanation: 'A entrega de Isaque é o ápice da fé de Abraão, tipologia de Cristo.', book: 'Gênesis', chapter: 22, verse: 1, difficulty: 'expert', category: 'Teologia', xp: 300 },
  { text: 'Qual é a referência bíblica que fala sobre "a espada do Espírito"?', type: 'multiple_choice', optionA: 'Efésios 6:17', optionB: 'Hebreus 4:12', optionC: 'Romanos 1:16', optionD: '2 Timóteo 3:16', answer: 'Efésios 6:17', explanation: 'A espada do Espírito é a Palavra de Deus, parte da armadura de Deus.', book: 'Efésios', chapter: 6, verse: 17, difficulty: 'expert', category: 'Epístolas', xp: 300 },
  { text: 'O livro de Lamentações tem quantos capítulos?', type: 'multiple_choice', optionA: '3', optionB: '5', optionC: '7', optionD: '10', answer: '5', explanation: 'Lamentações tem 5 capítulos, cada um sendo um lamento sobre a destruição de Jerusalém.', book: 'Lamentações', chapter: 1, verse: 1, difficulty: 'expert', category: 'Livros', xp: 300 },
  { text: 'Em Atos, quem foi o primeiro mártir cristão?', type: 'multiple_choice', optionA: 'Pedro', optionB: 'Paulo', optionC: 'Estêvão', optionD: 'Tiago', answer: 'Estêvão', explanation: 'Estêvão foi apedrejado até a morte, tornando-se o primeiro mártir cristão.', book: 'Atos', chapter: 7, verse: 60, difficulty: 'expert', category: 'Atos dos Apóstolos', xp: 300 },
  { text: 'Qual é o versículo mais longo da Bíblia?', type: 'multiple_choice', optionA: 'Efésios 1:3-14', optionB: 'Isaías 53', optionC: 'Salmos 119:105', optionD: 'Ester 8:9', answer: 'Ester 8:9', explanation: 'Ester 8:9 é o versículo mais longo da Bíblia em muitas traduções.', book: 'Ester', chapter: 8, verse: 9, difficulty: 'expert', category: 'Curiosidades', xp: 300 },
  { text: '"Eu sou o Alfa e o Omega" — Esse título é usado por:', type: 'who_said', optionA: 'Paulo', optionB: 'Pedro', optionC: 'João', optionD: 'Deus/Jesus', answer: 'Deus/Jesus', explanation: 'Deus se identifica como Alfa e Omega (primeira e última letra grega) em Apocalipse.', book: 'Apocalipse', chapter: 22, verse: 13, difficulty: 'expert', category: 'Versículos', xp: 300 },

  // ─── MESTRE DA BÍBLIA (10 perguntas) ───
  { text: 'Quantas palavras tem a Bíblia (aproximadamente)?', type: 'multiple_choice', optionA: '500.000', optionB: '600.000', optionC: '750.000', optionD: '1.000.000', answer: '750.000', explanation: 'A Bíblia contém aproximadamente 750.000 palavras (dependendo da tradução).', book: 'Geral', category: 'Curiosidades', xp: 500 },
  { text: 'Qual é o único livro que termina com uma pergunta?', type: 'multiple_choice', optionA: 'Eclesiastes', optionB: '2 João', optionC: 'Judas', optionD: 'Marcos', answer: 'Marcos', explanation: 'O evangelho de Marcos, na sua forma mais antiga, termina com uma pergunta.', book: 'Marcos', chapter: 16, verse: 8, difficulty: 'master', category: 'Curiosidades', xp: 500 },
  { text: 'Quantos idiomas o Novo Testamento foi originalmente escrito?', type: 'multiple_choice', optionA: '1', optionB: '2', optionC: '3', optionD: '5', answer: '1', explanation: 'Todo o Novo Testamento foi escrito em grego koiné (exceto possivelmente Mateus em aramaico, debatido).', book: 'Geral', category: 'Curiosidades', xp: 500 },
  { text: 'A "Estrela de Belém" — qual planeta astrônomo associa ao nascimento de Jesus?', type: 'multiple_choice', optionA: 'Marte', optionB: 'Júpiter-Saturno', optionC: 'Vênus', optionD: 'Mercúrio', answer: 'Júpiter-Saturno', explanation: 'A conjunção de Júpiter e Saturno em 7 a.C. é uma das teorias para a Estrela de Belém.', book: 'Mateus', chapter: 2, verse: 2, difficulty: 'master', category: 'Curiosidades', xp: 500 },
  { text: 'O autor de Provérbios — qual é o último capítulo e quem o escreveu?', type: 'multiple_choice', optionA: 'Cap 31, Salomão', optionB: 'Cap 31, Agur', optionC: 'Cap 31, Lemuel', optionD: 'Cap 30, Salomão', answer: 'Cap 31, Lemuel', explanation: 'Provérbios 31:1-9 é atribuído ao Rei Lemuel; 31:10-31 é a mulher virtuosa.', book: 'Provérbios', chapter: 31, verse: 1, difficulty: 'master', category: 'Livros', xp: 500 },
  { text: 'Qual apóstolo teria ido à Índia, segundo a tradição cristã?', type: 'multiple_choice', optionA: 'Pedro', optionB: 'Paulo', optionC: 'Tomé', optionD: 'André', answer: 'Tomé', explanation: 'A tradição da Igreja do Sul da Índia afirma que Tomé pregou na Índia.', book: 'Geral', category: 'Apóstolos', xp: 500 },
  { text: 'Qual é o único profeta que teve um livro com seu nome E que é mencionado por Jesus como exemplo?', type: 'multiple_choice', optionA: 'Isaías', optionB: 'Daniel', optionC: 'Jonas', optionD: 'Jeremias', answer: 'Jonas', explanation: 'Jesus mencionou Jonas como sinal de Sua ressurreição (Mateus 12:41).', book: 'Mateus', chapter: 12, verse: 41, difficulty: 'master', category: 'Profetas', xp: 500 },
  { text: 'O "Livro da Guerra" mencionado em Números 21:14 refere-se a:', type: 'multiple_choice', optionA: 'Conquista de Canaã', optionB: 'Um livro perdido', optionC: 'Vitórias de Moisés', optionD: 'Genealogia de Moisés', answer: 'Um livro perdido', explanation: 'O Livro da Guerra de Yavé é um livro perdido mencionado em Números 21:14.', book: 'Números', chapter: 21, verse: 14, difficulty: 'master', category: 'Curiosidades', xp: 500 },
  { text: 'Qual é a profecia mais antiga da Bíblia sobre o Messias?', type: 'multiple_choice', optionA: 'Isaías 53', optionB: 'Gênesis 3:15', optionC: 'Números 24:17', optionD: 'Salmos 22', answer: 'Gênesis 3:15', explanation: 'Gênesis 3:15 é chamada de Proto-Evangelho, a primeira profecia sobre a vitória sobre Satanás.', book: 'Gênesis', chapter: 3, verse: 15, difficulty: 'master', category: 'Teologia', xp: 500 },
  { text: 'Qual evento bíblico é tipificado como prefiguração da十字架 de Cristo?', type: 'multiple_choice', optionA: 'Arca de Noé', optionB: 'O Cordeiro da Páscoa', optionC: 'Maná no deserto', optionD: 'Serpente de bronze', answer: 'O Cordeiro da Páscoa', explanation: 'O Cordeiro da Páscoa é a tipologia mais direta de Cristo como Cordeiro de Deus.', book: 'Êxodo', chapter: 12, verse: 3, difficulty: 'master', category: 'Teologia', xp: 500 },
]

// ─── CONQUISTAS ──────────────────────────────────────────

const ACHIEVEMENTS = [
  { name: 'Primeiro Passo', description: 'Complete seu primeiro quiz', icon: '🎯', category: 'inicio', requirement: 1, xpReward: 500 },
  { name: 'Primeira Vitória', description: 'Acerte 100% em um quiz', icon: '⭐', category: 'inicio', requirement: 1, xpReward: 1000 },
  { name: 'Estudante Dedicado', description: 'Jogue 10 quizzes', icon: '📚', category: 'inicio', requirement: 10, xpReward: 750 },
  { name: 'Aluno da Palavra', description: 'Jogue 50 quizzes', icon: '📖', category: 'inicio', requirement: 50, xpReward: 2000 },
  { name: 'Centenário', description: 'Acerte 100 perguntas', icon: '💯', category: 'acertos', requirement: 100, xpReward: 1500 },
  { name: 'Quinhentário', description: 'Acerte 500 perguntas', icon: '💎', category: 'acertos', requirement: 500, xpReward: 3000 },
  { name: 'Milhar', description: 'Acerte 1000 perguntas', icon: '👑', category: 'acertos', requirement: 1000, xpReward: 5000 },
  { name: 'Fogo Aceso', description: 'Jogue 3 dias seguidos', icon: '🔥', category: 'streak', requirement: 3, xpReward: 500 },
  { name: 'Chama Viva', description: 'Jogue 7 dias seguidos', icon: '🔥', category: 'streak', requirement: 7, xpReward: 1000 },
  { name: 'Incêndio de Fé', description: 'Jogue 30 dias seguidos', icon: '🔥', category: 'streak', requirement: 30, xpReward: 3000 },
  { name: 'Primeira Batalha', description: 'Vença uma batalha bíblica', icon: '⚔️', category: 'batalha', requirement: 1, xpReward: 1000 },
  { name: 'Guerreiro da Fé', description: 'Vença 10 batalhas', icon: '🛡️', category: 'batalha', requirement: 10, xpReward: 2500 },
  { name: 'Campeão', description: 'Vença 50 batalhas', icon: '🏆', category: 'batalha', requirement: 50, xpReward: 5000 },
  { name: 'Conhecedor do AT', description: 'Acerte 50 perguntas do Antigo Testamento', icon: '📜', category: 'conhecimento', requirement: 50, xpReward: 2000 },
  { name: 'Conhecedor do NT', description: 'Acerte 50 perguntas do Novo Testamento', icon: '✝️', category: 'conhecimento', requirement: 50, xpReward: 2000 },
  { name: 'Mestre da Bíblia', description: 'Alcance nível 10', icon: '🎓', category: 'conhecimento', requirement: 10, xpReward: 5000 },
  { name: 'Desafiador', description: 'Complete o desafio diário', icon: '📅', category: 'diario', requirement: 1, xpReward: 500 },
  { name: 'Mensal Fiel', description: 'Complete 30 desafios diários', icon: '🗓️', category: 'diario', requirement: 30, xpReward: 5000 },
  { name: 'Perfeccionista', description: 'Acerte 100% em 5 quizzes', icon: '✨', category: 'acertos', requirement: 5, xpReward: 2000 },
  { name: 'Sábio dos Sábios', description: 'Alcance nível 15', icon: '🌟', category: 'conhecimento', requirement: 15, xpReward: 10000 },
]

// ─── EXECUÇÃO ────────────────────────────────────────────

async function main() {
  console.log('🌱 Iniciando seed do Bíblia Game...')

  // Livros da Bíblia
  console.log('📖 Inserindo livros da Bíblia...')
  for (const book of BIBLE_BOOKS) {
    await prisma.bibleBook.upsert({
      where: { name: book.name },
      update: book,
      create: book
    })
  }
  console.log(`  ✅ ${BIBLE_BOOKS.length} livros inseridos`)

  // Perguntas
  console.log('❓ Inserindo perguntas...')
  let insertedQuestions = 0
  for (const q of QUESTIONS) {
    try {
      await prisma.question.create({ data: q as any })
      insertedQuestions++
    } catch (e: any) {
      if (e.code !== 'P2002') console.error(`  ⚠️ Erro: ${e.message}`)
    }
  }
  console.log(`  ✅ ${insertedQuestions} perguntas inseridas`)

  // Conquistas
  console.log('🏆 Inserindo conquistas...')
  for (const ach of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { name: ach.name },
      update: ach,
      create: ach
    })
  }
  console.log(`  ✅ ${ACHIEVEMENTS.length} conquistas inseridas`)

  // Usuário admin de teste
  console.log('👤 Criando usuário admin de teste...')
  const adminPassword = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@bibliagame.com' },
    update: {},
    create: {
      email: 'admin@bibliagame.com',
      password: adminPassword,
      name: 'Administrador',
      role: 'admin',
      xp: 5000,
      level: 3,
      title: 'Estudante',
      profile: { create: {} }
    }
  })
  console.log('  ✅ Admin criado: admin@bibliagame.com / admin123')

  // Usuários de teste
  console.log('👥 Criando usuários de teste...')
  const testPassword = await bcrypt.hash('teste123', 12)
  const testUsers = [
    { name: 'João da Bíblia', xp: 12000, level: 6, title: 'Mestre da Palavra' },
    { name: 'Paulo Apóstolo', xp: 25000, level: 10, title: 'Mestre da Bíblia' },
    { name: 'Maria Evangelista', xp: 8500, level: 5, title: 'Mestre' },
    { name: 'Pedro Firme', xp: 6000, level: 4, title: 'Conhecedor' },
    { name: 'Ana Profetisa', xp: 15000, level: 7, title: 'Guardião da Palavra' },
  ]

  for (const u of testUsers) {
    const existing = await prisma.user.findFirst({ where: { name: u.name } })
    if (!existing) {
      await prisma.user.create({
        data: {
          email: `${u.name.toLowerCase().replace(/\s/g, '.')}@teste.com`,
          password: testPassword,
          ...u,
          profile: { create: {} },
          rankings: { create: { period: 'global', xp: u.xp } }
        }
      })
    }
  }
  console.log(`  ✅ ${testUsers.length} usuários de teste criados`)

  console.log('\n🎉 Seed concluído com sucesso!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`  📖 ${BIBLE_BOOKS.length} livros da Bíblia`)
  console.log(`  ❓ ${insertedQuestions} perguntas`)
  console.log(`  🏆 ${ACHIEVEMENTS.length} conquistas`)
  console.log(`  👤 Admin: admin@bibliagame.com / admin123`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
