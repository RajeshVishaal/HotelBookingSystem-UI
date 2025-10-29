import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/v1': {
        target: 'https://api-gateway.happyforest-8a2b009f.uksouth.azurecontainerapps.io',
        changeOrigin: true,
        secure: false
      }
    }
  },
  optimizeDeps: {
    force: true
  }
})
