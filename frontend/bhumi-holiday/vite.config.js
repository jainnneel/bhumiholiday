import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Tells Vite this is a SPA — all unmatched dev-server routes serve index.html
  appType: 'spa',
  server: {
    port: 3000,
    proxy: {
      // '/find':       'http://localhost:8084',
      // '/search/':    'http://localhost:8084',
      // '/coupen':     'http://localhost:8084',
      // '/auth':       'http://localhost:8084',
      // '/user':       'http://localhost:8084',
      // '/api/ticket': 'http://localhost:8084',

      '/find':       'https://api.bhumiholidays.in',
      '/search/':    'https://api.bhumiholidays.in',
      '/coupen':     'https://api.bhumiholidays.in',
      '/auth':       'https://api.bhumiholidays.in',
      '/user':       'https://api.bhumiholidays.in',
      '/api/ticket': 'https://api.bhumiholidays.in',

      // Production: swap above to 'https://api.bhumiholidays.in'
    },
  },
  preview: {
    port: 3000,
  },
})
