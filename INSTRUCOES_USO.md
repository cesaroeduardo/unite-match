# 📸 Instruções de Uso - UniteAPI Image Generator

## ✅ O que mudou?

A extensão agora usa **Canvas API nativo do JavaScript** ao invés de `dom-to-image`, o que torna a geração de imagens:
- ✨ **Mais rápida** - Sem dependências externas
- 🔒 **Mais segura** - Sem problemas de CSP (Content Security Policy)
- 🎨 **Mais confiável** - Desenho direto no canvas
- 💪 **Mais flexível** - Controle total sobre cada elemento visual

## 📋 Como testar

### 1. Recarregar a extensão no Chrome

1. Abra o Chrome e vá em `chrome://extensions/`
2. Certifique-se de que o **"Modo do desenvolvedor"** está ativado (canto superior direito)
3. Clique em **"Recarregar"** (ícone de atualizar) na extensão **UniteAPI Data Scraper**

### 2. Acessar o UniteAPI

1. Vá para [https://uniteapi.dev/](https://uniteapi.dev/)
2. Pesquise por um jogador (exemplo: seu próprio perfil)
3. Navegue até a seção de histórico de partidas

### 3. Fazer upload da sua foto (opcional, mas recomendado)

1. Procure pelo botão **"Upload Foto do Jogador"** na página
2. Clique e selecione uma foto sua (será armazenada localmente no navegador)
3. A foto aparecerá na imagem gerada

### 4. Gerar a imagem de uma partida

1. **Abra uma partida específica** clicando nela (o accordion deve expandir)
2. Clique no botão **"Gerar Imagem da Partida Aberta"**
3. Aguarde o processamento (você verá um indicador de carregamento)
4. A imagem será baixada automaticamente como arquivo PNG

## 🎨 O que a imagem contém?

A imagem gerada possui 3 seções principais:

### 📙 Seção Esquerda (Laranja) - Jogador
- Nome do jogador
- Foto do usuário (se foi feito upload)
- Pokémon usado com imagem
- Estatísticas pessoais:
  - Score (pontuação)
  - KO (knockouts)
  - A (assists)
  - Damage Dealt (dano causado)
  - Damage Taken (dano recebido)
  - Recovery (cura)

### 📕 Seção Central (Roxo) - Partida
- **Topo**: Placar da partida (seu time vs time adversário)
- **Meio**: Mapa jogado
- **Baixo**: Estatísticas gerais da partida
  - Total KOs
  - Total Assists
  - Total Damage Dealt
  - Team Battles (estimado)
  - (KO+A) Ratio

### 📘 Seção Direita (Roxo) - Radar Chart
- Gráfico radar hexagonal mostrando distribuição de stats:
  - Assists
  - KO
  - Damage Taken
  - Damage Dealt
  - Score
  - Interrupts

## 🐛 Resolução de problemas

### A imagem não está sendo gerada
1. Verifique o console do navegador (`F12` → Console)
2. Procure por mensagens de erro começando com `❌`
3. Certifique-se de que você abriu uma partida específica antes de clicar em "Gerar Imagem"

### As imagens dos Pokémon não aparecem
1. Verifique se a pasta `public/pokemons/` existe e contém as imagens
2. Verifique se os nomes dos arquivos estão corretos (devem corresponder aos nomes em `data/pokemons.js`)

### A foto do usuário não aparece
1. Certifique-se de que você clicou em "Upload Foto do Jogador" e selecionou uma imagem
2. A foto é armazenada localmente - se você limpar os dados do navegador, precisará fazer upload novamente

### Erro "Maximum call stack size exceeded"
- ✅ Este erro foi **corrigido** com a mudança para Canvas API
- Se ainda ocorrer, recarregue a extensão e a página

## 📊 Formato da imagem gerada

- **Dimensões**: 1400x900 pixels
- **Formato**: PNG
- **Qualidade**: Máxima (100%)
- **Nome do arquivo**: `unite-stats-[nome-do-jogador]-[data].png`

## 💡 Dicas

1. **Faça upload da sua foto** antes de gerar a primeira imagem - ficará salva para as próximas
2. **Abra apenas a partida que deseja** - não é necessário selecionar de uma lista
3. **Aguarde o carregamento completo** - a geração pode levar alguns segundos
4. **Compartilhe suas stats** - a imagem está pronta para ser compartilhada em redes sociais!

## 🔧 Tecnologias utilizadas

- **Canvas API** - Geração de imagens nativo do JavaScript
- **Chrome Extension Manifest V3** - Framework da extensão
- **Chrome Storage API** - Armazenamento local da foto do usuário
- **JavaScript ES6+** - Código modular e orientado a objetos

---

**Desenvolvido com ❤️ para a comunidade Pokémon Unite**

