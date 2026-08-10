import React from 'react'
import { createRoot } from 'react-dom/client'
import '@refy/ui/tokens.css'
import '@refy/ui/global.css'
import '@refy/ui/styles.css'
import './tela.css'
import { Tela } from './Tela.jsx'
import { ProvedorIdioma } from './i18n.jsx'

createRoot(document.getElementById('raiz')).render(<ProvedorIdioma><Tela /></ProvedorIdioma>)
