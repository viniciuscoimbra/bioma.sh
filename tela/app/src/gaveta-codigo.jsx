import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Badge, EmptyState, IconButton, Kbd, Tabs } from '@refy/ui'
import { useT } from './i18n.jsx'
import './gaveta-codigo.css'

/* A gaveta do código.

   O canvas é a figura central, então o código sai da tela fixa e vira gaveta:
   entra de baixo, ocupa 62vh, e some quando a pessoa volta a desenhar. A borda
   de cima arrasta, porque ler HCL de dez linhas e ler HCL de duzentas pedem
   alturas diferentes.

   Duas abas, e só duas: Arquivos é a árvore inteira que o bioma escreveu
   (estrutura de pasta, Terraform, Terragrunt), Saída é o que a última execução
   imprimiu. As quatro abas antigas recortavam a mesma árvore por critérios que
   ninguém adivinhava, e cada recorte contava os próprios erros: contagem que
   não bate é pior que contagem que não existe.

   Contrato: { aberta, arquivos, aberto, aoAbrir, aba, aoTrocarAba, aoFechar,
   aoAjuda, aoResponder }. Sem estado global: só a altura da gaveta mora aqui. */

/* A saída do comando entra como pseudo-arquivo próprio: é o que o comando
   escreveu, e ler saída de terminal noutro lugar seria esconder. */
export const SAIDA = 'saída do comando'

export const ABAS = ['arquivos', 'saida']

const RESERVADAS = new RegExp(
  '\\b(resource|module|provider|variable|output|locals|terraform|data|include|inputs|' +
  'source|dependency|generate|remote_state|required_providers|required_version|' +
  'depends_on|lifecycle|for_each|count|type|default|description|true|false|null)\\b')

const FRACAO = 0.62
const MINIMA = 240
const RESPIRO = 96
const BARRA = 60

/* Pendência é valor por responder, e não a palavra no meio de um texto: o
   guia PREENCHER.md fala dela o tempo todo sem esperar nada. */
const VALOR_PENDENTE = /=\s*"PREENCHER"/
const falta = (texto) => typeof texto === 'string' && VALOR_PENDENTE.test(texto)

const alturaPadrao = () =>
  Math.round((typeof window === 'undefined' ? 900 : window.innerHeight) * FRACAO)

/* Realce simples, feito com um só passo por linha: comentário come a linha
   inteira, texto entre aspas vem depois, palavra reservada por último. */
function pedacos(linha) {
  const corte = linha.search(/(^|\s)(#|\/\/)/)
  if (corte >= 0) {
    return [
      ...pedacos(linha.slice(0, corte)),
      { classe: 'nota', texto: linha.slice(corte) },
    ]
  }
  const saida = []
  const re = /("(?:[^"\\]|\\.)*")/g
  let ultimo = 0, m
  const solto = (texto) => {
    let i = 0, achado
    const rr = new RegExp(RESERVADAS.source, 'g')
    while ((achado = rr.exec(texto))) {
      if (achado.index > i) saida.push({ texto: texto.slice(i, achado.index) })
      saida.push({ classe: 'reservada', texto: achado[0] })
      i = achado.index + achado[0].length
    }
    if (i < texto.length) saida.push({ texto: texto.slice(i) })
  }
  while ((m = re.exec(linha))) {
    solto(linha.slice(ultimo, m.index))
    saida.push({ classe: 'cadeia', texto: m[0] })
    ultimo = m.index + m[0].length
  }
  solto(linha.slice(ultimo))
  return saida
}

const fechar = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" aria-hidden="true">
    <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
  </svg>
)

