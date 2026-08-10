import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Kbd } from '@refy/ui'
import { SUGESTOES } from './partes.jsx'
import { useT } from './i18n.jsx'
import './paleta.css'

/* A paleta de busca de recurso, no meio da tela.

   Contrato: { aberta, aoFechar, aoEscolher(tipo) }.

   Ela abre por cmd+K e ctrl+K, busca em /recursos enquanto se digita, e o
   enter põe a peça escolhida no canvas. Sem ela aberta, nenhuma lista de 1687
   recursos ocupa espaço na tela.

   Quem compõe deve deixar a paleta montada mesmo fechada: o atalho global mora
   aqui e só existe enquanto o componente vive. Fechada, ela não desenha nada.
   O atalho abre por conta própria, então as três propriedades do contrato
   bastam. `aberta` manda por cima e `aoAbrir` é opcional, para quem quiser
   guardar o estado da abertura fora. */

/* O que cada serviço comum faz, numa linha. Grupo fora da tabela aparece só
   com nome e contagem: descrever 274 serviços à mão viraria ruído. */
const DESCRICAO_GRUPO = {
  s3: { en: 'Object storage: buckets, versioning, policies', pt: 'Armazenamento de objetos: buckets, versionamento, políticas' },
  rds: { en: 'Managed relational databases (Aurora, Postgres, MySQL)', pt: 'Bancos relacionais gerenciados (Aurora, Postgres, MySQL)' },
  dynamodb: { en: 'Serverless key-value tables', pt: 'Tabelas chave-valor serverless' },
  lambda: { en: 'Functions that run without servers', pt: 'Funções que rodam sem servidor' },
  ec2: { en: 'Virtual machines, networking and disks', pt: 'Máquinas virtuais, rede e discos' },
  ecs: { en: 'Container orchestration on AWS', pt: 'Orquestração de contêineres na AWS' },
  eks: { en: 'Managed Kubernetes', pt: 'Kubernetes gerenciado' },
  sqs: { en: 'Message queues', pt: 'Filas de mensagens' },
  sns: { en: 'Pub/sub notifications', pt: 'Notificações pub/sub' },
  msk: { en: 'Managed Kafka', pt: 'Kafka gerenciado' },
  api_gateway: { en: 'REST APIs: routes, stages, keys', pt: 'APIs REST: rotas, estágios, chaves' },
  apigatewayv2: { en: 'HTTP and WebSocket APIs', pt: 'APIs HTTP e WebSocket' },
  kms: { en: 'Encryption keys', pt: 'Chaves de cifra' },
  secretsmanager: { en: 'Secrets with rotation', pt: 'Segredos com rotação' },
  cloudwatch: { en: 'Metrics, logs and alarms', pt: 'Métricas, logs e alarmes' },
  iam: { en: 'Identities, roles and policies', pt: 'Identidades, papéis e políticas' },
  route53: { en: 'DNS and routing', pt: 'DNS e roteamento' },
  glue: { en: 'Data catalog and ETL', pt: 'Catálogo de dados e ETL' },
  kinesis: { en: 'Real-time data streams', pt: 'Streams de dados em tempo real' },
  elasticache: { en: 'Managed Redis and Memcached', pt: 'Redis e Memcached gerenciados' },
  efs: { en: 'Shared network file system', pt: 'Sistema de arquivos de rede compartilhado' },
  cloudfront: { en: 'CDN at the edge', pt: 'CDN na borda' },
  cognito: { en: 'User sign-up and sign-in', pt: 'Cadastro e login de usuários' },
  sfn: { en: 'Step Functions state machines', pt: 'Máquinas de estado do Step Functions' },
  vpc: { en: 'Private networking', pt: 'Rede privada' },
  ecr: { en: 'Container image registry', pt: 'Registro de imagens de contêiner' },
  eventbridge: { en: 'Event bus and rules', pt: 'Barramento de eventos e regras' },
  backup: { en: 'Centralized backups', pt: 'Backups centralizados' },
}

const ATRASO = 140            // espera de digitação, a mesma da coluna de recursos
const TETO = 40               // linhas desenhadas por busca
const VAZIA = 4               // linhas dos mais usados: o resto da altura é do inventário
const GUARDA = 'bioma.paleta.usados'

