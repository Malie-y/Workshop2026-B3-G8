import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Écoute sur toutes les interfaces : nécessaire dans Docker et pour le réseau local
    host: true,
    port: 5173,
    strictPort: true,
    // Détection des modifications à travers le volume Docker sous Windows
    watch: { usePolling: true },
  },
})
