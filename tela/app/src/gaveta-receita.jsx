import React, { useState } from 'react'
import { Badge, Button, Drawer, Input } from '@refy/ui'
import { useT } from './i18n.jsx'
import './gaveta-receita.css'

/* A receita: os comandos que criam, atualizam e destroem a estrutura gerada.

   O bioma escreve; quem roda é o time, no pipeline dele, com a credencial
   dele. Esta gaveta existe para deixar isso explícito, e para que o comando
   saia daqui pronto para colar.

   A janela de mudança deixou de autorizar execução (não existe execução) e
   passa a ser o registro que acompanha a receita de destruir.

   Contrato: { aberta, comando, permanentes, aoFechar }. */

export function GavetaReceita({ aberta, comando = '', permanentes = [], aoFechar }) {
  const { t } = useT()
  const [janela, setJanela] = useState('')
  const [copiado, setCopiado] = useState('')

  const criar = comando
  const destruir = comando
    ? comando.replace('--area', '--destruir --area') + (janela.trim() ? `   # janela: ${janela.trim()}` : '')
    : ''

  const copia = (texto, qual) => {
    navigator.clipboard?.writeText(texto)
    setCopiado(qual)
    setTimeout(() => setCopiado(''), 1600)
  }

  return (
    <Drawer
      open={Boolean(aberta)}
      onOpenChange={v => { if (!v) aoFechar() }}
      side="right"
      width={560}
      className="gaveta-receita"
      title={t('receita.rotulo')}
    >
      <div className="gr2-corpo">
        <p className="gr2-desc">{t('receita.desc')}</p>

        <section className="gr2-bloco">
          <header>
            <h3>{t('receita.criar')}</h3>
            <Button size="sm" variant="ghost" onClick={() => copia(criar, 'criar')}>
              {copiado === 'criar' ? t('comum.copiado') : t('comum.copiar')}
            </Button>
          </header>
          <pre><code>{criar || '—'}</code></pre>
        </section>

        <section className="gr2-bloco">
          <header>
            <h3>{t('receita.destruir')}</h3>
            <Button size="sm" variant="ghost" onClick={() => copia(destruir, 'destruir')}>
              {copiado === 'destruir' ? t('comum.copiado') : t('comum.copiar')}
            </Button>
          </header>
          <Input block label={t('receita.janela')}
            placeholder="2026-08-10 22:00 a 23:30, chamado MUD-1042"
            value={janela} onChange={e => setJanela(e.target.value)} />
          <pre><code>{destruir || '—'}</code></pre>
          <p className="gr2-trava">
            {permanentes.length
              ? <Badge tone="critical">{t('receita.trava', { n: permanentes.length })}</Badge>
              : <Badge tone="neutral">{t('receita.travaNenhuma')}</Badge>}
            {permanentes.map(p => <code key={p}>{p}</code>)}
          </p>
        </section>
      </div>
    </Drawer>
  )
}

export default GavetaReceita
