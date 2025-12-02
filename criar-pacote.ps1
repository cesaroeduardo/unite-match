# Script para criar pacote da extensão para Chrome Web Store
# Execute no PowerShell: .\criar-pacote.ps1

Write-Host "🚀 Criando pacote para Chrome Web Store..." -ForegroundColor Green

# Criar pasta temporária
$tempDir = "temp-package"
if (Test-Path $tempDir) {
    Remove-Item -Path $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

Write-Host "📁 Copiando arquivos necessários..." -ForegroundColor Yellow

# Copiar arquivos da raiz
Copy-Item -Path "manifest.json" -Destination "$tempDir/" -ErrorAction Stop
Copy-Item -Path "background.js" -Destination "$tempDir/" -ErrorAction Stop
Copy-Item -Path "contentScript.modular.js" -Destination "$tempDir/" -ErrorAction Stop
Copy-Item -Path "privacy-policy.html" -Destination "$tempDir/" -ErrorAction Stop
Copy-Item -Path "icon16.png" -Destination "$tempDir/" -ErrorAction Stop
Copy-Item -Path "icon48.png" -Destination "$tempDir/" -ErrorAction Stop
Copy-Item -Path "icon128.png" -Destination "$tempDir/" -ErrorAction Stop

# Copiar package.json se existir
if (Test-Path "package.json") {
    Copy-Item -Path "package.json" -Destination "$tempDir/" -ErrorAction Stop
}

# Copiar pastas
Copy-Item -Path "data" -Destination "$tempDir/data" -Recurse -ErrorAction Stop
Copy-Item -Path "modules" -Destination "$tempDir/modules" -Recurse -ErrorAction Stop
Copy-Item -Path "public" -Destination "$tempDir/public" -Recurse -ErrorAction Stop

Write-Host "✅ Arquivos copiados com sucesso!" -ForegroundColor Green

# Criar ZIP
$zipName = "unite-match-webstore.zip"
if (Test-Path $zipName) {
    Remove-Item -Path $zipName -Force
}

Write-Host "📦 Criando arquivo ZIP..." -ForegroundColor Yellow
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipName -Force

# Limpar pasta temporária
Remove-Item -Path $tempDir -Recurse -Force

# Mostrar informações do pacote
$zipSize = (Get-Item $zipName).Length / 1MB
Write-Host "" -ForegroundColor Green
Write-Host "✅ Pacote criado com sucesso!" -ForegroundColor Green
Write-Host "📦 Arquivo: $zipName" -ForegroundColor Cyan
Write-Host "📊 Tamanho: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Green
Write-Host "🚀 Próximos passos:" -ForegroundColor Yellow
Write-Host "   1. Acesse: https://chrome.google.com/webstore/devconsole" -ForegroundColor White
Write-Host "   2. Selecione 'Unite Match Stats Generator'" -ForegroundColor White
Write-Host "   3. Vá em 'Build' > 'Status'" -ForegroundColor White
Write-Host "   4. Clique em 'Upload new version'" -ForegroundColor White
Write-Host "   5. Envie o arquivo $zipName" -ForegroundColor White
Write-Host "" -ForegroundColor Green

# Verificar tamanho (limite é 50MB)
if ($zipSize -gt 50) {
    Write-Host "⚠️ AVISO: O arquivo ZIP excede 50MB!" -ForegroundColor Red
} else {
    Write-Host "✅ Tamanho do pacote está dentro do limite (50MB)" -ForegroundColor Green
}

