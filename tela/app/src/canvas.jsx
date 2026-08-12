import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, IconButton, Select, Tooltip } from '@refy/ui'
import { Ajuda } from './gaveta-ajuda.jsx'
import { useT } from './i18n.jsx'
import './canvas.css'

/* O canvas: onde a arquitetura é montada. Ele ocupa a tela inteira entre os
   trilhos, e tudo que explica o desenho fica por cima dele, recolhível.

   Cada peça carrega o ícone oficial da AWS, o tipo do provider, o nome, o
   tecido com o link de ajuda ao lado e a conta onde mora, escolhida entre as
   cadastradas. As contas viram caixas tracejadas que abraçam as peças delas.

   Ligar acontece de dois jeitos: arrastando de um pino até a outra peça, ou
   clicando no pino e depois na peça de destino. Quem classifica a seta é o
   bioma, e a legenda por cima do quadro diz a regra de cada desenho.

   Contrato com quem compõe a tela:
     contas         a lista de tela/contas.json, cada uma { apelido, numero, area, padrao }
     aoMudarConta   (id, conta) com o cadastro inteiro, porque a escolha decide
                    três campos da peça de uma vez, nesta correspondência:
                    valores.conta recebe conta.numero (o canvas casa por ele),
                    conta recebe conta.apelido (é o que rotula a caixa),
                    zona recebe conta.area (é o que decide a pasta)
     aoAjuda        (verbete) abre a gaveta de ajuda no verbete pedido */

const LARGURA = 252
const ALTURA = 124
const ENCAIXE = 4          // o arrasto encaixa nesta grade, para o desenho ficar reto
const GRADE = 22           // o passo da grade de fundo, em 100%
const ZOOM_MIN = 0.4
const ZOOM_MAX = 2
const PASSO_ZOOM = 0.1
const MARGEM_CONTA = { x: 26, topo: 38, baixo: 24 }

const CLASSE_TECIDO = { permanente: 'permanente', estavel: 'estavel', efemera: 'efemera' }

/* Sinal de chave ou segredo na aresta: o recurso de uma das pontas ou a
   palavra que o desenho usou para o canal. "chave" fica fora da lista porque
   chave primária e chave de partição são outra coisa. */
const RECURSO_SEGURANCA = /^aws_(kms|secretsmanager|acm|acmpca|iam|cloudhsm|signer|privateca)/
const PALAVRA_SEGURANCA = /(cifra|cifrad|segredo|secret|kms|tls|mtls|certificad|assinatur)/i

const limita = (v, min, max) => Math.min(max, Math.max(min, v))
const encaixa = (v) => Math.round(v / ENCAIXE) * ENCAIXE
const chave = (s) => (s || '').trim().toLowerCase()

/* A legenda guarda o recolhimento, como os trilhos. Quem já sabe a regra não
   precisa reabrir a mesma caixa a cada visita. */
const GUARDA_LEGENDA = 'bioma.canvas.legenda'

/* Aberta enquanto o quadro está vazio, porque ali ela não cobre nada e é onde a
   regra das setas ainda precisa ser lida. Com peça no quadro ela nasce
   recolhida: caixa opaca por cima da peça esconde o trabalho. Depois do
   primeiro clique manda a escolha guardada. */
function legendaGuardada(temDesenho) {
  try {
    const guardado = window.localStorage.getItem(GUARDA_LEGENDA)
    if (guardado) return guardado !== 'fechada'
  } catch { /* sem disco, vale a regra do quadro */ }
  return !temDesenho
}

/* O que o seletor de conta da peça oferece: as cadastradas, mais a conta que a
   peça já tem quando ela não está no cadastro. Sem esta segunda parte, uma peça
   que o tradutor já resolveu apareceria vazia e a escolha apagaria o que existe.
   O valor do campo é o número da conta, que é o que não se repete. */
function escolhaDeConta(contas, n, t) {
  const opcoes = contas
    .filter(c => c && (c.numero || c.apelido))
    .map(c => ({
      valor: c.numero || c.apelido,
      rotulo: (c.apelido || c.numero) + (c.apelido && c.numero ? ' (' + c.numero + ')' : ''),
      conta: c,
    }))

  const numero = (n.valores?.conta || '').trim()
  const apelido = (n.conta || '').trim()
  let atual = (numero && opcoes.find(o => o.conta.numero === numero))
    || (apelido && opcoes.find(o => chave(o.conta.apelido) === chave(apelido)))
    || null

  if (!atual && (apelido || numero)) {
    atual = { valor: 'atual:' + (apelido || numero), rotulo: (apelido || numero) + ' · ' + t('canvas.conta.fora'), conta: null }
    opcoes.unshift(atual)
  }
  if (!atual && opcoes.length) {
    atual = { valor: '', rotulo: t('canvas.conta.escolha'), conta: null }
    opcoes.unshift(atual)
  }
  return { opcoes, valor: atual ? atual.valor : '' }
}

