import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { DICIONARIO } from './dicionario.js'

/* Idioma da interface. EN-US é o padrão; PT-BR entra pelo seletor do topo e a
   escolha sobrevive ao recarregamento. Toda microcopy passa por t(): texto
   solto em componente é defeito. */

const GUARDA = 'bioma.idioma'

const Ctx = createContext({ lingua: 'en', t: (k) => k, trocar: () => {} })

function leGuardado() {
  try {
    const v = window.localStorage.getItem(GUARDA)
    return v === 'pt' || v === 'en' ? v : 'en'
  } catch { return 'en' }
}

export function ProvedorIdioma({ children }) {
  const [lingua, setLingua] = useState(leGuardado)

  const trocar = useCallback((l) => {
    setLingua(l)
    try { window.localStorage.setItem(GUARDA, l) } catch { /* vale a sessão */ }
  }, [])

  const t = useCallback((chave, vars) => {
    let frase = DICIONARIO[lingua]?.[chave] ?? DICIONARIO.en[chave] ?? chave
    if (vars) for (const [k, v] of Object.entries(vars)) frase = frase.replaceAll('{' + k + '}', String(v))
    return frase
  }, [lingua])

  const valor = useMemo(() => ({ lingua, t, trocar }), [lingua, t, trocar])
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}

export function useT() {
  return useContext(Ctx)
}
