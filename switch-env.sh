#!/bin/bash
# Script para alternar entre ambiente local e remoto
# Uso: ./switch-env.sh local   OU   ./switch-env.sh remote

# Cores para output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verifica se o modo foi fornecido
if [ $# -eq 0 ]; then
    echo -e "${RED}Erro: Modo não especificado${NC}"
    echo "Uso: ./switch-env.sh [local|remote]"
    exit 1
fi

MODE=$1

# Valida o modo
if [ "$MODE" != "local" ] && [ "$MODE" != "remote" ]; then
    echo -e "${RED}Erro: Modo inválido. Use 'local' ou 'remote'${NC}"
    exit 1
fi

APP_DIR="app"
ENV_FILE="$APP_DIR/.env.client"
SOURCE_FILE="$APP_DIR/.env.client.$MODE"

# Verifica se o arquivo de configuração existe
if [ ! -f "$SOURCE_FILE" ]; then
    echo -e "${RED}Erro: Arquivo de configuração não encontrado: $SOURCE_FILE${NC}"
    exit 1
fi

# Copia o arquivo de configuração apropriado
cp "$SOURCE_FILE" "$ENV_FILE"

echo -e "✅ Configuração alterada para modo: ${GREEN}$MODE${NC}"

if [ "$MODE" = "local" ]; then
    echo -e "\n📍 Acesse o sistema em: ${CYAN}http://localhost:3000${NC}"
else
    echo -e "\n📍 Acesse o sistema em: ${CYAN}http://191.252.217.98:3000${NC}"
fi

echo -e "\n💡 Execute 'wasp start' para iniciar o servidor\n"
