# 📧 Correção de Links nos Emails - Glamo

## ✅ Problema Resolvido

Os emails enviados pelo sistema estavam com links incorretos do tipo:
```
http://url7794.glamo.com.br/ls/click?upn=...
```

## 🔍 Causa do Problema

O problema tinha **duas causas principais**:

### 1. Variáveis de Ambiente Ausentes
As variáveis `WASP_WEB_CLIENT_URL` e `WASP_SERVER_URL` não estavam definidas no arquivo `production.env`, fazendo com que o Wasp usasse URLs padrão incorretas.

### 2. Click Tracking do SendGrid
O SendGrid possui um sistema de rastreamento de cliques que modifica automaticamente todos os links nos emails para urls de tracking (como `url7794.glamo.com.br`). Isso é útil para analytics, mas problemático para links de autenticação.

## 🛠️ Soluções Aplicadas

### 1. Adicionadas Variáveis de Ambiente Corretas

**Arquivo:** `/home/glamodev/glamo/production.env`

```env
WASP_WEB_CLIENT_URL=https://glamo.com.br
WASP_SERVER_URL=https://glamo.com.br
```

Essas variáveis garantem que o Wasp gere links corretos para:
- Confirmação de email
- Redefinição de senha
- Convites de salão
- Notificações

### 2. Desabilitado Click Tracking do SendGrid

**Arquivo criado:** `/home/glamodev/glamo/patch-sendgrid-tracking.sh`

Este script modifica o código do bundle para adicionar configurações que desabilitam o tracking:

```javascript
trackingSettings: {
  clickTracking: { enable: false },
  openTracking: { enable: false }
}
```

**Benefícios:**
- ✅ Links diretos e limpos nos emails
- ✅ Melhor experiência do usuário
- ✅ Links funcionam imediatamente sem redirecionamentos
- ✅ Mais seguro para links de autenticação

### 3. Atualizado Deploy Script

O arquivo `deploy.sh` foi atualizado para aplicar automaticamente os patches:

```bash
echo "🔧 7. Aplicando patches..."
cd /home/glamodev/glamo
bash patch-oauth-cookies.sh
bash patch-sendgrid-tracking.sh  # <-- NOVO
```

## 📋 Emails Afetados (Agora Corrigidos)

Todos os emails do sistema agora têm links diretos:

1. **Email de Confirmação de Conta** (`verificationLink`)
   - Link: `https://glamo.com.br/email-verification?token=...`
   
2. **Email de Redefinição de Senha** (`passwordResetLink`)
   - Link: `https://glamo.com.br/password-reset?token=...`

3. **Convites de Salão**
   - Link: `https://glamo.com.br/accept-invite?token=...`

4. **Notificações de Trial**
   - Links: `https://glamo.com.br/...`

## 🧪 Como Testar

1. **Criar nova conta:**
   ```
   https://glamo.com.br/signup
   ```

2. **Verificar email recebido** - o link deve estar no formato:
   ```
   https://glamo.com.br/email-verification?token=abc123...
   ```
   ✅ SEM url7794 ou outros redirecionamentos!

3. **Redefinir senha:**
   ```
   https://glamo.com.br/request-password-reset
   ```

4. **Convites:** Criar convite de funcionário e verificar o email

## 📝 Arquivos Modificados

1. `/home/glamodev/glamo/production.env` - Variáveis de ambiente
2. `/home/glamodev/glamo/patch-sendgrid-tracking.sh` - Script de patch (novo)
3. `/home/glamodev/glamo/deploy.sh` - Deploy automático
4. `/home/glamodev/glamo/app/.wasp/build/server/bundle/server.js` - Bundle patchado

## 🚀 Status

- [x] Variáveis de ambiente configuradas
- [x] Click tracking desabilitado
- [x] Backend reiniciado com configurações
- [x] Deploy script atualizado
- [x] Documentação criada

## ⚙️ Comandos Úteis

**Reiniciar backend:**
```bash
screen -S glamo-backend -X quit
cd /home/glamodev/glamo
screen -dmS glamo-backend bash start-backend-v2.sh
```

**Verificar logs do backend:**
```bash
screen -r glamo-backend
# Ctrl+A+D para sair sem parar
```

**Reaplicar patches manualmente:**
```bash
cd /home/glamodev/glamo
bash patch-oauth-cookies.sh
bash patch-sendgrid-tracking.sh
```

## 💡 Notas Importantes

- Os patches são aplicados **automaticamente** a cada deploy via `deploy.sh`
- O Click Tracking está desabilitado **apenas para este projeto**
- Se reinstalar/rebuild do zero, execute `./deploy.sh` para reaplicar
- As variáveis `WASP_*` são essenciais - nunca remover do `production.env`

---

**Data da correção:** 05/12/2025  
**Status:** ✅ Resolvido e testado
