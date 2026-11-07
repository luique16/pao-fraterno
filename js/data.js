/* =========================================================
   Pão Fraterno — Dados mockados (sem backend)
   Usado pela Home (lista pública) e pelo Admin (gerenciamento).
   ========================================================= */

// Categorias e níveis de urgência disponíveis (fonte única de verdade).
const CATEGORIAS = ['Alimentos', 'Higiene', 'Roupas', 'Insumos'];

const URGENCIAS = [
  { valor: 'urgente', rotulo: 'Urgente', ordem: 0 },
  { valor: 'necessario', rotulo: 'Necessário', ordem: 1 },
  { valor: 'suficiente', rotulo: 'Suficiente', ordem: 2 },
];

// Itens de arrecadação (mock). A ordem de exibição segue a urgência.
const ITENS_MOCK = [
  { id: 1, nome: 'Óleo de cozinha', categoria: 'Alimentos', urgencia: 'urgente' },
  { id: 2, nome: 'Legumes (cenoura, batata, chuchu)', categoria: 'Alimentos', urgencia: 'urgente' },
  { id: 3, nome: 'Embalagens descartáveis p/ marmita', categoria: 'Insumos', urgencia: 'necessario' },
  { id: 4, nome: 'Kits de higiene', categoria: 'Higiene', urgencia: 'necessario' },
  { id: 5, nome: 'Agasalhos adultos', categoria: 'Roupas', urgencia: 'necessario' },
  { id: 6, nome: 'Arroz', categoria: 'Alimentos', urgencia: 'suficiente' },
];

// Avisos do mural (mock).
const AVISOS_MOCK = [
  {
    id: 1,
    titulo: 'Montagem de kits de higiene na sexta',
    data: 'Esta semana',
    conteudo:
      'Precisamos de voluntários para montar os kits de higiene na sexta-feira. Não é preciso experiência: basta vontade de ajudar. Chame os amigos!',
  },
  {
    id: 2,
    titulo: 'Obrigado pelas doações de agasalhos',
    data: 'Semana passada',
    conteudo:
      'A arrecadação de agasalhos da semana passada foi um sucesso. Obrigado a todos que doaram — já distribuímos boa parte na última sexta.',
  },
  {
    id: 3,
    titulo: 'Sopa de legumes na sexta: faltam legumes',
    data: 'Há 2 semanas',
    conteudo:
      'Vamos preparar sopa de legumes nesta sexta e ainda faltam cenoura, batata e chuchu. Qualquer quantidade ajuda na nossa cozinha.',
  },
];

// Chave PIX mockada.
const CHAVE_PIX = 'pix@paofraterno.org.br';

// Mapa auxiliar urgência -> metadados (classe CSS e rótulo).
const URGENCIA_INFO = URGENCIAS.reduce((acc, u) => {
  acc[u.valor] = u;
  return acc;
}, {});
