import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: {
    sourcemap: false,
    minify: 'esbuild',
  },
  esbuild: {
    drop: ['console', 'debugger'],
    legalComments: 'none'
  }
})
