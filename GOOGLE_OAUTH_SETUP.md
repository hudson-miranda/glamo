# 🔐 Configuração Google OAuth - Glamo

## ⚠️ Problema Atual

O Google OAuth não funciona com IP público HTTP por questões de segurança. O Google requer:
- HTTPS (certificado SSL), OU
- `localhost` (apenas desenvolvimento local)

## ✅ Solução: Configurar URIs de Redirecionamento

### Passo 1: Acessar Google Cloud Console

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Faça login com a conta que criou o projeto
3. Selecione o projeto correto

### Passo 2: Configurar OAuth 2.0 Client

1. Clique no **OAuth 2.0 Client ID** existente:
   - Client ID: `715923303288-3o3f0dh76rjm5fvjv6gull9vin0kli6j.apps.googleusercontent.com`

2. Em **"URIs de redirecionamento autorizados"**, adicione:
   ```
   http://72.60.252.17:3001/auth/google/callback
   ```

3. **Importante**: Mantenha também o localhost para desenvolvimento:
   ```
   http://localhost:3001/auth/google/callback
   ```

4. Clique em **"SALVAR"**

### Passo 3: Testar

Após salvar, aguarde 1-2 minutos para as configurações propagarem e teste:
1. Acesse: http://72.60.252.17:3000
2. Clique em "Login with Google"
3. Deve funcionar normalmente

## 🎯 Soluções Alternativas

### Opção A: Usar Domínio com HTTPS (Recomendado para Produção)

Configure um domínio apontando para o IP e instale SSL com Let's Encrypt:

1. **Configurar domínio**: 
   - Registre um domínio (ex: `glamo.com.br`)
   - Aponte o DNS para `72.60.252.17`

2. **Instalar Nginx + Certbot**:
   ```bash
   sudo apt update
   sudo apt install nginx certbot python3-certbot-nginx
   sudo certbot --nginx -d seudominio.com
   ```

3. **Configurar Nginx como proxy reverso**:
   ```nginx
   server {
       listen 80;
       server_name seudominio.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl;
       server_name seudominio.com;
       
       ssl_certificate /etc/letsencrypt/live/seudominio.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/seudominio.com/privkey.pem;

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
           proxy_set_header Host $host;
       }
   }
   ```

4. **Atualizar variáveis de ambiente**:
   ```bash
   export WASP_WEB_CLIENT_URL=https://seudominio.com
   export WASP_SERVER_URL=https://seudominio.com/api
   ```

5. **Atualizar Google Console**:
   ```
   https://seudominio.com/auth/google/callback
   ```

### Opção B: Desabilitar Google Auth Temporariamente

Se não precisa do Google Auth agora, comente no `main.wasp`:

```wasp
// google: {
//   userSignupFields: import { getGoogleUserFields } from "@src/auth/userSignupFields",
//   configFn: import { getGoogleAuthConfig } from "@src/auth/userSignupFields",
// },
```

Depois execute:
```bash
cd /home/glamodev/glamo/app
wasp clean
wasp build
screen -X -S glamo quit
screen -dmS glamo bash -c "./start-remote.sh"
```

## 🔍 Verificar Configuração Atual

```bash
# Ver URIs configuradas no Google Console
echo "Verifique em: https://console.cloud.google.com/apis/credentials"

# Ver variáveis de ambiente
cat /home/glamodev/glamo/app/start-remote.sh

# Ver logs do servidor
screen -r glamo
# (Ctrl+A depois D para sair sem matar)
```

## 📝 Notas Importantes

1. **Cross-Origin-Opener-Policy**: O erro que você viu é porque o navegador bloqueia autenticação OAuth em HTTP
2. **IP vs Domínio**: IPs públicos sem HTTPS não são considerados "origem confiável"
3. **Localhost funciona**: `localhost` é uma exceção de segurança do navegador para desenvolvimento

## 🚀 Recomendação Final

Para **produção**, sempre use:
- ✅ Domínio próprio (ex: `glamo.com.br`)
- ✅ HTTPS com certificado SSL
- ✅ Configuração correta no Google Console

Para **desenvolvimento**, use:
- ✅ `localhost:3000` localmente
- ⚠️ IP público apenas para testes (sem OAuth)

---
**Status Atual**: Google OAuth configurado mas requer ajuste no Google Cloud Console
**Próximos Passos**: Adicionar URI de redirecionamento no Google Console
