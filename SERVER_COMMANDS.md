# 🚀 Comandos do Servidor Glamo

## ✅ Status Atual
- **Frontend:** http://72.60.252.17:3000
- **Backend:** http://72.60.252.17:3001
- **Database:** PostgreSQL 16 na porta 5432
- **Wasp Version:** 0.18.0

## 📋 Comandos Essenciais

### Ver status dos servidores
```bash
# Ver sessões screen ativas
screen -ls

# Ver processos rodando
ps aux | grep -E "(vite|node.*bundle|postgres)"

# Ver portas em uso
ss -tulpn | grep -E ":(3000|3001|5432)"
```

### Acessar o servidor
```bash
# Conectar à sessão do Glamo
screen -r glamo

# Para sair sem matar o servidor: Ctrl+A, depois D
```

### Parar o servidor
```bash
# Matar a sessão screen
screen -X -S glamo quit

# Ou matar processos manualmente
pkill -f "wasp-bin start"
pkill -f "vite"
pkill -f "nodemon"
```

### Iniciar o servidor
```bash
cd /home/glamodev/glamo/app
screen -dmS glamo bash -c "./start-remote.sh"

# Aguarde 30 segundos para inicializar
sleep 30 && curl -I http://localhost:3000
```

### Restart completo (se necessário)
```bash
# 1. Parar tudo
screen -X -S glamo quit
pkill -9 -f "wasp-bin"
pkill -9 -f "vite"
pkill -9 -f "nodemon"

# 2. Limpar cache
cd /home/glamodev/glamo/app
wasp clean
npm cache clean --force

# 3. Rebuild
wasp build

# 4. Iniciar
screen -dmS glamo bash -c "./start-remote.sh"
```

## 🐘 Banco de Dados

### Gerenciar banco
```bash
# Ver container do banco
docker ps | grep postgres

# Iniciar banco (se não estiver rodando)
cd /home/glamodev/glamo/app
screen -dmS wasp-db bash -c "wasp start db"

# Parar banco
docker stop wasp-dev-db-OpenSaaS-db7d1debd6

# Ver logs do banco
docker logs wasp-dev-db-OpenSaaS-db7d1debd6
```

### Migrações
```bash
cd /home/glamodev/glamo/app

# Aplicar migrações
wasp db migrate-dev

# Abrir Prisma Studio
wasp db studio
```

### Limpar banco completamente
```bash
# CUIDADO: Isso apaga todos os dados!
docker stop $(docker ps -aq)
docker system prune -af --volumes
```

## 🔥 Firewall

### Verificar portas abertas
```bash
sudo ufw status
```

### Abrir portas (se necessário)
```bash
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
sudo ufw allow 5432/tcp
```

## 🧪 Testes

### Testar conexões
```bash
# Frontend
curl -I http://72.60.252.17:3000

# Backend
curl -I http://72.60.252.17:3001

# Localhost
curl -I http://localhost:3000
```

### Ver HTML da página
```bash
curl -s http://localhost:3000 | head -50
```

## 📝 Logs

### Ver logs do servidor em tempo real
```bash
# Conectar à sessão screen
screen -r glamo

# Ou capturar logs
screen -S glamo -X hardcopy /tmp/server-logs.txt
cat /tmp/server-logs.txt
```

## 🔧 Troubleshooting

### Erro: Porta já em uso
```bash
# Encontrar processo usando a porta
lsof -i :3000
# Ou
ss -tulpn | grep :3000

# Matar o processo
kill -9 <PID>
```

### Erro: Cannot connect to database
```bash
# Verificar se o banco está rodando
docker ps | grep postgres

# Se não estiver, iniciar
cd /home/glamodev/glamo/app
screen -dmS wasp-db bash -c "wasp start db"
```

### Erro: ReactCurrentDispatcher
```bash
# Isso geralmente significa cache corrompido
cd /home/glamodev/glamo/app
wasp clean
npm cache clean --force
wasp build
```

## 🎯 Script de Início Rápido

Criado em: `/home/glamodev/glamo/app/start-remote.sh`

```bash
#!/bin/bash
export WASP_WEB_CLIENT_URL=http://72.60.252.17:3000
export WASP_SERVER_URL=http://72.60.252.17:3001
export VITE_PUBLIC_IP=72.60.252.17

wasp start
```

## 📊 Monitoramento

### Ver uso de recursos
```bash
# CPU e memória
htop

# Disco
df -h

# Processos Node
ps aux | grep node | grep -v grep
```

---
**Última atualização:** 04/12/2025
**Servidor:** srv1175780
**IP Público:** 72.60.252.17
