import React, { useEffect, useState } from 'react'
import { Button } from '@refy/ui'
import { useT } from './i18n.jsx'
import './seletor-pasta.css'

/* O navegador de pastas como modal próprio.

   Ele existe porque salvar sem pasta declarada não pode terminar num recado:
   quem pediu para salvar quer salvar, então a escolha da pasta acontece ali
   mesmo e o salvamento segue. A mesma peça serve às configurações.

   Contrato: { aberto, inicial, aoEscolher(caminho), aoFechar }. */
export function SeletorPasta({ aberto, inicial = '', aoEscolher, aoFechar }) {
  const { t } = useT()
  const [lugar, setLugar] = useState(null)

  const navegar = async (caminho) => {
    const r = await fetch('/pastas?caminho=' + encodeURIComponent(caminho || ''))
    setLugar(await r.json())
  }

  useEffect(() => { if (aberto) navegar(inicial) }, [aberto, inicial])
  useEffect(() => {
    if (!aberto) return
    const esc = e => { if (e.key === 'Escape') aoFechar() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [aberto, aoFechar])

  if (!aberto) return null

  return (
    <div className="sp-fundo" onClick={aoFechar}>
      <div className="sp" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <header className="sp-topo">
          <h3>{t('pasta.titulo')}</h3>
          <button className="sp-fecha" onClick={aoFechar} aria-label={t('comum.fechar')}>×</button>
        </header>
        <p className="sp-corpo">{t('pasta.corpo')}</p>
        <code className="sp-aqui">{lugar?.caminho || '…'}</code>
        <div className="sp-lista">
          {lugar?.pai && (
            <button className="sp-item sp-acima" onClick={() => navegar(lugar.pai)}>
              {t('cfg.subir')}
            </button>
          )}
          {lugar && lugar.pastas.length === 0 && <p className="sp-nota">{t('cfg.semSub')}</p>}
          {(lugar?.pastas || []).map(f => (
            <button key={f.caminho} className="sp-item" onClick={() => navegar(f.caminho)}>
              {f.nome}/
            </button>
          ))}
        </div>
        <footer className="sp-pe">
          <Button variant="ghost" onClick={aoFechar}>{t('comum.cancelar')}</Button>
          <Button disabled={!lugar?.caminho}
            onClick={() => aoEscolher(lugar.caminho)}>{t('pasta.usar')}</Button>
        </footer>
      </div>
    </div>
  )
}

export default SeletorPasta
