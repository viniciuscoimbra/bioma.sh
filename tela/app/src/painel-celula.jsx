import React, { useMemo, useState } from 'react'
import { Badge, Callout, Chip, Input, Segmented, Select, Tooltip } from '@refy/ui'
import { camposBase } from './partes.jsx'
import { useT } from './i18n.jsx'
import './painel-celula.css'

/* O painel da célula em foco. Formulário com nome, conta, região, durabilidade
   e os campos que a receita exige. Cada campo é avaliado a cada tecla: verde
   quando o valor entra, âmbar quando não entra, dizendo o que se aceita.

   As regras de formato saem do perguntas.json que o gerador escreve: cada
   entrada traz pergunta, exemplo, formato (uma expressão regular), o que se
   aceita em português e o que dói se o valor estiver errado. */

const REGIOES = [
  'sa-east-1', 'us-east-1', 'us-east-2', 'us-west-2',
  'eu-west-1', 'eu-central-1', 'ap-southeast-1',
]


/* Expressão regular do provider pode vir quebrada. Padrão que não compila
   aceita qualquer coisa: barrar por causa do nosso erro seria pior. */
function compilar(formato) {
  if (!formato) return null
  try {
    return new RegExp(formato)
  } catch {
    return null
  }
}

/* O gerador escreve uma lista. Quem compõe a tela pode entregar um mapa por
   nome. As duas formas entram. */
function normalizar(campos) {
  if (Array.isArray(campos)) return campos.filter(Boolean)
  if (campos && typeof campos === 'object') {
    return Object.entries(campos).map(([nome, c]) => ({ nome, ...(c || {}) }))
  }
  return []
}

