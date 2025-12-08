#!/bin/bash
# Patch para adicionar SameSite=None aos cookies OAuth do Wasp

BUNDLE_FILE="/home/glamodev/glamo/app/.wasp/build/server/bundle/server.js"

echo "🔧 Aplicando patch para cookies OAuth..."

# Fazer backup
cp "$BUNDLE_FILE" "$BUNDLE_FILE.backup"

# Patch: Adicionar SameSite=None aos cookies OAuth
sed -i 's/secure: !config\$1\.isDevelopment,/secure: true, sameSite: "none",/g' "$BUNDLE_FILE"

# Verificar se o patch funcionou
if grep -q 'sameSite: "none"' "$BUNDLE_FILE"; then
    echo "✅ Patch aplicado com sucesso!"
else
    echo "❌ Falha ao aplicar patch. Restaurando backup..."
    mv "$BUNDLE_FILE.backup" "$BUNDLE_FILE"
    exit 1
fi

echo "🔄 Reiniciando backend..."
screen -X -S glamo-backend quit 2>/dev/null
sleep 2
screen -dmS glamo-backend bash -c '/home/glamodev/glamo/start-backend-v2.sh 2>&1 | tee /tmp/backend.log'
sleep 3

echo "✅ Patch concluído! Teste o login via Google agora."
