import React, { useEffect, useMemo, useState } from 'react'
import { Button, Input, Select, Callout, Chip, Tabs, Badge } from '@refy/ui'
import { useT } from './i18n.jsx'
import './gaveta-config.css'

/* Configurações: o que vale para o projeto inteiro, num lugar só.

   Três abas, na ordem de preenchimento: o projeto diz quem ele é, os domínios
   dão a estrutura, e as contas moram nos domínios. Cada peça nova nasce
   respondida por eles.

   O domínio é uma árvore, não uma lista: filho aninha sob o pai e vira
   subpasta na estrutura gerada (modelo em docs/dominios-e-contas.md). No
   armazenamento cada domínio é um caminho ("Plataforma > Redes"); a árvore é
   como a tela lê esse caminho.

   { aberta, config, contas, aoSalvarConfig, aoSalvarContas, aoAplicarPadroes, aoFechar }
 */

/* ── a árvore dos domínios, lida dos caminhos ───────────────────────── */

function partesDe(rotulo) {
  return String(rotulo || '').split('>').map(p => p.trim()).filter(Boolean)
}

/* Cada área vira um nó; pais que só existem implícitos (o "Plataforma" de
   "Plataforma > Redes") também aparecem, sem botão de tirar. */
function arvoreDe(areas) {
  const nos = new Map()
  for (const a of areas) {
    const partes = partesDe(a.rotulo || a.valor)
    let caminho = ''
    partes.forEach((p, i) => {
      const pai = caminho
      caminho = caminho ? caminho + ' > ' + p : p
      if (!nos.has(caminho)) {
        nos.set(caminho, { caminho, nome: p, pai, nivel: i, area: null, filhos: [] })
      }
    })
    const no = nos.get(partes.join(' > '))
    if (no) no.area = a
  }
  for (const no of nos.values()) {
    if (no.pai && nos.has(no.pai)) nos.get(no.pai).filhos.push(no)
  }
  const raizes = [...nos.values()].filter(n => !n.pai)
  const plano = []
  const desce = (n) => {
    plano.push(n)
    n.filhos.sort((a, b) => a.nome.localeCompare(b.nome)).forEach(desce)
  }
  raizes.sort((a, b) => a.nome.localeCompare(b.nome)).forEach(desce)
  return plano
}

