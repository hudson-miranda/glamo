#!/bin/bash
export WASP_WEB_CLIENT_URL="https://glamo.com.br"
export WASP_SERVER_URL="https://glamo.com.br"
export BROWSER="none"

cd /home/glamodev/glamo/app/.wasp/build/web-app
exec npm start
