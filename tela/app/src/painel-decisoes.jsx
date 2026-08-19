import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Badge, Button, Callout, Tabs } from '@refy/ui'
import { Ajuda } from './gaveta-ajuda.jsx'
import { PainelCelula } from './painel-celula.jsx'
import { useT } from './i18n.jsx'
import './painel-decisoes.css'

/* O trilho direito: o inspetor.

   Três abas, porque três perguntas diferentes chegam aqui e misturá-las num
   scroll só era ilegível:

   - Peça: a ficha da peça escolhida no canvas, editável.
   - Decisões: o que o tradutor resolveu sozinho, com a razão de cada decisão.
   - Ligações: as dependências e ligações que as setas geraram.

   Escolher uma peça no canvas abre a aba Peça sozinha. O trilho inteiro
   recolhe pelo puxador da borda esquerda.

   Contrato: { unidades, relacoes, aoResponder, aoSelecionar, recolhido,
   aoRecolher, aoAjuda } mais a ficha { no, unidade, campos, aoMudar,
   validacao, aoLigar } que a aba Peça repassa ao PainelCelula. */

export const GUARDA_RECOLHIDO = 'bioma.decisoes.recolhido'

function leGuardado() {
  try { return window.localStorage.getItem(GUARDA_RECOLHIDO) === '1' } catch { return false }
}

function guarda(v) {
  try { window.localStorage.setItem(GUARDA_RECOLHIDO, v ? '1' : '0') } catch { /* sem storage, o trilho segue */ }
}

