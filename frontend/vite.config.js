import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Forward API requests to backend during development
      '/submit': 'http://localhost:3000',
      '/get_questions': 'http://localhost:3000',
    }
  }
})
