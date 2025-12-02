// Módulo para mapear nomes de Pokémon da Unite API para nomes corretos
// Resolve diferenças entre como a API escreve os nomes e como estão salvos no projeto

// Mapeamento centralizado de nomes de Pokémon (do formato extraído para o formato correto)
const POKEMON_NAME_MAPPING = {
  raichu: "Alolan Raichu",
  rapidash: "Galarian Rapidash",
  ninetales: "Alolan Ninetales",
  urshifu_rapid: "Urshifu",
  hooh: "Ho-Oh",
  meowscara: "Meowscarada",
  charizardx: "Mega Charizard",
  megalucario: "Mega Lucario",
  mrmime: "Mr. Mime",
  "mr.mime": "Mr. Mime",
  "mr mime": "Mr. Mime",
  "mr. mime": "Mr. Mime",
  mewtwox: "Mewtwo X",
  mewtwoy: "Mewtwo Y",
};

// Mapeamento para nomes de imagens (formato com hífens)
const POKEMON_IMAGE_NAME_MAPPING = {
  // Mr. Mime variações (incluindo o nome já mapeado)
  "mr-mime": "mr-mime",
  "mr.mime": "mr-mime",
  "mr mime": "mr-mime",
  "mr. mime": "mr-mime",
  mrmime: "mr-mime",
  
  // Ho-Oh variações
  "ho-oh": "ho-oh",
  "ho.oh": "ho-oh",
  "ho oh": "ho-oh",
  hooh: "ho-oh",
  
  // Mewtwo variações
  mewtwox: "mewtwox",
  mewtwoy: "mewtwoy",
  "mewtwo x": "mewtwox",
  "mewtwo y": "mewtwoy",
  
  // Galarian Rapidash variações
  "galarian-rapidash": "galarian-rapidash",
  "galarian.rapidash": "galarian-rapidash",
  "galarian rapidash": "galarian-rapidash",
  rapidash: "galarian-rapidash",
  
  // Alolan Ninetales variações
  "alolan-ninetales": "alolan-ninetales",
  "alolan.ninetales": "alolan-ninetales",
  "alolan ninetales": "alolan-ninetales",
  ninetales: "alolan-ninetales",
  
  // Alolan Raichu variações
  "alolan-raichu": "alolan-raichu",
  "alolan.raichu": "alolan-raichu",
  "alolan raichu": "alolan-raichu",
  raichu: "alolan-raichu",
  
  // Urshifu variações
  urshifu_rapid: "urshifu",
  "urshifu-rapid": "urshifu",
  "urshifu rapid": "urshifu",
  urshifu: "urshifu",
  
  // Meowscarada variações
  meowscara: "meowscarada",
  meowscarada: "meowscarada",
  
  // Mega Charizard variações
  charizardx: "mega-charizard",
  "mega-charizard": "mega-charizard",
  "mega.charizard": "mega-charizard",
  "mega charizard": "mega-charizard",
  
  // Mega Lucario variações
  megalucario: "mega-lucario",
  "mega-lucario": "mega-lucario",
  "mega.lucario": "mega-lucario",
  "mega lucario": "mega-lucario",
};

/**
 * Mapeia nome de Pokémon extraído da API para o nome correto
 * @param {string} name - Nome do Pokémon como vem da API
 * @returns {string} - Nome correto do Pokémon
 */
function mapPokemonName(name) {
  if (!name) return name;
  const lowerName = name.toLowerCase().trim();
  return POKEMON_NAME_MAPPING[lowerName] || name;
}

/**
 * Mapeia nome de Pokémon para nome de imagem (formato com hífens)
 * @param {string} name - Nome do Pokémon
 * @returns {string} - Nome formatado para usar em caminhos de imagem
 */
