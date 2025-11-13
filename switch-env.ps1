# Script para alternar entre ambiente local e remoto
# Uso: .\switch-env.ps1 -Mode local   OU   .\switch-env.ps1 -Mode remote

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('local', 'remote')]
    [string]$Mode
)

$appDir = "app"
$envFile = Join-Path $appDir ".env.client"
$sourceFile = Join-Path $appDir ".env.client.$Mode"

if (-not (Test-Path $sourceFile)) {
    Write-Error "Arquivo de configuração não encontrado: $sourceFile"
    exit 1
}

# Copia o arquivo de configuração apropriado
Copy-Item -Path $sourceFile -Destination $envFile -Force

Write-Host "✅ Configuração alterada para modo: " -NoNewline
Write-Host "$Mode" -ForegroundColor Green

if ($Mode -eq "local") {
    Write-Host "`n📍 Acesse o sistema em: " -NoNewline
    Write-Host "http://localhost:3000" -ForegroundColor Cyan
} else {
    Write-Host "`n📍 Acesse o sistema em: " -NoNewline
    Write-Host "http://191.252.217.98:3000" -ForegroundColor Cyan
}

Write-Host "`n💡 Execute 'wasp start' para iniciar o servidor`n"