/* ── ícones dos controles ───────────────────────────────────────────── */

const Svg = (p) => (
  <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p} />
)
const IconeAbrir = () => <Svg><path d="M6 2H2v4M10 2h4v4M6 14H2v-4M10 14h4v-4" /></Svg>
const IconeFechar = () => <Svg><path d="M2 6h4V2M14 6h-4V2M2 10h4v4M14 10h-4v4" /></Svg>
const IconeMenos = () => <Svg><path d="M3 8h10" /></Svg>
const IconeMais = () => <Svg><path d="M8 3v10M3 8h10" /></Svg>

/* O que mora dentro da peça e recebe clique próprio (o link de ajuda e o
   seletor de conta) segura os três eventos: sem isso o ponteiro vira arrasto, o
   clique vira ligação quando um pino está fixado, e a seta do teclado dentro do
   seletor move a peça. */
const PARA_NA_PECA = {
  onPointerDown: (e) => e.stopPropagation(),
  onClick: (e) => e.stopPropagation(),
  onKeyDown: (e) => e.stopPropagation(),
}

/* ── geometria das arestas ──────────────────────────────────────────── */

function tracado(o, d) {
  const dxCentro = (d.x + LARGURA / 2) - (o.x + LARGURA / 2)
  const dyCentro = (d.y + ALTURA / 2) - (o.y + ALTURA / 2)

  // peças empilhadas ligam por cima e por baixo, para a linha não dar a volta
  if (Math.abs(dxCentro) < LARGURA * 0.8 && Math.abs(dyCentro) > ALTURA) {
    const desce = dyCentro > 0
    const x1 = o.x + LARGURA / 2
    const x2 = d.x + LARGURA / 2
    const y1 = desce ? o.y + ALTURA : o.y
    const y2 = desce ? d.y : d.y + ALTURA
    const puxa = Math.max(36, Math.abs(y2 - y1) / 2)
    const c1 = desce ? y1 + puxa : y1 - puxa
    const c2 = desce ? y2 - puxa : y2 + puxa
    return {
      d: `M ${x1} ${y1} C ${x1} ${c1}, ${x2} ${c2}, ${x2} ${y2}`,
      mx: (x1 + 3 * x1 + 3 * x2 + x2) / 8,
      my: (y1 + 3 * c1 + 3 * c2 + y2) / 8,
    }
  }

  const paraDireita = dxCentro >= 0
  const x1 = paraDireita ? o.x + LARGURA : o.x
  const x2 = paraDireita ? d.x : d.x + LARGURA
  const y1 = o.y + ALTURA / 2
  const y2 = d.y + ALTURA / 2
  const puxa = Math.max(42, Math.abs(x2 - x1) / 2)
  const c1 = paraDireita ? x1 + puxa : x1 - puxa
  const c2 = paraDireita ? x2 - puxa : x2 + puxa
  return {
    d: `M ${x1} ${y1} C ${c1} ${y1}, ${c2} ${y2}, ${x2} ${y2}`,
    mx: (x1 + 3 * c1 + 3 * c2 + x2) / 8,
    my: (y1 + 3 * y1 + 3 * y2 + y2) / 8,
  }
}

/* ── o componente ───────────────────────────────────────────────────── */

