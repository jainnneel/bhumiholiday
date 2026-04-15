import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/find': 'https://api.bhumiholidays.in',
      '/search': 'https://api.bhumiholidays.in',
      '/coupen': 'https://api.bhumiholidays.in',
      '/auth': 'https://api.bhumiholidays.in',
      '/user': 'https://api.bhumiholidays.in',
    }
  }
})