function Certo() {
  return (
    <svg className="celula-marca-ok" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3.5 8.4 6.4 11.3 12.5 5.2" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Espera() {
  return (
    <svg className="celula-marca-espera" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="5.6" fill="none" stroke="currentColor" strokeWidth="1.6"
        strokeDasharray="2.6 2.4" />
    </svg>
  )
}

export function PainelCelula({
  no, unidade, campos = [], aoMudar, validacao = {},
  contas = [], aoCadastrarConta, aoMudarPapel, aoExcluir,
}) {
  const { t } = useT()
  const daReceita = useMemo(() => normalizar(campos), [campos])
  const CAMPOS_BASE = useMemo(() => camposBase(t), [t])
  const [listaAberta, setListaAberta] = useState(false)
  const DURABILIDADES = [
    { value: 'permanente', label: t('canvas.tecido.permanente') },
    { value: 'estavel', label: t('canvas.tecido.estavel') },
    { value: 'efemera', label: t('canvas.tecido.efemera') },
  ]
  const rotuloTecido = (v) => t('canvas.tecido.' + v)

  const valorDe = (nome) => {
    const guardado = no?.valores?.[nome]
    if (guardado !== undefined && guardado !== null) return String(guardado)
    const direto = no?.[nome]
    return direto === undefined || direto === null ? '' : String(direto)
  }

  /* Quem compõe a tela pode avaliar por fora. Onde avaliou, a palavra é dela;
     onde não avaliou, vale o formato da pergunta. A escolha é por campo. */
  const estadoDe = (campo) => {
    const valor = valorDe(campo.nome)
    const vindo = validacao?.[campo.nome]
    if (vindo && typeof vindo.ok === 'boolean') {
      return { ok: vindo.ok, vazio: !valor, mensagem: vindo.mensagem || '' }
    }
    if (!valor.trim()) return { ok: false, vazio: true, mensagem: '' }
    const regra = compilar(campo.formato)
    if (!regra || regra.test(valor)) return { ok: true, vazio: false, mensagem: '' }
    return { ok: false, vazio: false, mensagem: t('celula.aceita', { formato: campo.explica || t('celula.outroFormato') }) }
  }

  const fronteira = unidade?.tipo === 'fronteira'
  const decidida = unidade?.durabilidade || null
  const durabilidade = valorDe('durabilidade') || decidida || ''
  const mudouTecido = Boolean(decidida && durabilidade && durabilidade !== decidida)

  const todos = useMemo(
    () => [...CAMPOS_BASE, ...daReceita.filter(c => c && c.nome && !CAMPOS_BASE.some(b => b.nome === c.nome))],
    [daReceita],
  )

  /* O resumo sai da mesma função que marca cada campo, e é recalculado a cada
     render: seis expressões regulares custam nada, e memória em cache aqui
     deixaria o pé discordando das marcas quando o pai muda valor no lugar. */
  const estados = todos.map(c => ({ campo: c, estado: estadoDe(c) }))
  /* Campo com default na receita não é pergunta esperando resposta: o
     framework herda o valor, e cobrá-lo faz uma árvore inteira em produção
     abrir com mil pendências cuja resposta já existe. Ele continua editável e
     continua contando como recusado se alguém escrever formato errado. */
  const resolvidoPelaArvore = (nome) =>
    Array.isArray(no?.derivados) && no.derivados.includes(nome)
  const cobravel = (e) => e.campo.obrigatoria !== false && !resolvidoPelaArvore(e.campo.nome)
  const resumo = {
    total: estados.length,
    aceitos: estados.filter(e => e.estado.ok).length,
    recusados: estados.filter(e => !e.estado.ok && !e.estado.vazio).map(e => e.campo.nome),
    esperando: estados.filter(e => e.estado.vazio && cobravel(e)).map(e => e.campo.nome),
  }

  const faltando = [...resumo.recusados, ...resumo.esperando]
  const idDoCampo = (nome) => 'celula-campo-' + nome

  /* A ficha fica longa. O nome recusado no pé leva até o campo dele. */
  const irPara = (nome) => {
    const alvo = document.getElementById(idDoCampo(nome))
    if (!alvo) return
    alvo.scrollIntoView({ block: 'center' })
    alvo.focus()
  }

  if (!no) {
    return (
      <div className="celula celula-vazia">
        <p className="celula-rotulo">{t('celula.rotulo')}</p>
        <p className="celula-nada">{t('trilho.peca.vazia')}</p>
      </div>
    )
  }

  const campo = (c, opcoes) => {
    const estado = estadoDe(c)
    const valor = valorDe(c.nome)
    const classe = 'celula-campo' +
      (estado.ok ? ' aceito' : '') +
      (!estado.ok && !estado.vazio ? ' recusado' : '') +
      (estado.vazio ? ' esperando' : '') +
      (opcoes?.mono ? ' mono' : '')
    return (
      <div key={c.nome} className={classe}>
        <div className="celula-cabeca">
          <span className="celula-pergunta">{c.pergunta || c.nome}</span>
          {estado.ok ? <Certo /> : <Espera />}
          {c.erra && (
            <Tooltip label={t('celula.doi')} description={c.erra} side="left" portalled>
              <button type="button" className="celula-porque" aria-label={t('celula.doi.aria', { campo: c.nome })}>?</button>
            </Tooltip>
          )}
        </div>
        {opcoes?.controle || (
          <Input
            block
            id={idDoCampo(c.nome)}
            value={valor}
            placeholder={c.exemplo || ''}
            spellCheck={false}
            autoComplete="off"
            onChange={e => aoMudar?.(c.nome, e.target.value)}
          />
        )}
        {/* Sugestão de preenchimento, quando o campo tem prática consagrada.
            Ela não é exemplo decorativo: cada uma vem de uma RFC ou de uma
            regra da AWS, e o `por_que` diz qual, para quem preenche não
            precisar acreditar. Clicar preenche; o valor continua editável. */}
        {c.sugestoes?.length > 0 && !valor && (
          <div className="celula-sugestoes">
            {c.sugestoes.map(s => (
              <button
                key={s}
                type="button"
                className="celula-sugestao"
                title={c.por_que || ''}
                onClick={() => aoMudar?.(c.nome, s)}
              >{s}</button>
            ))}
            {c.por_que && <span className="celula-sugestao-fonte">{c.por_que}</span>}
          </div>
        )}
        {opcoes?.argumento && <code className="celula-argumento">{c.nome}</code>}
        {estado.mensagem
          ? <p className="celula-recusa">{estado.mensagem}{c.exemplo ? ' · ' + t('celula.exemploDica', { exemplo: c.exemplo }) : ''}</p>
          : c.explica && <p className="celula-dica">{c.explica}</p>}
      </div>
    )
  }

  const regiao = valorDe('regiao')
  const listaRegioes = REGIOES.includes(regiao) || !regiao ? REGIOES : [regiao, ...REGIOES]

  return (
    <div className="celula">
      <header className="celula-topo">
        <img className="celula-icone" src={'/icone?tipo=' + no.tipo} alt=""
          onError={e => { e.currentTarget.style.display = 'none' }} />
        <div className="celula-quem">
          <code>{no.tipo}</code>
          <span>{unidade?.nome || no.servico || t('celula.semNome')}</span>
        </div>
        {aoExcluir && (
          <button type="button" className="celula-excluir" title={t('peca.excluir')}
            aria-label={t('peca.excluir')} onClick={aoExcluir}>
            <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
              <path d="M3 4.6h10 M6.4 4.6V3.2h3.2v1.4 M4.4 4.6l.6 8.2h6l.6-8.2"
                fill="none" stroke="currentColor" strokeWidth="1.4"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        {fronteira ? <Badge tone="neutral">{t('celula.fronteira')}</Badge>
          : durabilidade
            ? <Badge dot tone={durabilidade === 'permanente' ? 'danger' : durabilidade === 'estavel' ? 'warn' : 'success'}>
              {rotuloTecido(durabilidade)}
            </Badge>
            : <Badge tone="neutral">{t('celula.tecidoPorDecidir')}</Badge>}
      </header>

      <div className="celula-corpo">
        <p className="celula-rotulo">{t('celula.rotulo')}</p>
        {aoMudarPapel && (
          <div className="celula-campo">
            <div className="celula-cabeca">
              <span className="celula-pergunta">{t('peca.papel.rotulo')}</span>
            </div>
            <Input block placeholder={t('peca.papel.placeholder')} value={no.papel || ''}
              onChange={e => aoMudarPapel(e.target.value)} />
            <p className="celula-dica">{t('peca.papel.dica')}</p>
          </div>
        )}
        {campo(CAMPOS_BASE[0], { mono: true })}
        {campo(CAMPOS_BASE[1], {
          mono: true,
          controle: contas.length ? (
            <Select block id={idDoCampo('conta')} value={valorDe('conta')}
              onChange={e => aoMudar?.('conta', e.target.value)}>
              <option value="">{t('celula.conta.escolha')}</option>
              {contas.map(c => (
                <option key={c.numero} value={c.numero}>
                  {c.apelido} ({c.numero})
                </option>
              ))}
            </Select>
          ) : (
            <button type="button" className="celula-cadastrar" onClick={aoCadastrarConta}>
              {t('celula.conta.cadastrar')}
            </button>
          ),
        })}
        {campo(CAMPOS_BASE[2], {
          mono: true,
          controle: (
            <Select block id={idDoCampo('regiao')} value={regiao}
              onChange={e => aoMudar?.('regiao', e.target.value)}>
              <option value="">{t('celula.escolhaRegiao')}</option>
              {listaRegioes.map(r => <option key={r} value={r}>{r}</option>)}
            </Select>
          ),
        })}

        <div className="celula-divisa" />

        <p className="celula-rotulo">{t('celula.tecido.rotulo')}</p>
        {fronteira ? (
          <Callout tone="note" title={t('celula.foraNossa')}>
            {unidade?.por_que_esse_tipo || t('celula.foraNossa.texto')}
          </Callout>
        ) : (
          <>
            <Segmented
              label={t('celula.durabilidade')}
              options={DURABILIDADES}
              value={durabilidade}
              onChange={v => aoMudar?.('durabilidade', v)}
            />
            {decidida ? (
              <div className="celula-razao">
                <b>{t('celula.decidiu', { v: rotuloTecido(decidida) })}</b>
                {unidade?.por_que_durabilidade ? ' · ' + unidade.por_que_durabilidade : ''}
              </div>
            ) : (
              <div className="celula-razao pendente">
                <b>{t('celula.naoDecidiu.titulo')}</b> · {t('celula.naoDecidiu.texto')}
              </div>
            )}
            {mudouTecido && (
              <div className="celula-alerta">
                {t('celula.trocou', { v: rotuloTecido(durabilidade) })}
              </div>
            )}
            {unidade?.confirmar && !mudouTecido && (
              <div className="celula-alerta">{unidade.confirmar}</div>
            )}
          </>
        )}

        <div className="celula-divisa" />

        <p className="celula-rotulo">
          {t('celula.receita')}
          {daReceita.length > 0 && <span className="celula-conta">{daReceita.length}</span>}
        </p>
        {daReceita.length === 0 ? (
          <p className="celula-nada">{t('celula.receita.vazia')}</p>
        ) : daReceita.map(c => campo(c, { mono: true, argumento: true }))}
      </div>

      {/* O pé é uma linha só: a contagem e um botão. A lista do que falta
          abre por cima do corpo, e não empurra a ficha para fora da tela. */}
      <footer className="celula-pe">
        <Badge tone={resumo.aceitos === resumo.total ? 'success' : 'warn'} dot>
          {t('celula.aceitos', { a: resumo.aceitos, t: resumo.total })}
        </Badge>
        {faltando.length > 0 ? (
          <button type="button" className="celula-faltam" aria-expanded={listaAberta}
            onClick={() => setListaAberta(v => !v)}>
            {t('celula.oQueFalta', { n: faltando.length })}
          </button>
        ) : (
          <span className="celula-esperando">{t('celula.passa')}</span>
        )}

        {listaAberta && faltando.length > 0 && (
          <div className="celula-lista" role="dialog" aria-label={t('celula.oQueFalta', { n: faltando.length })}>
            {resumo.recusados.length > 0 && <p className="celula-lista-rotulo">{t('celula.foraFormato')}</p>}
            {resumo.recusados.map(n => (
              <button key={n} className="celula-lista-item recusado"
                onClick={() => { setListaAberta(false); irPara(n) }}>{n}</button>
            ))}
            {resumo.esperando.length > 0 && <p className="celula-lista-rotulo">{t('celula.semResposta')}</p>}
            {resumo.esperando.map(n => (
              <button key={n} className="celula-lista-item"
                onClick={() => { setListaAberta(false); irPara(n) }}>{n}</button>
            ))}
          </div>
        )}
      </footer>
    </div>
  )
}

export default PainelCelula
