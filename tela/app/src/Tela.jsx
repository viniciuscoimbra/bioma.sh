import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Input } from '@refy/ui'

import { chave, servicoDoTipo, camposBase } from './partes.jsx'
import { Cabecalho } from './cabecalho.jsx'
import { PainelRecursos } from './painel-recursos.jsx'
import { Canvas } from './canvas.jsx'
import { PainelDecisoes, GUARDA_RECOLHIDO } from './painel-decisoes.jsx'
import { PainelCelula } from './painel-celula.jsx'
import { BarraComando } from './barra-comando.jsx'
import { Paleta } from './paleta.jsx'
import { GavetaCodigo, SAIDA } from './gaveta-codigo.jsx'
import { GavetaPendencias } from './gaveta-pendencias.jsx'
import { GavetaConfig } from './gaveta-config.jsx'
import { GavetaAjuda } from './gaveta-ajuda.jsx'
import { Assistente } from './assistente.jsx'
import { SeletorPasta } from './seletor-pasta.jsx'
import { GavetaRevisao } from './gaveta-revisao.jsx'
import { GavetaReceita } from './gaveta-receita.jsx'
import { useT } from './i18n.jsx'

/* A composição da tela.

   O canvas é a figura central e ocupa todo o espaço entre os trilhos. O estado
   do desenho mora aqui e desce por propriedade; cada painel recebe o que o
   contrato manda e não sabe da existência dos outros.

   Quatro gavetas entram por cima do canvas, uma de cada vez: código,
   pendências, ajuda e contas. O que saiu desta versão: o seletor de perfil (na
   beta só `local` roda), a coluna de áreas (a área virou escolha dentro da
   peça) e a aba de verificações (as conferências rodam dentro de simular e de
   aplicar). */

const PERFIL = 'local'

/* Onde o prefixo do projeto mora. Não existe tela de configurações ainda, e
   guardar no navegador é o que faz o prefixo sobreviver ao recarregamento. */
const GUARDA_PREFIXO = 'bioma.prefixo'


/* Um desenho pronto para quem chega pelo link, com as três arestas que a
   legenda do canvas explica: travessia de conta, cifra e dependência. */
/* O exemplo é a primeira impressão da ferramenta, então ele chega mobiliado:
   as contas que ele usa, a sigla e a região entram junto. Exemplo que abre
   cheio de pendência ensina que a ferramenta dá trabalho. */
const EXEMPLO_CONTAS = [
  { apelido: 'plataforma-dev', numero: '210987654321', area: 'Plataforma', padrao: true },
  { apelido: 'dados-dev', numero: '310987654321', area: 'Plataforma > Dados', padrao: false },
  { apelido: 'seguranca-dev', numero: '410987654321', area: 'Plataforma > Segurança', padrao: false },
]
const EXEMPLO_CONFIG = {
  sigla: 'BIO', padrao_nome: '{sigla}-{recurso}-{funcao}',
  regioes: ['sa-east-1', 'us-east-1'], regiao_padrao: 'sa-east-1',
}

/* O exemplo é a primeira leitura da ferramenta, então ele mostra o repertório
   inteiro: peça de entrada, computação, mensageria, banco, dado governado e
   segurança; os três desenhos de seta; e os dois tecidos que existem. */
const EXEMPLO = {
  nos: [
    ['aws_api_gateway_rest_api', 'porta de entrada das APIs do canal', 'Plataforma', 'compartilhado', 24, 24],
    ['aws_lambda_function', 'recorta o evento e publica na fila', 'Plataforma', 'compartilhado', 24, 208],
    ['aws_sqs_queue', 'fila de eventos da plataforma', 'Plataforma', 'compartilhado', 24, 392],
    ['aws_cloudwatch_log_group', 'log nativo da plataforma', 'Plataforma', '×conta', 24, 576],
    ['aws_s3_bucket', 'trilha de auditoria como dado governado', 'Plataforma > Dados', 'compartilhado', 356, 24],
    ['aws_dynamodb_table', 'estado das cobranças em andamento', 'Plataforma > Dados', 'compartilhado', 356, 208],
    ['aws_rds_cluster', 'banco relacional do domínio', 'Plataforma > Dados', 'compartilhado', 356, 392],
    ['aws_kms_key', 'cifra das trilhas e dos segredos', 'Plataforma > Segurança', 'compartilhado', 688, 24],
    ['aws_secretsmanager_secret', 'segredo de acesso ao barramento', 'Plataforma > Segurança', 'compartilhado', 688, 208],
  ],
  arestas: [
    [0, 1, 'requisição do canal', 'direto'],
    [1, 2, 'evento recortado', 'direto'],
    [1, 5, 'estado da cobrança', 'direto'],
    [2, 6, 'evento persistido', 'direto'],
    [3, 4, 'logs para evidência', 'subscription'],
    [7, 4, 'chave de cifra', 'cifra em repouso'],
    [7, 8, 'chave do segredo', 'cifra em repouso'],
  ],
}

const conta12 = /^[0-9]{12}$/

function compilar(formato) {
  if (!formato) return null
  try { return new RegExp(formato) } catch { return null }
}

function leGuardado(chaveGuarda) {
  try { return window.localStorage.getItem(chaveGuarda) } catch { return null }
}

function guarda(chaveGuarda, valor) {
  try { window.localStorage.setItem(chaveGuarda, valor) } catch { /* sem disco, vale a sessão */ }
}

