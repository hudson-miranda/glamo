# Guia de Configuração de Ambiente

## Problema Resolvido
O WebSocket do Vite HMR (Hot Module Replacement) estava configurado com IP fixo, causando erro quando acessado via localhost.

## Solução Implementada
O sistema agora detecta automaticamente se está rodando em ambiente local ou remoto através de variáveis de ambiente.

## Como Usar

### Desenvolvimento Local (seu computador)

1. **Renomeie o arquivo de configuração local:**
   
   **Windows PowerShell:**
   ```powershell
   Copy-Item .env.client.local .env.client
   ```
   
   **Ubuntu/Linux:**
   ```bash
   cp .env.client.local .env.client
   ```

2. **Inicie o servidor:**
   ```bash
   wasp start
   ```

3. **Acesse em:**
   - http://localhost:3000

### Desenvolvimento Remoto (VPS)

1. **Renomeie o arquivo de configuração remota:**
   
   **Windows PowerShell:**
   ```powershell
   Copy-Item .env.client.remote .env.client
   ```
   
   **Ubuntu/Linux:**
   ```bash
   cp .env.client.remote .env.client
   ```

2. **Inicie o servidor:**
   ```bash
   wasp start
   ```

3. **Acesse em:**
   - http://191.252.217.98:3000

## Alternativa Rápida (sem arquivos .env)

### Local:

**Windows PowerShell:**
```powershell
$env:VITE_LOCAL_DEV="true"; wasp start
```

**Ubuntu/Linux:**
```bash
VITE_LOCAL_DEV=true wasp start
```

### Remoto (VPS):

**Windows PowerShell:**
```powershell
$env:VITE_PUBLIC_IP="191.252.217.98"; wasp start
```

**Ubuntu/Linux:**
```bash
VITE_PUBLIC_IP=191.252.217.98 wasp start
```

## Mudança de IP do Servidor

Se o IP do seu VPS mudar, edite o arquivo `.env.client.remote`:

```env
VITE_PUBLIC_IP=SEU_NOVO_IP
```

## Verificação

Após iniciar, verifique no console do navegador:
- ✅ **Sem erros** de WebSocket
- ✅ **HMR funcionando** (mudanças no código atualizam automaticamente)

## Configuração Automática

O `vite.config.ts` agora:
- Detecta se `VITE_LOCAL_DEV=true` → usa localhost
- Detecta se `VITE_PUBLIC_IP` está definido → usa o IP especificado
- Padrão: usa localhost (desenvolvimento local)
