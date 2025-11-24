import { defineConfig } from 'vite'

// Detecta automaticamente o ambiente
const isProduction = process.env.NODE_ENV === 'production'
const publicIp = process.env.VITE_PUBLIC_IP || '191.252.217.98'
const isLocalDev = process.env.VITE_LOCAL_DEV === 'true' || !process.env.VITE_PUBLIC_IP

export default defineConfig({
  server: {
    host: '0.0.0.0', // Aceita conexões de qualquer IP
    port: 3000,
    open: false, // Não tenta abrir o browser automaticamente
    strictPort: true, // Falha se a porta já estiver em uso
    // Hot Module Replacement configurado dinamicamente
    hmr: isLocalDev ? {
      overlay: true,
      protocol: 'ws',
      // Em localhost, usa a configuração padrão (auto-detecta)
    } : {
      overlay: true,
      protocol: 'ws',
      host: publicIp, // IP público do servidor para desenvolvimento remoto
      clientPort: 3000,
    },
    // HABILITA polling para garantir hot reload consistente
    watch: {
      usePolling: true, // Habilita polling para detectar mudanças em arquivos
      interval: 1000, // Intervalo de polling em ms (1 segundo)
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
  // Logs informativos para ver hot reload
  logLevel: 'info',
})
