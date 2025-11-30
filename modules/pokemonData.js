// Módulo para gerenciar dados de pokemons
// Usa dados do arquivo data/pokemons.js

class PokemonData {
  constructor() {
    this.pokemonsMap = new Map();
    this.pokemonsByName = new Map();
    this.pokemonsByNormalizedName = new Map();
    
    // Carregar dados se disponíveis
    if (typeof window !== 'undefined' && window.pokemonsData) {
      console.log(`📦 PokemonData: Carregando ${window.pokemonsData.length} pokemons`);
      this.loadPokemonsData(window.pokemonsData);
      console.log(`✅ PokemonData: ${this.pokemonsByName.size} pokemons mapeados`);
    } else {
      console.warn('⚠️ PokemonData: window.pokemonsData não está disponível');
    }
  }

  loadPokemonsData(pokemonsData) {
    pokemonsData.forEach(pokemon => {
      // Mapear por nome exato
      this.pokemonsByName.set(pokemon.name, pokemon);
      
      // Mapear por nome normalizado (lowercase, sem espaços/hífens)
      const normalized = this.normalizeName(pokemon.name);
      this.pokemonsByNormalizedName.set(normalized, pokemon);
      
      // Também mapear variações comuns
      const variations = this.getPokemonNameVariations(pokemon.name);
      variations.forEach(variation => {
        this.pokemonsByNormalizedName.set(variation, pokemon);
      });
    });
  }

  normalizeName(name) {
    if (!name) return '';
    return name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  }

  getPokemonNameVariations(name) {
    const variations = [];
    const normalized = this.normalizeName(name);
    variations.push(normalized);
    
    // Adicionar variações comuns
    if (name.includes(' ')) {
      variations.push(name.toLowerCase().replace(/\s+/g, '-'));
      variations.push(name.toLowerCase().replace(/\s+/g, ''));
    }
    if (name.includes('-')) {
      variations.push(name.toLowerCase().replace(/-/g, ' '));
      variations.push(name.toLowerCase().replace(/-/g, ''));
    }
    
    // Casos especiais
    if (name === 'Mr. Mime') {
      variations.push('mrmime');
      variations.push('mr mime');
    }
    if (name === 'Mewtwo X') {
      variations.push('mewtwox');
    }
    if (name === 'Mewtwo Y') {
      variations.push('mewtwoy');
    }
    if (name === 'Ho-Oh') {
      variations.push('hooh');
    }
    
    return variations;
  }

  getPokemonByName(name) {
    if (!name) return null;
    
    // Primeiro, aplicar mapeamento de nomes se PokemonMapper estiver disponível
    let mappedName = name;
    if (typeof window !== 'undefined' && window.PokemonMapper) {
      mappedName = window.PokemonMapper.mapPokemonName(name);
    }
    
    // Tentar busca exata primeiro (com nome mapeado)
    let pokemon = this.pokemonsByName.get(mappedName);
    if (pokemon) return pokemon;
    
    // Tentar busca exata com nome original também
    pokemon = this.pokemonsByName.get(name);
    if (pokemon) return pokemon;
    
    // Tentar busca normalizada
    const normalized = this.normalizeName(mappedName);
    pokemon = this.pokemonsByNormalizedName.get(normalized);
    if (pokemon) return pokemon;
    
    // Tentar variações
    const variations = this.getPokemonNameVariations(mappedName);
    for (const variation of variations) {
      pokemon = this.pokemonsByNormalizedName.get(variation);
      if (pokemon) return pokemon;
    }
    
    // Tentar variações do nome original também
    const originalVariations = this.getPokemonNameVariations(name);
    for (const variation of originalVariations) {
      pokemon = this.pokemonsByNormalizedName.get(variation);
      if (pokemon) return pokemon;
    }
    
    return null;
  }

