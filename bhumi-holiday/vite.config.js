import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/find': 'http://localhost:8084',
      '/search': 'http://localhost:8084',
      '/coupen': 'http://localhost:8084',
      '/auth': 'http://localhost:8084',
      '/user': 'http://localhost:8084',
    }
  }
})
