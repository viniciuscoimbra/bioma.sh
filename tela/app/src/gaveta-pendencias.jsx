import React, { useMemo, useState } from 'react'
import { Badge, Button, Drawer, EmptyState, Input } from '@refy/ui'
import { useT } from './i18n.jsx'
import './gaveta-pendencias.css'

/* A gaveta de pendências: o relatório do que ainda espera resposta, com o
   lugar de responder ali mesmo.

   Cada linha carrega os fatos de uma vez, sem clique para abrir: qual célula,
   qual campo, o que se aceita, um exemplo certo e o que acontece se ficar como
   está. Embaixo, o campo de resposta: valida a cada tecla e o Aplicar grava na
   peça. Quem prefere o contexto inteiro abre a peça pelo botão ao lado.

   Pendência de verificação (sem campo de ficha) não tem input: só o motivo e
   o caminho de volta.

   Contrato: { aberta, pendencias, aoCorrigir(celula, campo),
   aoResponderValor(pendencia, valor), aoFechar }. */

function texto(v) {
  return typeof v === 'string' ? v.trim() : v == null ? '' : String(v).trim()
}

function normalizar(bruto) {
  return (Array.isArray(bruto) ? bruto : [])
    .map(p => (p && typeof p === 'object' ? p : {}))
    .map(p => ({
      id: p.id || '',
      celula: texto(p.celula),
      campo: texto(p.campo),
      pergunta: texto(p.pergunta),
      exemplo: texto(p.exemplo),
      formato: texto(p.formato),
      regex: texto(p.regex),
      consequencia: texto(p.consequencia),
      // achado do diagnóstico não se responde digitando: normalizar sem este
      // campo fazia a gaveta oferecer um input para "responder" que a peça
      // está solta
      somenteLeitura: Boolean(p.somenteLeitura),
      nivel: texto(p.nivel),
    }))
    .filter(p => p.campo || p.celula)
}

function compilar(formato) {
  if (!formato) return null
  try { return new RegExp(formato) } catch { return null }
}

const Alerta = () => (
  <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
    <path d="M10 2.6 18.6 17H1.4L10 2.6Z" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M10 7.6v4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="10" cy="14.4" r="1" fill="currentColor" />
  </svg>
)

