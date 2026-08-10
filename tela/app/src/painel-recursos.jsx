import React, { useEffect, useRef, useState } from 'react'
import { Badge, Kbd } from '@refy/ui'
import { ROTULO_ZONA, servicoDoTipo } from './partes.jsx'
import { useT } from './i18n.jsx'
import './painel-recursos.css'

/* O trilho dos elementos já usados no desenho.

   Contrato: { nos, escolhido, aoEscolher, recolhido, aoRecolher, aoAbrirPaleta }.

   ATENÇÃO A QUEM COMPÕE: `aoEscolher` mudou de significado. Antes recebia o
   tipo do recurso e criava a peça; agora recebe o `id` de uma peça que já
   está no desenho e a seleciona no canvas. Quem quer criar peça chama a
   paleta por `aoAbrirPaleta`.

   A lista dos 1687 recursos da AWS saiu daqui e virou a paleta do cmd+K. Este
   painel mostra uma linha por peça: ícone oficial, nome e a área onde ela
   mora. Aberto tem 232px; recolhido tem 44px e mostra só os ícones. O estado
   do recolhimento guarda em localStorage.

   `recolhido` e `aoRecolher` são opcionais. Sem eles, o painel guarda o
   estado sozinho e avisa a composição na montagem, para a coluna nascer com
   a largura certa. */

const GUARDA = 'bioma.trilho.recolhido'

function leRecolhido() {
  try { return window.localStorage.getItem(GUARDA) === '1' }
  catch { return false }
}

function gravaRecolhido(valor) {
  try { window.localStorage.setItem(GUARDA, valor ? '1' : '0') }
  catch { /* navegador sem armazenamento: o trilho nasce aberto todo dia */ }
}

/* O mesmo nome que o canvas escreve no nó, para o clique aqui bater com o que
   a pessoa vê lá. O nó só guarda o serviço com espaço (`s3 bucket`); no canvas
   quem manda é o nome da unidade, que vem com hífen (`s3-bucket`). Sem a troca
   do espaço pelo hífen, o trilho e o canvas escrevem a mesma peça de dois
   jeitos, lado a lado. */
function nomeDoNo(n) {
  if (n.valores?.nome) return n.valores.nome
  const base = n.servico || servicoDoTipo(n.tipo) || n.tipo || ''
  return String(base).trim().replace(/\s+/g, '-') || 'sem nome'
}

/* A área é a zona declarada na peça. `conta` nasce vazia e não serve de
   rótulo. */
function areaDoNo(n) {
  const zona = n.zona || n.area || ''
  return ROTULO_ZONA[zona] || zona
}

function Chevron({ recolhido }) {
  return (
    <svg className={'pr-chevron' + (recolhido ? ' virado' : '')} viewBox="0 0 12 12"
      width="12" height="12" aria-hidden="true" focusable="false">
      <path d="M7.5 2.5 L4 6 L7.5 9.5" fill="none" stroke="currentColor"
        strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Linha({ no, escolhido, recolhido, aoEscolher, alvo }) {
  const nome = nomeDoNo(no)
  const area = areaDoNo(no)
  const titulo = area ? `${nome} · ${area}` : nome
  return (
    <button type="button" title={titulo} ref={escolhido ? alvo : null}
      className={'pr-linha' + (escolhido ? ' pr-linha--escolhida' : '')}
      aria-current={escolhido ? 'true' : undefined}
      onClick={() => aoEscolher && aoEscolher(no.id)}>
      <img className="pr-icone" alt="" width="18" height="18"
        loading="lazy" decoding="async"
        src={'/icone?tipo=' + encodeURIComponent(no.tipo || no.servico || '')} />
      {!recolhido && (
        <span className="pr-texto">
          <span className="pr-nome">{nome}</span>
          <span className="pr-area">{area || 'sem área'}</span>
        </span>
      )}
    </button>
  )
}

export function PainelRecursos({
  nos, escolhido, aoEscolher, recolhido, aoRecolher, aoAbrirPaleta,
}) {
  const { t } = useT()
  const lista = Array.isArray(nos) ? nos : []

  /* Controlado quando a composição manda `recolhido`. Sem isso, o painel
     manda em si mesmo, a partir do que ficou guardado. */
  const [interno, setInterno] = useState(leRecolhido)
  const fechado = typeof recolhido === 'boolean' ? recolhido : interno

  /* Na montagem, a composição recebe o valor guardado na visita anterior e
     ajusta a coluna no mesmo quadro. Sem este aviso, um trilho de 44px
     acordaria dentro de uma coluna de 232px. Vale também quando a composição
     controla o recolhimento: ela nasce com o padrão dela e só aqui fica
     sabendo o que a pessoa escolheu da última vez. */
  useEffect(() => {
    if (!aoRecolher) return
    const guardado = leRecolhido()
    if (typeof recolhido === 'boolean' && guardado === recolhido) return
    aoRecolher(guardado)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Grava só no clique. Gravar por efeito escreveria o estado inicial da
     composição por cima do que a pessoa escolheu na visita anterior. */
  const alterna = () => {
    const proximo = !fechado
    setInterno(proximo)
    gravaRecolhido(proximo)
    if (aoRecolher) aoRecolher(proximo)
  }

  const rotuloAlterna = fechado ? t('pr.abrir') : t('pr.fechar')

  /* A peça escolhida no canvas aparece no trilho sem a pessoa procurar. */
  const alvo = useRef(null)
  useEffect(() => {
    if (alvo.current) alvo.current.scrollIntoView({ block: 'nearest' })
  }, [escolhido])

  return (
    <aside className={'pr' + (fechado ? ' pr--recolhido' : '')}
      aria-label={t('pr.titulo')}>
      <div className="pr-topo">
        {!fechado && (
          <div className="pr-cabeca">
            <span className="pr-rotulo">{t('pr.titulo')}</span>
            {lista.length > 0 && <Badge tone="success">{lista.length}</Badge>}
          </div>
        )}
        <button type="button" className="pr-alterna" title={rotuloAlterna}
          aria-label={rotuloAlterna} aria-expanded={!fechado}
          onClick={alterna}>
          <Chevron recolhido={fechado} />
        </button>
      </div>

      <div className="pr-lista">
        {lista.map(n => (
          <Linha key={n.id} no={n} recolhido={fechado} alvo={alvo}
            escolhido={escolhido === n.id} aoEscolher={aoEscolher} />
        ))}

        {!lista.length && !fechado && (
          <p className="pr-vazio">{t('pr.vazio')}</p>
        )}
      </div>

      <div className="pr-pe">
        <button type="button" className="pr-buscar"
          title={t('pr.buscar') + ' (cmd+K)'}
          aria-label={t('pr.buscar')}
          onClick={() => aoAbrirPaleta && aoAbrirPaleta()}>
          <span className="pr-mais" aria-hidden="true">+</span>
          {!fechado && (
            <>
              <span className="pr-buscar-texto">{t('pr.buscar')}</span>
              <Kbd>⌘K</Kbd>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}

export default PainelRecursos
