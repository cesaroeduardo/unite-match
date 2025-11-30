# Changelog - Extração de Habilidades e Itens

## ✅ Implementações Realizadas

### 1. Novo Módulo: `modules/itemMapper.js`
- Mapeamento completo de battle items para arquivos de imagem
- Mapeamento completo de held items para arquivos de imagem
- Função para obter caminho de imagens de habilidades
- Normalização de nomes (com e sem "+", maiúsculas/minúsculas)

### 2. Melhorias na Extração de Dados (`contentScript.modular.js`)

#### Habilidades (Abilities)
- ✅ Extração melhorada para capturar códigos exatos: `s11`, `s12`, `s21`, `s22`, `s13`, `s23`, `s24`
- ✅ Suporte para múltiplas habilidades por jogador
- ✅ Padrão de URL: `t_Skill_PokemonName_S11.png` → código `s11`

#### Battle Items
- ✅ Extração melhorada com múltiplos seletores
- ✅ Suporte para `alt="Used item"` e classes CSS variadas
- ✅ Padrão de URL: `t_prop_ItemName.png` → nome normalizado

#### Held Items
- ⚠️ Estrutura preparada, mas held items podem não estar visíveis na tabela principal
- ✅ Retorna array vazio por enquanto (pode ser implementado quando disponível na UI)

### 3. Atualização do Gerador de Imagens (`modules/imageGenerator.js`)

#### Renderização de Habilidades
- ✅ Desenha Ability 1 (s11 ou s12) com imagem real
- ✅ Desenha Ability 2 (s21 ou s22) com imagem real
- ✅ Fallback para container vazio se habilidade não disponível

#### Renderização de Battle Item
- ✅ Desenha battle item com imagem real
- ✅ Usa ItemMapper para mapear nome → arquivo
- ✅ Fallback para container vazio se item não disponível

#### Renderização de Held Items
- ✅ Desenha até 3 held items com imagens reais
- ✅ Usa ItemMapper para mapear nomes → arquivos
- ✅ Containers vazios se held items não disponíveis

### 4. Atualização do PokemonData (`modules/pokemonData.js`)

#### Integração com ItemMapper
- ✅ `getBattleItemImagePath()` usa ItemMapper quando disponível
- ✅ `getHeldItemImagePath()` usa ItemMapper quando disponível
- ✅ `getAbilityImagePath()` melhorado para normalizar nomes de pokemon

### 5. Manifest.json
- ✅ Adicionado `modules/itemMapper.js` aos scripts carregados

## 📁 Estrutura de Arquivos de Imagem

### Battle Items
```
/public/battle-items/
  - shedinjadoll.png
  - ejectbutton.png
  - potion.png
  - xspeed.png
  - xattack.png
  - tail.png
  - smoke.png
  - ganrao.png
  - purify.png
  - gear.png
  - Controller.png
```

### Held Items
```
/public/held-itens/
  - muscleband.png / Muscle+Band.png
  - focusband.png / Focus+Band.png
  - floatstone.png / Float+Stone.png
  - ... (múltiplas variações com e sem "+")
```

### Habilidades (Moves)
```
/public/pokemons/moves/
  - {pokemon-name}_s11.png
  - {pokemon-name}_s12.png
  - {pokemon-name}_s21.png
  - {pokemon-name}_s22.png
  - {pokemon-name}_s13.png (alguns pokemons)
  - {pokemon-name}_s23.png (alguns pokemons)
  - {pokemon-name}_s24.png (alguns pokemons)
```

## 🔄 Fluxo de Dados

1. **Extração** (`contentScript.modular.js`)
   - Extrai códigos de habilidades (s11, s12, s21, s22)
   - Extrai nome do battle item
   - Extrai held items (quando disponível)

2. **Mapeamento** (`modules/itemMapper.js`)
   - Normaliza nomes de itens
   - Mapeia para arquivos de imagem corretos
   - Trata variações de nomes (com/sem "+")

3. **Renderização** (`modules/imageGenerator.js`)
   - Carrega imagens usando `chrome.runtime.getURL()`
   - Desenha habilidades e itens no canvas
   - Fallback para containers vazios se imagens não disponíveis

## 🎯 Exemplo de Uso

```javascript
// Dados extraídos do jogador
const playerData = {
  pokemon: "Darkrai",
  abilities: ["s21", "s22"],  // Shadow Claw+, Dark Pulse+
  battleItem: "shedinjadoll",
  heldItems: []  // Pode estar vazio se não disponível na UI
};

// ItemMapper mapeia para caminhos
const itemMapper = new ItemMapper();
const abilityPath = itemMapper.getAbilityImagePath("Darkrai", "s21");
// Retorna: "/pokemons/moves/darkrai_s21.png"

const battleItemPath = itemMapper.getBattleItemImagePath("shedinjadoll");
// Retorna: "/battle-items/shedinjadoll.png"
```

## ⚠️ Notas Importantes

1. **Held Items**: Atualmente retornam array vazio pois podem não estar visíveis na tabela principal do UniteAPI. Se estiverem disponíveis em outra parte da página, a extração pode ser implementada.

2. **Normalização de Nomes**: O ItemMapper trata variações como:
   - `muscleband` ↔ `Muscle+Band`
   - `weaknesspolice` ↔ `Weakness+Policy`
   - Maiúsculas/minúsculas

3. **Caminhos de Imagem**: Todos os caminhos começam com `/` e são transformados em `chrome.runtime.getURL('public/...')` pelo método `loadImage()`.

4. **Fallbacks**: Se uma imagem não for encontrada, o container é desenhado vazio (laranja) mas a geração continua normalmente.

## 🚀 Próximos Passos (Opcional)

- [ ] Implementar extração de held items se estiverem disponíveis na UI
- [ ] Adicionar cache de imagens carregadas
- [ ] Melhorar tratamento de erros de carregamento de imagens
- [ ] Adicionar logs detalhados para debugging

