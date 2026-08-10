import React, { useState } from 'react'
import { Badge, Button, Tooltip } from '@refy/ui'
import { useT } from './i18n.jsx'
import './barra-comando.css'

/* A barra de baixo, sempre visível.

   O comando aparece por inteiro, com o rótulo dizendo o que ele é. Cada botão
   que executa carrega o texto exato que vai rodar: o engenheiro que desconfia
   de gerador de código lê o comando antes de apertar, e o arquiteto que não
   escreve Terraform vê que nada acontece escondido.

   Duas gavetas nascem daqui: o código, que deixou de ocupar a tela, e as
   pendências, com a contagem no próprio botão.

   As verificações rodam como etapa do botão. Simular e aplicar conferem antes
   de tocar a nuvem e, quando alguma checagem bloqueia, mandam os motivos para
   `aoBloqueio`, que abre a gaveta de pendências.

   O que a barra NÃO faz: aplicar e destruir. O bioma para na estrutura
   validada, e a receita (os comandos que criam, atualizam e destroem) é
   entregue para o time rodar no pipeline dele. Simular fica, porque o plano
   não muda estado.

   Contrato: { comando, pendencias, ocupado, aoCopiar, aoProvar, aoReceita,
               aoVerCodigo, aoVerPendencias, aoBloqueio, aoPreVoo, aoAjuda,
               pasta }. */

