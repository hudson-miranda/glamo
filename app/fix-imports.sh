#!/bin/bash
# Script para adicionar imports Prisma e corrigir tipos

echo "🔧 Corrigindo imports e tipos..."

# Adicionar import do Prisma onde está faltando
for file in $(grep -l "Cannot find name 'Prisma'" /tmp/build-progress.log 2>/dev/null | cut -d'(' -f1 | sort -u); do
  if [ -f "$file" ]; then
    # Verificar se já tem import do Prisma
    if ! grep -q "import.*Prisma.*from.*@prisma/client" "$file" 2>/dev/null; then
      # Adicionar import no topo do arquivo
      sed -i "1i import { Prisma } from '@prisma/client';" "$file"
      echo "✅ Adicionado import Prisma em $file"
    fi
  fi
done

# Corrigir deletedAt: Prisma.JsonNull para deletedAt: null em campos Date
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/deletedAt: Prisma\.JsonNull/deletedAt: null/g' {} +

echo "✅ Correções aplicadas!"
