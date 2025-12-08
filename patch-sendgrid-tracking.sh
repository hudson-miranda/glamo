#!/bin/bash

# Script para desabilitar Click Tracking no SendGrid (evitar links estranhos nos emails)

BUNDLE_FILE="/home/glamodev/glamo/app/.wasp/build/server/bundle/server.js"

echo "🔧 Desabilitando Click Tracking do SendGrid..."

# Adicionar trackingSettings ao SendGrid.send para desabilitar click tracking
sed -i 's/html: email\.html$/html: email.html,\n        trackingSettings: {\n          clickTracking: { enable: false },\n          openTracking: { enable: false }\n        }/g' "$BUNDLE_FILE"

echo "✅ Click Tracking desabilitado!"
echo "   - Links nos emails agora serão diretos"
echo "   - Não haverá mais urls como url7794.glamo.com.br"
