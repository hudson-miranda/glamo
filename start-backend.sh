#!/bin/bash
set -a
source /home/glamodev/glamo/production.env
set +a

export WASP_WEB_CLIENT_URL="https://glamo.com.br"
export WASP_SERVER_URL="https://glamo.com.br"
export NODE_ENV="production"
export PORT=3001

cd /home/glamodev/glamo/app/.wasp/build/server
exec node --enable-source-maps bundle/server.js
