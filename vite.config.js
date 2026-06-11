import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base é o nome do repositório, necessário para o GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: '/mrs-cx-dashboard/',
})