export function Canvas({
  nos = [], arestas = [], proposta = null, escolhido = null, contas = [],
  aoEscolher, aoMover, aoLigar, aoMudarConta, aoAjuda, aoTirarAresta,
  zoom, aoZoom, pan, aoPan,
}) {
  /* Zoom e pan são governados pela Tela quando ela manda o valor e o aviso.
     Faltando qualquer um dos dois, o canvas se governa sozinho, para não ler de
     um lugar e escrever em outro. */
  const { t } = useT()
  const [zoomLocal, setZoomLocal] = useState(1)
  const [panLocal, setPanLocal] = useState({ x: 0, y: 0 })
  const zoomDeFora = typeof zoom === 'number' && typeof aoZoom === 'function'
  const panDeFora = !!pan && typeof pan.x === 'number' && typeof aoPan === 'function'
  const zoomAtual = zoomDeFora ? zoom : zoomLocal
  const panAtual = panDeFora ? pan : panLocal
  const definirZoom = useCallback((v) => (zoomDeFora ? aoZoom(v) : setZoomLocal(v)), [zoomDeFora, aoZoom])
  const definirPan = useCallback((v) => (panDeFora ? aoPan(v) : setPanLocal(v)), [panDeFora, aoPan])

  const [ligando, setLigando] = useState(null)     // arrasto de pino em curso
  const [fixado, setFixado] = useState(null)       // pino clicado, esperando o destino
  const [alvo, setAlvo] = useState(null)           // peça sob o cursor durante o arrasto
  const [arrastandoPlano, setArrastandoPlano] = useState(false)
  const [arrastandoNo, setArrastandoNo] = useState(null)
  const [telaCheia, setTelaCheia] = useState(false)
  const [legendaAberta, setLegendaAberta] = useState(() => legendaGuardada(nos.length > 0))

  const raizRef = useRef(null)
  const quadroRef = useRef(null)
  const houveArraste = useRef(false)
  const mexeuPlano = useRef(false)

  // espelho para os ouvintes de janela, que nascem antes da próxima renderização
  const vivo = useRef({ zoom: zoomAtual, pan: panAtual, nos })
  vivo.current = { zoom: zoomAtual, pan: panAtual, nos }

  /* A primeira peça a chegar no quadro vazio recolhe a legenda, uma vez só.
     Quem já escolheu antes manda, e reabrir depois continua valendo. */
  const legendaDecidida = useRef(false)
  useEffect(() => {
    if (legendaDecidida.current || !nos.length) return
    legendaDecidida.current = true
    let escolhida = null
    try { escolhida = window.localStorage.getItem(GUARDA_LEGENDA) } catch { /* sem disco */ }
    if (!escolhida) setLegendaAberta(false)
  }, [nos.length])

  const paraMundo = useCallback((cx, cy) => {
    const r = quadroRef.current.getBoundingClientRect()
    const { pan: p, zoom: z } = vivo.current
    return { x: (cx - r.left - p.x) / z, y: (cy - r.top - p.y) / z }
  }, [])

  const noSob = useCallback((mx, my) => {
    const lista = vivo.current.nos
    for (let i = lista.length - 1; i >= 0; i--) {
      const n = lista[i]
      if (mx >= n.x && mx <= n.x + LARGURA && my >= n.y && my <= n.y + ALTURA) return n
    }
    return null
  }, [])

  /* ── o que a proposta diz de cada peça e de cada seta ──────────────── */

  const porServico = useMemo(() => {
    const m = {}
    for (const u of (proposta?.unidades || [])) m[chave(u.servico)] = u
    return m
  }, [proposta])

  const unidadeDe = useCallback((n) => porServico[chave(n.servico)] || null, [porServico])

  const relacaoDe = useCallback((a) => {
    const o = nos.find(n => n.id === a.de), d = nos.find(n => n.id === a.para)
    if (!o || !d) return null
    return (proposta?.relacoes || []).find(r =>
      chave(r.origem) === chave(o.servico) && chave(r.destino) === chave(d.servico)) || null
  }, [nos, proposta])

  /* Três desenhos de aresta, e a razão de cada um:
     ligação quando o tradutor disse ligação ou quando as contas diferem, e ela
     vem antes porque atravessar conta cobra permissão dos dois lados;
     cifra quando uma ponta é recurso de segurança ou o canal fala de chave;
     dependência no resto, inclusive fronteira de confiança. */
  const tipoDaAresta = useCallback((a, rel) => {
    const o = nos.find(n => n.id === a.de), d = nos.find(n => n.id === a.para)
    if (rel?.vira === 'ligação') return 'ligacao'
    if (o?.conta && d?.conta && chave(o.conta) !== chave(d.conta)) return 'ligacao'
    if (PALAVRA_SEGURANCA.test(`${a.canal || ''} ${a.flui || ''}`)) return 'cifra'
    if (RECURSO_SEGURANCA.test(o?.tipo || '') || RECURSO_SEGURANCA.test(d?.tipo || '')) return 'cifra'
    return 'dependencia'
  }, [nos])

  /* cada aresta desenhada uma vez: a linha embaixo das peças, o rótulo em cima,
     para a classificação do tradutor ficar legível mesmo com peça no caminho */
  const desenhos = useMemo(() => arestas.map((a, i) => {
    const o = nos.find(n => n.id === a.de), d = nos.find(n => n.id === a.para)
    if (!o || !d) return null
    const rel = relacaoDe(a)
    return {
      chave: `${a.de}-${a.para}-${i}`,
      indice: i,
      de: o.valores?.nome || o.servico,
      para: d.valores?.nome || d.servico,
      tipo: tipoDaAresta(a, rel),
      rotulo: rel?.vira || a.flui || '',
      aceso: escolhido === o.id || escolhido === d.id,
      ...tracado(o, d),
    }
  }).filter(Boolean), [arestas, nos, relacaoDe, tipoDaAresta, escolhido])

  /* ── as contas, como caixas que abraçam as peças ───────────────────── */

  /* Peça sem conta escolhida cai na caixa da área dela, e a caixa diz `área`.
     Escrever `conta:` em cima do nome de uma área seria rótulo mentindo. */
  const caixas = useMemo(() => {
    /* O rótulo da caixa é sempre "apelido (número)": só o número não diz nada,
       e cada peça da mesma conta tem que cair na mesma caixa, venha o valor
       do cadastro, do tradutor ou do desenho subido. */
    const porNumero = new Map(), porApelido = new Map()
    for (const c of (Array.isArray(contas) ? contas : [])) {
      if (c?.numero) porNumero.set(String(c.numero).trim(), c)
      if (c?.apelido) porApelido.set(chave(c.apelido), c)
    }
    const grupos = new Map()
    for (const n of nos) {
      const cru = (n.valores?.conta || n.conta || '').trim()
      const cadastro = porNumero.get(cru) || porApelido.get(chave(n.conta || cru))
      const nome = cadastro
        ? (cadastro.apelido || cru) + (cadastro.numero ? ' (' + cadastro.numero + ')' : '')
        : (cru || (n.zona || '').trim())
      if (!nome) continue
      const id = (cru || cadastro ? 'conta:' : 'area:') + (cadastro?.numero || nome)
      if (!grupos.has(id)) grupos.set(id, { nome, termo: (cru || cadastro) ? 'conta' : 'dominio', lista: [] })
      grupos.get(id).lista.push(n)
    }
    return [...grupos.entries()].map(([id, { nome, termo, lista }]) => {
      const x = Math.min(...lista.map(n => n.x)) - MARGEM_CONTA.x
      const y = Math.min(...lista.map(n => n.y)) - MARGEM_CONTA.topo
      return {
        id, nome, termo, x, y,
        moradores: lista.map(n => n.id),
        largura: Math.max(...lista.map(n => n.x + LARGURA)) - x + MARGEM_CONTA.x,
        altura: Math.max(...lista.map(n => n.y + ALTURA)) - y + MARGEM_CONTA.baixo,
      }
    })
  }, [nos])

  /* ── arrastar a conta inteira ───────────────────────────────────────
     Mover peça por peça para reposicionar uma conta é trabalho de formiga.
     A alça é o rótulo da caixa, e o movimento vale para todos os moradores. */
  const arrastarCaixa = (e, caixa) => {
    e.stopPropagation()
    e.preventDefault()
    const inicio = { x: e.clientX, y: e.clientY }
    const antes = new Map(nos.filter(n => caixa.moradores.includes(n.id))
      .map(n => [n.id, { x: n.x, y: n.y }]))
    const escala = zoomAtual || 1
    const mover = (ev) => {
      const dx = (ev.clientX - inicio.x) / escala
      const dy = (ev.clientY - inicio.y) / escala
      if (Math.hypot(dx, dy) > 2) mexeuPlano.current = true
      for (const [id, p] of antes) aoMover && aoMover(id, Math.round(p.x + dx), Math.round(p.y + dy))
    }
    const soltar = () => {
      window.removeEventListener('mousemove', mover)
      window.removeEventListener('mouseup', soltar)
    }
    window.addEventListener('mousemove', mover)
    window.addEventListener('mouseup', soltar)
  }

  /* ── zoom ──────────────────────────────────────────────────────────── */

  const zoomEm = useCallback((novo, ax, ay) => {
    const { zoom: z, pan: p } = vivo.current
    const v = limita(Math.round(novo * 100) / 100, ZOOM_MIN, ZOOM_MAX)
    if (v === z) return
    const k = v / z
    definirPan({ x: ax - (ax - p.x) * k, y: ay - (ay - p.y) * k })
    definirZoom(v)
  }, [definirPan, definirZoom])

  const zoomNoCentro = useCallback((novo) => {
    const r = quadroRef.current?.getBoundingClientRect()
    zoomEm(novo, (r?.width || 0) / 2, (r?.height || 0) / 2)
  }, [zoomEm])

  /* Enquadrar é o jeito de voltar ao centro: o desenho inteiro cabe no quadro,
     com folga para a caixa da conta. Aproximar além de 100% seria enganoso num
     desenho pequeno, então o enquadramento só afasta. */
  const enquadrar = useCallback(() => {
    const lista = vivo.current.nos
    const r = quadroRef.current?.getBoundingClientRect()
    if (!lista.length || !r?.width) {
      definirZoom(1)
      definirPan({ x: 0, y: 0 })
      return
    }
    const folga = { x: MARGEM_CONTA.x + 16, topo: MARGEM_CONTA.topo + 16, baixo: MARGEM_CONTA.baixo + 16 }
    const x1 = Math.min(...lista.map(n => n.x)) - folga.x
    const y1 = Math.min(...lista.map(n => n.y)) - folga.topo
    const x2 = Math.max(...lista.map(n => n.x + LARGURA)) + folga.x
    const y2 = Math.max(...lista.map(n => n.y + ALTURA)) + folga.baixo
    const z = limita(Math.min(r.width / (x2 - x1), r.height / (y2 - y1)), ZOOM_MIN, 1)
    definirZoom(Math.floor(z * 100) / 100)
    definirPan({
      x: (r.width - (x2 - x1) * z) / 2 - x1 * z,
      y: (r.height - (y2 - y1) * z) / 2 - y1 * z,
    })
  }, [definirPan, definirZoom])

  /* Desenho que chega de fora, ou página que troca, muda VÁRIAS peças de uma
     vez, e o quadro enquadra sozinho: sem isso, o desenho subido nascia fora
     da borda, e a página aberta mostrava duas peças perdidas num canto porque
     cada uma guarda a posição do desenho inteiro. Editar muda UMA peça por
     vez, e edição não pode roubar o quadro de quem está desenhando — é essa a
     linha que separa os dois casos. */
  const idsAnteriores = useRef('')
  useEffect(() => {
    const ids = nos.map(n => n.id)
    const antes = idsAnteriores.current
    idsAnteriores.current = ids.join('|')
    if (nos.length < 2) return
    const conjunto = new Set(antes ? antes.split('|') : [])
    const novos = ids.filter(id => !conjunto.has(id)).length
    const sairam = antes ? [...conjunto].filter(id => !ids.includes(id)).length : 0
    if (novos + sairam <= 1) return
    const t = setTimeout(enquadrar, 0)
    return () => clearTimeout(t)
  }, [nos, enquadrar])

  // a roda: com ctrl ou command aproxima no cursor, sozinha desloca o plano
  useEffect(() => {
    const el = quadroRef.current
    if (!el) return
    const roda = (e) => {
      e.preventDefault()
      const r = el.getBoundingClientRect()
      if (e.ctrlKey || e.metaKey) {
        const { zoom: z } = vivo.current
        zoomEm(z * (e.deltaY < 0 ? 1.12 : 1 / 1.12), e.clientX - r.left, e.clientY - r.top)
        return
      }
      const p = vivo.current.pan
      definirPan({ x: p.x - e.deltaX, y: p.y - e.deltaY })
    }
    el.addEventListener('wheel', roda, { passive: false })
    return () => el.removeEventListener('wheel', roda)
  }, [zoomEm, definirPan])

  /* ── tela cheia ────────────────────────────────────────────────────── */

  useEffect(() => {
    const troca = () => setTelaCheia(document.fullscreenElement === raizRef.current)
    document.addEventListener('fullscreenchange', troca)
    return () => document.removeEventListener('fullscreenchange', troca)
  }, [])

  const alternarTelaCheia = () => {
    if (document.fullscreenElement) document.exitFullscreen()
    else raizRef.current?.requestFullscreen?.()
  }

  /* ── arrastar o plano ──────────────────────────────────────────────── */

  const arrastarPlano = (e) => {
    if (e.button !== 0) return
    if (!e.target.classList.contains('bc-quadro') && !e.target.classList.contains('bc-plano')
      && !e.target.classList.contains('bc-conta')) return
    setFixado(null)
    setArrastandoPlano(true)
    const inicio = { cx: e.clientX, cy: e.clientY, px: panAtual.x, py: panAtual.y }
    const mover = (ev) => {
      if (Math.hypot(ev.clientX - inicio.cx, ev.clientY - inicio.cy) > 3) mexeuPlano.current = true
      definirPan({
        x: inicio.px + (ev.clientX - inicio.cx),
        y: inicio.py + (ev.clientY - inicio.cy),
      })
    }
    const soltar = () => {
      setArrastandoPlano(false)
      window.removeEventListener('pointermove', mover)
      window.removeEventListener('pointerup', soltar)
    }
    window.addEventListener('pointermove', mover)
    window.addEventListener('pointerup', soltar)
  }

  /* ── arrastar uma peça ─────────────────────────────────────────────── */

  const arrastarNo = (e, n) => {
    if (e.button !== 0) return
    e.stopPropagation()
    houveArraste.current = false
    const inicio = { cx: e.clientX, cy: e.clientY, x: n.x, y: n.y }
    const mover = (ev) => {
      const z = vivo.current.zoom
      const dx = (ev.clientX - inicio.cx) / z
      const dy = (ev.clientY - inicio.cy) / z
      if (!houveArraste.current && Math.hypot(dx, dy) < 3 / z) return
      houveArraste.current = true
      setArrastandoNo(n.id)
      aoMover?.(n.id, encaixa(inicio.x + dx), encaixa(inicio.y + dy))
    }
    const soltar = () => {
      setArrastandoNo(null)
      window.removeEventListener('pointermove', mover)
      window.removeEventListener('pointerup', soltar)
    }
    window.addEventListener('pointermove', mover)
    window.addEventListener('pointerup', soltar)
  }

  /* ── ligar: arrastando de um pino, ou clicando no pino e no destino ── */

  const ligar = (origem, destino, sentido) => {
    if (!origem || !destino || origem === destino) return
    if (sentido === 'entrada') aoLigar?.(destino, origem)
    else aoLigar?.(origem, destino)
  }

  const arrastarPino = (e, n, sentido) => {
    if (e.button !== 0) return
    e.stopPropagation()
    const partida = {
      x: sentido === 'saida' ? n.x + LARGURA : n.x,
      y: n.y + ALTURA / 2,
    }
    let mexeu = false
    setLigando({ id: n.id, sentido, ...partida, px: partida.x, py: partida.y })
    const mover = (ev) => {
      const m = paraMundo(ev.clientX, ev.clientY)
      mexeu = mexeu || Math.hypot(m.x - partida.x, m.y - partida.y) > 6
      const sob = noSob(m.x, m.y)
      setAlvo(sob && sob.id !== n.id ? sob.id : null)
      setLigando({ id: n.id, sentido, ...partida, px: m.x, py: m.y })
    }
    const soltar = (ev) => {
      window.removeEventListener('pointermove', mover)
      window.removeEventListener('pointerup', soltar)
      setLigando(null)
      setAlvo(null)
      const m = paraMundo(ev.clientX, ev.clientY)
      const sob = noSob(m.x, m.y)
      if (mexeu && sob && sob.id !== n.id) { ligar(n.id, sob.id, sentido); setFixado(null); return }
      if (!mexeu) setFixado(f => (f && f.id === n.id && f.sentido === sentido ? null : { id: n.id, sentido }))
    }
    window.addEventListener('pointermove', mover)
    window.addEventListener('pointerup', soltar)
  }

  const clicarNo = (e, n) => {
    e.stopPropagation()
    if (houveArraste.current) { houveArraste.current = false; return }
    if (fixado && fixado.id !== n.id) {
      ligar(fixado.id, n.id, fixado.sentido)
      setFixado(null)
      return
    }
    aoEscolher?.(n.id)
  }

  const teclarNo = (e, n) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); aoEscolher?.(n.id); return }
    const passo = e.shiftKey ? 22 : ENCAIXE * 2
    const mapa = { ArrowLeft: [-passo, 0], ArrowRight: [passo, 0], ArrowUp: [0, -passo], ArrowDown: [0, passo] }
    if (!mapa[e.key]) return
    e.preventDefault()
    aoMover?.(n.id, encaixa(n.x + mapa[e.key][0]), encaixa(n.y + mapa[e.key][1]))
  }

  const alternarLegenda = () => {
    setLegendaAberta(v => {
      try { window.localStorage.setItem(GUARDA_LEGENDA, v ? 'fechada' : 'aberta') } catch { /* sem disco, vale a sessão */ }
      return !v
    })
  }

  const trocarConta = (n, valor, opcoes) => {
    const alvo = opcoes.find(o => o.valor === valor)
    if (!alvo?.conta) return
    aoMudarConta?.(n.id, alvo.conta)
  }

  /* ── desenho ───────────────────────────────────────────────────────── */

  const cadastradas = Array.isArray(contas) ? contas : []
  const passoGrade = GRADE * zoomAtual
  const ligacaoAberta = ligando || fixado
  const noFixado = fixado ? nos.find(n => n.id === fixado.id) : null

  return (
    <div ref={raizRef} className={'bc' + (telaCheia ? ' bc-cheia' : '')}>
      <div
        ref={quadroRef}
        className={'bc-quadro'
          + (arrastandoPlano ? ' arrastando' : '')
          + (ligacaoAberta ? ' ligando' : '')}
        style={{
          backgroundSize: `${passoGrade}px ${passoGrade}px`,
          backgroundPosition: `${panAtual.x}px ${panAtual.y}px`,
        }}
        onPointerDown={arrastarPlano}
        onClick={(e) => {
          setFixado(null)
          /* clique no vazio desseleciona; o fim de um arrasto de plano ou de
             caixa não conta como clique */
          if (mexeuPlano.current) { mexeuPlano.current = false; return }
          const cls = e.target.classList
          if (cls.contains('bc-quadro') || cls.contains('bc-plano') || cls.contains('bc-conta')) {
            aoEscolher?.(null)
          }
        }}
      >
        <div
          className="bc-plano"
          style={{ transform: `translate(${panAtual.x}px, ${panAtual.y}px) scale(${zoomAtual})` }}
        >
          {caixas.map(c => (
            <div key={c.id} className="bc-conta"
              style={{ left: c.x, top: c.y, width: c.largura, height: c.altura }}>
              {/* a alça é o rótulo: arrastar a caixa leva as peças que moram
                  nela, porque conta se move inteira e não peça por peça */}
              <span className="bc-conta-nome bc-alca"
                title={t('canvas.caixa.arrastar')}
                onMouseDown={e => arrastarCaixa(e, c)}>
                {t(c.termo === 'conta' ? 'canvas.caixa.conta' : 'canvas.caixa.dominio')}: {c.nome}
              </span>
            </div>
          ))}

          <svg className="bc-fios">
            <defs>
              {['dependencia', 'ligacao', 'cifra'].map(t => (
                <marker key={t} id={`bc-ponta-${t}`} className={`bc-ponta ${t}`}
                  viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7"
                  orient="auto-start-reverse">
                  <path d="M 0 1 L 9 5 L 0 9 z" />
                </marker>
              ))}
            </defs>

            {desenhos.map(e => (
              <path key={e.chave} className={'bc-fio ' + e.tipo + (e.aceso ? ' acesa' : '')}
                d={e.d} markerEnd={`url(#bc-ponta-${e.tipo})`} />
            ))}

            {ligando && (
              <path className="bc-fio bc-provisorio"
                d={`M ${ligando.x} ${ligando.y} L ${ligando.px} ${ligando.py}`} />
            )}
            {!ligando && noFixado && (
              <circle className="bc-fixado" r="9"
                cx={fixado.sentido === 'saida' ? noFixado.x + LARGURA : noFixado.x}
                cy={noFixado.y + ALTURA / 2} />
            )}
          </svg>

          {nos.map(n => {
            const u = unidadeDe(n)
            const durabilidade = u?.durabilidade
            const nome = n.valores?.nome || u?.nome || n.servico || n.tipo
            const { opcoes, valor } = escolhaDeConta(cadastradas, n, t)
            return (
              <div key={n.id}
                className={'bc-no'
                  + (escolhido === n.id ? ' escolhido' : '')
                  + (arrastandoNo === n.id ? ' movendo' : '')
                  + (alvo === n.id ? ' alvo' : '')
                  + (fixado?.id === n.id ? ' fonte' : '')}
                style={{ left: n.x, top: n.y, width: LARGURA, height: ALTURA }}
                role="button" tabIndex={0}
                aria-pressed={escolhido === n.id}
                onPointerDown={e => arrastarNo(e, n)}
                onClick={e => clicarNo(e, n)}
                onKeyDown={e => teclarNo(e, n)}
              >
                <div className="bc-no-cabeca">
                  <img className="bc-icone" alt="" draggable={false}
                    src={`/icone?tipo=${encodeURIComponent(n.tipo || n.servico || '')}`} />
                  <div className="bc-no-nomes">
                    <span className="bc-no-nome">{nome}</span>
                    <code className="bc-no-tipo">{n.tipo}</code>
                  </div>
                </div>
                <div className="bc-no-pe">
                  <span className="bc-no-termo" {...PARA_NA_PECA}>
                    <Ajuda verbete="tecido" aoAbrir={aoAjuda}>{t('canvas.tecido.termo')}</Ajuda>
                  </span>
                  {durabilidade ? (
                    <span className={'bc-tecido ' + (CLASSE_TECIDO[durabilidade] || 'efemera')}>
                      <i />{t('canvas.tecido.' + durabilidade)}
                    </span>
                  ) : u ? (
                    <span className="bc-tecido fronteira"><i />{u.tipo}</span>
                  ) : (
                    <span className="bc-mudo">{proposta ? t('canvas.semLeitura') : t('canvas.lendo')}</span>
                  )}
                </div>

                {/* Artefato não mora em conta: ele é entregue à esteira. Pedir
                    conta aqui fazia a peça parecer infraestrutura por aplicar. */}
                {u?.tipo === 'artefato' ? (
                  <div className="bc-no-conta">
                    <span className="bc-mudo">{t('canvas.conta.artefato')}</span>
                    {n.multiplicidade && <span className="bc-mult">{n.multiplicidade}</span>}
                  </div>
                ) : (
                <div className="bc-no-conta">
                  <div className="bc-conta-campo" {...PARA_NA_PECA}>
                    <Select
                      block
                      className={'bc-conta-escolha'
                        + (cadastradas.length && valor.startsWith('atual:') ? ' sem-cadastro' : '')}
                      aria-label={t('canvas.conta.aria', { nome })}
                      title={opcoes.find(o => o.valor === valor)?.rotulo || t('canvas.conta.nenhuma')}
                      value={valor}
                      disabled={!opcoes.length}
                      onChange={e => trocarConta(n, e.target.value, opcoes)}
                    >
                      {opcoes.length
                        ? opcoes.map(o => <option key={o.valor} value={o.valor}>{o.rotulo}</option>)
                        : <option value="">{t('canvas.conta.nenhuma')}</option>}
                    </Select>
                  </div>
                  {n.multiplicidade && <span className="bc-mult">{n.multiplicidade}</span>}
                </div>
                )}

                <button type="button" className="bc-pino entrada" aria-label={t('canvas.pino.entrada', { nome })}
                  onPointerDown={e => arrastarPino(e, n, 'entrada')}
                  onClick={e => e.stopPropagation()} />
                <button type="button" className="bc-pino saida" aria-label={t('canvas.pino.saida', { nome })}
                  onPointerDown={e => arrastarPino(e, n, 'saida')}
                  onClick={e => e.stopPropagation()} />
              </div>
            )
          })}

          <svg className="bc-fios bc-rotulos">
            {desenhos.filter(e => e.rotulo).map(e => (
              <text key={e.chave} className={'bc-fio-rotulo ' + e.tipo}
                x={e.mx} y={e.my - 7} textAnchor="middle">{e.rotulo}</text>
            ))}
          </svg>

          {/* remover a ligação no próprio desenho: o × mora no meio da seta */}
          {aoTirarAresta && desenhos.map(e => (
            <button key={'x' + e.chave} type="button" className="bc-tirar-seta"
              style={{ left: e.mx, top: e.my }}
              title={t('canvas.seta.remover')} aria-label={t('canvas.seta.remover')}
              onPointerDown={ev => ev.stopPropagation()}
              onClick={ev => { ev.stopPropagation(); aoTirarAresta(e.indice, e.de, e.para) }}>×</button>
          ))}
        </div>

        <div className="bc-controles">
          <Tooltip label={telaCheia ? t('canvas.telaCheia.sair') : t('canvas.telaCheia')} side="bottom" portalled>
            <IconButton aria-label={telaCheia ? t('canvas.telaCheia.sair') : t('canvas.telaCheia')} variant="ghost" size="sm"
              icon={telaCheia ? <IconeFechar /> : <IconeAbrir />} onClick={alternarTelaCheia} />
          </Tooltip>
          <span className="bc-separador" />
          <Tooltip label={t('canvas.afastar')} side="bottom" portalled>
            <IconButton aria-label={t('canvas.afastar')} variant="ghost" size="sm" icon={<IconeMenos />}
              disabled={zoomAtual <= ZOOM_MIN}
              onClick={() => zoomNoCentro(zoomAtual - PASSO_ZOOM)} />
          </Tooltip>
          <Tooltip label={t('canvas.enquadrar')} side="bottom" portalled>
            <Button variant="ghost" size="sm" className="bc-percentual" onClick={enquadrar}>
              {Math.round(zoomAtual * 100)}%
            </Button>
          </Tooltip>
          <Tooltip label={t('canvas.aproximar')} side="bottom" portalled>
            <IconButton aria-label={t('canvas.aproximar')} variant="ghost" size="sm" icon={<IconeMais />}
              disabled={zoomAtual >= ZOOM_MAX}
              onClick={() => zoomNoCentro(zoomAtual + PASSO_ZOOM)} />
          </Tooltip>
        </div>

        {fixado && (
          <div className="bc-aviso">
            {t('canvas.aviso.fixado')}
          </div>
        )}

        {/* A legenda por cima do quadro, e recolhida quando já foi lida: o
            canvas é a figura, e nenhuma faixa fixa come altura dele. */}
        <div className={'bc-legenda' + (legendaAberta ? '' : ' recolhida')}
          onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
          {legendaAberta ? (
            <>
              <div className="bc-legenda-topo">
                <span className="bc-legenda-titulo">{t('canvas.legenda.titulo')}</span>
                <button type="button" className="bc-legenda-botao" aria-expanded="true"
                  aria-controls="bc-legenda-corpo" onClick={alternarLegenda}>
                  {t('canvas.legenda.esconder')}
                </button>
              </div>
              <div id="bc-legenda-corpo" className="bc-legenda-corpo">
                <p className="bc-legenda-lead">
                  {t('canvas.legenda.lead')}
                </p>
                <ul className="bc-legenda-lista">
                  <li className="bc-amostra dependencia">
                    <svg viewBox="0 0 34 8"><path d="M0 4h34" /></svg>
                    <span>{t('canvas.legenda.dep')} <b>{t('canvas.legenda.dep.termo')}</b></span>
                  </li>
                  <li className="bc-amostra ligacao">
                    <svg viewBox="0 0 34 8"><path d="M0 4h34" /></svg>
                    <span>{t('canvas.legenda.lig')} <b>{t('canvas.legenda.lig.termo')}</b></span>
                  </li>
                  <li className="bc-amostra cifra">
                    <svg viewBox="0 0 34 8"><path d="M0 4h34" /></svg>
                    <span>{t('canvas.legenda.cifra')} <b>{t('canvas.legenda.cifra.termo')}</b></span>
                  </li>
                </ul>
                <p className="bc-dica">{t('canvas.legenda.dica')}</p>
              </div>
            </>
          ) : (
            <button type="button" className="bc-legenda-botao" aria-expanded="false"
              onClick={alternarLegenda}>
              {t('canvas.legenda.mostrar')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Canvas