  getPokemonImagePath(pokemonName, imageType = 'complete') {
    const pokemon = this.getPokemonByName(pokemonName);
    if (!pokemon || !pokemon.images) {
      // Fallback: usar PokemonMapper se disponível para mapear nome de imagem
      if (typeof window !== 'undefined' && window.PokemonMapper) {
        const mappedImageName = window.PokemonMapper.mapPokemonImageName(pokemonName);
        const imagePaths = {
          'main': `/pokemons/roster-${mappedImageName}.png`,
          'big': `/pokemons/roster-${mappedImageName}-2x.png`,
          'complete': `/pokemons/stat-${mappedImageName}.png`,
        };
        return imagePaths[imageType] || imagePaths.complete;
      }
      
      // Fallback antigo: gerar caminho baseado no nome
      const fileName = (pokemonName || 'unknown').toLowerCase().replace(/\s+/g, '-');
      const imagePaths = {
        'main': `/pokemons/roster-${fileName}.png`,
        'big': `/pokemons/roster-${fileName}-2x.png`,
        'complete': `/pokemons/stat-${fileName}.png`,
      };
      return imagePaths[imageType] || imagePaths.complete;
    }
    
    // Usar caminho do arquivo de dados
    const imageKey = imageType === 'main' ? 'main' : 
                     imageType === 'big' ? 'big' : 'complete';
    return pokemon.images[imageKey] || pokemon.images.complete || '';
  }

  getAbilityImagePath(pokemonName, abilityCode) {
    if (!pokemonName || !abilityCode) return '';
    
    const pokemon = this.getPokemonByName(pokemonName);
    
    // Se o pokemon tem dados e tem a imagem específica, usar
    if (pokemon && pokemon.images) {
      const moveKey = `move_${abilityCode.toLowerCase()}`;
      if (pokemon.images[moveKey]) {
        return pokemon.images[moveKey];
      }
    }
    
    // Fallback: usar PokemonMapper se disponível para mapear nome de imagem
    let fileName;
    if (typeof window !== 'undefined' && window.PokemonMapper) {
      fileName = window.PokemonMapper.mapPokemonImageName(pokemonName);
    } else {
      // Fallback antigo: normalizar nome do pokemon (ex: "Mr. Mime" -> "mr-mime")
      fileName = (pokemonName || 'unknown').toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');
    }
    
    return `/pokemons/moves/${fileName}_${abilityCode}.png`;
  }

  getBattleItemImagePath(itemName) {
    if (!itemName || itemName === 'none') return '';
    
    // Usar ItemMapper se disponível
    if (window.ItemMapper) {
      const itemMapper = new window.ItemMapper();
      return itemMapper.getBattleItemImagePath(itemName);
    }
    
    // Fallback: gerar caminho baseado no nome
    const fileName = itemName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `/battle-items/${fileName}.png`;
  }

  getHeldItemImagePath(itemName) {
    if (!itemName || itemName === 'none') return '';
    
    // Usar ItemMapper se disponível
    if (window.ItemMapper) {
      const itemMapper = new window.ItemMapper();
      return itemMapper.getHeldItemImagePath(itemName);
    }
    
    // Fallback: gerar caminho baseado no nome
    const fileName = itemName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `/held-itens/${fileName}.png`;
  }

  // Métodos de compatibilidade (para manter API antiga)
  normalizePokemonName(name) {
    // Usar PokemonMapper se disponível
    if (typeof window !== 'undefined' && window.PokemonMapper) {
      return window.PokemonMapper.normalizePokemonName(name);
    }
    
    const pokemon = this.getPokemonByName(name);
    return pokemon ? pokemon.name : (name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : null);
  }
}

// Criar instância global
console.log('🔧 PokemonData: Criando instância...');
const pokemonDataInstance = new PokemonData();

// Exportar instância e funções de compatibilidade
if (typeof module !== 'undefined' && module.exports) {
  module.exports = pokemonDataInstance;
  module.exports.PokemonData = PokemonData;
  console.log('📦 PokemonData: Exportado via module.exports');
} else {
  window.pokemonData = pokemonDataInstance;
  // Não sobrescrever window.PokemonData para evitar referências circulares
  // window.PokemonData já é a instância, não precisa de wrappers
  console.log('📦 PokemonData: Exportado no window', {
    pokemonData: !!window.pokemonData
  });
}

