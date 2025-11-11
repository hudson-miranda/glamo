# Configuração para Acesso Externo ao Servidor

## 🌐 IPs e Portas

- **IP Público do Servidor**: `191.252.217.98`
- **Frontend**: porta `3000`
- **Backend API**: porta `3001`
- **Prisma Studio**: porta `5555`
- **PostgreSQL**: porta `5432` (acesso local apenas, por segurança)

## 🚀 Como Iniciar o Servidor

### 1. Iniciar o Wasp (Frontend + Backend)

```bash
cd /root/glamo/app
wasp start
```

O servidor estará acessível em:
- **Frontend**: http://191.252.217.98:3000
- **Backend**: http://191.252.217.98:3001

### 2. Iniciar o Prisma Studio (opcional)

Em um terminal separado:

```bash
cd /root/glamo/app
./scripts/start-prisma-studio.sh
```

Ou manualmente:
```bash
npx prisma studio --port 5555 --hostname 0.0.0.0
```

Acessível em: http://191.252.217.98:5555

## 🔒 Configuração de Firewall (se necessário)

Se você ativar o firewall UFW no futuro, execute:

```bash
cd /root/glamo/app
./scripts/open-ports.sh
```

Ou manualmente:
```bash
sudo ufw allow 3000/tcp  # Frontend
sudo ufw allow 3001/tcp  # Backend API
sudo ufw allow 5555/tcp  # Prisma Studio
sudo ufw enable
```

## 📝 Arquivos Configurados

### 1. `.env.server`
```bash
WASP_WEB_CLIENT_URL=http://191.252.217.98:3000
WASP_SERVER_URL=http://191.252.217.98:3001
```

### 2. `.env.client`
```bash
REACT_APP_API_URL=http://191.252.217.98:3001
```

### 3. `vite.config.ts`
```typescript
server: {
  host: '0.0.0.0',      // Aceita conexões de qualquer IP
  port: 3000,
  hmr: {
    host: '191.252.217.98',  // IP público para HMR
    clientPort: 3000,
  }
}
```

## ⚠️ Importante para Produção

Para produção, você deve:

1. **Usar HTTPS** com certificado SSL (Let's Encrypt)
2. **Configurar um proxy reverso** (nginx ou Apache)
3. **Não expor a porta 5555** (Prisma Studio) publicamente
4. **Usar variáveis de ambiente de produção**
5. **Ativar e configurar corretamente o firewall**

### Exemplo de configuração nginx:

```nginx
server {
    listen 80;
    server_name glamo.app www.glamo.app;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Troubleshooting

### Erro de conexão recusada
- Verifique se o firewall do VPS está bloqueando as portas
- Verifique as regras de segurança do seu provedor de cloud
- Confirme que o Wasp está rodando com `ps aux | grep wasp`

### HMR não funciona
- Verifique se o WebSocket está sendo bloqueado
- Tente acessar via IP público ao invés de localhost

### Stripe webhook não funciona
Para webhooks do Stripe em produção, você precisa:
1. Configurar um domínio público
2. Usar HTTPS
3. Atualizar a URL do webhook no Stripe Dashboard
