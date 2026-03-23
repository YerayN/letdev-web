import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Alias para no escribir '../../../components' nunca más
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
