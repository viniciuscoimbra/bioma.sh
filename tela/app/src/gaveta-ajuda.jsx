import React, { useLayoutEffect, useRef, useState } from 'react'
import { Drawer, Tabs, Tooltip } from '@refy/ui'
import { CATEGORIAS, todos, verbete as verbeteDe } from './verbetes.js'
import { FAQ } from './ajuda-faq.js'
import { useT } from './i18n.jsx'
import './gaveta-ajuda.css'

/* Duas peças que andam juntas.

   `Ajuda` marca um termo do bioma no meio do texto. O mouse em cima abre o
   tooltip com a frase de definição; o link ao lado abre a gaveta no verbete.

   `GavetaAjuda` tem duas abas: o FAQ, em árvore de categorias com perguntas e
   respostas, e o glossário, com os verbetes agrupados por categoria. Cada
   verbete é um artigo curto que termina numa ação concreta (`aoAcao(id)`).
   Quem compõe manda `aberta` e `verbete` e recebe `aoFechar` e `aoAcao`. */

function comCodigo(texto, chaveBase) {
  return String(texto).split('`').map((parte, i) =>
    i % 2 === 1
      ? <code key={`${chaveBase}-${i}`} className="ga-inline">{parte}</code>
      : <React.Fragment key={`${chaveBase}-${i}`}>{parte}</React.Fragment>
  )
}

/* ── o termo explicado, no meio do texto ──────────────────────────────── */

export function Ajuda({ verbete, aoAbrir, children }) {
  const { lingua, t } = useT()
  const dado = verbeteDe(verbete, lingua)
  if (!dado) return <>{children}</>

  return (
    <Tooltip label={dado.titulo} description={dado.frase} side="top" portalled className="ajuda">
      <span className="aj-alvo">
        <span className="aj-termo">{children}</span>
        <button
          type="button"
          className="aj-entenda"
          onClick={() => aoAbrir && aoAbrir(verbete)}
          aria-label={`${t('comum.entenda')} · ${dado.titulo}`}
        >
          {t('comum.entenda')}
        </button>
      </span>
    </Tooltip>
  )
}

/* ── a pergunta do FAQ, aberta e fechada no clique ────────────────────── */