function Visor({ caminho, conteudo, aoResponder, t }) {
  const linhas = useMemo(() => String(conteudo == null ? '' : conteudo).split('\n'), [conteudo])

  if (!caminho) {
    return (
      <div className="gc-visor vazio">
        <p>{t('gc.escolha')}</p>
      </div>
    )
  }

  const pendente = falta(conteudo)
  return (
    <div className="gc-visor">
      <div className="gc-visor-topo">
        <code className="gc-visor-nome">{caminho}</code>
        {pendente && (
          <button className="gc-responder"
            title={t('gc.responder.title')}
            onClick={() => aoResponder && aoResponder(caminho)}>
            {t('gc.responder')}
          </button>
        )}
        <span className="gc-respiro" />
        <span className="gc-visor-linhas">{t('gc.linhas', { n: linhas.length })}</span>
      </div>
      <pre className="gc-codigo">
        <code>
          {linhas.map((l, i) => (
            <span key={i} className={'gc-linha' + (VALOR_PENDENTE.test(l) ? ' pendente' : '')}>
              <span className="gc-numero">{i + 1}</span>
              <span className="gc-texto">
                {pedacos(l).map((p, j) => (
                  <span key={j} className={p.classe ? 'gc-' + p.classe : undefined}>{p.texto}</span>
                ))}
              </span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}

/* Árvore hierárquica de verdade: caminho comprido em lista plana trunca
   justamente no fim, que é onde mora o nome do arquivo. */
function Ramos({ no, nivel, prefixo = '', arquivos, aberto, aoAbrir, fechadas, aoAlternar, t }) {
  const entradas = Object.entries(no)
    .filter(([k]) => k !== '__arquivo')
    .sort(([a, x], [b, y]) => (!!x.__arquivo - !!y.__arquivo) || a.localeCompare(b))

  return entradas.map(([nome, filho]) => {
    const caminho = filho.__arquivo
    const recuo = { paddingLeft: 8 + nivel * 12 }
    if (caminho) {
      const pendente = falta(arquivos[caminho])
      return (
        <button key={caminho} type="button" style={recuo}
          className={'gc-arquivo' + (aberto === caminho ? ' ativo' : '') + (pendente ? ' pendente' : '')}
          title={caminho + (pendente ? ' · ' + t('gc.pendente.title') : '')}
          onClick={() => aoAbrir && aoAbrir(caminho)}>
          {nome}
        </button>
      )
    }
    /* A pasta abre e fecha no clique. O caminho inteiro é a chave, senão duas
       pastas de mesmo nome em ramos diferentes abriam juntas. */
    const dela = prefixo + nome + '/'
    const fechada = !!fechadas[dela]
    return (
      <div key={dela} className="gc-ramo">
        <button type="button" className="gc-pasta" style={recuo}
          aria-expanded={!fechada} onClick={() => aoAlternar(dela)}>
          <span className="gc-pasta-seta" aria-hidden>{fechada ? '▸' : '▾'}</span>
          {nome}/
        </button>
        {!fechada && (
          <Ramos no={filho} nivel={nivel + 1} prefixo={dela} arquivos={arquivos}
            aberto={aberto} aoAbrir={aoAbrir} fechadas={fechadas} aoAlternar={aoAlternar} t={t} />
        )}
      </div>
    )
  })
}

export function GavetaCodigo({
  aberta = false, arquivos = {}, aberto, aoAbrir,
  aba = 'arquivos', aoTrocarAba, aoFechar, aoAjuda, aoResponder,
}) {
  const { t } = useT()
  const painel = useRef(null)
  const puxando = useRef(false)
  const [altura, setAltura] = useState(alturaPadrao)
  const [arrastando, setArrastando] = useState(false)
  const [fechadas, setFechadas] = useState({})
  const alternarPasta = useCallback((chave) => setFechadas(v => ({ ...v, [chave]: !v[chave] })), [])

  const limita = useCallback((v) => {
    const janela = typeof window === 'undefined' ? 900 : window.innerHeight
    const teto = janela - BARRA - RESPIRO
    return Math.max(MINIMA, Math.min(Math.round(v), Math.max(MINIMA, teto)))
  }, [])

  useEffect(() => {
    if (!aberta) return
    const naTecla = (e) => {
      if (e.key !== 'Escape') return
      const alvo = document.activeElement
      const dentro = painel.current && alvo && painel.current.contains(alvo)
      if (!dentro && alvo && alvo.closest && alvo.closest('[role="dialog"]')) return
      if (aoFechar) aoFechar()
    }
    document.addEventListener('keydown', naTecla)
    return () => document.removeEventListener('keydown', naTecla)
  }, [aberta, aoFechar])

  useEffect(() => {
    if (!aberta) return
    setAltura((v) => limita(v))
    painel.current?.focus()
  }, [aberta, limita])

  useEffect(() => {
    if (!aberta) return
    const aoRedimensionar = () => setAltura((v) => limita(v))
    window.addEventListener('resize', aoRedimensionar)
    return () => window.removeEventListener('resize', aoRedimensionar)
  }, [aberta, limita])

  const aoPegar = (e) => {
    puxando.current = true
    setArrastando(true)
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* segue sem captura */ }
  }
  const aoMover = (e) => {
    if (!puxando.current) return
    setAltura(limita(window.innerHeight - BARRA - e.clientY))
  }
  const aoSoltar = (e) => {
    if (!puxando.current) return
    puxando.current = false
    setArrastando(false)
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* nada a soltar */ }
  }
  const aoTeclarNaBorda = (e) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); setAltura((v) => limita(v + 32)) }
    if (e.key === 'ArrowDown') { e.preventDefault(); setAltura((v) => limita(v - 32)) }
    if (e.key === 'Home') { e.preventDefault(); setAltura(limita(alturaPadrao())) }
  }

  /* A saída vive na própria aba; a árvore mostra só arquivo de verdade. */
  const todos = useMemo(
    () => Object.keys(arquivos).filter((c) => c !== SAIDA).sort(), [arquivos])

  const pendentes = useMemo(
    () => todos.filter((c) => falta(arquivos[c])).length, [todos, arquivos])

  const raiz = useMemo(() => {
    const r = {}
    for (const c of todos) {
      let no = r
      const partes = c.split('/')
      partes.forEach((p, i) => {
        const folha = i === partes.length - 1
        no[p] = no[p] || (folha ? { __arquivo: c } : {})
        no = no[p]
      })
    }
    return r
  }, [todos])

  const abaViva = aba === 'saida' ? 'saida' : 'arquivos'

  const itens = useMemo(() => [
    { id: 'arquivos', label: t('gc.aba.arquivos'), badge: todos.length },
    { id: 'saida', label: t('gc.aba.saida') },
  ], [t, todos.length])

  if (!aberta) return null

  return (
    <>
      <div className="gc-escuro" aria-hidden="true" onClick={() => aoFechar && aoFechar()} />

      <section
        ref={painel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={t('gc.rotulo')}
        className={'gc' + (arrastando ? ' arrastando' : '')}
        style={{ height: altura }}
      >
        <div
          className="gc-borda"
          role="separator"
          aria-orientation="horizontal"
          aria-label={t('gc.borda')}
          tabIndex={0}
          onPointerDown={aoPegar}
          onPointerMove={aoMover}
          onPointerUp={aoSoltar}
          onPointerCancel={aoSoltar}
          onKeyDown={aoTeclarNaBorda}
        >
          <span className="gc-alca" aria-hidden="true" />
        </div>

        <header className="gc-topo">
          <span className="gc-rotulo">{t('gc.rotulo')}</span>
          <Tabs variant="pill" items={itens} value={abaViva}
            onChange={(id) => aoTrocarAba && aoTrocarAba(id)} className="gc-abas" />
          <span className="gc-respiro" />
          {pendentes > 0 && (
            <Badge tone="warn" dot>
              {pendentes === 1 ? t('gc.espera.um') : t('gc.espera.varios', { n: pendentes })}
            </Badge>
          )}
          <span className="gc-dica"><Kbd>esc</Kbd> {t('gc.esc')}</span>
          <IconButton size="sm" variant="ghost" aria-label={t('gc.fechar')}
            icon={fechar} onClick={() => aoFechar && aoFechar()} />
        </header>

        <p className="gc-aviso">
          {t('gc.aviso')}
          <button type="button" className="gc-entenda"
            onClick={() => aoAjuda && aoAjuda('gerado')}>{t('comum.entenda')}</button>
        </p>

        {abaViva === 'saida' ? (
          <div className="gc-corpo sozinho">
            {arquivos[SAIDA]
              ? <Visor caminho={SAIDA} conteudo={arquivos[SAIDA]} aoResponder={aoResponder} t={t} />
              : (
                <EmptyState bordered={false} className="gc-vazia"
                  title={t('gc.aba.saida')}
                  message={t('gc.saida.vazia')} />
              )}
          </div>
        ) : (
          <div className={'gc-corpo' + (todos.length ? '' : ' sozinho')}>
            {todos.length === 0 ? (
              <EmptyState bordered={false} className="gc-vazia"
                title={t('gc.vazia.titulo')}
                message={t('gc.vazia.corpo')} />
            ) : (
              <>
                <div className="gc-arvore">
                  {todos.length === 0 && <p className="gc-nada">{t('gc.nada')}</p>}
                  <Ramos no={raiz} nivel={0} arquivos={arquivos} aberto={aberto} aoAbrir={aoAbrir}
                    fechadas={fechadas} aoAlternar={alternarPasta} t={t} />
                </div>
                <Visor caminho={aberto === SAIDA ? null : aberto} conteudo={arquivos[aberto]}
                  aoResponder={aoResponder} t={t} />
              </>
            )}
          </div>
        )}
      </section>
    </>
  )
}

export default GavetaCodigo
