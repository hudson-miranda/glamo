#!/bin/bash

set -e  # Para na primeira erro

echo "🚀 GLAMO - DEPLOY AUTOMÁTICO"
echo "=============================="
echo ""

cd /home/glamodev/glamo/app

echo "📦 1. Gerando build de produção..."
wasp build

echo ""
echo "📚 2. Instalando dependências..."
cd .wasp/build
npm install --loglevel=error

echo ""
echo "🗄️  3. Gerando Prisma Client..."
npx prisma generate --schema=./db/schema.prisma

echo ""
echo "🔨 4. Buildando servidor..."
cd /home/glamodev/glamo/app/.wasp/build/server
npm run bundle

echo ""
echo "⚛️  5. Corrigindo URL da API no schema..."
sed -i "s|.default('http://localhost:3001')|.default('https://glamo.com.br')|g" /home/glamodev/glamo/app/.wasp/out/sdk/wasp/dist/client/env/schema.js

echo ""
echo "⚛️  6. Buildando frontend estático..."
cd /home/glamodev/glamo/app/.wasp/build/web-app
npm run build

echo ""
echo "🔧 7. Aplicando patches..."
cd /home/glamodev/glamo
bash patch-oauth-cookies.sh
bash patch-sendgrid-tracking.sh

echo ""
echo "✅ Patch aplicado com sucesso!"

echo ""
echo "🌐 8. Recarregando Nginx..."
sudo systemctl reload nginx

echo ""
echo "⏳ Aguardando serviços iniciarem..."
sleep 5

echo ""
echo "✅ DEPLOY CONCLUÍDO!"
echo ""
echo "📊 Status dos serviços:"
netstat -tlnp 2>/dev/null | grep -E ":(80|3001)" || echo "⚠️  Aguardando serviços..."

echo ""
echo "📝 Ver logs:"
echo "   Backend: tail -f /tmp/backend.log"
echo ""
echo "🌍 Acesse: https://glamo.com.br"