/* Os mais usados moram no navegador de quem desenha. Sem histórico, entram as
   sugestões do vocabulário compartilhado. */
function leUsados() {
  try {
    const cru = JSON.parse(window.localStorage.getItem(GUARDA) || '{}')
    return cru && typeof cru === 'object' ? cru : {}
  } catch { return {} }
}

function anotaUso(item) {
  try {
    const usados = leUsados()
    const antes = usados[item.tipo] || {}
    usados[item.tipo] = {
      n: (Number(antes.n) || 0) + 1,
      categoria: item.categoria || antes.categoria || '',
      servico: item.servico || antes.servico || '',
    }
    window.localStorage.setItem(GUARDA, JSON.stringify(usados))
  } catch { /* navegador sem armazenamento: os mais usados voltam às sugestões */ }
}

function maisUsados() {
  const usados = leUsados()
  const escolhidos = Object.entries(usados)
    .map(([tipo, v]) => ({ tipo, categoria: v.categoria, servico: v.servico, n: Number(v.n) || 0 }))
    .filter(x => x.n > 0)
    .sort((a, b) => b.n - a.n || a.tipo.localeCompare(b.tipo))
  const vistos = new Set(escolhidos.map(x => x.tipo))
  const resto = SUGESTOES.filter(s => !vistos.has(s.tipo))
  return [...escolhidos, ...resto].slice(0, VAZIA)
}

/* O servidor devolve quem contém o termo, em ordem alfabética. Aqui a ordem
   vira a da utilidade: o tipo exato primeiro, depois o que esta pessoa já usou
   e o que as sugestões trazem, depois o casamento mais perto do começo do tipo
   e o nome mais curto. Sem isto, buscar `lambda` traz `aws_lambda_alias` na
   frente de `aws_lambda_function`. */
function ordena(itens, termo) {
  const t = termo.toLowerCase()
  const conhecidos = new Set([...Object.keys(leUsados()), ...SUGESTOES.map(s => s.tipo)])
  const peso = (tipo) => (tipo === 'aws_' + t || tipo === t) ? 0 : (conhecidos.has(tipo) ? 1 : 2)
  return [...itens].sort((a, b) => {
    const pa = a.tipo.toLowerCase().indexOf(t)
    const pb = b.tipo.toLowerCase().indexOf(t)
    return (peso(a.tipo) - peso(b.tipo)) || (pa - pb) ||
      (a.tipo.length - b.tipo.length) || a.tipo.localeCompare(b.tipo)
  })
}

/* O tipo com o termo em destaque, e o prefixo aws_ apagado quando a busca não
   encosta nele. */
function Tipo({ tipo, termo }) {
  const t = (termo || '').trim().toLowerCase()
  const em = t ? tipo.toLowerCase().indexOf(t) : -1
  const prefixo = tipo.startsWith('aws_') && (em < 0 || em >= 4)
  const corpo = prefixo ? tipo.slice(4) : tipo
  const emCorpo = em < 0 ? -1 : (prefixo ? em - 4 : em)
  return (
    <span className="pk-tipo">
      {prefixo && <span className="pk-prefixo">aws_</span>}
      {emCorpo < 0 ? corpo : (
        <>
          {corpo.slice(0, emCorpo)}
          <b className="pk-marca">{corpo.slice(emCorpo, emCorpo + t.length)}</b>
          {corpo.slice(emCorpo + t.length)}
        </>
      )}
    </span>
  )
}

