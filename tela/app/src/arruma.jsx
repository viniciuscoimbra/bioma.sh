/* Arrumação por CONTÊINER: a página desenha a hierarquia que a infraestrutura
   tem, e não uma grade de caixas iguais.

   A página da fundação abria com sessenta retângulos brancos do mesmo tamanho,
   e quarenta e sete deles eram a MESMA receita — uma conta governada por conta
   da organização. O desenho de arquitetura que a instituição mantém não põe
   quarenta e sete caixas soltas: ele põe a OU e as contas dentro dela.

   Quem diz onde cada peça mora é o `.bio`: `ou` na peça, e `dominios` com o
   `pai` de cada OU. Continua sendo a VISTA — a posição de verdade está no
   arquivo, e `Todas as Páginas` devolve o desenho como ele é. */

export const LARGURA_PECA = 252
export const ALTURA_PECA = 124
const PASSO_X = 300
const PASSO_Y = 170

/* A peça que mora numa OU é uma CONTA, e o desenho de arquitetura desenha
   conta como tarja: ícone e nome, uma linha. A ficha inteira — nome, tipo,
   tecido e o combo de conta — tem 252 por 124, e sessenta delas não cabem em
   zoom nenhum que ainda se leia. O combo ali é redundante: a caixa em volta já
   diz de que conta se trata. */
export const LARGURA_TARJA = 184
export const ALTURA_TARJA = 52
const TARJA_X = 200
const TARJA_Y = 68
const PADDING = { x: 26, topo: 44, baixo: 24 }
const ENTRE = 24

/* O caminho de contêineres de uma peça, do mais externo ao mais interno.
   Peça de conta governada mora na OU dela, e a peça É a conta: pôr uma caixa
   de conta em volta de uma peça só repetiria o rótulo. As demais continuam
   agrupadas pela conta, que é o que a tela sempre fez. */
export function caminhoDeContainer(n, dominios) {
  if (n.ou && dominios) {
    const acima = []
    let atual = n.ou
    const visto = new Set()
    while (atual && dominios[atual] && !visto.has(atual)) {
      visto.add(atual)
      acima.unshift({ id: 'ou:' + atual, nome: atual, termo: 'dominio' })
      atual = dominios[atual].pai
    }
    if (acima.length) return acima
  }
  const conta = (n.conta || '').trim()
  return conta ? [{ id: 'conta:' + conta, nome: conta, termo: 'conta' }] : []
}

/* Empacota uma lista de peças numa grade com `colunas` colunas. */
function grade(lista, colunas, x0, y0) {
  const c = Math.max(1, colunas)
  const tarja = lista.length > 0 && lista.every(n => n.compacto)
  const px = tarja ? TARJA_X : PASSO_X
  const py = tarja ? TARJA_Y : PASSO_Y
  const lx = tarja ? LARGURA_TARJA : LARGURA_PECA
  const ly = tarja ? ALTURA_TARJA : ALTURA_PECA
  lista.forEach((n, i) => {
    n.x = x0 + (i % c) * px
    n.y = y0 + Math.floor(i / c) * py
  })
  const usadas = Math.min(c, lista.length)
  return {
    largura: usadas ? (usadas - 1) * px + lx : 0,
    altura: lista.length ? (Math.ceil(lista.length / c) - 1) * py + ly : 0,
  }
}

/* Monta um nó da árvore de contêineres e devolve o tamanho que ele ocupa.
   As peças soltas do contêiner vão em cima; os filhos, embaixo, em linha, e
   quebram quando passam da largura pedida. */
function monta(no, x0, y0, largura) {
  let y = y0
  let maiorX = x0
  if (no.pecas.length) {
    const tarja = no.pecas.every(n => n.compacto)
    const px = tarja ? TARJA_X : PASSO_X
    const lx = tarja ? LARGURA_TARJA : LARGURA_PECA
    const colunas = Math.max(1, Math.min(
      tarja ? 4 : 99, Math.floor((largura + px - lx) / px)))
    const t = grade(no.pecas, colunas, x0, y)
    y += t.altura + (no.filhos.length ? ENTRE : 0)
    maiorX = Math.max(maiorX, x0 + t.largura)
  }
  let linhaX = x0
  let linhaAltura = 0
  for (const filho of no.filhos) {
    const interno = monta(filho, linhaX + PADDING.x, y + PADDING.topo, largura)
    filho.rect = {
      x: linhaX, y,
      largura: interno.largura + PADDING.x * 2,
      altura: interno.altura + PADDING.topo + PADDING.baixo,
    }
    if (linhaX > x0 && linhaX + filho.rect.largura - x0 > largura) {
      // não coube na linha: desce e refaz este filho no começo da próxima
      linhaX = x0
      y += linhaAltura + ENTRE
      linhaAltura = 0
      const outra = monta(filho, linhaX + PADDING.x, y + PADDING.topo, largura)
      filho.rect = {
        x: linhaX, y,
        largura: outra.largura + PADDING.x * 2,
        altura: outra.altura + PADDING.topo + PADDING.baixo,
      }
    }
    linhaAltura = Math.max(linhaAltura, filho.rect.altura)
    maiorX = Math.max(maiorX, filho.rect.x + filho.rect.largura)
    linhaX = filho.rect.x + filho.rect.largura + ENTRE
  }
  if (no.filhos.length) y += linhaAltura
  return { largura: maiorX - x0, altura: y - y0 }
}

/* A arrumação inteira de uma página. Devolve as peças reposicionadas e os
   contêineres com o retângulo de cada um, já aninhados. */
export function arrumaPorContainer(recorte, dominios, larguraUtil) {
  const raizes = []
  const porId = new Map()
  const soltas = []

  for (const n of recorte) {
    const caminho = caminhoDeContainer(n, dominios)
    if (!caminho.length) { soltas.push({ ...n }); continue }
    let nivel = raizes
    let pai = null
    let no = null
    for (const passo of caminho) {
      const id = (pai ? pai.id + '>' : '') + passo.id
      no = porId.get(id)
      if (!no) {
        no = { id, nome: passo.nome, termo: passo.termo, profundidade: (pai?.profundidade ?? -1) + 1,
               pecas: [], filhos: [], rect: null }
        porId.set(id, no)
        nivel.push(no)
      }
      nivel = no.filhos
      pai = no
    }
    /* Peça que mora numa OU é conta, e conta se desenha como tarja. */
    no.pecas.push({ ...n, compacto: Boolean(n.ou && dominios && dominios[n.ou]) })
  }

  const largura = Math.max(3 * PASSO_X, larguraUtil || 3 * PASSO_X)
  const topo = { pecas: soltas, filhos: raizes }
  monta(topo, 80, 80, largura)

  const pecas = [...soltas]
  const containers = []
  const anda = (no) => {
    if (no.rect) containers.push({ id: no.id, nome: no.nome, termo: no.termo,
                                   profundidade: no.profundidade, ...no.rect,
                                   moradores: no.pecas.map(p => p.id) })
    pecas.push(...no.pecas)
    no.filhos.forEach(anda)
  }
  raizes.forEach(anda)
  return { pecas, containers }
}