function Pergunta({ pergunta, lingua, t, aoAcao, aoVerbete }) {
  const [aberta, setAberta] = useState(false)
  const texto = pergunta[lingua] || pergunta.en
  const acaoVerbete = pergunta.verbete ? verbeteDe(pergunta.verbete, lingua) : null

  return (
    <div className={'ga-pergunta' + (aberta ? ' aberta' : '')}>
      <button type="button" className="ga-pergunta-q" aria-expanded={aberta}
        onClick={() => setAberta(v => !v)}>
        <span className="ga-seta" aria-hidden>{aberta ? '▾' : '▸'}</span>
        {texto.q}
      </button>
      {aberta && (
        <div className="ga-pergunta-a">
          <p>{comCodigo(texto.a, pergunta.chave)}</p>
          <div className="ga-acoes">
            {pergunta.acao && aoAcao && (
              <button type="button" className="ga-acao"
                onClick={() => aoAcao(pergunta.acao)}>
                {rotuloDaAcao(pergunta.acao, lingua)}
              </button>
            )}
            {acaoVerbete && (
              <button type="button" className="ga-acao ga-acao-suave"
                onClick={() => aoVerbete(pergunta.verbete)}>
                {t('ga.saibaMais')}: {acaoVerbete.titulo}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* Rótulo das ações do FAQ que não vêm de verbete. */
const ACOES = {
  abrirDesenho: { en: 'Open a drawing', pt: 'Abrir um desenho' },
  abrirPaleta: { en: 'Open the palette (cmd+K)', pt: 'Abrir a paleta (cmd+K)' },
  abrirExemplo: { en: 'Open the example', pt: 'Abrir o exemplo' },
  abrirConfig: { en: 'Open Settings', pt: 'Abrir Configurações' },
  verCodigo: { en: 'Open the code drawer', pt: 'Abrir a gaveta do código' },
  verPendencias: { en: 'Open the questions', pt: 'Abrir as pendências' },
  verDecisoes: { en: 'Open the Decisions tab', pt: 'Abrir a aba Decisões' },
  verLigacoes: { en: 'Open the Connections tab', pt: 'Abrir a aba Ligações' },
  simular: { en: 'Simulate now — nothing changes', pt: 'Simular agora — nada muda' },
  copiarComando: { en: 'Copy the current command', pt: 'Copiar o comando atual' },
}

function rotuloDaAcao(id, lingua) {
  const a = ACOES[id]
  return a ? (a[lingua] || a.en) : id
}

/* ── a gaveta ─────────────────────────────────────────────────────────── */

export function GavetaAjuda({ aberta, verbete, aoFechar, aoAcao }) {
  const { lingua, t } = useT()
  const alvos = useRef({})
  const corpo = useRef(null)
  const [aba, setAba] = useState('faq')
  const [foco, setFoco] = useState(null)

  const lista = todos(lingua)

  /* Verbete pedido abre a aba do glossário e rola até ele. Sem verbete, o
     FAQ abre no começo. */
  useLayoutEffect(() => {
    if (!aberta) return
    if (!verbeteDe(verbete, lingua)) {
      setFoco(null)
      return
    }
    setAba('glossario')
    setFoco(verbete)
    requestAnimationFrame(() => rolarAte(verbete))
  }, [aberta, verbete, lingua])

  function rolarAte(chave) {
    const alvo = alvos.current[chave]
    const caixa = corpo.current && corpo.current.parentElement
    if (!alvo || !caixa) return
    caixa.scrollTop += alvo.getBoundingClientRect().top - caixa.getBoundingClientRect().top - 8
  }

  const irAoVerbete = (chave) => {
    setAba('glossario')
    setFoco(chave)
    requestAnimationFrame(() => rolarAte(chave))
  }

  const agir = (id) => {
    if (!aoAcao) return
    aoFechar && aoFechar()
    requestAnimationFrame(() => requestAnimationFrame(() => aoAcao(id)))
  }

  return (
    <Drawer
      open={!!aberta}
      onOpenChange={(v) => { if (!v && aoFechar) aoFechar() }}
      side="right"
      width={520}
      title={t('ga.titulo')}
      className="gaveta-ajuda"
    >
      <div className="ga-corpo" ref={corpo}>
        <Tabs variant="underline" size="sm" className="ga-abas"
          items={[
            { id: 'faq', label: t('ga.aba.faq') },
            { id: 'glossario', label: t('ga.aba.glossario') },
          ]}
          value={aba} onChange={setAba} />

        {aba === 'faq' && (
          <>
            <p className="ga-abertura">{t('ga.abertura.faq')}</p>
            {FAQ.map(cat => (
              <section key={cat.chave} className="ga-categoria">
                <h3 className="ga-cat-titulo">{cat[lingua] || cat.en}</h3>
                {cat.perguntas.map(p => (
                  <Pergunta key={p.chave} pergunta={p} lingua={lingua} t={t}
                    aoAcao={agir} aoVerbete={irAoVerbete} />
                ))}
              </section>
            ))}
          </>
        )}

        {aba === 'glossario' && (
          <>
            <p className="ga-abertura">{t('ga.abertura.glossario')}</p>
            {CATEGORIAS.map(cat => {
              const doGrupo = lista.filter(v => v.categoria === cat.chave)
              if (!doGrupo.length) return null
              return (
                <section key={cat.chave} className="ga-categoria">
                  <h3 className="ga-cat-titulo">{cat[lingua] || cat.en}</h3>
                  {doGrupo.map(v => (
                    <section
                      key={v.chave}
                      className={`ga-verbete${foco === v.chave ? ' ga-foco' : ''}`}
                      ref={(el) => { alvos.current[v.chave] = el }}
                      aria-labelledby={`ga-titulo-${v.chave}`}
                    >
                      <h4 className="ga-titulo" id={`ga-titulo-${v.chave}`}>{v.titulo}</h4>
                      <p className="ga-frase">{v.frase}</p>
                      {v.paragrafos.map((p, i) => (
                        <p className="ga-texto" key={i}>{comCodigo(p, `${v.chave}-p${i}`)}</p>
                      ))}
                      <div className="ga-exemplo">
                        <span className="ga-rotulo">{t('ga.exemplo')}</span>
                        <p className="ga-texto">{comCodigo(v.exemplo.texto, `${v.chave}-ex`)}</p>
                        <code className="ga-codigo">{v.exemplo.codigo}</code>
                      </div>
                      {v.acao && aoAcao && (
                        <button type="button" className="ga-acao"
                          onClick={() => agir(v.acao.id)}>
                          {v.acao[lingua] || v.acao.en}
                        </button>
                      )}
                    </section>
                  ))}
                </section>
              )
            })}
          </>
        )}
      </div>
    </Drawer>
  )
}

export default GavetaAjuda
