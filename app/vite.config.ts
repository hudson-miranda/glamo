import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    open: true,
    // Hot Module Replacement otimizado
    hmr: {
      overlay: true, // Mostra erros na tela
    },
    // Aumenta velocidade do reload
    watch: {
      usePolling: false, // Desabilita polling (mais rápido em WSL/Windows)
    },
  },
  // Otimizações de build para desenvolvimento
  optimizeDeps: {
    exclude: ['@wasp'], // Não otimiza pacotes do Wasp (já otimizados)
  },
})
