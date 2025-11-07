import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    open: true,
    // Hot Module Replacement otimizado
    hmr: {
      overlay: true, // Mostra erros na tela
      protocol: 'ws', // Usa WebSocket para HMR
      host: 'localhost', // Host do servidor HMR
    },
    // Para WSL/Windows, precisamos usar polling para detectar mudanças
    watch: {
      usePolling: true, // Necessário para WSL detectar mudanças de arquivos
      interval: 100, // Verifica mudanças a cada 100ms (padrão é 1000ms)
    },
  },
  // Otimizações de build para desenvolvimento
  optimizeDeps: {
    exclude: ['@wasp'], // Não otimiza pacotes do Wasp (já otimizados)
  },
  // Melhorar performance do HMR
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