export function Tela() {
  const { t } = useT()
  const CAMPOS_BASE = useMemo(() => camposBase(t), [t])
  const [projeto, setProjeto] = useState('plataforma-dados')
  const [prefixo, setPrefixo] = useState(() => leGuardado(GUARDA_PREFIXO) || '')
  const [nos, setNos] = useState([])
  const [arestas, setArestas] = useState([])
  const [escolhido, setEscolhido] = useState(null)
  const [contas, setContas] = useState([])
  const [comandoProjeto, setComandoProjeto] = useState('')
  const [origemProjeto, setOrigemProjeto] = useState(null)
  /* A página é um recorte de LEITURA, como a aba de uma planilha: o canvas
     mostra a fase escolhida, e a lista da esquerda continua inteira — quem lê
     por fases não perde a visão do todo. */
  const [pagina, setPagina] = useState('tudo')

  const [resultado, setResultado] = useState(null)
  const [gerando, setGerando] = useState(false)

  const [aberto, setAberto] = useState(null)
  const [aba, setAba] = useState('arquivos')

  const [preVoo, setPreVoo] = useState(null)
  const [bloqueio, setBloqueio] = useState(null)
  const [janela, setJanela] = useState('')
  const [saida, setSaida] = useState(null)
  const [ocupado, setOcupado] = useState(false)
  const [referencia, setReferencia] = useState(null)

  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 40, y: 30 })

  /* Os dois trilhos e as quatro gavetas. `gaveta` é uma string só, porque
     nunca existem duas abertas ao mesmo tempo. */
  const [esqRecolhido, setEsqRecolhido] = useState(false)
  const [dirRecolhido, setDirRecolhido] = useState(() => leGuardado(GUARDA_RECOLHIDO) === '1')
  const [gaveta, setGaveta] = useState(null)
  const [verbete, setVerbete] = useState(null)
  const [paleta, setPaleta] = useState(false)
  const [assistente, setAssistente] = useState(null)   // { depois: 'importar' | 'paleta' }
  /* Um projeto aberto continua aberto mesmo com o canvas vazio: apagar a
     última peça é uma edição, não um fechar. A tela inicial só volta quando
     alguém fecha o projeto de propósito. */
  const [aberto_projeto, setAbertoProjeto] = useState(false)

  const [pedido, setPedido] = useState(null)   // limpeza | destruir | levar
  const [destino, setDestino] = useState('')
  const [recadoDestino, setRecadoDestino] = useState('')

  const contador = useRef(1)
  const entradaRef = useRef(null)
  const [recentes, setRecentes] = useState([])
  const [recadoSalvo, setRecadoSalvo] = useState('')

  useEffect(() => {
    fetch('/recentes').then(r => r.json()).then(d => Array.isArray(d) && setRecentes(d)).catch(() => {})
  }, [])

  /* O projeto vive num arquivo .bio na pasta de trabalho: JSON legível, que o
     Git trata bem. Salvar guarda o desenho, a configuração e as contas. */
  const [pedindoPasta, setPedindoPasta] = useState(false)
  const [revisao, setRevisao] = useState(null)
  const [revisando, setRevisando] = useState(false)

  const salvarBio = useCallback(async () => {
    const r = await fetch('/salvar', {
      method: 'POST',
      /* O .bio é o projeto, e não o desenho: o que abre precisa devolver o
         ponto em que se parou. As respostas já viajam dentro de `nos`
         (`valores` por peça); a revisão dos linters viaja aqui porque ela é
         resultado de trabalho e não se reconstrói sozinha ao abrir. */
      body: JSON.stringify({ nome: projeto || 'projeto', prefixo,
        origem: origemProjeto || undefined,
        revisao: revisao || undefined,
        grafo: { nos, arestas } }),
    })
    const d = await r.json()
    /* Sem pasta declarada, salvar não termina em recado: a escolha da pasta
       acontece ali mesmo e o salvamento segue de onde parou. */
    if (d.erro && /pasta/i.test(d.erro)) { setPedindoPasta(true); return }
    setRecadoSalvo(d.erro ? d.erro : 'salvo em ' + d.caminho)
    setTimeout(() => setRecadoSalvo(''), 4000)
  }, [projeto, prefixo, nos, arestas, revisao, origemProjeto])

  const abrirBio = useCallback(async (caminho) => {
    const r = await fetch('/abrir?caminho=' + encodeURIComponent(caminho))
    const d = await r.json()
    if (d.erro) { setRecadoSalvo(d.erro); return }
    setNos((d.grafo?.nos || []).map((n, i) => ({ ...n, id: n.id || 'bio-' + i, valores: n.valores || {} })))
    setArestas(d.grafo?.arestas || [])
    setAbertoProjeto(true)
    if (d.nome) setProjeto(d.nome)
    if (d.prefixo) setPrefixo(d.prefixo)
    if (d.config) setConfig(d.config)
    if (d.revisao) setRevisao(d.revisao)
    if (Array.isArray(d.contas) && d.contas.length) setContas(d.contas)
    /* O comando de execução viaja no projeto: um .bio lido de árvore real sabe
       como aquela árvore se aplica, e o rodapé mostrando o padrão da casa
       (`--perfil local`) para um projeto de produção era um comando que não
       roda. */
    setComandoProjeto(d.origem?.comando || '')
    /* A origem volta no salvar: sem isto, salvar um projeto lido de árvore
       descartava de onde ele veio e o comando que o executa. */
    setOrigemProjeto(d.origem || null)
    setPagina('tudo')
    setEscolhido(null)
  }, [])
  const vivo = useRef({ nos, arestas })
  vivo.current = { nos, arestas }

  /* ── gavetas e paleta ───────────────────────────────────────────────── */

  const abrirGaveta = useCallback((nome) => {
    setPaleta(false)
    setGaveta(nome)
  }, [])

  const fecharGaveta = useCallback(() => setGaveta(null), [])

  const abrirAjuda = useCallback((chaveVerbete) => {
    setVerbete(chaveVerbete || null)
    abrirGaveta('ajuda')
  }, [abrirGaveta])

  const abrirPaleta = useCallback(() => {
    setGaveta(null)
    setPaleta(true)
  }, [])


  /* ── contas cadastradas ─────────────────────────────────────────────── */

  useEffect(() => {
    let cancelado = false
    fetch('/contas')
      .then(r => r.json())
      .then(d => { if (!cancelado && Array.isArray(d)) setContas(d) })
      .catch(() => { /* sem servidor, a peça nova nasce sem conta e a pendência aparece */ })
    return () => { cancelado = true }
  }, [])

  const contaPadrao = useMemo(
    () => contas.find(c => c.padrao) || contas[0] || null, [contas])

  /* ── o desenho vira proposta e arquivos, enquanto se monta ──────────── */

  /* A assinatura carrega só o que o tradutor lê. Arrastar peça e preencher
     ficha não regeram a árvore, e a conta que a proposta devolve não realimenta
     a geração. */
  const assinatura = useMemo(() => JSON.stringify({
    p: projeto,
    n: nos.map(n => [n.servico, n.papel, n.zona, n.multiplicidade, n.valores || {}]),
    a: arestas.map(a => [a.de, a.para, a.flui, a.canal]),
  }), [projeto, nos, arestas])

  useEffect(() => {
    if (!vivo.current.nos.length) { setResultado(null); setPreVoo(null); return }
    let cancelado = false
    setGerando(true)
    const t = setTimeout(async () => {
      const { nos: N, arestas: A } = vivo.current
      const corpo = {
        nome: projeto,
        nos: N.map(n => ({
          servico: n.servico, papel: n.papel || 'sem papel declarado',
          zona: n.zona, multiplicidade: n.multiplicidade,
          valores: n.valores || {},
          /* A receita que a peça aponta viaja junto: é ela que diz quais
             variáveis a célula exige. Sem isto o servidor não tem como
             perguntar o que a receita do catálogo pede, e a peça chega à tela
             com os argumentos que o gerador deduz do serviço, que são outros. */
          receita: n.receita || undefined,
        })),
        arestas: A.map(a => {
          const o = N.find(n => n.id === a.de), d = N.find(n => n.id === a.para)
          if (!o || !d) return null
          /* cruza fronteira é limite de CONFIANÇA, não travessia de conta: só
             o que a zona declara como SaaS. Travessia de conta o tradutor
             deriva sozinho dos trilhos. */
          const saas = [o.zona, d.zona].some(z => /saas/i.test(z || ''))
          return {
            origem: o.servico, destino: d.servico,
            flui: a.flui || 'dado', canal: a.canal || 'direto',
            cruza: saas ? 'sim (SaaS)' : 'não',
          }
        }).filter(Boolean),
      }
      try {
        const r = await fetch('/gerar', { method: 'POST', body: JSON.stringify(corpo) })
        const d = await r.json()
        if (!cancelado) { setResultado(d); setPreVoo(null) }
      } catch (e) {
        if (!cancelado) setResultado({ erro: t('tela.servidor', { erro: e.message }) })
      } finally {
        if (!cancelado) setGerando(false)
      }
    }, 400)
    return () => { cancelado = true; clearTimeout(t); setGerando(false) }
  }, [assinatura])

  const proposta = resultado?.proposta || null
  const arquivosGerados = resultado?.arquivos || {}

  const arquivos = useMemo(
    () => (saida ? { ...arquivosGerados, [SAIDA]: saida } : arquivosGerados),
    [arquivosGerados, saida])

  /* A conta que o tradutor decidiu volta para o nó, porque é ela que o canvas
     desenha como caixa. Quem escreveu o número de 12 dígitos manda. */
  useEffect(() => {
    const unidades = proposta?.unidades
    if (!unidades) return
    setNos(v => {
      let mudou = false
      const novo = v.map(n => {
        const u = unidades.find(x => chave(x.servico) === chave(n.servico))
        const conta = n.valores?.conta || u?.conta || n.conta || ''
        if (conta === n.conta) return n
        mudou = true
        return { ...n, conta }
      })
      return mudou ? novo : v
    })
  }, [proposta])

  /* O visor abre sozinho no arquivo que mais interessa da aba: primeiro o que
     espera resposta, depois a receita. */
  useEffect(() => {
    if (aberto && arquivos[aberto]) return
    const lista = Object.keys(arquivos).sort().filter(c => c !== SAIDA)
    if (!lista.length) return
    setAberto(lista.find(c => /=\s*"PREENCHER"/.test(arquivos[c] || ''))
      || lista.find(c => c.endsWith('main.tf'))
      || lista[0])
  }, [arquivos, aberto])

  const unidadeDe = useCallback((n) => {
    if (!n) return null
    return (proposta?.unidades || []).find(u => chave(u.servico) === chave(n.servico)) || null
  }, [proposta])

  const noEscolhido = nos.find(n => n.id === escolhido) || null
  const unidadeEscolhida = unidadeDe(noEscolhido)

  /* ── montar ─────────────────────────────────────────────────────────── */

  /* A peça nova nasce na conta padrão: número, apelido e área de uma vez, na
     mesma correspondência que a troca de conta no canvas escreve. Sem conta
     cadastrada ela nasce na plataforma e o campo entra no relatório. */
  /* ── as decisões que valem para o projeto inteiro ───────────────────
     Elas existem para a pessoa responder uma vez, em vez de responder a
     mesma coisa em toda peça. Sem elas, seis peças pedem vinte e três
     respostas, e dezoito são o mesmo nome, a mesma conta e a mesma região. */
  const [config, setConfig] = useState(null)

  useEffect(() => {
    fetch('/projeto').then(r => r.json()).then(setConfig).catch(() => {})
  }, [])

  /* Projeto sem sigla ainda não foi configurado: a porta abre o assistente
     primeiro e guarda o que a pessoa ia fazer. O exemplo se mobília sozinho
     e um .bio traz a configuração dentro, então os dois pulam o assistente. */
  const seguirDepois = useCallback((depois) => {
    if (depois === 'importar') entradaRef.current?.click()
    else if (depois === 'paleta') abrirPaleta()
  }, [abrirPaleta])

  /* Entrar por uma porta com o canvas vazio é começar um projeto, e projeto
     começa pelo assistente. Sem flag guardada: flag some, marca errado, e a
     pessoa fica sem o assistente que pediu. Quem não quer configurar agora
     usa o "Configurar depois" do próprio assistente. */
  const pelaPorta = useCallback((depois) => {
    /* Abrir um desenho começa pelo arquivo: um .bio traz configuração dentro,
       e perguntar antes de olhar seria perguntar o que já está respondido. O
       assistente entra depois, quando a leitura não trouxe configuração. */
    if (depois === 'importar') { entradaRef.current?.click(); return }
    setAssistente({ depois })
  }, [])

  const salvarContas = useCallback(async (lista) => {
    const r = await fetch('/contas', { method: 'POST', body: JSON.stringify(lista) })
    const v = await r.json()
    if (!v.erro && Array.isArray(v)) setContas(v)
    return v
  }, [])

  const salvarConfig = useCallback(async (d) => {
    const r = await fetch('/projeto', { method: 'POST', body: JSON.stringify(d) })
    const v = await r.json()
    if (!v.erro) setConfig(v)
    return v
  }, [])

  /* O nome sai do padrão do projeto, e não da cabeça de quem desenha: peça do
     mesmo tipo em projetos diferentes nasce com nome do mesmo formato. */
  const nomearPeca = useCallback((tipo, papel, quantos) => {
    const sigla = (config?.sigla || '').trim().toLowerCase()
    const recurso = String(tipo || '').replace(/^aws_/, '').replace(/_/g, '-')
    const funcao = (papel || '').trim()
      ? chave(papel).split(' ').slice(0, 2).join('-')
      : 'principal'
    const bruto = (config?.padrao_nome || '{sigla}-{recurso}-{funcao}')
      .replace('{sigla}', sigla).replace('{recurso}', recurso).replace('{funcao}', funcao)
    const limpo = bruto.replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-').slice(0, 63)
    return quantos > 1 ? `${limpo}-${quantos}` : limpo
  }, [config])

  const acrescentar = useCallback((tipo) => {
    if (!tipo) return
    setAbertoProjeto(true)
    const id = tipo + '-' + contador.current++
    setNos(v => {
      const iguais = v.filter(n => n.tipo === tipo).length + 1
      /* a conta é determinística: a padrão do cadastro, sempre a mesma.
         O domínio da peça é o domínio dessa conta. */
      const daArea = contaPadrao
      const zona = daArea?.area || 'Platform'
      return [...v, {
        id, tipo, servico: servicoDoTipo(tipo), papel: '',
        zona,
        conta: daArea?.apelido || '',
        regiao: config?.regiao_padrao || '',
        multiplicidade: 'compartilhado',
        x: 40 + (v.length % 3) * 280, y: 40 + Math.floor(v.length / 3) * 180,
        valores: {
          nome: nomearPeca(tipo, '', iguais),
          ...(daArea ? { conta: daArea.numero } : {}),
          ...(config?.regiao_padrao ? { regiao: projeto.regiao_padrao } : {}),
        },
      }]
    })
    setEscolhido(id)
    setDirRecolhido(false)
  }, [contaPadrao, contas, config, nomearPeca])

  /* Quem já desenhou antes de configurar o projeto não pode ficar preso ao
     que nasceu vazio: este botão reescreve nome, conta e região das peças que
     ainda não foram respondidas à mão. */
  const aplicarPadroes = useCallback(() => {
    setNos(v => v.map((n, i) => {
      const daArea = contas.find(c => c.area === n.zona) || contaPadrao
      const iguais = v.slice(0, i + 1).filter(x => x.tipo === n.tipo).length
      return {
        ...n,
        conta: n.conta || daArea?.apelido || '',
        regiao: n.regiao || config?.regiao_padrao || '',
        valores: {
          ...n.valores,
          nome: n.valores?.nome || nomearPeca(n.tipo, n.papel, iguais),
          conta: n.valores?.conta || daArea?.numero || '',
          regiao: n.valores?.regiao || config?.regiao_padrao || '',
        },
      }
    }))
  }, [contas, contaPadrao, config, nomearPeca])

  const mover = useCallback((id, x, y) =>
    setNos(v => v.map(n => (n.id === id ? { ...n, x, y } : n))), [])

  const ligar = useCallback((de, para) => setArestas(v =>
    v.some(a => a.de === de && a.para === para)
      ? v
      : [...v, { de, para, flui: 'dado', canal: 'direto' }]), [])

  const escolher = useCallback((id) => setEscolhido(id), [])

  const [aTirar, setATirar] = useState(null)   // { indice, de, para }

  const tirarAresta = useCallback(() => {
    if (!aTirar) return
    setArestas(v => v.filter((_, i) => i !== aTirar.indice))
    setATirar(null)
  }, [aTirar])

  /* A escolha de conta decide três campos da peça de uma vez: o número casa a
     peça com a caixa, o apelido rotula e a área decide a pasta. */
  const mudarConta = useCallback((id, conta) => {
    if (!conta) return
    setNos(v => v.map(n => (n.id === id ? {
      ...n,
      conta: conta.apelido || n.conta,
      zona: conta.area || n.zona,
      valores: { ...(n.valores || {}), conta: conta.numero },
    } : n)))
  }, [])

  const remover = () => {
    if (!escolhido) return
    setNos(v => v.filter(n => n.id !== escolhido))
    setArestas(v => v.filter(a => a.de !== escolhido && a.para !== escolhido))
    setEscolhido(null)
  }

  const zerar = () => {
    setNos([]); setArestas([]); setEscolhido(null)
    setPreVoo(null); setBloqueio(null); setSaida(null)
    setAberto(null); setReferencia(null); setPedido(null)
  }

  const abrirExemplo = useCallback(async () => {
    // o exemplo cadastra as contas e a configuração que ele mesmo usa
    let contasDoExemplo = contas
    if (!contas.length) {
      const v = await salvarContas(EXEMPLO_CONTAS)
      if (Array.isArray(v)) contasDoExemplo = v
    }
    let cfg = config
    if (!config?.sigla) {
      const v = await salvarConfig({ ...(config || {}), ...EXEMPLO_CONFIG })
      if (!v?.erro) cfg = v
    }
    const sigla = (cfg?.sigla || 'org').toLowerCase()
    const regiao = cfg?.regiao_padrao || 'sa-east-1'
    const ids = EXEMPLO.nos.map((_, i) => 'exemplo-' + i)
    const vistos = {}
    setNos(EXEMPLO.nos.map(([tipo, papel, zona, mult, x, y], i) => {
      const daArea = contasDoExemplo.find(c => c.area === zona)
      vistos[tipo] = (vistos[tipo] || 0) + 1
      const recurso = tipo.replace(/^aws_/, '').replace(/_/g, '-')
      const funcao = chave(papel).split(' ').slice(0, 2).join('-') || 'principal'
      const nome = (`${sigla}-${recurso}-${funcao}` + (vistos[tipo] > 1 ? `-${vistos[tipo]}` : '')).slice(0, 63)
      return {
        id: ids[i], tipo, servico: servicoDoTipo(tipo), papel, zona,
        conta: daArea?.apelido || '', regiao, multiplicidade: mult, x, y,
        valores: {
          nome,
          ...(daArea ? { conta: daArea.numero } : {}),
          regiao,
        },
      }
    }))
    setArestas(EXEMPLO.arestas.map(([de, para, flui, canal]) => ({
      de: ids[de], para: ids[para], flui, canal,
    })))
    setEscolhido(null)
    setAbertoProjeto(true)
  }, [contas, config, salvarContas, salvarConfig])

  /* ── a ficha da célula ──────────────────────────────────────────────── */

  /* As perguntas saem do perguntas.json que o gerador escreveu para esta
     receita. Quem preenche não precisa saber o nome do argumento no provider,
     mas ele aparece embaixo do campo, porque o engenheiro confere. */
  const perguntasDe = useCallback((u) => (
    Array.isArray(u?.perguntas) ? u.perguntas : []
  ), [])

  const campos = useMemo(() => perguntasDe(unidadeEscolhida), [perguntasDe, unidadeEscolhida])

  const validacao = useMemo(() => {
    if (!noEscolhido) return {}
    const escrito = noEscolhido.valores?.conta || ''
    if (conta12.test(escrito)) return {}
    const papel = unidadeEscolhida?.conta
    return {
      conta: {
        ok: false,
        mensagem: papel
          ? t('tela.contaDoTradutor', { conta: papel })
          : t('ficha.conta.explica'),
      },
    }
  }, [noEscolhido, unidadeEscolhida])

  /* Responder um campo invalida o veredito das verificações anterior: ele falou de
     uma árvore que acabou de mudar. */
  const mudarCelula = (campo, valor) => {
    if (!escolhido) return
    setBloqueio(null)
    setNos(v => v.map(n => {
      if (n.id !== escolhido) return n
      const novo = { ...n, valores: { ...(n.valores || {}), [campo]: valor } }
      if (campo === 'conta') novo.conta = valor.trim() || n.conta
      if (campo === 'regiao') novo.regiao = valor
      return novo
    }))
  }

  /* ── o relatório de pendências ──────────────────────────────────────── */

  /* Uma linha por campo que espera resposta, em toda peça do desenho. É a
     mesma lista que a barra conta no botão: o número e o relatório nunca
     discordam. */
  const nomeDaCelula = useCallback(
    (n) => unidadeDe(n)?.nome || n.servico || n.tipo || 'célula', [unidadeDe])

  const fasesDoDesenho = useMemo(() => {
    const f = [...new Set(nos.map(n => n.fase).filter(v => v != null))]
    f.sort((a, b) => a - b)
    return f
  }, [nos])

  const nosDaPagina = useMemo(() => {
    if (pagina === 'tudo') return nos
    const recorte = pagina === 'adiadas'
      ? nos.filter(n => n.fase == null)
      : nos.filter(n => n.fase === pagina)
    /* A página compacta a VISTA, não o dado: cada peça mantém a coluna
       (profundidade) e a ordem, mas as faixas vazias somem — sete peças
       espalhadas pela caixa do desenho inteiro ficavam abaixo do piso de zoom
       e a página abria ilegível como o todo. A posição real da peça não muda:
       voltar para "tudo" volta ao desenho como ele é. */
    const xs = [...new Set(recorte.map(n => n.x))].sort((a, b) => a - b)
    const ys = [...new Set(recorte.map(n => n.y))].sort((a, b) => a - b)
    return recorte.map(n => ({
      ...n,
      x: 80 + xs.indexOf(n.x) * 300,
      y: 80 + ys.indexOf(n.y) * 170,
    }))
  }, [nos, pagina])

  const arestasDaPagina = useMemo(() => {
    if (pagina === 'tudo') return arestas
    const ids = new Set(nosDaPagina.map(n => n.id))
    return arestas.filter(a => ids.has(a.de) && ids.has(a.para))
  }, [arestas, nosDaPagina, pagina])

  const pendencias = useMemo(() => {
    const fora = []
    for (const n of nos) {
      const u = unidadeDe(n)
      const celula = nomeDaCelula(n)
      for (const c of [...CAMPOS_BASE, ...perguntasDe(u)]) {
        if (!c || !c.nome) continue
        const valor = String(n.valores?.[c.nome] ?? n[c.nome] ?? '').trim()
        const regra = compilar(c.formato)
        if (valor && (!regra || regra.test(valor))) continue
        fora.push({
          id: n.id,
          celula,
          campo: c.nome,
          pergunta: c.pergunta || '',
          exemplo: c.exemplo || '',
          formato: c.explica || c.formato || '',
          regex: c.formato || '',
          consequencia: c.erra || '',
        })
      }
    }
    return fora
  }, [nos, unidadeDe, nomeDaCelula, perguntasDe, CAMPOS_BASE])

  /* O diagnóstico do bioma entra junto do que a ficha espera: erro primeiro,
     porque é ele que impede a árvore de sair; aviso depois, porque a decisão é
     de quem desenha. */
  const doDiagnostico = useMemo(() => {
    const achados = resultado?.diagnostico?.achados || []
    const peso = { erro: 0, aviso: 1 }
    return [...achados]
      .sort((a, b) => (peso[a.nivel] ?? 9) - (peso[b.nivel] ?? 9) || a.camada - b.camada)
      .map((a, i) => ({
        id: 'diag-' + i,
        celula: a.onde || '',
        campo: a.regra,
        pergunta: a.razao,
        formato: t('diag.camada.' + a.camada),
        consequencia: a.saida || '',
        nivel: a.nivel,
        somenteLeitura: true,
      }))
  }, [resultado, t])

  /* O que as verificações bloqueou entra na frente do que a ficha espera: quem
     apertou simular quer saber por que o comando não saiu. */
  const noRelatorio = bloqueio && bloqueio.length
    ? bloqueio
    : [...doDiagnostico, ...pendencias]

  const responderValor = useCallback((p, valor) => {
    if (!p?.id || !p?.campo) return
    setBloqueio(null)
    setNos(v => v.map(n => {
      if (n.id !== p.id) return n
      const novo = { ...n, valores: { ...(n.valores || {}), [p.campo]: valor } }
      if (p.campo === 'conta') novo.conta = valor.trim() || n.conta
      if (p.campo === 'regiao') novo.regiao = valor
      return novo
    }))
  }, [])

  /* Linha das verificações não tem campo na ficha: corrigir nela dispensa o veredito
     e devolve o relatório vivo, em vez de virar botão que não faz nada. */
  const corrigir = useCallback((celula, campo) => {
    const alvo = nos.find(n => nomeDaCelula(n) === celula)
      || nos.find(n => chave(n.servico) === chave(celula))
    setBloqueio(null)
    if (!alvo) { setGaveta(null); return }
    setEscolhido(alvo.id)
    setDirRecolhido(false)
    setGaveta(null)
    if (!campo) return
    setTimeout(() => {
      document.getElementById('celula-campo-' + campo)?.focus()
    }, 90)
  }, [nos, nomeDaCelula])

  const responder = useCallback((unidade, campoAlvo) => {
    const alvo = nos.find(n => chave(n.servico) === chave(unidade.servico))
    if (!alvo) return
    setEscolhido(alvo.id)
    setDirRecolhido(false)
    if (campoAlvo) setTimeout(() => {
      document.getElementById('celula-campo-' + campoAlvo)?.focus()
    }, 90)
  }, [nos])

  /* ── comando ────────────────────────────────────────────────────────── */

  /* A área do comando é a célula em foco quando há uma, e a árvore inteira
     quando não há. O filtro de prod/ vale para o desenho nascido AQUI, que roda
     no perfil local; projeto aberto de árvore real traz o próprio comando, e
     ele vence. */
  const area = useMemo(() => {
    const vivos = Object.keys(arquivosGerados)
      .filter(c => c.startsWith('live/') && !/\/prod\//.test(c)).sort()
    if (!vivos.length) return ''
    if (unidadeEscolhida) {
      const alvo = vivos.find(c => c.includes('/' + unidadeEscolhida.nome + '/'))
      if (alvo) return alvo.replace(/\/terragrunt\.hcl$/, '')
    }
    return 'live'
  }, [arquivosGerados, unidadeEscolhida])

  const comando = comandoProjeto || (area ? `./bioma.sh --perfil ${PERFIL} --area ${area}` : '')


  /* ── as ações que tocam o servidor ──────────────────────────────────── */

  const rodarPreVoo = useCallback(async () => {
    if (!resultado?.pasta) {
      return { checagens: [], bloqueio: true, por_que: t('tela.semArvore') }
    }
    try {
      const r = await fetch('/pre-voo', {
        method: 'POST', body: JSON.stringify({ pasta: resultado.pasta }),
      })
      const d = await r.json()
      setPreVoo(d)
      return d
    } catch (e) {
      const d = { checagens: [], bloqueio: true, por_que: t('tela.servidor', { erro: e.message }) }
      setPreVoo(d)
      return d
    }
  }, [resultado])

  const rodar = useCallback(async (acao) => {
    if (!area) return null
    setOcupado(true)
    setBloqueio(null)
    setAba('saida')
    setAberto(SAIDA)
    setSaida('-- ' + acao + ' · ' + area + '\n…')
    setGaveta('codigo')
    try {
      const r = await fetch('/rodar', {
        method: 'POST',
        body: JSON.stringify({
          perfil: PERFIL, acao, area, janela, pasta: resultado?.pasta || '', tempo: 900,
        }),
      })
      const d = await r.json()
      setSaida([d.comando && '$ ' + d.comando, d.erro && '! ' + d.erro, d.saida,
        d.codigo != null && '\n(código de saída: ' + d.codigo + ')']
        .filter(Boolean).join('\n'))
      return d
    } catch (e) {
      setSaida(t('tela.servidor', { erro: e.message }))
      return { erro: e.message }
    } finally {
      setOcupado(false)
    }
  }, [area, janela, resultado])

  /* A barra roda as verificações antes de cada ação e manda os motivos para
     `aoBloqueio`. Aqui é só a ação. */
  const provar = useCallback(() => rodar('plan'), [rodar])

  const receberBloqueio = useCallback((motivos) => {
    setBloqueio(motivos)
    abrirGaveta('pendencias')
  }, [abrirGaveta])


  /* ── levar a árvore para fora do bioma ──────────────────────────────── */

  const corpoDoGrafo = useCallback(() => ({
    grafo: {
      nos: nos.map(n => ({ servico: n.servico, papel: n.papel, zona: n.zona,
        multiplicidade: n.multiplicidade })),
      arestas: arestas.map(a => ({
        origem: nos.find(n => n.id === a.de)?.servico,
        destino: nos.find(n => n.id === a.para)?.servico,
        flui: a.flui, canal: a.canal, cruza: 'não',
      })).filter(a => a.origem && a.destino),
    },
  }), [nos, arestas])

  /* A revisão junta três vozes: os verificadores, o terraform e um revisor
     AWS. Ela roda contra a árvore já gerada; sem árvore, manda o desenho e o
     servidor gera antes. */
  const revisar = useCallback(async () => {
    setRevisando(true)
    abrirGaveta('revisao')
    try {
      const corpo = resultado?.pasta ? { pasta: resultado.pasta } : corpoDoGrafo()
      const r = await fetch('/revisar', { method: 'POST', body: JSON.stringify(corpo) })
      setRevisao(await r.json())
    } catch (e) {
      setRevisao({ itens: [], recado: t('tela.servidor', { erro: e.message }) })
    } finally {
      setRevisando(false)
    }
  }, [resultado, corpoDoGrafo, abrirGaveta, t])

  /* O link precisa estar no documento para o clique virar download, e o
     endereço do blob só some depois que o navegador terminou de gravar:
     revogar na linha seguinte cancela o arquivo pela metade. */
  const baixarZip = useCallback(async () => {
    setRecadoDestino(t('levar.montando'))
    try {
      const r = await fetch('/baixar', { method: 'POST', body: JSON.stringify(corpoDoGrafo()) })
      if (!r.ok) throw new Error('o servidor recusou: ' + r.status)
      const b = await r.blob()
      const u = URL.createObjectURL(b)
      const a = document.createElement('a')
      a.href = u
      a.download = 'bioma.zip'
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      setTimeout(() => { a.remove(); URL.revokeObjectURL(u) }, 4000)
      setRecadoDestino(t('levar.pronto'))
    } catch (e) {
      setRecadoDestino(e.message)
    }
  }, [corpoDoGrafo])

  const gravarNaPasta = useCallback(async () => {
    setRecadoDestino(t('levar.gravando'))
    const r = await fetch('/materializar', {
      method: 'POST',
      body: JSON.stringify({ ...corpoDoGrafo(), destino }),
    })
    const d = await r.json()
    setRecadoDestino(d.erro ? d.erro : t('levar.gravado', { quantos: d.quantos, destino: d.destino }))
  }, [corpoDoGrafo, destino])

  /* ── subir desenho de fora ──────────────────────────────────────────── */

  const [ultimoArquivo, setUltimoArquivo] = useState(null)

  const subir = async (arquivo, forcarVisao = false) => {
    if (!arquivo) return
    setUltimoArquivo(arquivo)
    setOcupado(true)
    try {
      const r = await fetch('/subir', {
        method: 'POST',
        headers: { 'X-Nome': arquivo.name, ...(forcarVisao ? { 'X-Forcar-Visao': '1' } : {}) },
        body: arquivo,
      })
      const d = await r.json()
      const naoLidos = d.nao_reconhecido || d.nao_lidos || []
      const explicacao = d.porque || d.explicacao || d.erro

      // o grafo manda: quando a leitura achou peças, elas entram no canvas,
      // e a imagem (quando veio) fica de referência ao lado, nunca no lugar
      if (d.lido && d.grafo?.nos?.length) {
        const lidos = d.grafo.nos.map((n, i) => ({
          ...n, id: n.id || 'subido-' + i, valores: n.valores || {},
        }))
        setNos(lidos)
        setAbertoProjeto(true)
        setArestas(d.grafo.arestas || [])
        setEscolhido(null)
        setReferencia((d.imagem || naoLidos.length || d.caminho_lido === 'especificacao-irma')
          ? { imagem: d.imagem, explicacao, nome: d.nome, naoLidos, caminho: d.caminho_lido }
          : null)
        if (!config?.sigla) setAssistente({ depois: null })
        return
      }
      // nada lido: a imagem entra como referência para desenhar por cima
      setReferencia({ imagem: d.imagem, explicacao, nome: d.nome, naoLidos, caminho: d.caminho_lido })
      if (!config?.sigla) setAssistente({ depois: null })
    } catch (e) {
      setReferencia({ explicacao: t('tela.servidor', { erro: e.message }) })
    } finally {
      setOcupado(false)
    }
  }

  /* Um desenho de exemplos/ sobe pela mesma rota de quem escolhe o arquivo à
     mão: o caminho de subir fica exercido, e não simulado. */
  const subirExemplo = useCallback(async (nome) => {
    try {
      const r = await fetch('/exemplo?nome=' + encodeURIComponent(nome))
      if (!r.ok) throw new Error('exemplo não existe: ' + nome)
      const texto = await r.text()
      await subir(new File([texto], nome))
    } catch (e) {
      setReferencia({ explicacao: e.message, nome })
    }
  }, [])

  /* O link decide o que a tela mostra ao abrir. `gaveta` existe para a prova
     visual: uma foto sem clique não consegue abrir gaveta nenhuma.

     O guarda existe porque este efeito depende de callbacks que a própria
     abertura recria: `abrirBio` grava contas e config, `abrirExemplo` depende
     das duas, o efeito roda de novo e reabre o arquivo. Com um .bio que carrega
     contas (que é o caso de todo projeto lido de árvore real) isso fechava o
     ciclo e a tela pedia o arquivo umas 130 vezes por segundo, sem nunca
     assentar: parecia que não tinha aberto. Ler a URL é ato de uma vez só. */
  const linkLido = useRef(false)
  useEffect(() => {
    if (linkLido.current) return
    linkLido.current = true
    const q = new URLSearchParams(location.search)
    const desenho = q.get('desenho')
    const projeto = q.get('projeto')
    /* `projeto` abre um .bio pelo caminho: é o que permite mandar um desenho
       salvo para alguém por link, e é como a prova visual chega num projeto
       que não é o exemplo. */
    if (projeto) abrirBio(projeto)
    else if (desenho) subirExemplo(desenho)
    else if (q.get('exemplo')) abrirExemplo()
    const pedida = q.get('gaveta')
    if (pedida) setGaveta(pedida)
  }, [abrirExemplo, subirExemplo, abrirBio])

  const [arrastandoArquivo, setArrastandoArquivo] = useState(false)

  /* ── o estado escrito no topo ───────────────────────────────────────── */

  const estado = gerando
    ? { texto: t('tela.estado.traduzindo'), tom: 'info' }
    : resultado?.erro
      ? { texto: t('tela.estado.parou'), tom: 'erro' }
      : nos.length
        ? {
          texto: t('tela.estado.resumo', { arquivos: Object.keys(arquivosGerados).length, pecas: nos.length }),
          tom: pendencias.length ? 'atencao' : 'bom',
        }
        : { texto: t('tela.estado.vazio') }

  const temArquivos = Object.keys(arquivos).length > 0

  return (
    <div className={'tela'
      + (esqRecolhido ? ' esq-fechado' : '')
      + (dirRecolhido ? ' dir-fechado' : '')
      + (arrastandoArquivo ? ' recebendo' : '')}
      onDragOver={e => { e.preventDefault(); setArrastandoArquivo(true) }}
      onDragLeave={e => { if (e.currentTarget === e.target) setArrastandoArquivo(false) }}
      onDrop={e => {
        e.preventDefault(); setArrastandoArquivo(false)
        const f = e.dataTransfer?.files?.[0]
        if (f) subir(f)
      }}>

      {ocupado && (
        <div className="veu-lendo">
          <div className="veu-caixa">
            <span className="veu-giro" aria-hidden />
            {t('tela.veu')}
          </div>
        </div>
      )}

      <Cabecalho
        prefixo={prefixo}
        projeto={projeto}
        aoAbrirConfig={() => abrirGaveta('config')}
        estado={estado}
        aoSalvar={salvarBio}
        recadoSalvo={recadoSalvo}
        aoContas={() => abrirGaveta('config')}
        aoProjeto={() => abrirGaveta('config')}
        aoAjuda={() => abrirAjuda(null)}
        aoLimpar={() => { setRecadoDestino(''); setPedido('limpeza') }}
        temDesenho={nos.length > 0}
      />

      <div className="trilho-esq">
        <PainelRecursos
          nos={nos}
          escolhido={escolhido}
          aoEscolher={escolher}
          recolhido={esqRecolhido}
          aoRecolher={setEsqRecolhido}
          aoAbrirPaleta={abrirPaleta}
        />
      </div>

      <main className="palco">
        <Canvas
          nos={nosDaPagina}
          arestas={arestasDaPagina}
          proposta={proposta}
          escolhido={escolhido}
          contas={contas}
          aoEscolher={escolher}
          aoMover={mover}
          aoLigar={ligar}
          aoMudarConta={mudarConta}
          aoTirarAresta={(indice, de, para) => setATirar({ indice, de, para })}
          aoAjuda={abrirAjuda}
          zoom={zoom}
          aoZoom={setZoom}
          pan={pan}
          aoPan={setPan}
        />

        {fasesDoDesenho.length > 0 && (
          <div className="paginas" role="tablist">
            <button role="tab" aria-selected={pagina === 'tudo'}
              className={pagina === 'tudo' ? 'pagina ativa' : 'pagina'}
              onClick={() => setPagina('tudo')}>{t('paginas.tudo')}</button>
            {fasesDoDesenho.map(f => (
              <button key={f} role="tab" aria-selected={pagina === f}
                className={pagina === f ? 'pagina ativa' : 'pagina'}
                onClick={() => setPagina(f)}>{t('paginas.fase')} {f}</button>
            ))}
            {nos.some(n => n.fase == null) && (
              <button role="tab" aria-selected={pagina === 'adiadas'}
                className={pagina === 'adiadas' ? 'pagina ativa' : 'pagina'}
                onClick={() => setPagina('adiadas')}>{t('paginas.adiadas')}</button>
            )}
          </div>
        )}

        {!nos.length && aberto_projeto && (
          <div className="canvas-vazio">
            <h3>{t('canvas.vazio.titulo')}</h3>
            <p>{t('canvas.vazio.corpo')}</p>
            <Button size="sm" variant="secondary" onClick={abrirPaleta}>{t('pr.buscar')}</Button>
          </div>
        )}

        {!nos.length && !aberto_projeto && (
          <div className="convite">
            <div className="convite-marca">
              <span className="convite-logo" aria-hidden>{'{ }'}</span>
              <div>
                <h2>bioma.sh</h2>
                <p className="convite-sub">Beta · <button className="link"
                  onClick={() => abrirGaveta('config')}>{t('cab.config')}</button></p>
              </div>
            </div>
            <div className="portas">
              <button className="porta" onClick={() => pelaPorta('importar')}>
                <b>{t('inicio.importar')}</b>
                <span>{t('inicio.importar.desc')}</span>
                <em>md · html · png · bio</em>
              </button>
              <button className="porta" onClick={abrirExemplo}>
                <b>{t('inicio.exemplo')}</b>
                <span>{t('inicio.exemplo.desc')}</span>
                <em>6 × aws</em>
              </button>
              <button className="porta" onClick={() => pelaPorta('paleta')}>
                <b>{t('inicio.zero')}</b>
                <span>{t('inicio.zero.desc')}</span>
                <em>{t('inicio.atalho')}</em>
              </button>
            </div>
            {recentes.length > 0 && (
              <div className="recentes">
                <p className="recentes-titulo">{t('inicio.recentes')}</p>
                {recentes.slice(0, 5).map(r => (
                  <button key={r.caminho} className="recente" onClick={() => abrirBio(r.caminho)}>
                    <b>{r.organizacao ? r.organizacao + '/' + r.nome : r.nome}</b>
                    <code>{r.caminho}</code>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}


        {temArquivos && (
          <button type="button" className="levar-abre"
            title={t('tela.levar.rotulo')}
            onClick={() => { setRecadoDestino(''); setPedido('levar') }}>{t('tela.levar')}</button>
        )}

        {referencia && (
          <div className="referencia">
            <div className="referencia-topo">
              <b>{referencia.nome || t('tela.referencia.subido')}</b>
              <Button size="sm" variant="ghost" onClick={() => setReferencia(null)}>{t('levar.fechar')}</Button>
            </div>
            {referencia.imagem && <img src={referencia.imagem} alt="desenho subido para conferência" />}
            <p>{referencia.explicacao}</p>
            {referencia.caminho === 'especificacao-irma' && ultimoArquivo && (
              <Button size="sm" variant="outlined"
                onClick={() => { setReferencia(null); subir(ultimoArquivo, true) }}>
                {t('visao.forcar')}
              </Button>
            )}
            {referencia.naoLidos?.length > 0 && (
              <ul>{referencia.naoLidos.map((x, i) => <li key={i}>{x.nome} · {x.por_que}</li>)}</ul>
            )}
          </div>
        )}

        {resultado?.erro && (
          <div className="palco-erro">
            <b>{t('tela.erro.parou')}</b>
            <span>{resultado.erro}</span>
          </div>
        )}
      </main>

      <aside className="trilho-dir">
        <PainelDecisoes
          gerando={gerando}
          unidades={proposta?.unidades || []}
          relacoes={proposta?.relacoes || []}
          aoResponder={responder}
          aoSelecionar={(u) => responder(u)}
          recolhido={dirRecolhido}
          aoRecolher={setDirRecolhido}
          aoAjuda={abrirAjuda}
          no={noEscolhido}
          unidade={unidadeEscolhida}
          campos={campos}
          aoMudar={mudarCelula}
          validacao={validacao}
          contas={contas}
          aoCadastrarConta={() => abrirGaveta('config')}
          aoMudarPapel={(v) => setNos(vs => vs.map(n =>
            n.id === noEscolhido?.id ? { ...n, papel: v } : n))}
          aoExcluir={() => setPedido('excluir')}
        />
      </aside>

      <BarraComando
        aoAjuda={(v) => { setVerbete(v); abrirGaveta('ajuda') }}
        comando={comando}
        pendencias={noRelatorio}
        ocupado={ocupado}
        pasta={resultado?.pasta || ''}
        aoPreVoo={rodarPreVoo}
        aoProvar={provar}
        aoReceita={() => abrirGaveta('receita')}
        aoBloqueio={receberBloqueio}
        aoVerCodigo={() => abrirGaveta('codigo')}
        aoVerPendencias={() => abrirGaveta('pendencias')}
        aoRevisar={revisar}
        revisando={revisando}
      />

      {/* ── as quatro gavetas, uma de cada vez ──────────────────────────── */}

      <GavetaCodigo
        aberta={gaveta === 'codigo'}
        arquivos={arquivos}
        aberto={aberto}
        aoAbrir={setAberto}
        aba={aba}
        aoTrocarAba={setAba}
        aoFechar={fecharGaveta}
        aoAjuda={abrirAjuda}
        aoResponder={(caminho) => {
          // o arquivo diz a célula: a pendência daquela célula abre com foco
          const pend = pendencias.find(q => caminho.includes('/' + (q.celula || '') + '/'))
          fecharGaveta()
          if (pend) corrigir(pend.celula, pend.campo)
          else abrirGaveta('pendencias')
        }}
      />

      <GavetaConfig
        aoAssistente={() => { fecharGaveta(); setAssistente({ depois: null }) }}
        aberta={gaveta === 'config'}
        config={config}
        contas={contas}
        pecas={nos}
        aoSalvarConfig={salvarConfig}
        aoSalvarContas={salvarContas}
        aoAplicarPadroes={() => { aplicarPadroes(); fecharGaveta() }}
        aoFechar={fecharGaveta}
      />

      <GavetaPendencias
        aberta={gaveta === 'pendencias'}
        pendencias={noRelatorio}
        aoCorrigir={corrigir}
        aoResponderValor={responderValor}
        aoFechar={fecharGaveta}
      />

      <GavetaAjuda
        aberta={gaveta === 'ajuda'}
        verbete={verbete}
        aoFechar={fecharGaveta}
        aoAcao={(id) => {
          /* a ajuda termina em ação: cada id abre o lugar que resolve */
          if (id === 'abrirDesenho') entradaRef.current?.click()
          else if (id === 'abrirPaleta') abrirPaleta()
          else if (id === 'abrirExemplo') abrirExemplo()
          else if (id === 'abrirConfig') abrirGaveta('config')
          else if (id === 'verCodigo') abrirGaveta('codigo')
          else if (id === 'verPendencias') abrirGaveta('pendencias')
          else if (id === 'verDecisoes' || id === 'verLigacoes') setDirRecolhido(false)
          else if (id === 'simular') provar()
          else if (id === 'copiarComando' && comando) navigator.clipboard?.writeText(comando)
        }}
      />

      <Assistente
        aberta={!!assistente}
        config={config}
        aoPular={() => { const d = assistente?.depois; setAssistente(null); seguirDepois(d) }}
        aoConcluir={async (dados) => {
          const d = assistente?.depois
          setAssistente(null)
          if (dados.prefixo) { setPrefixo(dados.prefixo); guarda(GUARDA_PREFIXO, dados.prefixo) }
          if (dados.nome) setProjeto(dados.nome)
          await salvarConfig({ ...(config || {}), ...dados.config })
          if (dados.contas?.length) await salvarContas(dados.contas)
          seguirDepois(d)
        }}
      />

      <GavetaReceita
        aberta={gaveta === 'receita'}
        comando={comando}
        permanentes={(proposta?.unidades || [])
          .filter(u => u.durabilidade === 'permanente')
          .map(u => u.nome)}
        aoFechar={fecharGaveta}
      />

      <GavetaRevisao
        aberta={gaveta === 'revisao'}
        revisao={revisao}
        ocupado={revisando}
        aoRevisar={revisar}
        aoFechar={fecharGaveta}
      />

      <SeletorPasta
        aberto={pedindoPasta}
        inicial={config?.pasta || ''}
        aoFechar={() => setPedindoPasta(false)}
        aoEscolher={async (caminho) => {
          setPedindoPasta(false)
          const v = await salvarConfig({ ...(config || {}), pasta: caminho })
          if (v?.erro) { setRecadoSalvo(v.erro); return }
          salvarBio()
        }}
      />

      <Paleta
        aberta={paleta}
        aoAbrir={() => setGaveta(null)}
        aoFechar={() => setPaleta(false)}
        aoEscolher={acrescentar}
      />

      {/* ── o que precisa de resposta antes de acontecer ────────────────── */}

      {aTirar && (
        <div className="aviso-fundo" onClick={() => setATirar(null)}>
          <div className="aviso" onClick={e => e.stopPropagation()}>
            <h3>{t('canvas.seta.titulo')}</h3>
            <p>{t('canvas.seta.corpo', { de: aTirar.de, para: aTirar.para })}</p>
            <div className="aviso-botoes">
              <Button variant="ghost" onClick={() => setATirar(null)}>{t('comum.cancelar')}</Button>
              <Button className="perigo" onClick={tirarAresta}>{t('excluir.confirmar')}</Button>
            </div>
          </div>
        </div>
      )}

      {pedido === 'excluir' && noEscolhido && (
        <div className="aviso-fundo" onClick={() => setPedido(null)}>
          <div className="aviso" onClick={e => e.stopPropagation()}>
            <h3>{t('excluir.titulo', { nome: noEscolhido.valores?.nome || noEscolhido.servico || noEscolhido.tipo })}</h3>
            <p>{t('excluir.corpo')}</p>
            <div className="aviso-botoes">
              <Button variant="ghost" onClick={() => setPedido(null)}>{t('comum.cancelar')}</Button>
              <Button className="perigo" onClick={() => { setPedido(null); remover() }}>{t('excluir.confirmar')}</Button>
            </div>
          </div>
        </div>
      )}

      {pedido === 'limpeza' && (
        <div className="aviso-fundo" onClick={() => setPedido(null)}>
          <div className="aviso" onClick={e => e.stopPropagation()}>
            <h3>{t('limpeza.titulo')}</h3>
            <p>{t('limpeza.corpo', { pecas: nos.length, setas: arestas.length })}</p>
            {recadoDestino && <code className="aviso-recado">{recadoDestino}</code>}
            <div className="aviso-botoes">
              <Button variant="ghost" onClick={() => setPedido(null)}>{t('limpeza.ficar')}</Button>
              <Button onClick={baixarZip}>{t('limpeza.baixar')}</Button>
              <Button className="perigo" onClick={zerar}>{t('limpeza.apagar')}</Button>
            </div>
          </div>
        </div>
      )}

      {pedido === 'levar' && (
        <div className="aviso-fundo" onClick={() => setPedido(null)}>
          <div className="aviso" onClick={e => e.stopPropagation()}>
            <h3>{t('levar.titulo')}</h3>
            <p>{t('levar.corpo')}</p>
            <Input className="aviso-campo" placeholder={t('levar.placeholder')} value={destino}
              aria-label={t('levar.pasta.aria')}
              onChange={e => setDestino(e.target.value)} />
            {recadoDestino && <code className="aviso-recado">{recadoDestino}</code>}
            <div className="aviso-botoes">
              <Button variant="ghost" onClick={() => setPedido(null)}>{t('levar.fechar')}</Button>
              <Button variant="outlined" onClick={baixarZip}>{t('levar.zip')}</Button>
              <Button disabled={!destino.trim()} onClick={gravarNaPasta}>{t('levar.gravar')}</Button>
            </div>
          </div>
        </div>
      )}

      {arrastandoArquivo && <div className="alvo-arquivo">{t('tela.solte')}</div>}

      <input ref={entradaRef} className="entrada-arquivo" type="file"
        accept=".md,.drawio,.xml,.png,.jpg,.jpeg,.svg"
        onChange={e => { subir(e.target.files?.[0]); e.target.value = '' }} />
    </div>
  )
}

export default Tela
