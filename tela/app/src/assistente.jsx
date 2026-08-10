import React, { useMemo, useState } from 'react'
import { Button, Input, Select } from '@refy/ui'
import { useT } from './i18n.jsx'
import './assistente.css'

/* O assistente de projeto: três passos antes do primeiro desenho.

   Todo projeto (importado ou do zero) passa por aqui quando ainda não tem
   configuração: organização, nome e sigla; os domínios; as contas. É o mesmo
   conteúdo das configurações, na ordem de preenchimento, com a saída de
   emergência de configurar depois.

   Contrato: { aberta, config, aoConcluir({ config, contas }), aoPular }.
   Quem compõe decide o que acontece depois (abrir o arquivo, abrir a paleta). */

const PASSOS = ['p1', 'p2', 'p3']

function partesDe(rotulo) {
  return String(rotulo || '').split('>').map(p => p.trim()).filter(Boolean)
}

export function Assistente({ aberta, config, aoConcluir, aoPular }) {
  const { t, lingua } = useT()
  const [passo, setPasso] = useState(0)
  const [d, setD] = useState(() => ({
    prefixo: '',
    nome: '',
    sigla: config?.sigla || '',
    regiao_padrao: config?.regiao_padrao || 'us-east-1',
    areas: config?.areas || [],
  }))
  const [contas, setContas] = useState([])
  const [nova, setNova] = useState({ apelido: '', numero: '', area: '' })
  const [erro, setErro] = useState('')

  const sugeridas = config?.areas_sugeridas || {}
  const regioes = config?.regioes_aws || ['us-east-1', 'sa-east-1', 'eu-west-1']

  const muda = (campo, valor) => setD(v => ({ ...v, [campo]: valor }))

  const arvore = useMemo(() => {
    const nos = []
    for (const a of d.areas) {
      const partes = partesDe(a.rotulo || a.valor)
      nos.push({ caminho: partes.join(' > '), nome: partes[partes.length - 1], nivel: partes.length - 1, valor: a.valor })
    }
    return nos.sort((x, y) => x.caminho.localeCompare(y.caminho))
  }, [d.areas])

  if (!aberta) return null

  const podeAvancar = passo === 0
    ? d.sigla.trim().length > 0
    : passo === 1
      ? d.areas.length > 0
      : true

  const poeConta = () => {
    setErro('')
    if (!/^[0-9]{12}$/.test(nova.numero.trim())) { setErro(t('cfg.conta.erroNumero')); return }
    if (!nova.apelido.trim()) { setErro(t('cfg.conta.erroApelido')); return }
    setContas(v => [...v, { ...nova, padrao: v.length === 0 }])
    setNova({ apelido: '', numero: '', area: '' })
  }

  const concluir = () => {
    aoConcluir({
      config: {
        sigla: d.sigla.trim(),
        regiao_padrao: d.regiao_padrao,
        regioes: [...new Set([d.regiao_padrao, ...(config?.regioes || [])])].filter(Boolean),
        areas: d.areas,
      },
      prefixo: d.prefixo.trim(),
      nome: d.nome.trim(),
      contas,
    })
  }

  return (
    <div className="wz-fundo">
      <div className="wz" role="dialog" aria-modal="true" aria-label={t('wz.titulo')}>
        <header className="wz-topo">
          <h2>{t('wz.titulo')}</h2>
          <span className="wz-passo">{t('wz.passo', { n: passo + 1, t: PASSOS.length })}</span>
        </header>

        <div className="wz-trilha" aria-hidden>
          {PASSOS.map((p, i) => (
            <span key={p} className={'wz-ponto' + (i === passo ? ' ativo' : i < passo ? ' feito' : '')} />
          ))}
        </div>

        <div className="wz-corpo">
          {passo === 0 && (
            <>
              <h3>{t('wz.p1.titulo')}</h3>
              <p className="wz-desc">{t('wz.p1.desc')}</p>
              <div className="wz-linha dupla">
                <Input block label={t('wz.org')} placeholder="minha-org"
                  hint={t('wz.org.hint')}
                  value={d.prefixo} onChange={e => muda('prefixo', e.target.value)} />
                <Input block label={t('wz.nome')} placeholder="plataforma-dados"
                  value={d.nome} onChange={e => muda('nome', e.target.value)} />
              </div>
              <div className="wz-linha dupla">
                <Input block label={t('cfg.sigla')} placeholder="BIO"
                  hint={t('cfg.sigla.hint')}
                  value={d.sigla} onChange={e => muda('sigla', e.target.value)} />
                <Select block label={t('wz.regiao')} value={d.regiao_padrao}
                  onChange={e => muda('regiao_padrao', e.target.value)}>
                  {regioes.map(r => <option key={r} value={r}>{r}</option>)}
                </Select>
              </div>
            </>
          )}

          {passo === 1 && (
            <>
              <h3>{t('wz.p2.titulo')}</h3>
              <p className="wz-desc">{t('wz.p2.desc')}</p>
              <div className="wz-conjuntos">
                {['simples', 'plataforma', 'referencia'].map(chave => {
                  const doConjunto = sugeridas[chave] || []
                  const escolhido = doConjunto.length > 0
                    && doConjunto.length === d.areas.length
                    && doConjunto.every(a => d.areas.some(x => x.valor === a.valor))
                  return (
                    <button key={chave} type="button"
                      className={'wz-conjunto' + (escolhido ? ' escolhido' : '')}
                      onClick={() => muda('areas', doConjunto.map(a => ({ ...a })))}>
                      <b>{t('cfg.preset.' + chave)}</b>
                      <span>{t('cfg.preset.' + chave + '.desc')}</span>
                    </button>
                  )
                })}
              </div>
              {arvore.length > 0 && (
                <div className="wz-arvore">
                  {arvore.map(no => (
                    <span key={no.caminho} className="wz-no" style={{ marginLeft: no.nivel * 16 }}>
                      {no.nivel > 0 && <i aria-hidden>└ </i>}{no.nome}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}

          {passo === 2 && (
            <>
              <h3>{t('wz.p3.titulo')}</h3>
              <p className="wz-desc">{t('wz.p3.desc')}</p>
              <div className="wz-contas">
                {contas.length === 0 && <p className="wz-nota">{t('wz.contas.vazia')}</p>}
                {contas.map(c => (
                  <div key={c.numero} className="wz-conta">
                    <b>{c.apelido}</b>
                    <code>{c.numero}</code>
                    <span>{c.area || t('cfg.conta.semDominio')}</span>
                    {c.padrao && <em>{t('cfg.padrao')}</em>}
                    <button className="wz-tirar" aria-label={t('cfg.conta.tirar', { nome: c.apelido })}
                      onClick={() => setContas(v => v.filter(x => x.numero !== c.numero))}>×</button>
                  </div>
                ))}
              </div>
              <div className="wz-linha dupla">
                <Input block label={t('cfg.conta.apelido')} placeholder="dados-prod"
                  value={nova.apelido} onChange={e => setNova(v => ({ ...v, apelido: e.target.value }))} />
                <Input block label={t('cfg.conta.numero')} placeholder="111111111111"
                  value={nova.numero}
                  onChange={e => setNova(v => ({ ...v, numero: e.target.value.replace(/\D/g, '').slice(0, 12) }))} />
              </div>
              <div className="wz-linha">
                <Select block label={t('cfg.conta.dominio')} value={nova.area}
                  onChange={e => setNova(v => ({ ...v, area: e.target.value }))}>
                  <option value="">{t('cfg.conta.dominio.escolha')}</option>
                  {arvore.map(no => (
                    <option key={no.caminho} value={no.valor || no.caminho}>
                      {' '.repeat(no.nivel * 3)}{no.nome}
                    </option>
                  ))}
                </Select>
                <Button size="sm" variant="outlined" className="wz-poe"
                  onClick={poeConta}>{t('cfg.conta.cadastrar')}</Button>
              </div>
              {erro && <p className="wz-erro">{erro}</p>}
            </>
          )}
        </div>

        <footer className="wz-pe">
          <button type="button" className="wz-pular" onClick={aoPular}>{t('wz.depois')}</button>
          <span className="wz-respiro" />
          {passo > 0 && (
            <Button variant="ghost" onClick={() => setPasso(p => p - 1)}>{t('wz.voltar')}</Button>
          )}
          {passo < PASSOS.length - 1 ? (
            <Button disabled={!podeAvancar} onClick={() => setPasso(p => p + 1)}>{t('wz.avancar')}</Button>
          ) : (
            <Button onClick={concluir}>{t('wz.concluir')}</Button>
          )}
        </footer>
      </div>
    </div>
  )
}

export default Assistente