function Traco({ d }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.4"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const CODIGO = 'M6.2 4.8 3 8l3.2 3.2 M9.8 4.8 13 8l-3.2 3.2'
const PENDENCIA = 'M8 2.8 14.4 13.6H1.6L8 2.8Z M8 6.9v3 M8 11.9h.01'


/* O comando de cada ação sai do mesmo texto base, com a bandeira que a ação
   acrescenta. Assim o que está escrito na barra e o que o botão dispara nunca
   divergem. */
function comAcao(base, bandeira) {
  if (!base) return ''
  return bandeira ? base + ' ' + bandeira : base
}

function quantidade(pendencias) {
  if (Array.isArray(pendencias)) return pendencias.length
  const n = Number(pendencias)
  return Number.isFinite(n) && n > 0 ? n : 0
}

/* O que veio das verificações vira lista de motivos, no formato que a gaveta
   de pendências lê. Resposta de outra rota passa direto e devolve lista vazia:
   só bloqueia quem falou de checagem. */
function motivosDo(resposta, t) {
  if (!resposta) return []
  if (Array.isArray(resposta)) return resposta.filter(Boolean)

  const temChecagens = Array.isArray(resposta.checagens)
  if (!temChecagens && resposta.bloqueio === undefined) return []

  const motivos = (temChecagens ? resposta.checagens : [])
    .filter(c => c && c.estado === 'bloqueado')
    .map(c => ({
      celula: t('barra.motivo.checagens'),
      campo: c.nome || t('barra.motivo.conferencia'),
      pergunta: c.detalhe || '',
      consequencia: t('barra.motivo.consequencia'),
    }))

  if (resposta.erro) {
    motivos.unshift({
      celula: t('barra.motivo.checagens'),
      campo: t('barra.motivo.arvore'),
      pergunta: resposta.erro,
      consequencia: t('barra.motivo.semArvore'),
    })
  }

  if (!motivos.length && resposta.bloqueio) {
    motivos.push({
      celula: t('barra.motivo.checagens'),
      campo: t('barra.motivo.conferencia'),
      pergunta: resposta.por_que || t('barra.motivo.bloqueada'),
      consequencia: t('barra.motivo.bloqueioDePe'),
    })
  }

  return motivos
}

export function BarraComando({
  comando = '', pendencias = 0,
  aoCopiar, aoProvar, aoReceita,
  aoVerCodigo, aoVerPendencias, aoBloqueio, aoPreVoo, aoCorrigir, aoAjuda,
  aoRevisar, revisando = false,
  pasta = '', ocupado = false,
}) {
  const { t } = useT()
  const [copiado, setCopiado] = useState(false)
  const [passo, setPasso] = useState('')
  const [etapa, setEtapa] = useState('')

  const quantas = quantidade(pendencias)
  const verPendencias = aoVerPendencias || aoCorrigir

  const copiar = () => {
    if (!comando) return
    navigator.clipboard?.writeText(comando)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1600)
    aoCopiar && aoCopiar(comando)
  }

  /* As verificações rodam contra a árvore, e quem tem a árvore é a composição.
     Ela entrega a conferência pronta em `aoPreVoo` ou o caminho da pasta, e a
     barra chama a rota. */
  const preVoo = async () => {
    if (typeof aoPreVoo === 'function') return aoPreVoo()
    if (!pasta) return null
    try {
      const r = await fetch('/pre-voo', { method: 'POST', body: JSON.stringify({ pasta }) })
      return await r.json()
    } catch (e) {
      return { checagens: [], bloqueio: true, por_que: t('barra.motivo.servidor', { erro: e.message }) }
    }
  }

  /* Confere primeiro, roda depois. O botão diz em qual das duas etapas está.
     Ação que devolve bloqueio também cai na gaveta: o motivo aparece por
     inteiro, venha de onde vier. */
  const disparar = async (nome, acao) => {
    if (!acao || passo) return
    setPasso(nome)
    setEtapa('conferindo')
    try {
      const motivos = motivosDo(await preVoo(), t)
      if (motivos.length) {
        aoBloqueio && aoBloqueio(motivos)
        return
      }
      setEtapa('rodando')
      const depois = motivosDo(await acao(), t)
      if (depois.length) aoBloqueio && aoBloqueio(depois)
    } finally {
      setPasso('')
      setEtapa('')
    }
  }

  const provar = comAcao(comando, '--plan')
  const rodando = ocupado || Boolean(passo)
  const dizendo = etapa === 'conferindo' ? t('barra.conferindo') : t('barra.rodandoAgora')

  return (
    <footer className="barra-comando">
      <Tooltip portalled side="top" delayMs={400}
        label={t('barra.verCodigo.rotulo')}
        description={t('barra.verCodigo.desc')}>
        <Button size="sm" variant="ghost" className="bcm-gaveta"
          leadingIcon={<Traco d={CODIGO} />}
          onClick={() => aoVerCodigo && aoVerCodigo()}>
          {t('barra.verCodigo')}
        </Button>
      </Tooltip>

      <Tooltip portalled side="top" delayMs={400}
        label={t('barra.pendencias.rotulo')}
        description={t('barra.pendencias.desc')}>
        <Button size="sm" variant="ghost"
          className={'bcm-gaveta' + (quantas > 0 ? ' bcm-espera' : '')}
          leadingIcon={<Traco d={PENDENCIA} />}
          aria-label={quantas === 0
            ? t('barra.pendencias')
            : t('barra.pendencias.aria', { n: quantas })}
          onClick={() => verPendencias && verPendencias()}>
          {t('barra.pendencias')}
          {quantas > 0 && <Badge tone="warn" className="bcm-conta">{quantas}</Badge>}
        </Button>
      </Tooltip>

      {aoRevisar && (
        <Tooltip portalled side="top" delayMs={400}
          label={t('rev.rotulo')} description={t('rev.desc')}>
          <Button size="sm" variant="ghost" className="bcm-gaveta"
            loading={revisando} loadingLabel={t('rev.botao')}
            onClick={() => aoRevisar()}>
            {t('rev.botao')}
          </Button>
        </Tooltip>
      )}

      <span className="bcm-corte" aria-hidden="true" />

      <span className="bcm-etiqueta">{t('barra.etiqueta')}
        <button className="bcm-entenda" onClick={() => aoAjuda && aoAjuda('comando')}>{t('comum.entenda')}</button>
      </span>

      <code className={'bcm-comando' + (comando ? '' : ' mudo')} title={comando}>
        {comando || t('barra.vazio')}
      </code>

      <Button size="sm" variant="ghost" disabled={!comando} onClick={copiar}>
        {copiado ? t('comum.copiado') : t('comum.copiar')}
      </Button>

      <span className="bcm-respiro" />

      {rodando && <Badge tone="neutral" dot>{t('barra.rodando')}</Badge>}

      <Tooltip portalled side="top" delayMs={400}
        label={t('barra.simular.rotulo')}
        description={t('barra.simular.desc', { cmd: provar || 'terraform plan' })}>
        <Button size="sm" variant="secondary" disabled={!comando || rodando}
          loading={passo === 'simular'} loadingLabel={dizendo}
          onClick={() => disparar('simular', aoProvar)}>
          {t('barra.simular')} <code className="bcm-bandeira">{t('barra.simular.bandeira')}</code>
        </Button>
      </Tooltip>

      <Tooltip portalled side="top" delayMs={400}
        label={t('receita.rotulo')} description={t('receita.desc')}>
        <Button size="sm" variant="primary" disabled={!comando}
          onClick={() => aoReceita && aoReceita()}>
          {t('receita.rotulo')}
        </Button>
      </Tooltip>
    </footer>
  )
}

export default BarraComando