function mapPokemonImageName(name) {
  if (!name) return name;

  const lowerName = name.toLowerCase().trim();

  // Primeiro, tentar encontrar diretamente no mapeamento (casos mais comuns)
  if (POKEMON_IMAGE_NAME_MAPPING[lowerName]) {
    return POKEMON_IMAGE_NAME_MAPPING[lowerName];
  }

  // Normalizar o nome: remover pontos, espaços, converter para lowercase
  // Substituir múltiplos hífens por um único hífen
  const normalized = lowerName
    .replace(/[.\s]+/g, "-") // Substituir pontos e espaços por hífen
    .replace(/-+/g, "-") // Múltiplos hífens viram um único
    .replace(/^-|-$/g, ""); // Remover hífens no início/fim

  // Tentar com o nome normalizado
  if (POKEMON_IMAGE_NAME_MAPPING[normalized]) {
    return POKEMON_IMAGE_NAME_MAPPING[normalized];
  }

  // Tentar variações: sem hífens, com underscore, etc.
  const withoutHyphens = normalized.replace(/-/g, "");
  if (POKEMON_IMAGE_NAME_MAPPING[withoutHyphens]) {
    return POKEMON_IMAGE_NAME_MAPPING[withoutHyphens];
  }

  // Caso especial para Mr. Mime: garantir que sempre retorne "mr-mime"
  if (
    normalized === "mr-mime" ||
    withoutHyphens === "mrmime" ||
    (lowerName.includes("mime") && lowerName.includes("mr"))
  ) {
    return "mr-mime";
  }

  // Se não encontrar, retornar o nome normalizado (com hífens)
  return normalized;
}

/**
 * Normaliza nome de Pokémon (primeira letra maiúscula)
 * @param {string} name - Nome do Pokémon
 * @returns {string} - Nome normalizado
 */
function normalizePokemonName(name) {
  if (!name || name === "unknown") return "unknown";

  // Primeiro aplicar o mapeamento, depois normalizar
  const mappedName = mapPokemonName(name);

  // Converter primeira letra para maiúscula e resto para minúscula
  return mappedName.charAt(0).toUpperCase() + mappedName.slice(1).toLowerCase();
}

/**
 * Obtém o nome formatado de um Pokémon (mapeado e normalizado)
 * @param {string|null|undefined} name - Nome do Pokémon
 * @returns {string} - Nome formatado
 */
function getFormattedPokemonName(name) {
  if (!name || name === "unknown") return "unknown";

  // Aplicar mapeamento primeiro
  const formattedName = mapPokemonName(name);

  // Capitalizar corretamente o nome
  // Tratar casos especiais primeiro
  const specialCases = {
    "mr. mime": "Mr. Mime",
    "ho-oh": "Ho-Oh",
    "alolan raichu": "Alolan Raichu",
    "alolan ninetales": "Alolan Ninetales",
    "galarian rapidash": "Galarian Rapidash",
    "mega charizard": "Mega Charizard",
    "mega lucario": "Mega Lucario",
    "mewtwo x": "Mewtwo X",
    "mewtwo y": "Mewtwo Y",
  };

  const lowerFormatted = formattedName.toLowerCase();
  if (specialCases[lowerFormatted]) {
    return specialCases[lowerFormatted];
  }

  // Capitalizar palavras separadas por espaço ou hífen
  // Ex: "pikachu" -> "Pikachu", "charizard-x" -> "Charizard-X"
  return formattedName
    .split(/[\s-]+/)
    .map((word) => {
      if (!word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(formattedName.includes("-") ? "-" : " ");
}

/**
 * Obtém o caminho da imagem do Pokémon
 * @param {string} pokemonName - Nome do Pokémon
 * @param {string} imageType - Tipo de imagem: "roster", "roster-2x", "stat" (padrão: "roster")
 * @returns {string} - Caminho da imagem
 */
function getPokemonImagePath(pokemonName, imageType = "roster") {
  if (!pokemonName || pokemonName === "unknown")
    return "/pokemons/roster-unknown.png";

  // Usar o mapeamento para nome de imagem
  const mappedName = mapPokemonImageName(pokemonName);

  // Construir o caminho da imagem
  const imagePath = `/pokemons/${imageType}-${mappedName}.png`;

  return imagePath;
}

// Exportar funções
const PokemonMapper = {
  mapPokemonName,
  mapPokemonImageName,
  normalizePokemonName,
  getFormattedPokemonName,
  getPokemonImagePath,
  POKEMON_NAME_MAPPING,
  POKEMON_IMAGE_NAME_MAPPING,
};

// Exportar para uso global
if (typeof window !== "undefined") {
  window.PokemonMapper = PokemonMapper;
  console.log("📦 PokemonMapper: Exportado no window");
}

// Exportar para módulos (Node.js/CommonJS)
if (typeof module !== "undefined" && module.exports) {
  module.exports = PokemonMapper;
  console.log("📦 PokemonMapper: Exportado via module.exports");
}





