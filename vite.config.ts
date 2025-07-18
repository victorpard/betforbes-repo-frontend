import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/',              // caminhos absolutos
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')  // garante que @ -> <root>/src
    },
    // Opcional: especifique as extensões que o Rollup deve tentar
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
