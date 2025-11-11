#!/bin/bash
# Script para abrir as portas necessárias para o Wasp/Glamo

# Portas necessárias:
# 3000 - Frontend (Vite/React)
# 3001 - Backend API (Node.js/Express)
# 5432 - PostgreSQL (se acessível externamente)
# 5555 - Prisma Studio

echo "Abrindo portas no firewall..."

# Porta 3000 - Frontend
sudo ufw allow 3000/tcp
echo "✓ Porta 3000 (Frontend) aberta"

# Porta 3001 - Backend API
sudo ufw allow 3001/tcp
echo "✓ Porta 3001 (Backend API) aberta"

# Porta 5432 - PostgreSQL (opcional - apenas se precisar acesso externo ao DB)
# sudo ufw allow 5432/tcp
# echo "✓ Porta 5432 (PostgreSQL) aberta"

# Porta 5555 - Prisma Studio
sudo ufw allow 5555/tcp
echo "✓ Porta 5555 (Prisma Studio) aberta"

# Mostrar status
sudo ufw status

echo ""
echo "✅ Configuração de portas concluída!"
echo ""
echo "IMPORTANTE:"
echo "- Frontend estará acessível em: http://191.252.217.98:3000"
echo "- Backend API em: http://191.252.217.98:3001"
echo "- Prisma Studio em: http://191.252.217.98:5555"
echo ""
echo "Para ativar o firewall (se ainda não estiver ativo):"
echo "  sudo ufw enable"
