// Módulo para mapear nomes de itens e habilidades para arquivos de imagem

class ItemMapper {
  constructor() {
    // Mapeamento de battle items (nomes do UniteAPI para nomes de arquivo)
    this.battleItemsMap = {
      'shedinjadoll': 'shedinjadoll',
      'ejectbutton': 'ejectbutton',
      'potion': 'potion',
      'fullheal': 'fullheal',
      'fluffytail': 'tail',
      'smoke': 'smoke',
      'xattack': 'xattack',
      'xspeed': 'xspeed',
      'ganrao': 'ganrao',
      'purify': 'purify',
      'gear': 'gear',
      'controller': 'Controller',
    };
    
    // Mapeamento de held items (nomes do UniteAPI para nomes de arquivo)
    // Nota: alguns arquivos têm nomes com "+" e outros sem
    this.heldItemsMap = {
      'muscleband': 'muscleband',
      'focusband': 'focusband',
      'floatstone': 'floatstone',
      'razorclaw': 'razorclaw',
      'scopelens': 'scopelens',
      'shellbell': 'shellbell',
      'scoreshield': 'scoreshield',
      'rockyhelmet': 'rockyhelmet',
      'buddybarrier': 'buddybarrier',
      'energyamplifier': 'energyamplifier',
      'attackweight': 'attackweight',
      'assaultvest': 'assaultvest',
      'aeoscookie': 'aeoscookie',
      'expshare': 'expshare',
      'weaknesspolice': 'weaknesspolice',
      'wiseglasses': 'wiseglasses',
      'spatkspecs': 'spatkspecs',
      'slickspoon': 'slickspoon',
      'rustedsword': 'rustedsword',
      'resonantguard': 'resonantguard',
      'rescuehood': 'rescuehood',
      'rapidscarf': 'rapidscarf',
      'draincrown': 'draincrown',
      'drivelens': 'drivelens',
      'curseincense': 'curseincense',
      'cursebangle': 'cursebangle',
      'choicespecs': 'choicespecs',
      'choicescarf': 'choicescarf',
      'chargingcharm': 'chargingcharm',
      'amuletcoin': 'amuletcoin',
      'accelbracer': 'accelbracer',
      'leftovers': 'Leftovers',
      // Variações com "+"
      'weakness+policy': 'Weakness+Policy',
      'sp.+atk+specs': 'Sp.+Atk+Specs',
      'slick+spoon': 'Slick+Spoon',
      'shell+bell': 'Shell+Bell',
      'score+shield': 'Score+Shield',
      'scope+lens': 'Scope+Lens',
      'rusted+sword': 'Rusted+Sword',
      'rocky+helmet': 'Rocky+Helmet',
      'resonant+guard': 'Resonant+Guard',
      'rescue+hood': 'Rescue+Hood',
      'rapid+fire+scarf': 'Rapid+Fire+Scarf',
      'razor+claw': 'Razor+Claw',
      'muscle+band': 'Muscle+Band',
      'focus+band': 'Focus+Band',
      'float+stone': 'Float+Stone',
      'exp+share': 'Exp+Share',
      'energy+amplifier': 'Energy+Amplifier',
      'drain+crown': 'Drain+Crown',
      'curse+incense': 'Curse+Incense',
      'curse+bangle': 'Curse+Bangle',
      'choice+specs': 'Choice+Specs',
      'charging+charm': 'Charging+Charm',
      'buddy+barrier': 'Buddy+Barrier',
      'attack+weight': 'Attack+Weight',
      'assault+vest': 'Assault+Vest',
      'aeos+cookie': 'Aeos+Cookie',
    };
  }
  
  // Normalizar nome de battle item
  normalizeBattleItemName(name) {
    if (!name || name === 'none') return null;
    const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return this.battleItemsMap[normalized] || normalized;
  }
  
  // Normalizar nome de held item
  normalizeHeldItemName(name) {
    if (!name || name === 'none') return null;
    // Tentar primeiro com o nome exato (pode ter +)
    const withPlus = name.toLowerCase();
    if (this.heldItemsMap[withPlus]) {
      return this.heldItemsMap[withPlus];
    }
    // Tentar sem caracteres especiais
    const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return this.heldItemsMap[normalized] || normalized;
  }
  
  // Obter caminho da imagem do battle item
  getBattleItemImagePath(itemName) {
    const normalized = this.normalizeBattleItemName(itemName);
    if (!normalized) return '';
    return `/battle-items/${normalized}.png`;
  }
  
  // Obter caminho da imagem do held item
  getHeldItemImagePath(itemName) {
    const normalized = this.normalizeHeldItemName(itemName);
    if (!normalized) return '';
    return `/held-itens/${normalized}.png`;
  }
  
  // Obter caminho da imagem da habilidade
  getAbilityImagePath(pokemonName, abilityCode) {
    if (!pokemonName || !abilityCode) return '';
    
    // Normalizar nome do pokemon (ex: "Mr. Mime" -> "mr-mime", "Alolan Ninetales" -> "alolan-ninetales")
    const normalizedPokemon = pokemonName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
    
    // abilityCode deve ser s11, s12, s21, s22, etc.
    return `/pokemons/moves/${normalizedPokemon}_${abilityCode}.png`;
  }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ItemMapper;
} else {
  window.ItemMapper = ItemMapper;
  console.log('📦 ItemMapper exportado no window');
}

