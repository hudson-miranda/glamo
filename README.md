# <YOUR_APP_NAME>

This project is based on [OpenSaas](https://opensaas.sh) template and consists of three main dirs:
1. `app` - Your web app, built with [Wasp](https://wasp.sh).
2. `e2e-tests` - [Playwright](https://playwright.dev/) tests for your Wasp web app.
3. `blog` - Your blog / docs, built with [Astro](https://docs.astro.build) based on [Starlight](https://starlight.astro.build/) template.

## 🚀 Configuração de Ambiente (Local vs Remoto)

Este projeto pode ser executado tanto em **localhost** quanto em **servidor remoto (VPS)**.

### Método 1: Script Automático (Recomendado)

**Windows PowerShell:**
```powershell
# Para desenvolvimento LOCAL
.\switch-env.ps1 -Mode local

# Para desenvolvimento REMOTO (VPS)
.\switch-env.ps1 -Mode remote

# Depois execute
wasp start
```

**Ubuntu/Linux:**
```bash
# Para desenvolvimento LOCAL
./switch-env.sh local

# Para desenvolvimento REMOTO (VPS)
./switch-env.sh remote

# Depois execute
wasp start
```

### Método 2: Variáveis de Ambiente

**Windows PowerShell:**
```powershell
# Local
$env:VITE_LOCAL_DEV="true"; wasp start

# Remoto
$env:VITE_PUBLIC_IP="191.252.217.98"; wasp start
```

**Ubuntu/Linux:**
```bash
# Local
VITE_LOCAL_DEV=true wasp start

# Remoto
VITE_PUBLIC_IP=191.252.217.98 wasp start
```

### Método 3: Arquivo .env Manual

**Windows PowerShell:**
```powershell
# Local
Copy-Item app\.env.client.local app\.env.client

# Remoto
Copy-Item app\.env.client.remote app\.env.client
```

**Ubuntu/Linux:**
```bash
# Local
cp app/.env.client.local app/.env.client

# Remoto
cp app/.env.client.remote app/.env.client
```

📖 **Mais detalhes:** Veja `app/AMBIENTE_CONFIG.md`

For more details, check READMEs of each respective directory!

