import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/',   // Caminhos absolutos para assets em todas as rotas
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: true,  // Gera source maps para debug em produção
  },
  server: {
    host: true,    // expõe em 0.0.0.0 para aceitar www.betforbes.com
    port: 5173,    // mesma porta do `npm run dev`
  },
  preview: {
    host: true,    // expõe em 0.0.0.0 para aceitar www.betforbes.com
    port: 4173,    // mesma porta do `npm run preview`
  },
})
