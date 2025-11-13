# 🚀 Guia Rápido - Configuração de Ambiente

## ⚡ Comandos Rápidos

### Windows PowerShell

```powershell
# Modo Local
.\switch-env.ps1 -Mode local
wasp start

# Modo Remoto (VPS)
.\switch-env.ps1 -Mode remote
wasp start
```

### Ubuntu/Linux

```bash
# Modo Local
./switch-env.sh local
wasp start

# Modo Remoto (VPS)
./switch-env.sh remote
wasp start
```

---

## 🔧 Alternativa: Variáveis de Ambiente Diretas

### Windows PowerShell

```powershell
# Local
$env:VITE_LOCAL_DEV="true"; wasp start

# Remoto
$env:VITE_PUBLIC_IP="191.252.217.98"; wasp start
```

### Ubuntu/Linux

```bash
# Local
VITE_LOCAL_DEV=true wasp start

# Remoto
VITE_PUBLIC_IP=191.252.217.98 wasp start
```

---

## 📝 Alternativa: Cópia Manual

### Windows PowerShell

```powershell
# Local
Copy-Item app\.env.client.local app\.env.client
wasp start

# Remoto
Copy-Item app\.env.client.remote app\.env.client
wasp start
```

### Ubuntu/Linux

```bash
# Local
cp app/.env.client.local app/.env.client
wasp start

# Remoto
cp app/.env.client.remote app/.env.client
wasp start
```

---

## 🌐 URLs de Acesso

- **Local:** http://localhost:3000
- **Remoto:** http://191.252.217.98:3000

---

## 🔄 Trocar IP do Servidor

Edite `app/.env.client.remote`:

```env
VITE_PUBLIC_IP=SEU_NOVO_IP
```

---

## ✅ Verificação

Após iniciar, o console do navegador deve estar **sem erros de WebSocket**.
