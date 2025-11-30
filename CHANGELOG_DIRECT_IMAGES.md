# Changelog - Uso Direto de Imagens do UniteAPI

## ✅ Mudança de Abordagem

**Antes:**
- Extração de nomes/códigos de habilidades e itens
- Mapeamento para arquivos locais via `ItemMapper`
- Dependência de arquivos locais nas pastas `public/`

**Agora:**
- Extração direta das URLs das imagens do HTML
- Aumento automático de resolução (w=32 → w=96)
- Uso direto das imagens do UniteAPI
- Sem dependência de arquivos locais

## 🔧 Mudanças Implementadas

### 1. `contentScript.modular.js`

#### Nova Função: `increaseImageResolution(url, targetWidth = 96)`
- Aumenta resolução de URLs do UniteAPI
- Suporta múltiplos formatos de URL:
  - `/_next/image?url=...&w=32` → `w=96`
  - `/Sprites/...` → URL completa com `w=96`
  - URLs completas → ajusta parâmetros

#### `extractAbilitiesFromCell()` - Atualizado
- **Antes**: Retornava array de códigos `['s11', 's21']`
- **Agora**: Retorna array de objetos `[{ code: 's11', url: 'https://...' }, { code: 's21', url: 'https://...' }]`
- Captura URL original da imagem
- Aumenta resolução automaticamente para 96px
- Mantém ordenação correta (s1x primeiro, s2x depois)

#### `extractBattleItemFromCell()` - Atualizado
- **Antes**: Retornava nome do item `'shedinjadoll'`
- **Agora**: Retorna URL completa da imagem `'https://uniteapi.dev/_next/image?url=...&w=96&q=100'`
- Captura URL do `src` ou `srcset`
- Aumenta resolução automaticamente

### 2. `modules/imageGenerator.js`

#### `loadImage()` - Melhorado
- Suporte para URLs externas (HTTP/HTTPS)
- Tratamento de CORS com `crossOrigin = 'anonymous'`
- Fallback gracioso se imagem falhar

#### `drawPlayerSection()` - Simplificado
- **Habilidades**: Usa URLs diretamente de `ability.url`
- **Battle Item**: Usa URL diretamente de `mainPlayer.battleItem`
- Removida dependência de `ItemMapper` e `pokemonData.getAbilityImagePath()`
- Mantém fallback para compatibilidade

## 📊 Exemplo de Transformação

### Antes:
```javascript
abilities: ['s21', 's22']
battleItem: 'shedinjadoll'

// Depois precisava mapear:
itemMapper.getAbilityImagePath('Darkrai', 's21')
// → '/pokemons/moves/darkrai_s21.png'
// → chrome.runtime.getURL('public/pokemons/moves/darkrai_s21.png')
```

### Agora:
```javascript
abilities: [
  { code: 's21', url: 'https://uniteapi.dev/_next/image?url=%2FSprites%2Ft_Skill_Darkrai_S21.png&w=96&q=100' },
  { code: 's22', url: 'https://uniteapi.dev/_next/image?url=%2FSprites%2Ft_Skill_Darkrai_S22.png&w=96&q=100' }
]
battleItem: 'https://uniteapi.dev/_next/image?url=%2FSprites%2Ft_prop_ShedinjaDoll.png&w=96&q=100'

// Uso direto:
await loadImage(ability.url)
```

## 🎯 Benefícios

1. **Simplicidade**: Não precisa mais de mapeamento de nomes
2. **Atualização automática**: Sempre usa as imagens mais recentes do UniteAPI
3. **Menos dependências**: Não precisa manter arquivos locais sincronizados
4. **Melhor qualidade**: Resolução aumentada de 32px para 96px
5. **Menos erros**: Não depende de nomes de arquivos corretos

## ⚠️ Considerações

### CORS (Cross-Origin Resource Sharing)
- Imagens do UniteAPI podem ter restrições de CORS
- `crossOrigin = 'anonymous'` está configurado, mas pode falhar em alguns casos
- Se falhar, a imagem não será carregada, mas o processo continua

### Fallback
- Se a URL não for válida ou a imagem falhar ao carregar, o container fica vazio (laranja)
- O processo de geração continua normalmente

### Compatibilidade
- Mantido suporte para formato antigo (strings) para compatibilidade
- Se `ability` for string, tenta usar mapeamento antigo

## 🚀 Próximos Passos (Opcional)

- [ ] Adicionar cache de imagens carregadas
- [ ] Implementar retry em caso de falha de CORS
- [ ] Adicionar proxy se CORS for um problema
- [ ] Suporte para held items quando disponíveis

