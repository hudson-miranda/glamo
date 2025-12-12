#!/bin/bash

# Script para iniciar o Glamo em PRODUÇÃO
# Configurações para glamo.com.br via Cloudflare

export WASP_WEB_CLIENT_URL=https://glamo.com.br
export WASP_SERVER_URL=https://glamo.com.br
export NODE_ENV=production

echo "🚀 Iniciando Glamo em PRODUÇÃO..."
echo "   Domínio: https://glamo.com.br"
echo "   Backend local: localhost:3001 (via Nginx proxy)"
echo "   Frontend local: localhost:3000 (via Nginx proxy)"
echo ""

wasp start
