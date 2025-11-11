import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0', // Aceita conexões de qualquer IP
    port: 3000,
    open: false, // Não tenta abrir o browser automaticamente
    strictPort: true, // Falha se a porta já estiver em uso
    // Hot Module Replacement otimizado para servidor remoto
    hmr: {
      overlay: true, // Mostra erros na tela
      protocol: 'ws', // Usa WebSocket para HMR
      host: '191.252.217.98', // IP público do servidor para HMR
      clientPort: 3000,
    },
    // DESABILITA polling para melhorar performance em servidor
    watch: {
      usePolling: false, // Desabilita polling para economizar recursos
      ignored: ['**/node_modules/**', '**/.git/**'], // Ignora pastas desnecessárias
    },
    // Otimizações de rede
    cors: true,
    headers: {
      'Cache-Control': 'public, max-age=31536000',
    },
  },
  // Otimizações de build para desenvolvimento
  optimizeDeps: {
    exclude: ['@wasp'], // Não otimiza pacotes do Wasp (já otimizados)
    include: ['react', 'react-dom'], // Pre-bundle dependências comuns
    esbuildOptions: {
      target: 'es2020',
    },
  },
  // Melhorar performance do build
  build: {
    target: 'es2020',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
    // Reduz verificações em dev
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
  },
  // Cache agressivo para melhorar velocidade
  cacheDir: 'node_modules/.vite',
  // Reduz logs
  logLevel: 'error',
})
