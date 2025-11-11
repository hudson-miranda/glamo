#!/bin/bash
# Script para iniciar o Prisma Studio com acesso externo

echo "Iniciando Prisma Studio..."
echo "Acessível em: http://191.252.217.98:5555"
echo ""

cd /root/glamo/app
npx prisma studio --port 5555 --hostname 0.0.0.0
