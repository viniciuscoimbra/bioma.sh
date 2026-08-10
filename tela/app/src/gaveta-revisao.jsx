import React from 'react'
import { Badge, Button, Drawer, EmptyState } from '@refy/ui'
import { useT } from './i18n.jsx'
import './gaveta-revisao.css'

/* O parecer sobre a infraestrutura gerada.

   Três fontes na mesma lista, cada item dizendo de onde veio: os verificadores
   do bioma, o terraform (que compila e não opina) e um revisor AWS sênior. O
   item traz o estado, onde, por que, e os passos do conserto quando falha.

   Contrato: { aberta, revisao, ocupado, aoRevisar, aoFechar }. */

const ORDEM = { falha: 0, risco: 1, ok: 2 }

export function GavetaRevisao({ aberta, revisao, ocupado, aoRevisar, aoFechar }) {
  const { t } = useT()
  const itens = [...(revisao?.itens || [])].sort(
    (a, b) => (ORDEM[a.estado] ?? 9) - (ORDEM[b.estado] ?? 9))
  const r = revisao?.resumo

  return (
    <Drawer
      open={Boolean(aberta)}
      onOpenChange={v => { if (!v) aoFechar() }}
      side="right"
      width={520}
      className="gaveta-revisao"
      title={
        <span className="gr-titulo">
          {t('rev.titulo')}
          {r && (
            <>
              {r.falha > 0 && <Badge tone="critical">{r.falha}</Badge>}
              {r.risco > 0 && <Badge tone="warn">{r.risco}</Badge>}
              {r.ok > 0 && <Badge tone="success">{r.ok}</Badge>}
            </>
          )}
        </span>
      }
    >
      <div className="gr-corpo">
        {ocupado && <p className="gr-rodando">{t('rev.rodando')}</p>}

        {!ocupado && !itens.length && (
          <EmptyState bordered={false}
            title={t('rev.titulo')} message={t('rev.vazio')}
            action={<Button size="sm" onClick={aoRevisar}>{t('rev.botao')}</Button>} />
        )}

        {revisao?.recado && <p className="gr-recado">{revisao.recado}</p>}

        {itens.map((i, n) => (
          <article key={n} className={'gr-item ' + i.estado}>
            <header className="gr-item-topo">
              <span className={'gr-marca ' + i.estado}>{t('rev.' + i.estado)}</span>
              <b>{i.titulo}</b>
            </header>
            {i.onde && <p className="gr-onde"><span>{t('rev.onde')}</span> <code>{i.onde}</code></p>}
            {i.porque && <p className="gr-porque">{i.porque}</p>}
            {i.conserto?.length > 0 && (
              <div className="gr-conserto">
                <span className="gr-rotulo">{t('rev.conserto')}</span>
                <ol>{i.conserto.map((p, j) => <li key={j}>{p}</li>)}</ol>
              </div>
            )}
            {i.fonte && <span className="gr-fonte">{i.fonte}</span>}
          </article>
        ))}

        {!ocupado && itens.length > 0 && (
          <Button variant="secondary" size="sm" className="gr-refazer"
            onClick={aoRevisar}>{t('rev.refazer')}</Button>
        )}
      </div>
    </Drawer>
  )
}

export default GavetaRevisao
