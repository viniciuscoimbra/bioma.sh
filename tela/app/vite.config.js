import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// A tela é servida pelo servidor Python em produção local, então o build sai
// estático em ../estatico. No desenvolvimento, o Vite chama a API na 8000.
export default defineConfig({
  plugins: [react()],
  // o refy-ui é consumido por caminho de arquivo, então o vite precisa saber
  // resolver as dependências dele a partir daqui
  // preserveSymlinks: o refy-ui entra por caminho de arquivo, e sem isto o
  // rollup procura as dependências dele na pasta original, onde não existem
  resolve: { dedupe: ['react', 'react-dom'], preserveSymlinks: true },
  optimizeDeps: { include: ['d3-array', 'd3-scale', 'd3-shape'] },
  base: './',
  build: { outDir: '../estatico', emptyOutDir: true },
  // toda rota do servidor entra aqui: ícone que falta no desenvolvimento
  // deixa o canvas sem a marca oficial da AWS, e aí o desenho mente
  server: {
    proxy: Object.fromEntries(
      ['/recursos', '/icone', '/exemplo', '/gerar', '/subir', '/pre-voo', '/rodar']
        .map(r => [r, 'http://localhost:8000']),
    ),
  },
})
