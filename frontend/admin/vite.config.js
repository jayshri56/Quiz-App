import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/quiz': 'http://localhost:8090',
      '/question': 'http://localhost:8081'
    }
  }
})