const Feito = () => (
  <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
    <circle cx="10" cy="10" r="8.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <path d="M6.4 10.3 9 12.8l4.6-5" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function Pendencia({ pendencia, ordem, aoCorrigir, aoResponderValor, t }) {
  const { id, celula, campo, pergunta, exemplo, formato, regex, consequencia } = pendencia
  const [valor, setValor] = useState('')
  const regra = useMemo(() => compilar(regex), [regex])
  /* Achado do diagnóstico não se responde digitando: ele se resolve mexendo no
     desenho. Oferecer campo de resposta ali convida a pessoa a "responder" que
     a peça está solta, o que não quer dizer nada. */
  const respondivel = Boolean(id && campo && aoResponderValor && !pendencia.somenteLeitura)
  const valido = valor.trim() && (!regra || regra.test(valor.trim()))

  const aplicar = () => {
    if (!valido) return
    aoResponderValor(pendencia, valor.trim())
  }

  return (
    <li className="gp-item">
      <div className="gp-cabeca">
        <span className="gp-ordem" aria-hidden="true">{ordem}</span>
        <span className="gp-quem">
          <span className="gp-celula">{celula || t('gp.celulaSemNome')}</span>
          <code className="gp-campo">{campo || t('gp.campoSemNome')}</code>
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="gp-corrigir"
          onClick={() => aoCorrigir(celula, campo)}
        >
          {t('gp.abrirNaPeca')}
        </Button>
      </div>

      {pergunta && <p className="gp-pergunta">{pergunta}</p>}

      {(formato || exemplo) && (
        <dl className="gp-ficha">
          {formato && (
            <>
              <dt>{t('gp.aceita')}</dt>
              <dd><code>{formato}</code></dd>
            </>
          )}
          {exemplo && (
            <>
              <dt>{t('gp.exemplo')}</dt>
              <dd><code>{exemplo}</code></dd>
            </>
          )}
        </dl>
      )}

      {respondivel && (
        <div className="gp-resposta">
          <Input
            className="gp-resposta-campo"
            value={valor}
            placeholder={exemplo || t('gp.placeholder')}
            spellCheck={false}
            autoComplete="off"
            onChange={e => setValor(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') aplicar() }}
          />
          <Button size="sm" disabled={!valido} onClick={aplicar}>{t('gp.aplicar')}</Button>
        </div>
      )}
      {respondivel && valor.trim() && !valido && (
        <p className="gp-recusa">{t('gp.foraFormato')}</p>
      )}

      {consequencia && (
        <p className="gp-consequencia">
          <span className="gp-rotulo">{t('gp.seFicar')}</span>
          {consequencia}
        </p>
      )}
    </li>
  )
}

export function GavetaPendencias({ aberta, pendencias, aoCorrigir, aoResponderValor, aoFechar }) {
  const { t } = useT()
  const lista = useMemo(() => normalizar(pendencias), [pendencias])

  const celulas = useMemo(
    () => new Set(lista.map(p => p.celula).filter(Boolean)).size, [lista])

  const fechar = () => { if (aoFechar) aoFechar() }

  /* Abrir na peça sai da frente e manda o foco para o campo, nesta ordem.
     A gaveta devolve o foco ao botão que a abriu quando fecha; o corrigir
     espera dois quadros para o foco parar onde ele mandou. */
  const corrigir = (celula, campo) => {
    fechar()
    if (!aoCorrigir) return
    requestAnimationFrame(() => requestAnimationFrame(() => aoCorrigir(celula, campo)))
  }

  /* Duas coisas viajam nesta lista e não são a mesma: campo esperando resposta,
     que alguém preenche aqui, e achado de revisão, que se resolve mudando o
     desenho. Somá-los no título fazia a gaveta anunciar seiscentas perguntas
     onde havia quarenta campos vazios e quinhentos avisos de peça solta. */
  const aResponder = lista.filter(p => !p.somenteLeitura)
  const aRevisar = lista.filter(p => p.somenteLeitura)
  const resumo = (aResponder.length === 1 ? t('gp.resumo.um') : t('gp.resumo.varios', { n: aResponder.length }))
    + (celulas > 0 ? ', ' + t('gp.resumo.celulas', { c: celulas }) : '')
    + (aRevisar.length > 0 ? ' · ' + t('gp.resumo.revisao', { n: aRevisar.length }) : '')

  return (
    <Drawer
      open={Boolean(aberta)}
      onOpenChange={aberto => { if (!aberto) fechar() }}
      side="right"
      width={480}
      className="gaveta-pendencias"
      title={
        <span className="gp-titulo">
          {t('gp.titulo')}
          {aResponder.length > 0 && <Badge tone="warn" dot>{aResponder.length}</Badge>}
          {aRevisar.length > 0 && <Badge tone="info">{aRevisar.length}</Badge>}
        </span>
      }
    >
      {lista.length === 0 && (
        <EmptyState
          icon={<span className="gp-feito"><Feito /></span>}
          title={t('gp.vazio.titulo')}
          message={t('gp.vazio.corpo')}
          action={<Button size="sm" variant="secondary" onClick={fechar}>{t('gp.voltar')}</Button>}
        />
      )}

      {lista.length > 0 && (
        <>
          <div className="gp-resumo">
            <span className="gp-resumo-marca" aria-hidden="true"><Alerta /></span>
            <div className="gp-resumo-texto">
              <p className="gp-resumo-conta">{resumo}</p>
              <p className="gp-resumo-efeito">{t('gp.efeito')}</p>
            </div>
          </div>

          <ul className="gp-lista">
            {lista.map((p, i) => (
              <Pendencia
                key={p.id + '·' + p.campo + '·' + i}
                pendencia={p}
                ordem={i + 1}
                aoCorrigir={corrigir}
                aoResponderValor={aoResponderValor}
                t={t}
              />
            ))}
          </ul>
        </>
      )}
    </Drawer>
  )
}

export default GavetaPendencias