export function Paleta({ aberta, aoFechar, aoEscolher, aoAbrir }) {
  const { t: tr, lingua } = useT()
  /* Abrir é do atalho, que mora aqui: sem esta abertura própria, cmd+K não
     teria como levantar a paleta com as três propriedades do contrato.
     `aberta` continua mandando por cima, e `aoAbrir` avisa quem compõe. */
  const [propria, setPropria] = useState(false)
  const [termo, setTermo] = useState('')
  const [itens, setItens] = useState([])
  const [ativo, setAtivo] = useState(0)
  const [cortado, setCortado] = useState(false)    // a busca achou mais do que cabe
  const [estado, setEstado] = useState('parada')   // parada | buscando | fora
  const [grupos, setGrupos] = useState(null)     // a árvore de serviços, uma vez
  const [abertos, setAbertos] = useState({})     // grupo → expandido
  const campo = useRef(null)
  const lista = useRef(null)
  const anterior = useRef(null)
  const pedido = useRef(0)

  const visivel = aberta || propria
  const procurando = termo.trim().length > 0

  useEffect(() => {
    if (!visivel || grupos !== null) return
    fetch('/recursos?arvore=1').then(r => r.json())
      .then(d => setGrupos(Array.isArray(d.grupos) ? d.grupos : []))
      .catch(() => setGrupos([]))
  }, [visivel, grupos])
  const sugestoes = useMemo(() => (visivel && !procurando ? maisUsados() : []), [visivel, procurando])
  const linhas = procurando ? itens : sugestoes

  const fecha = useCallback(() => {
    setPropria(false)
    if (aoFechar) aoFechar()
  }, [aoFechar])

  /* O atalho global. Vive enquanto o componente vive, e sai junto. */
  useEffect(() => {
    const escuta = (e) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        if (visivel) fecha()
        else { setPropria(true); if (aoAbrir) aoAbrir() }
        return
      }
      if (visivel && e.key === 'Escape') {
        e.preventDefault()
        fecha()
      }
    }
    window.addEventListener('keydown', escuta)
    return () => window.removeEventListener('keydown', escuta)
  }, [visivel, aoAbrir, fecha])

  /* Cada abertura começa limpa, com o foco no campo. Ao fechar, o foco volta
     para onde estava. */
  useEffect(() => {
    if (!visivel) {
      const volta = anterior.current
      anterior.current = null
      if (volta && volta.focus) volta.focus()
      return
    }
    anterior.current = document.activeElement
    setTermo('')
    setItens([])
    setAtivo(0)
    setCortado(false)
    setEstado('parada')
    const q = requestAnimationFrame(() => campo.current && campo.current.focus())
    return () => cancelAnimationFrame(q)
  }, [visivel])

  /* A busca mora no servidor: o esquema tem 1687 recursos e nenhum deles vem
     para o navegador de uma vez. */
  useEffect(() => {
    if (!visivel || !procurando) {
      /* campo limpo volta aos mais usados, sem o resultado do termo anterior
         esperando atrás */
      pedido.current += 1
      setItens([])
      setCortado(false)
      setEstado('parada')
      return
    }
    const meu = ++pedido.current
    setEstado('buscando')
    const t = setTimeout(async () => {
      try {
        const r = await fetch('/recursos?q=' + encodeURIComponent(termo.trim().toLowerCase()))
        const d = await r.json()
        if (meu !== pedido.current) return          // resposta velha não manda na lista
        const brutos = d.itens || []
        const postos = ordena(brutos, termo.trim())
        setCortado(postos.length > TETO || brutos.length >= 60)
        setItens(postos.slice(0, TETO))
        setAtivo(0)
        setEstado('parada')
      } catch {
        if (meu !== pedido.current) return
        setItens([])
        setEstado('fora')
      }
    }, ATRASO)
    return () => clearTimeout(t)
  }, [visivel, procurando, termo])

  /* A linha escolhida pela seta acompanha a rolagem. */
  useEffect(() => {
    const alvo = lista.current && lista.current.querySelector('[data-linha="' + ativo + '"]')
    if (alvo) alvo.scrollIntoView({ block: 'nearest' })
  }, [ativo, linhas.length])

  const escolhe = useCallback((item) => {
    if (!item) return
    anotaUso(item)
    if (aoEscolher) aoEscolher(item.tipo)
    fecha()
  }, [aoEscolher, fecha])

  function teclado(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setAtivo(i => (linhas.length ? Math.min(i + 1, linhas.length - 1) : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setAtivo(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      escolhe(linhas[ativo])
    }
  }

  if (!visivel) return null

  return (
    <div className="pk-fundo" onMouseDown={fecha}>
      <div className="pk" role="dialog" aria-modal="true" aria-label={tr('pk.aria')}
        onMouseDown={e => e.stopPropagation()} onKeyDown={teclado}>

        <div className="pk-campo">
          <svg className="pk-lupa" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input ref={campo} className="pk-entrada" type="text" value={termo}
            role="combobox" aria-expanded="true" aria-controls="pk-lista" aria-autocomplete="list"
            aria-activedescendant={linhas.length ? 'pk-linha-' + ativo : undefined}
            placeholder={tr('pk.placeholder')}
            onChange={e => { setTermo(e.target.value); setAtivo(0) }} />
        </div>

        {(!procurando || estado === 'buscando' || linhas.length > 0) && (
          <div className="pk-secao">
            {!procurando ? tr('pk.maisUsados')
              : estado === 'buscando' ? tr('pk.procurando')
                : cortado ? tr('pk.cortado', { n: linhas.length })
                  : tr('pk.encontrados', { n: linhas.length })}
          </div>
        )}

        <div id="pk-lista" className="pk-lista" ref={lista} role="listbox"
          aria-label="recursos da AWS">
          {linhas.map((item, i) => (
            <div key={item.tipo} id={'pk-linha-' + i} data-linha={i} role="option"
              aria-selected={i === ativo}
              className={'pk-linha' + (i === ativo ? ' ativa' : '')}
              title={item.exige ? item.tipo + ' · ' + tr('pk.exige', { n: item.exige }) : item.tipo}
              onMouseEnter={() => setAtivo(i)}
              onMouseDown={e => e.preventDefault()}
              onClick={() => escolhe(item)}>
              <img className="pk-icone" src={'/icone?tipo=' + encodeURIComponent(item.tipo)}
                alt="" width="20" height="20" loading="lazy" decoding="async" />
              <Tipo tipo={item.tipo} termo={termo} />
              <span className="pk-categoria">{item.categoria || tr('pk.outros')}</span>
            </div>
          ))}

          {!procurando && grupos && grupos.length > 0 && (
            <div className="pk-grupos">
              <div className="pk-secao">{tr('pk.todos')}</div>
              {grupos.map(g => {
                const abertoG = !!abertos[g.grupo]
                const desc = DESCRICAO_GRUPO[g.grupo]
                return (
                  <div key={g.grupo} className="pk-grupo">
                    <button type="button" className="pk-grupo-cabeca" aria-expanded={abertoG}
                      onClick={() => setAbertos(v => ({ ...v, [g.grupo]: !v[g.grupo] }))}>
                      <span className="pk-grupo-seta" aria-hidden>{abertoG ? '▾' : '▸'}</span>
                      <span className="pk-grupo-nome">{g.rotulo}</span>
                      {desc && <span className="pk-grupo-desc">{desc[lingua] || desc.en}</span>}
                      <span className="pk-grupo-conta">{tr('pk.recursosDo', { n: g.quantos })}</span>
                    </button>
                    {abertoG && g.itens.map(item => (
                      <div key={item.tipo} role="option" aria-selected={false}
                        className="pk-linha pk-linha-grupo"
                        title={item.exige ? item.tipo + ' · ' + tr('pk.exige', { n: item.exige }) : item.tipo}
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => escolhe(item)}>
                        <img className="pk-icone" src={'/icone?tipo=' + encodeURIComponent(item.tipo)}
                          alt="" width="20" height="20" loading="lazy" decoding="async" />
                        <Tipo tipo={item.tipo} termo="" />
                        <span className="pk-categoria">{item.categoria || tr('pk.outros')}</span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          )}

          {!linhas.length && procurando && (
            <p className="pk-vazio">
              {estado === 'fora'
                ? tr('pk.fora')
                : estado === 'buscando'
                  ? tr('pk.buscando')
                  : tr('pk.nenhum', { termo: termo.trim() })}
            </p>
          )}
        </div>

        <div className="pk-pe">
          <span><Kbd>↑</Kbd><Kbd>↓</Kbd> {tr('pk.anda')}</span>
          <span><Kbd>enter</Kbd> {tr('pk.poe')}</span>
          <span><Kbd>esc</Kbd> {tr('pk.fecha')}</span>
        </div>
      </div>
    </div>
  )
}

export default Paleta