/* minúsculo e sem acento, para casar 'estável' com 'estavel' */
function chave(s) {
  return String(s || '').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

/* Fronteira e tubo são passagem entre duas partes, sem estado próprio para
   guardar, e a tela chama isso de ligação. O resto se classifica pelo tecido. */
const NATUREZAS = ['organismo', 'molecula', 'ligacao', 'fronteira', 'tubo', 'artefato']

function etiquetaDe(u) {
  const tipo = chave(u.tipo)
  if (tipo === 'fronteira' || tipo === 'ligacao' || tipo === 'tubo') {
    return { chave: 'ligacao', classe: 'tubo', verbete: 'ligacao' }
  }
  /* Artefato é entregue à esteira, e não aplicado pelo comando: ele não tem
     tecido, porque não vive no live. Sem esta linha ele aparecia sem rótulo. */
  if (tipo === 'artefato') {
    return { chave: 'artefato', classe: 'artefato', verbete: 'artefato' }
  }
  const d = chave(u.durabilidade)
  if (d === 'permanente') return { chave: 'permanente', classe: 'permanente', verbete: 'tecido' }
  if (d === 'estavel') return { chave: 'estavel', classe: 'estavel', verbete: 'tecido' }
  if (d === 'efemera') return { chave: 'efemera', classe: 'efemera', verbete: 'tecido' }
  /* Natureza que a tela não conhece aparece dizendo isso, em vez de sumir sem
     rótulo e passar por peça comum. */
  if (tipo && !NATUREZAS.includes(tipo)) {
    return { chave: 'desconhecida', classe: 'desconhecida', verbete: null }
  }
  return null
}

function recursoDe(u) {
  return u.recurso || u.tipo_recurso || u.tipo_aws || u.servico || u.nome || ''
}

function pendenciasDe(u) {
  const bruto = u.pendencias || u.perguntas || u.pendentes || []
  return (Array.isArray(bruto) ? bruto : [])
    .map(p => (typeof p === 'string'
      ? { campo: p }
      : {
        campo: p.campo || p.nome || p.arg || p.chave,
        pergunta: p.pergunta || p.explica,
        aceito: p.aceito || p.aceita || p.formato,
        exemplo: p.exemplo,
      }))
    .filter(p => p.campo)
}

function travessia(r) {
  const v = chave(r.vira)
  return v.startsWith('ligacao') || v.startsWith('fronteira') || v.startsWith('dependencia')
}

function Seta({ classe }) {
  return (
    <svg className={'pd-chevron ' + classe} viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
      <path d="M4 2.5 L8 6 L4 9.5" fill="none" stroke="currentColor"
        strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Unidade({ unidade, aoResponder, aoSelecionar, aoAjuda, t }) {
  const etiqueta = etiquetaDe(unidade)
  const pendencias = pendenciasDe(unidade)
  const razoes = [
    { rotulo: t('trilho.rotulo.tipo'), texto: unidade.por_que_esse_tipo },
    { rotulo: t('trilho.rotulo.tecido'), texto: unidade.por_que_durabilidade },
    { rotulo: t('trilho.rotulo.onde'), texto: unidade.por_que_conta || unidade.por_que_trilho },
  ].filter(r => r.texto)
  const recurso = recursoDe(unidade)
  const onde = [unidade.conta, unidade.celulas].filter(Boolean).join(' · ')

  return (
    <article className={'pd-cartao' + (pendencias.length ? ' esperando' : '')}>
      <button type="button" className="pd-cabeca"
        onClick={() => aoSelecionar && aoSelecionar(unidade)}
        title={t('trilho.abrirFicha')}>
        <img className="pd-icone" alt=""
          src={'/icone?tipo=' + encodeURIComponent(recurso)} />
        <span className="pd-nomes">
          <code className="pd-recurso">{recurso}</code>
          {unidade.nome && <span className="pd-nome">{unidade.nome}</span>}
        </span>
      </button>

      {etiqueta && (
        <p className="pd-etiqueta">
          <span className={'pd-tecido ' + etiqueta.classe}>
            <i />
            {etiqueta.verbete
                ? <Ajuda verbete={etiqueta.verbete} aoAbrir={aoAjuda}>{t('trilho.etiqueta.' + etiqueta.chave)}</Ajuda>
                : t('trilho.etiqueta.' + etiqueta.chave)}
          </span>
        </p>
      )}

      {onde && <p className="pd-onde">{onde}</p>}
      {unidade.papel && <p className="pd-papel">{unidade.papel}</p>}

      {razoes.length > 0 && (
        <div className="pd-porque">
          <span className="pd-rotulo">{t('trilho.porque')}</span>
          {razoes.map(r => (
            <p key={r.rotulo}><b>{r.rotulo}</b> {r.texto}</p>
          ))}
        </div>
      )}

      {unidade.confirmar && (
        <p className="pd-confirmar">{t('trilho.confirmar')} · {unidade.confirmar}</p>
      )}

      {pendencias.map((p, i) => (
        <Callout key={p.campo + '-' + i} tone="warn" className="pd-aviso"
          title={<span className="pd-aviso-titulo">
            <code>{p.campo}</code> {t('trilho.espera')}
          </span>}>
          {p.pergunta && <p className="pd-pergunta">{p.pergunta}</p>}
          <dl className="pd-formato">
            {p.aceito && <><dt>{t('trilho.aceito')}</dt><dd><code>{p.aceito}</code></dd></>}
            {p.exemplo && <><dt>{t('trilho.exemplo')}</dt><dd><code>{p.exemplo}</code></dd></>}
          </dl>
          <div className="pd-acao">
            <Button size="sm" variant="secondary"
              onClick={() => aoResponder && aoResponder(unidade, p.campo)}>{t('trilho.responder')}</Button>
          </div>
        </Callout>
      ))}
    </article>
  )
}

export function PainelDecisoes({
  unidades, relacoes, aoResponder, aoSelecionar, recolhido, aoRecolher, aoAjuda,
  no = null, unidade = null, campos = [], aoMudar, aoLigar, validacao = {},
  contas = [], aoCadastrarConta, aoMudarPapel, aoExcluir,
  gerando = false,
}) {
  const { t } = useT()
  const lista = unidades || []
  const ligacoes = relacoes || []
  const [proprio, setProprio] = useState(leGuardado)
  const [aba, setAba] = useState('decisoes')

  const controlado = recolhido !== undefined
  const fechado = controlado ? !!recolhido : proprio

  const avisou = useRef(false)
  useEffect(() => {
    if (avisou.current) return
    avisou.current = true
    if (controlado && aoRecolher && !!recolhido !== proprio) aoRecolher(proprio)
  }, [controlado, aoRecolher, recolhido, proprio])

  /* Escolher uma peça no canvas traz a aba dela; desselecionar volta para as
     decisões. A pessoa ainda troca de aba à vontade depois. */
  const idAnterior = useRef(null)
  useEffect(() => {
    const id = no?.id || null
    if (id === idAnterior.current) return
    idAnterior.current = id
    setAba(id ? 'peca' : 'decisoes')
  }, [no])

  function alternar() {
    const novo = !fechado
    setProprio(novo)
    guarda(novo)
    if (aoRecolher) aoRecolher(novo)
  }

  const esperando = useMemo(
    () => lista.reduce((n, u) => n + pendenciasDe(u).length, 0), [lista])

  const puxador = (
    <button type="button"
      className={'pd-puxador' + (fechado ? ' fechado' : '')}
      aria-expanded={!fechado}
      title={fechado ? t('trilho.abrir') : t('trilho.fechar')}
      aria-label={fechado ? t('trilho.abrir') : t('trilho.fechar')}
      onClick={alternar}>
      <Seta classe={fechado ? 'para-esquerda' : 'para-direita'} />
      {fechado && <span className="pd-vertical">{t('trilho.titulo')}</span>}
      {fechado && esperando > 0 && (
        <span className="pd-marca" title={t('trilho.porResponder', { n: esperando })}>{esperando}</span>
      )}
    </button>
  )

  if (fechado) {
    return (
      <section className="painel-decisoes recolhido" aria-label={t('trilho.titulo')}>
        {puxador}
      </section>
    )
  }

  const itens = [
    { id: 'peca', label: t('trilho.aba.peca') },
    { id: 'decisoes', label: t('trilho.aba.decisoes'), badge: esperando || undefined },
    { id: 'ligacoes', label: t('trilho.aba.ligacoes'), badge: ligacoes.length || undefined },
  ]

  return (
    <section className="painel-decisoes" aria-label={t('trilho.titulo')}>
      {puxador}

      <header className="pd-topo">
        <div className="pd-topo-linha">
          <h2 className="pd-titulo">
            <Ajuda verbete="decisao" aoAbrir={aoAjuda}>{t('trilho.titulo')}</Ajuda>
          </h2>
          {esperando > 0 && <Badge tone="warn" dot>{t('trilho.porResponder', { n: esperando })}</Badge>}
        </div>
        <Tabs variant="underline" size="sm" items={itens} value={aba}
          onChange={setAba} className="pd-abas" />
      </header>

      {aba === 'peca' && (
        <div className="pd-corpo pd-corpo-ficha">
          {no ? (
            <PainelCelula no={no} unidade={unidade} campos={campos}
              aoMudar={aoMudar} aoLigar={aoLigar} validacao={validacao} contas={contas}
              aoCadastrarConta={aoCadastrarConta} aoMudarPapel={aoMudarPapel}
              aoExcluir={aoExcluir} />
          ) : (
            <p className="pd-nada">{t('trilho.peca.vazia')}</p>
          )}
        </div>
      )}

      {aba === 'decisoes' && (
        <div className="pd-corpo">
          <p className="pd-abertura">{t('trilho.abertura')}</p>
          {gerando && lista.length === 0 ? (
            <>
              <div className="pd-esqueleto" />
              <div className="pd-esqueleto" />
              <div className="pd-esqueleto" />
            </>
          ) : lista.length === 0 ? (
            <p className="pd-nada">{t('trilho.nada')}</p>
          ) : lista.map((u, i) => (
            <Unidade key={u.nome || u.servico || i} unidade={u} t={t}
              aoResponder={aoResponder} aoSelecionar={aoSelecionar} aoAjuda={aoAjuda} />
          ))}
        </div>
      )}

      {aba === 'ligacoes' && (
        <div className="pd-corpo">
          <ul className="pd-relacoes">
            {ligacoes.length === 0 && (
              <li className="pd-relacao vazia">{t('trilho.ligacoes.vazio')}</li>
            )}
            {ligacoes.map((r, i) => (
              <li key={i} className="pd-relacao">
                <span className={'pd-vira' + (travessia(r) ? ' travessia' : '')}>
                  {r.vira || 'aresta'}
                </span>
                <span className="pd-pontas">
                  <code>{r.origem}</code> → <code>{r.destino}</code>
                </span>
                {r.por_que && <span className="pd-motivo">{r.por_que}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export default PainelDecisoes
