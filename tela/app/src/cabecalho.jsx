import React from 'react'
import { Button, StatusDot, Tooltip } from '@refy/ui'
import { useT } from './i18n.jsx'
import './cabecalho.css'

/* O topo da tela.
   Contrato: { prefixo, projeto, aoMudarProjeto, aoMudarPrefixo, estado,
   aoSalvar, recadoSalvo, aoContas, aoAjuda, aoLimpar, temDesenho }.

   Sem estado próprio: tudo entra e sai por propriedade, e cada `ao*` recebe o
   valor já pronto, como no resto da tela. A confirmação de apagar mora na
   composição; aqui só chama `aoLimpar`. O seletor de idioma mora aqui porque o
   topo é o único lugar fixo da tela. */

/* A barra separa as duas metades do mesmo campo, então barra dentro do valor
   deixa a fronteira ambígua e cai fora. O resto do texto passa inteiro: quem
   gera a pasta normaliza, e reescrever a tecla de quem digita seria decisão em
   silêncio. */
/* O tom do estado chega em português da composição ou já no nome do refy. */
const TONS = {
  bom: 'good', ok: 'ok', atencao: 'warn', aviso: 'warn',
  erro: 'critical', parado: 'critical', info: 'info', neutro: 'neutral',
}

function Estado({ estado }) {
  const dado = typeof estado === 'string'
    ? { texto: estado }
    : (estado && typeof estado === 'object' ? estado : {})
  const texto = dado.texto ?? dado.rotulo
  if (!texto) return null
  const tom = dado.tom ? (TONS[dado.tom] || dado.tom) : null
  if (tom) return <StatusDot className="cab-estado-marca" tone={tom}>{texto}</StatusDot>
  return <span className="cab-estado">{texto}</span>
}

function Traco({ d }) {
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true" focusable="false">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.4"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const CONTAS = 'M2.4 4.6h11.2v7.2H2.4z M2.4 7.2h11.2 M4.8 9.8h2.4'
const AJUDA = 'M8 1.6a6.4 6.4 0 1 0 0 12.8 6.4 6.4 0 0 0 0-12.8'
  + ' M6.2 6.2a1.9 1.9 0 1 1 2.5 1.8c-.5.2-.7.6-.7 1.1v.3 M8 11.6h.01'
const LIMPAR = 'M3 4.6h10 M6.4 4.6V3.2h3.2v1.4 M4.4 4.6l.6 8.2h6l.6-8.2'

export function Cabecalho({
  prefixo = '',
  projeto = '',
  aoMudarProjeto,
  aoMudarPrefixo,
  estado,
  aoSalvar,
  recadoSalvo,
  aoContas,
  aoAjuda,
  aoLimpar,
  aoAbrirConfig,
  temDesenho = false,
}) {
  const { t, lingua, trocar } = useT()
  /* O prefixo mora dentro do mesmo campo do nome, à esquerda da barra. Vai
     sempre montado, mesmo vazio: sem ele o Input do refy não desenha a caixa
     da esquerda e o pedido de preencher some. */
  /* O nome e a organização se decidem nas configurações e no assistente. Aqui
     eles se leem: campo editável no topo convidava a mudar o que já entrou em
     todo caminho gerado. */
  return (
    <header className="cab" aria-label="topo">
      <span className="cab-marca">bioma.sh</span>

      <Tooltip portalled side="bottom" delayMs={400}
        label={t('cab.org.rotulo')} description={t('cab.org.desc')}>
        <button type="button" className="cab-projeto-fixo"
          onClick={() => aoAbrirConfig && aoAbrirConfig()}>
          <span className="cab-org-fixa">{prefixo || t('cab.org.placeholder')}</span>
          <span className="cab-org-barra" aria-hidden="true">/</span>
          <span className="cab-projeto-nome">{projeto || t('cab.projeto.placeholder')}</span>
        </button>
      </Tooltip>

      <Estado estado={estado} />

      <span className="cab-respiro" />

      {recadoSalvo && <span className="cab-recado">{recadoSalvo}</span>}

      <Tooltip portalled side="bottom" delayMs={400}
        label={t('cab.salvar.rotulo')} description={t('cab.salvar.desc')}>
        <Button variant="ghost" size="sm"
          onClick={() => aoSalvar && aoSalvar()}>{t('cab.salvar')}</Button>
      </Tooltip>

      <Tooltip portalled side="bottom" delayMs={400}
        label={t('cab.config.rotulo')} description={t('cab.config.desc')}>
        <Button variant="ghost" size="sm" leadingIcon={<Traco d={CONTAS} />}
          onClick={() => aoContas && aoContas()}>{t('cab.config')}</Button>
      </Tooltip>

      <Tooltip portalled side="bottom" delayMs={400}
        label={t('cab.ajuda.rotulo')} description={t('cab.ajuda.desc')}>
        <Button variant="ghost" size="sm" leadingIcon={<Traco d={AJUDA} />}
          onClick={() => aoAjuda && aoAjuda()}>{t('cab.ajuda')}</Button>
      </Tooltip>

      {temDesenho && (
        <Tooltip portalled side="bottom" delayMs={400}
          label={t('cab.limpar.rotulo')} description={t('cab.limpar.desc')}>
          <Button className="cab-limpar" variant="ghost" size="sm"
            leadingIcon={<Traco d={LIMPAR} />}
            onClick={() => aoLimpar && aoLimpar()}>{t('cab.limpar')}</Button>
        </Tooltip>
      )}

      <div className="cab-lingua" role="group" aria-label="language">
        <button className={'cab-lingua-opcao' + (lingua === 'en' ? ' ativa' : '')}
          onClick={() => trocar('en')}>EN</button>
        <button className={'cab-lingua-opcao' + (lingua === 'pt' ? ' ativa' : '')}
          onClick={() => trocar('pt')}>PT</button>
      </div>
    </header>
  )
}

export default Cabecalho