export function GavetaConfig({
  aberta, config, contas = [], pecas = [], aoSalvarConfig, aoSalvarContas,
  aoAplicarPadroes, aoFechar, aoAssistente,
}) {
  const { t } = useT()
  const [aba, setAba] = useState('projeto')
  const [d, setD] = useState(config || {})
  const [erro, setErro] = useState('')
  const [recado, setRecado] = useState('')
  const [salvando, setSalvando] = useState(false)

  /* O `d` acompanha o config só na abertura. Acompanhar toda mudança apagava
     o recado no instante em que o salvar dava certo: o config novo chegava e
     este efeito zerava tudo, e o clique parecia não fazer nada. */
  useEffect(() => {
    if (aberta) { setD(config || {}); setErro(''); setRecado('') }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberta])
  useEffect(() => {
    if (!aberta) return
    const esc = e => { if (e.key === 'Escape') aoFechar() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [aberta, aoFechar])

  if (!aberta) return null

  const muda = (campo, valor) => setD(v => ({ ...v, [campo]: valor }))

  const guardar = async () => {
    setErro(''); setSalvando(true); setRecado('')
    const v = await aoSalvarConfig(d)
    setSalvando(false)
    if (v?.erro) { setErro(v.erro); return }
    setRecado(t('cfg.guardado'))
    setTimeout(() => aoFechar(), 650)
  }

  return (
    <div className="cfg-fundo" onClick={aoFechar}>
      <aside className="cfg" onClick={e => e.stopPropagation()}>
        <header className="cfg-topo">
          <h2>{t('cfg.titulo')}</h2>
          <span className="cfg-topo-acoes">
            {aoAssistente && (
              <button className="cfg-assistente" onClick={aoAssistente}>{t('wz.titulo')}</button>
            )}
            <button className="cfg-fecha" onClick={aoFechar} aria-label={t('comum.fechar')}>×</button>
          </span>
        </header>

        <div className="cfg-abas">
          <Tabs variant="underline" value={aba} onChange={setAba}
            items={[
              { id: 'projeto', label: t('cfg.aba.projeto') },
              { id: 'areas', label: t('cfg.aba.dominios'), badge: (d.areas || []).length || undefined },
              { id: 'contas', label: t('cfg.aba.contas'), badge: contas.length || undefined },
            ]} />
        </div>

        <div className="cfg-corpo">
          {aba === 'projeto' && <AbaProjeto d={d} muda={muda} t={t} />}
          {aba === 'contas' && (
            <AbaContas contas={contas} areas={d.areas || []} aoSalvar={aoSalvarContas} t={t} />
          )}
          {aba === 'areas' && (
            <AbaDominios d={d} muda={muda} contas={contas} pecas={pecas} t={t} />
          )}
          {erro && <Callout tone="danger" title={t('cfg.naoDeu')}>{erro}</Callout>}
        </div>

        <footer className="cfg-pe">
          {recado && <span className="cfg-recado">{recado}</span>}
          {aba !== 'contas' && (
            <>
              <Button variant="ghost" onClick={aoAplicarPadroes}>{t('cfg.aplicar')}</Button>
              <Button loading={salvando} loadingLabel={t('cfg.guardando')}
                onClick={guardar}>{recado || t('cfg.guardar')}</Button>
            </>
          )}
        </footer>
      </aside>
    </div>
  )
}

/* ── projeto: sigla, padrão do nome, pasta e regiões ─────────────────── */
function AbaProjeto({ d, muda, t }) {
  const exemplo = (d.padrao_nome || '{sigla}-{recurso}-{funcao}')
    .replace('{sigla}', (d.sigla || 'gf').toLowerCase())
    .replace('{recurso}', 's3-bucket')
    .replace('{funcao}', 'trilha-auditoria')

  return (
    <>
      <Callout tone="info" title={t('cfg.callout.titulo')}>
        {t('cfg.callout.corpo')}
      </Callout>

      <p className="cfg-rotulo">{t('cfg.sigla')}</p>
      <Input block placeholder="BIO" value={d.sigla || ''}
        onChange={e => muda('sigla', e.target.value)}
        hint={t('cfg.sigla.hint')} />

      <p className="cfg-rotulo">{t('cfg.padraoNome')}</p>
      <Input block value={d.padrao_nome || ''}
        onChange={e => muda('padrao_nome', e.target.value)}
        hint={t('cfg.padraoNome.hint')} />
      <p className="cfg-nota">{t('cfg.ficaAssim')} <code>{exemplo}</code></p>

      <p className="cfg-rotulo">{t('cfg.pasta')}</p>
      <SeletorDePasta valor={d.pasta || ''} aoEscolher={v => muda('pasta', v)} t={t} />

      <p className="cfg-rotulo">{t('cfg.regioes')}</p>
      <SeletorDeRegioes d={d} muda={muda} t={t} />
    </>
  )
}

/* ── o seletor de pasta, navegando no disco pelo servidor ───────────── */
function SeletorDePasta({ valor, aoEscolher, t }) {
  const [abrindo, setAbrindo] = useState(false)
  const [lugar, setLugar] = useState(null)

  const navegar = async (caminho) => {
    const r = await fetch('/pastas?caminho=' + encodeURIComponent(caminho || ''))
    setLugar(await r.json())
  }

  useEffect(() => { if (abrindo && !lugar) navegar(valor) }, [abrindo])

  return (
    <div className="cfg-pasta">
      <div className="cfg-pasta-linha">
        <Input block readOnly placeholder={t('cfg.pasta.nenhuma')} value={valor}
          hint={t('cfg.pasta.hint')} />
        <Button size="sm" variant="outlined" onClick={() => setAbrindo(v => !v)}>
          {abrindo ? t('cfg.fecharNav') : t('cfg.escolher')}
        </Button>
      </div>

      {abrindo && lugar && (
        <div className="cfg-navegador">
          <div className="cfg-nav-topo">
            <code>{lugar.caminho}</code>
            <Button size="sm" onClick={() => { aoEscolher(lugar.caminho); setAbrindo(false) }}>
              {t('cfg.usarEsta')}
            </Button>
          </div>
          <div className="cfg-nav-lista">
            {lugar.pai && (
              <button className="cfg-nav-item cfg-acima" onClick={() => navegar(lugar.pai)}>
                {t('cfg.subir')}
              </button>
            )}
            {lugar.pastas.length === 0 && <p className="cfg-nota">{t('cfg.semSub')}</p>}
            {lugar.pastas.map(f => (
              <button key={f.caminho} className="cfg-nav-item" onClick={() => navegar(f.caminho)}>
                {f.nome}/
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── as regiões, escolhidas de uma lista e não digitadas ────────────── */
function SeletorDeRegioes({ d, muda, t }) {
  const [busca, setBusca] = useState('')
  const todas = d.regioes_aws || []
  const escolhidas = d.regioes || []

  const achadas = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return todas.filter(r => !escolhidas.includes(r) && (!q || r.includes(q))).slice(0, 8)
  }, [busca, todas, escolhidas])

  const poe = (r) => { muda('regioes', [...escolhidas, r]); setBusca('') }
  const tira = (r) => {
    const resto = escolhidas.filter(x => x !== r)
    muda('regioes', resto)
    if (d.regiao_padrao === r) muda('regiao_padrao', resto[0] || '')
  }

  return (
    <div className="cfg-regioes">
      <div className="cfg-chips">
        {escolhidas.map(r => (
          <Chip key={r} selected={r === d.regiao_padrao}
            onClick={() => muda('regiao_padrao', r)}
            removable onRemove={() => tira(r)}>
            {r}{r === d.regiao_padrao ? ' · ' + t('cfg.padrao') : ''}
          </Chip>
        ))}
        {escolhidas.length === 0 && <p className="cfg-nota">{t('cfg.regiao.nenhuma')}</p>}
      </div>

      <Input block placeholder={t('cfg.regiao.busca')}
        value={busca} onChange={e => setBusca(e.target.value)} />
      {busca && (
        <div className="cfg-sugestoes">
          {achadas.map(r => (
            <button key={r} className="cfg-sugestao" onClick={() => poe(r)}>{r}</button>
          ))}
          {achadas.length === 0 && <p className="cfg-nota">{t('cfg.regiao.semTexto')}</p>}
        </div>
      )}
      <p className="cfg-nota">{t('cfg.regiao.nota')}</p>
    </div>
  )
}

/* ── os domínios, em árvore de verdade ─────────────────────────────── */
function AbaDominios({ d, muda, contas, pecas, t }) {
  const sugeridas = d.areas_sugeridas || {}
  const areas = d.areas || []
  const [novo, setNovo] = useState('')
  const [filhoDe, setFilhoDe] = useState('')   // caminho do pai do domínio novo
  const [aRemover, setARemover] = useState(null)

  const nos = useMemo(() => arvoreDe(areas), [areas])

  const contasNo = (no) => contas.filter(c =>
    c.area === no.area?.valor || partesDe(c.area).join(' > ') === no.caminho).length

  const pecasNo = (no) => (pecas || []).filter(p =>
    partesDe(p.zona).join(' > ') === no.caminho).length

  /* Domínio em uso não sai, e o motivo aparece no lugar do botão: apagar o
     domínio de uma conta deixaria a conta apontando para o vazio, e a peça no
     canvas perderia a pasta onde nasce. */
  const filhosDe = (no) => nos.filter(x => x.caminho.startsWith(no.caminho + ' > '))

  /* O uso do domínio soma o dele e o dos filhos numa contagem só: apagar o pai
     levaria a subárvore inteira, então o que trava é o total. */
  const emUso = (no) => {
    const todos = [no, ...filhosDe(no)]
    const c = todos.reduce((s, x) => s + contasNo(x), 0)
    const p = todos.reduce((s, x) => s + pecasNo(x), 0)
    const partes = []
    if (c) partes.push(t('cfg.dom.usoConta', { n: c }))
    if (p) partes.push(t('cfg.dom.usoPeca', { n: p }))
    return partes.join(' · ')
  }

  const usar = (chave) => muda('areas', (sugeridas[chave] || []).map(a => ({ ...a })))

  const pedirTirar = (no) => {
    const filhos = filhosDe(no)
    const travado = emUso(no)
    if (travado) return
    if (filhos.length) { setARemover({ no, filhos }); return }
    tirar(no)
  }

  const tirar = (no) => {
    muda('areas', areas.filter(a => {
      const caminho = partesDe(a.rotulo || a.valor).join(' > ')
      return caminho !== no.caminho && !caminho.startsWith(no.caminho + ' > ')
    }))
    setARemover(null)
  }

  const poe = () => {
    const nome = novo.trim()
    if (!nome) return
    const rotulo = filhoDe ? filhoDe + ' > ' + nome : nome
    const caminho = partesDe(rotulo).join(' > ')
    if (areas.some(a => partesDe(a.rotulo || a.valor).join(' > ') === caminho)) return
    muda('areas', [...areas, { valor: rotulo, rotulo }])
    setNovo('')
    setFilhoDe('')
  }

  return (
    <>
      <Callout tone="info" title={t('cfg.dom.callout.titulo')}>
        {t('cfg.dom.callout.corpo')}
      </Callout>

      <p className="cfg-rotulo">{t('cfg.dominios')}</p>
      <div className="cfg-arvore">
        {nos.map(no => {
          const quantas = contasNo(no)
          const travado = emUso(no)
          return (
            <div key={no.caminho} className="cfg-no" style={{ paddingLeft: 4 + no.nivel * 20 }}>
              {no.nivel > 0 && <span className="cfg-galho" aria-hidden>└</span>}
              <span className="cfg-no-nome">{no.nome}</span>
              {quantas > 0 && (
                <span className="cfg-no-contas">{t('cfg.dom.contas', { n: quantas })}</span>
              )}
              <span className="cfg-no-acoes">
                <button className="cfg-no-filho"
                  onClick={() => { setFilhoDe(no.caminho); setNovo('') }}>
                  {t('cfg.dom.filho')}
                </button>
                {no.area && (
                  travado ? (
                    <span className="cfg-no-travado" title={t('cfg.dom.travado', { onde: travado })}>
                      {travado}
                    </span>
                  ) : (
                    <button className="cfg-tirar" onClick={() => pedirTirar(no)}
                      aria-label={t('cfg.dom.tirar', { nome: no.caminho })}>×</button>
                  )
                )}
              </span>
            </div>
          )
        })}
        {nos.length === 0 && <p className="cfg-nota">{t('cfg.dom.nenhum')}</p>}
      </div>

      <div className="cfg-linha">
        <Input block
          placeholder={filhoDe ? t('cfg.dom.filhoDe', { pai: filhoDe }) : t('cfg.dom.placeholder')}
          value={novo}
          onChange={e => setNovo(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') poe() }} />
        {filhoDe && (
          <Chip removable onRemove={() => setFilhoDe('')}>{filhoDe} ›</Chip>
        )}
        <Button size="sm" variant="outlined" onClick={poe}>
          {filhoDe ? t('cfg.dom.filho') : t('cfg.dom.novo')}
        </Button>
      </div>

      {aRemover && (
        <div className="aviso-fundo" onClick={() => setARemover(null)}>
          <div className="aviso" onClick={e => e.stopPropagation()}>
            <h3>{t('cfg.dom.confirmar.titulo', { nome: aRemover.no.caminho })}</h3>
            <p>{t('cfg.dom.confirmar.filhos', {
              n: aRemover.filhos.length,
              lista: aRemover.filhos.map(f => f.nome).join(', '),
            })}</p>
            <p>{t('cfg.dom.confirmar.corpo')}</p>
            <div className="aviso-botoes">
              <Button variant="ghost" onClick={() => setARemover(null)}>{t('comum.cancelar')}</Button>
              <Button className="perigo" onClick={() => tirar(aRemover.no)}>{t('excluir.confirmar')}</Button>
            </div>
          </div>
        </div>
      )}

      <p className="cfg-rotulo">{t('cfg.conjunto')}</p>
      <div className="cfg-sugeridas">
        {['simples', 'plataforma', 'referencia'].map(chave => (
          <button key={chave} className="cfg-preset" onClick={() => usar(chave)}>
            <b>{t('cfg.preset.' + chave)}</b>
            <span>{t('cfg.preset.' + chave + '.desc')}</span>
          </button>
        ))}
      </div>
    </>
  )
}

/* ── contas: cada uma pertence a um domínio ─────────────────────────── */
function AbaContas({ contas, areas, aoSalvar, t }) {
  const [lista, setLista] = useState(contas)
  const [novo, setNovo] = useState({ apelido: '', numero: '', area: '' })
  const [erro, setErro] = useState('')

  useEffect(() => setLista(contas), [contas])

  const nos = useMemo(() => arvoreDe(areas), [areas])

  const nomeDoDominio = (valor) => {
    const alvo = partesDe(valor).join(' > ')
    const no = nos.find(n => n.caminho === alvo || n.area?.valor === valor)
    return no ? no.caminho : (valor || '')
  }

  const guardar = async (l) => {
    setErro('')
    const v = await aoSalvar(l)
    if (v?.erro) setErro(v.erro); else setLista(v)
  }

  const poe = () => {
    if (!/^[0-9]{12}$/.test(novo.numero.trim())) {
      setErro(t('cfg.conta.erroNumero'))
      return
    }
    if (!novo.apelido.trim()) { setErro(t('cfg.conta.erroApelido')); return }
    const l = [...lista, { ...novo, padrao: lista.length === 0 }]
    setNovo({ apelido: '', numero: '', area: '' })
    guardar(l)
  }

  return (
    <>
      <Callout tone="info" title={t('cfg.contas.callout.titulo')}>
        {t('cfg.contas.callout.corpo')}
      </Callout>

      <div className="cfg-contas">
        {lista.map(c => (
          <div key={c.numero} className="cfg-conta">
            <div className="cfg-conta-quem">
              <b>{c.apelido}</b>
              <code>{c.numero}</code>
            </div>
            <span className="cfg-conta-dominio">
              {nomeDoDominio(c.area) || t('cfg.conta.semDominio')}
            </span>
            <span className="cfg-conta-acoes">
              {c.padrao
                ? <Badge tone="success">{t('cfg.padrao')}</Badge>
                : <button className="cfg-tornar" onClick={() =>
                    guardar(lista.map(x => ({ ...x, padrao: x.numero === c.numero })))}>
                    {t('cfg.conta.tornarPadrao')}
                  </button>}
              <button className="cfg-tirar" onClick={() =>
                guardar(lista.filter(x => x.numero !== c.numero))}
                aria-label={t('cfg.conta.tirar', { nome: c.apelido })}>×</button>
            </span>
          </div>
        ))}
        {lista.length === 0 && <p className="cfg-nota">{t('cfg.conta.nenhuma')}</p>}
      </div>

      <p className="cfg-rotulo">{t('cfg.conta.cadastrar')}</p>
      <div className="cfg-form-conta">
        <div className="cfg-form-linha dupla">
          <Input block label={t('cfg.conta.apelido')} placeholder="dados-prod"
            value={novo.apelido}
            onChange={e => setNovo(v => ({ ...v, apelido: e.target.value }))} />
          <Input block label={t('cfg.conta.numero')} placeholder="111111111111"
            hint={t('cfg.conta.erroNumero')}
            value={novo.numero}
            onChange={e => setNovo(v => ({ ...v, numero: e.target.value.replace(/\D/g, '').slice(0, 12) }))} />
        </div>
        <Select block label={t('cfg.conta.dominio')} value={novo.area}
          onChange={e => setNovo(v => ({ ...v, area: e.target.value }))}>
          <option value="">{t('cfg.conta.dominio.escolha')}</option>
          {nos.map(no => (
            <option key={no.caminho} value={no.area?.valor || no.caminho}>
              {'\u00a0'.repeat(no.nivel * 3)}{no.nome}
            </option>
          ))}
        </Select>
        <div className="cfg-form-acao">
          <Button size="sm" onClick={poe}>{t('cfg.conta.cadastrar')}</Button>
        </div>
      </div>
      {erro && <Callout tone="danger" title={t('cfg.naoDeu')}>{erro}</Callout>}
    </>
  )
}
