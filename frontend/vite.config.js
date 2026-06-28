import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/login/api': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/login/form': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/login/session': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/login/validate-session': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/logout': { target: 'http://127.0.0.1:5000', changeOrigin: true },
    },
  },
})
