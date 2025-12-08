#!/bin/bash

# Exportar variáveis diretamente
while IFS='=' read -r key value; do
  if [[ ! "$key" =~ ^# ]] && [[ -n "$key" ]]; then
    export "$key=$value"
  fi
done < /home/glamodev/glamo/production.env

export WASP_WEB_CLIENT_URL="https://glamo.com.br"
export WASP_SERVER_URL="https://glamo.com.br"
export NODE_ENV="production"
export PORT=3001

cd /home/glamodev/glamo/app/.wasp/build/server
exec node --enable-source-maps bundle/server.js
