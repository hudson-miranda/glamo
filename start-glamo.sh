#!/bin/bash
echo "🚀 Iniciando Glamo - Sistema em Produção"
echo "   Domínio: https://glamo.com.br"
echo "   Backend: localhost:3001"
echo "   Frontend: localhost:3000"
echo ""

# Parar processos existentes
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
screen -X -S glamo-backend quit 2>/dev/null
screen -X -S glamo-frontend quit 2>/dev/null
sleep 3

# Iniciar backend
screen -dmS glamo-backend bash -c '/home/glamodev/glamo/start-backend-v2.sh 2>&1 | tee /tmp/backend.log'
sleep 15

# Iniciar frontend
screen -dmS glamo-frontend bash -c '/home/glamodev/glamo/start-frontend.sh 2>&1 | tee /tmp/frontend.log'
sleep 10

echo "✅ Sistema iniciado!"
echo ""
echo "Para ver logs:"
echo "  Backend:  tail -f /tmp/backend.log"
echo "  Frontend: tail -f /tmp/frontend.log"
echo ""
echo "Para acessar screens:"
echo "  screen -r glamo-backend"
echo "  screen -r glamo-frontend"
