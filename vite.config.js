import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: '.', // 👈 Explicitly define root where index.html is
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
