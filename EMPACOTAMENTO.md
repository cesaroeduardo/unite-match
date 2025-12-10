# Como Empacotar a Extensão para Chrome Web Store

## ⚠️ IMPORTANTE - Arquivos a NÃO Incluir no ZIP

Ao criar o pacote ZIP para enviar à Chrome Web Store, **NÃO INCLUA** os seguintes arquivos:

- `preview.html` (arquivo de desenvolvimento)
- `examples/` (pasta de exemplos)
- `*.zip` (arquivos ZIP anteriores)
- `node_modules/` (se houver)
- `.git/` (pasta git)
- `.gitignore`
- `EMPACOTAMENTO.md` (este arquivo)
- Qualquer outro arquivo de desenvolvimento

## ✅ Arquivos que DEVEM ser incluídos:

- `manifest.json`
- `background.js`
- `contentScript.modular.js`
- `icon16.png`, `icon48.png`, `icon128.png`
- `data/` (pasta completa)
- `modules/` (pasta completa)
- `public/` (pasta completa)
- `privacy-policy.html`
- `package.json` (opcional, mas recomendado)

## 📦 Como Criar o Pacote

### Opção 1: Windows (PowerShell)
```powershell
# Criar pasta temporária
New-Item -ItemType Directory -Path "temp-package" -Force

# Copiar arquivos necessários
Copy-Item -Path "manifest.json" -Destination "temp-package/"
Copy-Item -Path "background.js" -Destination "temp-package/"
Copy-Item -Path "contentScript.modular.js" -Destination "temp-package/"
Copy-Item -Path "*.png" -Destination "temp-package/"
Copy-Item -Path "privacy-policy.html" -Destination "temp-package/"
Copy-Item -Path "package.json" -Destination "temp-package/"
Copy-Item -Path "data" -Destination "temp-package/" -Recurse
Copy-Item -Path "modules" -Destination "temp-package/" -Recurse
Copy-Item -Path "public" -Destination "temp-package/" -Recurse

# Criar ZIP
Compress-Archive -Path "temp-package\*" -DestinationPath "unite-match.zip" -Force

# Limpar pasta temporária
Remove-Item -Path "temp-package" -Recurse -Force
```

### Opção 2: Manual
1. Crie uma nova pasta chamada `temp-package`
2. Copie APENAS os arquivos e pastas listados acima
3. Selecione TODOS os arquivos dentro de `temp-package`
4. Clique com botão direito > "Enviar para" > "Pasta compactada"
5. Renomeie para `unite-match-webstore.zip`

## ✅ Verificação Final

Antes de enviar, abra o arquivo ZIP e verifique que:
- ✅ NÃO contém `preview.html`
- ✅ NÃO contém pasta `examples/`
- ✅ Contém `manifest.json` na raiz
- ✅ Contém as pastas `data/`, `modules/`, e `public/`
- ✅ O arquivo ZIP não deve ter mais de 50MB

## 🚀 Enviando para Chrome Web Store

1. Acesse: https://chrome.google.com/webstore/devconsole
2. Clique no item "Unite Match Stats Generator"
3. Vá em "Build" > "Status"
4. Clique em "Upload new version"
5. Envie o arquivo `unite-match-webstore.zip`
6. Aguarde a análise (pode levar alguns dias)






