import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // O Caddy (proxy reverso local pro fluxo do gov.br) repassa o Host
    // original — sem isso o Vite recusa a requisição com 403.
    allowedHosts: ['local.regic.gov.br'],
  },
})
