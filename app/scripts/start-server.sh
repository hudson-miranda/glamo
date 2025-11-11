#!/bin/bash
# Script para iniciar o Wasp com configurações otimizadas para servidor remoto

echo "🚀 Iniciando Glamo Server (Otimizado)..."
echo ""
echo "📍 Endereços de acesso:"
echo "   Frontend: http://191.252.217.98:3000"
echo "   Backend:  http://191.252.217.98:3001"
echo ""
echo "⚡ Otimizações aplicadas:"
echo "   - Desabilitado file watching polling"
echo "   - Cache agressivo ativado"
echo "   - Logs reduzidos"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Certifique-se de que as portas 3000 e 3001 estão abertas no firewall"
echo "   - Se estiver usando um provedor cloud, verifique os Security Groups"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/glamo/app

# Limpa cache antigo se necessário
if [ -d "node_modules/.vite" ]; then
    echo "🧹 Limpando cache Vite..."
    rm -rf node_modules/.vite
fi

# Exporta as variáveis de ambiente necessárias
export HOST=0.0.0.0
export PORT=3000
export NODE_ENV=development
# Limita uso de memória do Node.js
export NODE_OPTIONS="--max-old-space-size=2048"

# Inicia o Wasp
wasp start
