# Changelog - Unite Match Stats Generator

## [1.0.2] - 2025-12-02

### 🔧 Correções para Conformidade com Chrome Web Store

Esta versão corrige as violações de política da Chrome Web Store que causaram a rejeição da versão 1.0.1.

#### Problemas Corrigidos:
1. **Código Hospedado Remotamente (Principal Problema)**
   - ❌ **REMOVIDO**: Carregamento de fontes do Google Fonts (https://fonts.googleapis.com)
   - ✅ **SOLUÇÃO**: Extensão agora usa fontes do sistema (sans-serif) como fallback
   - 📝 A extensão mantém a referência a "Sora" no CSS, mas com fallback seguro para sans-serif

2. **Erro de Sintaxe**
   - ❌ **CORRIGIDO**: Erro de digitação no arquivo `imageGenerator.js` linha 580
   - ✅ Caractere extra "m" removido de `ctx.stroke();m` → `ctx.stroke();`

3. **Empacotamento**
   - ❌ **PROBLEMA**: Arquivo `preview.html` continha scripts remotos (Tailwind CDN)
   - ✅ **SOLUÇÃO**: Criado `.gitignore` e documentação para excluir arquivos de desenvolvimento
   - 📦 Script PowerShell para criar pacote correto (`criar-pacote.ps1`)

#### Arquivos Modificados:
- `modules/imageGenerator.js` - Correção de sintaxe
- `contentScript.modular.js` - Remoção de importação de fontes externas
- `manifest.json` - Atualização de versão para 1.0.2
- `.gitignore` - Novo arquivo para controle de empacotamento
- `EMPACOTAMENTO.md` - Documentação de como empacotar corretamente
- `criar-pacote.ps1` - Script automatizado para criar pacote
- `CHANGELOG.md` - Este arquivo

#### Teste de Conformidade:
- ✅ Nenhum uso de `eval()` ou `new Function()`
- ✅ Nenhum carregamento de scripts remotos
- ✅ Nenhuma importação de código hospedado externamente
- ✅ Todas as imagens e recursos são locais ou do site uniteapi.dev
- ✅ Manifest V3 válido

### 📝 Notas para Revisão

**Para os revisores da Chrome Web Store:**
- Esta versão corrige completamente a violação de "código hospedado remotamente"
- A extensão agora usa apenas recursos locais e fontes do sistema
- O arquivo `preview.html` foi excluído do pacote (era apenas para desenvolvimento)
- Todos os recursos (imagens, ícones, scripts) estão incluídos localmente na extensão

---

## [1.0.1] - 2025-12-02
- Versão rejeitada pela Chrome Web Store (código hospedado remotamente)

## [1.0.0] - 2025-12-01
- Lançamento inicial






