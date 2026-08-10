import { defineConfig } from "vite";

// Build da BIBLIOTECA (não confundir com o Storybook, que usa a config dele).
// Uso: npm run build  →  dist/index.js + dist/refy-ui.css + dist/*.d.ts
export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
      // CSS extraído sai como dist/style.css (vite 5, cssCodeSplit=false)
    },
    outDir: "dist",
    emptyOutDir: true,
    cssCodeSplit: false,
    sourcemap: true,
    rollupOptions: {
      // peer deps e deps ficam de fora do bundle — o consumidor resolve
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "d3-array",
        "d3-scale",
        "d3-shape",
      ],
    },
  },
});
