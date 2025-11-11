#!/bin/bash
# Script para build e start em modo produção (muito mais rápido!)

echo "🏭 Construindo Glamo para PRODUÇÃO..."
echo ""
echo "Isso levará alguns minutos, mas depois será MUITO mais rápido!"
echo ""

cd /root/glamo/app

# Build do projeto
echo "📦 Fazendo build..."
wasp build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build!"
    exit 1
fi

echo ""
echo "✅ Build concluído!"
echo ""
echo "🚀 Iniciando servidor de produção..."
echo ""
echo "📍 Endereços de acesso:"
echo "   Frontend: http://191.252.217.98:3000"
echo "   Backend:  http://191.252.217.98:3001"
echo ""

cd .wasp/build

# Instala dependências de produção (se necessário)
if [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependências..."
    npm install --production
fi

# Inicia servidor em produção
export NODE_ENV=production
export WASP_WEB_CLIENT_URL=http://191.252.217.98:3000
export WASP_SERVER_URL=http://191.252.217.98:3001
export PORT=3001

# Inicia backend
cd server
npm start &
BACKEND_PID=$!

# Inicia frontend
cd ../web-app
export PORT=3000
export HOST=0.0.0.0
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Servidor em produção iniciado!"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "Para parar os servidores:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Aguarda os processos
wait
