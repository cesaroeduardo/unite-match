// Módulo para gerar imagem de estatísticas usando Canvas API nativo

class ImageGenerator {
  constructor() {
    console.log('🔧 ImageGenerator constructor iniciado');
    
    // Inicializar dependências de forma segura
    // Sempre usar window.pokemonData (instância) se disponível, não window.PokemonData (pode ter métodos sobrescritos)
    if (window.pokemonData) {
      this.pokemonData = window.pokemonData;
    } else {
      console.warn('⚠️ pokemonData não disponível');
      this.pokemonData = null;
    }
    
    if (window.StatsCalculator) {
      this.statsCalculator = new window.StatsCalculator();
    } else {
      console.warn('⚠️ StatsCalculator não disponível');
      this.statsCalculator = null;
    }
    
    if (window.PhotoUpload) {
      this.photoUpload = new window.PhotoUpload();
    } else {
      console.warn('⚠️ PhotoUpload não disponível');
      this.photoUpload = null;
    }
    
    this.canvas = null;
    this.ctx = null;
  }
  
  initCanvas(width = 1400, height = 905) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
    return this.ctx;
  }
  
  // Carregar imagem de URL
  async loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => resolve(img);
      img.onerror = (err) => {
        console.warn(`Erro ao carregar imagem: ${src}`, err);
        resolve(null); // Continuar mesmo se a imagem falhar
      };
      
      // Se o src começar com /, é um caminho relativo da extensão
      if (src && src.startsWith('/')) {
        img.src = chrome.runtime.getURL('public' + src);
      } else if (src && src.startsWith('data:')) {
        img.src = src; // base64
      } else if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
        // URL externa - tentar com crossOrigin, mas pode falhar por CORS
        // Se falhar, tentar sem crossOrigin
        img.crossOrigin = 'anonymous';
        img.src = src;
      } else {
        img.src = src;
      }
    });
  }
  
  // Desenhar gradiente
  drawGradient(x, y, width, height, color1, color2) {
    const gradient = this.ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
  }
  
  // Desenhar retângulo com cantos arredondados
  roundRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }
  
  // Desenhar gráfico radar
  drawRadarChart(x, y, size, stats) {
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const radius = size / 2 - 40;
    const axes = 6;
    const angleStep = (2 * Math.PI) / axes;
    
    const labels = ['Assists', 'KO', 'Dmg Taken', 'Dmg Dealt', 'Healing', 'Score'];
    const values = [
      stats.assists || 0,
      stats.knockouts || 0,
      stats.damageTaken || 0,
      stats.damageDealt || 0,
      stats.healing || 0,
      stats.scoring || 0,
    ];
    
    // Desenhar círculos de fundo
    for (let i = 1; i <= 5; i++) {
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, (radius / 5) * i, 0, 2 * Math.PI);
      this.ctx.strokeStyle = 'rgba(167, 139, 250, 0.2)';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
    
    // Desenhar eixos e labels
    this.ctx.strokeStyle = 'rgba(167, 139, 250, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.fillStyle = '#e9d5ff';
    this.ctx.font = '12px "Exo 2", sans-serif';
    this.ctx.textAlign = 'center';
    
    for (let i = 0; i < axes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x1 = centerX + radius * Math.cos(angle);
      const y1 = centerY + radius * Math.sin(angle);
      
      // Linha do eixo
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.lineTo(x1, y1);
      this.ctx.stroke();
      
      // Label
      const labelX = centerX + (radius + 20) * Math.cos(angle);
      const labelY = centerY + (radius + 20) * Math.sin(angle);
      this.ctx.fillText(labels[i], labelX, labelY);
    }
    
    // Desenhar polígono de dados
    this.ctx.beginPath();
    for (let i = 0; i < axes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const value = Math.min(values[i] / 100, 1); // Normalizar
      const r = radius * value;
      const px = centerX + r * Math.cos(angle);
      const py = centerY + r * Math.sin(angle);
      
      if (i === 0) {
        this.ctx.moveTo(px, py);
      } else {
        this.ctx.lineTo(px, py);
      }
    }
    this.ctx.closePath();
    this.ctx.fillStyle = 'rgba(167, 139, 250, 0.5)';
    this.ctx.fill();
    this.ctx.strokeStyle = '#a78bfa';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }
  
  // Desenhar seção do jogador (esquerda - laranja) - Layout atualizado
  async drawPlayerSection(x, y, width, height, mainPlayer, userPhoto) {
    const ctx = this.ctx;
    const gap = 20; // gap-5 = 20px (conforme preview linha 93: gap-5)
    let currentY = y; // Começar sem padding no topo
    
    // Log para debug de altura
    console.log('📏 Altura disponível para seção do jogador:', height);
    
    // Calcular altura disponível para garantir que não extrapole
    const maxY = y + height;
    
    // Barra do Nome do Jogador (Topo) - h-20 = 80px (atualizado), text-3xl = 30px
    // No preview: sem padding lateral, ocupa toda a largura da seção
    ctx.fillStyle = '#ea580c';
    this.roundRect(x, currentY, width, 80, 16);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px "Exo 2", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(mainPlayer.playerName || 'Unknown', x + width / 2, currentY + 52); // Ajustado para h-20
    ctx.textAlign = 'left';
    currentY += 80 + gap;
    
    // Layout em duas colunas
    const colLeftWidth = 288; // w-72 = 288px
    const colRightWidth = width - colLeftWidth - gap;
    
    // Definir tamanhos dos items ANTES de calcular photoHeight
    const itemHeight = 96; // h-24 = 96px (atualizado de h-20)
    const itemGap = 20; // gap-5 = 20px (conforme preview linha 125: gap-5)
    
    // Coluna Esquerda: Foto
    const colLeftX = x;
    
    // Foto Quadrada - Mesma altura do bloco de moves (3 items de 96px + 2 gaps de 20px = 328px)
    const photoHeight = (itemHeight * 3) + (itemGap * 2); // 96*3 + 20*2 = 328px
    const photoWidth = colLeftWidth; // Largura da coluna esquerda (288px)
    
    if (userPhoto) {
      const photoImg = await this.loadImage(userPhoto);
      if (photoImg) {
        ctx.fillStyle = '#ea580c';
        this.roundRect(colLeftX, currentY, photoWidth, photoHeight, 16);
        ctx.fill();
        ctx.save();
        this.roundRect(colLeftX, currentY, photoWidth, photoHeight, 16);
        ctx.clip();
        // Centralizar e cobrir toda a área (object-cover)
        const imgAspect = photoImg.width / photoImg.height;
        const boxAspect = photoWidth / photoHeight;
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgAspect > boxAspect) {
          drawHeight = photoHeight;
          drawWidth = photoHeight * imgAspect;
          drawX = colLeftX - (drawWidth - photoWidth) / 2;
          drawY = currentY;
        } else {
          drawWidth = photoWidth;
          drawHeight = photoWidth / imgAspect;
          drawX = colLeftX;
          drawY = currentY - (drawHeight - photoHeight) / 2;
        }
        ctx.drawImage(photoImg, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();
      }
    } else {
      // Placeholder se não tiver foto
      ctx.fillStyle = '#ea580c';
      this.roundRect(colLeftX, currentY, photoWidth, photoHeight, 16);
      ctx.fill();
    }
    
    // Coluna Direita: Habilidades e Battle Item
    const colRightX = colLeftX + 288 + gap;
    let itemY = currentY;
    
    // Coluna de Abilities e Battle Item (sem held items)
    const abilitiesColX = colRightX;
    const abilitiesColWidth = colRightWidth;
    
    // Abilities - Usar TODAS as habilidades na ordem que aparecem
    // Agora as habilidades vêm como objetos { code, url }
    const abilities = mainPlayer.abilities || [];
    
    // Ability 1 - Primeira habilidade disponível
    if (abilities.length > 0) {
      const ability1 = abilities[0];
      const ability1Url = typeof ability1 === 'object' ? ability1.url : null;
      
      ctx.fillStyle = '#f97316';
      this.roundRect(abilitiesColX, itemY, abilitiesColWidth, itemHeight, 10);
      ctx.fill();
      
      if (ability1Url) {
        const abilityImg = await this.loadImage(ability1Url);
        if (abilityImg) {
          // Desenhar imagem quadrada centralizada
          const imgSize = Math.min(abilitiesColWidth - 20, itemHeight - 20) - 12;
          const imgX = abilitiesColX + (abilitiesColWidth - imgSize) / 2;
          const imgY = itemY + (itemHeight - imgSize) / 2;
          ctx.drawImage(abilityImg, imgX, imgY, imgSize, imgSize);
        }
      }
      itemY += itemHeight + itemGap;
    } else {
      ctx.fillStyle = '#f97316';
      this.roundRect(abilitiesColX, itemY, abilitiesColWidth, itemHeight, 10);
      ctx.fill();
      itemY += itemHeight + itemGap;
    }
    
    // Ability 2 - Segunda habilidade disponível
    if (abilities.length > 1) {
      const ability2 = abilities[1];
      const ability2Url = typeof ability2 === 'object' ? ability2.url : null;
      
      ctx.fillStyle = '#f97316';
      this.roundRect(abilitiesColX, itemY, abilitiesColWidth, itemHeight, 10);
      ctx.fill();
      
      if (ability2Url) {
        const abilityImg = await this.loadImage(ability2Url);
        if (abilityImg) {
          // Desenhar imagem quadrada centralizada
          const imgSize = Math.min(abilitiesColWidth - 20, itemHeight - 20) - 12;
          const imgX = abilitiesColX + (abilitiesColWidth - imgSize) / 2;
          const imgY = itemY + (itemHeight - imgSize) / 2;
          ctx.drawImage(abilityImg, imgX, imgY, imgSize, imgSize);
        }
      }
      itemY += itemHeight + itemGap;
    } else {
      ctx.fillStyle = '#f97316';
      this.roundRect(abilitiesColX, itemY, abilitiesColWidth, itemHeight, 10);
      ctx.fill();
      itemY += itemHeight + itemGap;
    }
    
    // Battle Item - Agora vem como URL direta
    if (mainPlayer.battleItem && mainPlayer.battleItem !== 'none' && mainPlayer.battleItem !== null) {
      ctx.fillStyle = '#f97316';
      this.roundRect(abilitiesColX, itemY, abilitiesColWidth, itemHeight, 16);
      ctx.fill();
      
      // Se battleItem é uma URL (string começando com http), usar diretamente
      // Se for um nome (string sem http), tentar usar mapeamento (compatibilidade)
      let battleItemUrl = null;
      if (typeof mainPlayer.battleItem === 'string' && mainPlayer.battleItem.startsWith('http')) {
        battleItemUrl = mainPlayer.battleItem;
      } else if (this.pokemonData && typeof this.pokemonData.getBattleItemImagePath === 'function') {
        try {
          const path = this.pokemonData.getBattleItemImagePath(mainPlayer.battleItem);
          if (path) battleItemUrl = path;
        } catch (err) {
          console.warn('⚠️ Erro ao obter caminho do battle item:', err);
        }
      }
      
      if (battleItemUrl) {
        const battleItemImg = await this.loadImage(battleItemUrl);
        if (battleItemImg) {
          // Desenhar imagem quadrada centralizada
          const imgSize = Math.min(abilitiesColWidth - 20, itemHeight - 20) - 6;
          const imgX = abilitiesColX + (abilitiesColWidth - imgSize) / 2;
          const imgY = itemY + (itemHeight - imgSize) / 2;
          ctx.drawImage(battleItemImg, imgX, imgY, imgSize, imgSize);
        }
      }
    } else {
      ctx.fillStyle = '#f97316';
      this.roundRect(abilitiesColX, itemY, abilitiesColWidth, itemHeight, 16);
      ctx.fill();
    }
    
    // Pokémon Imagem (abaixo da foto/items) - ocupa o espaço restante com overflow hidden
    const pokemonY = currentY + photoHeight + gap;
    // Fallback inicial - será substituído se pokemonData estiver disponível
    let pokemonImagePath = `/pokemons/stat-unknown.png`;
    
    if (this.pokemonData && typeof this.pokemonData.getPokemonImagePath === 'function') {
      try {
        const customPath = this.pokemonData.getPokemonImagePath(mainPlayer.pokemon, 'complete');
        if (customPath) pokemonImagePath = customPath;
      } catch (err) {
        console.warn('⚠️ Erro ao obter caminho do pokemon:', err);
        // Fallback: usar PokemonMapper diretamente se disponível
        if (typeof window !== 'undefined' && window.PokemonMapper) {
          pokemonImagePath = window.PokemonMapper.getPokemonImagePath(mainPlayer.pokemon, 'stat');
        }
      }
    } else if (typeof window !== 'undefined' && window.PokemonMapper) {
      // Se pokemonData não estiver disponível, usar PokemonMapper diretamente
      pokemonImagePath = window.PokemonMapper.getPokemonImagePath(mainPlayer.pokemon, 'stat');
    }
    
    // Container do Pokémon - altura calculada baseada no espaço restante
    // Espaço usado até agora: Nome(80) + Gap(20) + Foto/Moves(328) + Gap(20) = 448px
    // Espaço para stats: 160px + Gap(20) = 180px
    // Espaço restante para pokemon: totalHeight - 448 - 180 = altura disponível
    const usedBeforePokemon = 80 + gap + photoHeight + gap;
    const neededAfterPokemon = gap + 160; // Gap + stats
    const pokemonContainerHeight = height - usedBeforePokemon - neededAfterPokemon;
    
    // Imagem do pokemon é 320x320px, mas vamos cortá-la se necessário
    const pokemonImgSize = 320;
    
    ctx.fillStyle = '#f97316';
    this.roundRect(x, pokemonY, width, pokemonContainerHeight, 16);
    ctx.fill();
    
    const pokemonImg = await this.loadImage(pokemonImagePath);
    if (pokemonImg) {
      // Aplicar clip para overflow-hidden (cortar a imagem)
      ctx.save();
      this.roundRect(x, pokemonY, width, pokemonContainerHeight, 16);
      ctx.clip();
      
      // Centralizar imagem no container
      const pokemonX = x + (width - pokemonImgSize) / 2;
      const pokemonImgY = pokemonY + (pokemonContainerHeight - pokemonImgSize) / 2;
      ctx.drawImage(pokemonImg, pokemonX, pokemonImgY, pokemonImgSize, pokemonImgSize);
      
      ctx.restore();
    }
    
    // Estatísticas Pessoais (apenas 1 linha agora - Damage Dealt, Taken, Recovery)
    const statsY = pokemonY + pokemonContainerHeight + gap;
    
    // Linha única: Damage Dealt, Damage Taken, Recovery - h-40 = 160px (atualizado)
    // No preview: p-4 = 16px padding interno, gap-5 = 20px entre colunas
    const statsPadding = 16; // p-4
    const statsGap = 20; // gap-5
    ctx.fillStyle = '#f97316';
    this.roundRect(x, statsY, width, 160, 16);
    ctx.fill();
    
    const stats = [
      { label: 'Damage Dealt', value: (mainPlayer.damageDone || 0).toLocaleString() },
      { label: 'Damage Taken', value: (mainPlayer.damageTaken || 0).toLocaleString() },
      { label: 'Recovery', value: (mainPlayer.damageHealed || 0).toLocaleString() },
    ];
    
    // Calcular largura de cada coluna considerando gap entre elas
    const statsContentWidth = width - (statsPadding * 2);
    const statWidth = (statsContentWidth - (statsGap * 2)) / 3;
    const statsStartX = x + statsPadding;
    
    stats.forEach((stat, i) => {
      const statX = statsStartX + (statWidth + statsGap) * i + statWidth / 2;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px "Exo 2", sans-serif';
      ctx.textAlign = 'center';
      // Centralizar verticalmente: container 160px
      // Total conteúdo: 36px (número) + 8px (gap aumentado) + 18px (label) = 62px
      // Padding top para centralizar: (160 - 62) / 2 = 49px
      const gapBetweenValueAndLabel = 8; // Aumentado de 4px para 8px
      ctx.fillText(String(stat.value), statX, statsY + 49 + 36);
      
      ctx.font = '18px "Exo 2", sans-serif';
      // Label abaixo do número com espaçamento aumentado
      ctx.fillText(stat.label, statX, statsY + 49 + 36 + gapBetweenValueAndLabel + 18);
    });
    
    ctx.textAlign = 'left';
    
    // Verificar se extrapolou a altura
    const finalY = statsY + 160;
    const usedHeight = finalY - y;
    console.log(`📏 Seção do jogador:`);
    console.log(`   - Largura: ${width}px`);
    console.log(`   - Altura usada: ${usedHeight}px`);
    console.log(`   - Altura disponível: ${height}px`);
    console.log(`   - Pokemon container: ${pokemonContainerHeight}px`);
    console.log(`   - Componentes: Nome(80) + Gap(20) + Foto(${photoHeight}) + Gap(20) + Pokemon(${pokemonContainerHeight}) + Gap(20) + Stats(160)`);
    if (finalY > maxY) {
      console.warn(`⚠️ Seção do jogador extrapolou: ${finalY} > ${maxY} (diferença: ${finalY - maxY}px)`);
    } else {
      console.log(`✅ Seção do jogador OK (sobram ${maxY - finalY}px)`);
    }
  }
  
  // Desenhar seção central - Layout atualizado
  async drawCenterSection(x, y, width, height, matchData, mainPlayer) {
    const ctx = this.ctx;
    const gap = 20; // gap-5 = 20px entre elementos (conforme preview linha 176)
    
    try {
      // Determinar se ganhou
      const { winnerTeam, defeatedTeam } = matchData.fullMatchData || {};
      
      if (!winnerTeam || !defeatedTeam) {
        console.warn('⚠️ Dados de equipe não disponíveis');
        return;
      }
      
      const isWinner = [
        winnerTeam.player1, winnerTeam.player2, winnerTeam.player3, 
        winnerTeam.player4, winnerTeam.player5
      ].some(p => p && p.playerName === mainPlayer.playerName);
      
      // Determinar qual time o usuário está baseado na cor do resultado
      // No HTML: #7D46E2 (roxo) = Purple Team, #F67C1B (laranja) = Orange Team
      // Verificar se há informação sobre qual time é Purple e qual é Orange no matchData
      let purpleScore = matchData.fullMatchData?.purpleScore;
      let orangeScore = matchData.fullMatchData?.orangeScore;
      
      // Se não houver informação de cor, usar os scores dos times diretamente
      // Assumir que o primeiro time (roxo) é Purple e o segundo (laranja) é Orange
      if (purpleScore === null || purpleScore === undefined || orangeScore === null || orangeScore === undefined) {
        // Por padrão, usar os scores dos times na ordem que aparecem
        purpleScore = winnerTeam.totalScore;
        orangeScore = defeatedTeam.totalScore;
      }
      
      // Determinar qual time o usuário está (Purple ou Orange)
      const userTeamScore = isWinner ? winnerTeam.totalScore : defeatedTeam.totalScore;
      const userIsInPurpleTeam = userTeamScore === purpleScore;
      const userIsInOrangeTeam = userTeamScore === orangeScore;
      
      // Determinar os nomes dos times
      const purpleTeamName = userIsInPurpleTeam ? 'Player Team' : 'Purple Team';
      const orangeTeamName = userIsInOrangeTeam ? 'Player Team' : 'Orange Team';
      
      let currentY = y;
      
      // Placar da Partida (Topo) - h-20 (80px) para nome (mesmo tamanho do box do jogador)
      // No preview: gap-5 = 20px entre os times
      const teamWidth = (width - gap) / 2;
      const teamNameHeight = 80; // Mesmo tamanho do box do nome do jogador (h-20)
      
      // Time 1 (Roxo) - Purple Team
      ctx.fillStyle = '#7c3aed';
      this.roundRect(x, currentY, teamWidth, teamNameHeight, 16);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px "Exo 2", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(purpleTeamName, x + teamWidth / 2, currentY + 52); // Ajustado para h-20
      
      currentY += teamNameHeight + gap;
      
      ctx.fillStyle = '#7c3aed';
      this.roundRect(x, currentY, teamWidth, 96, 16); // h-24 = 96px
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px "Exo 2", sans-serif';
      ctx.fillText(`Score: ${purpleScore}`, x + teamWidth / 2, currentY + 60);
      
      // Time 2 (Laranja) - Orange Team
      const team2X = x + teamWidth + gap;
      currentY = y;
      
      ctx.fillStyle = '#ea580c';
      this.roundRect(team2X, currentY, teamWidth, teamNameHeight, 16);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px "Exo 2", sans-serif';
      ctx.fillText(orangeTeamName, team2X + teamWidth / 2, currentY + 52); // Ajustado para h-20
      
      currentY += teamNameHeight + gap;
      
      ctx.fillStyle = '#f97316';
      this.roundRect(team2X, currentY, teamWidth, 96, 16); // h-24 = 96px
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px "Exo 2", sans-serif';
      ctx.fillText(`Score: ${orangeScore}`, team2X + teamWidth / 2, currentY + 60);
      
      ctx.textAlign = 'left';
      
      // Radar Chart (Centro) - com título "Stat Distribution" abaixo
      // Preview: altura fixa h-[486px]
      const radarY = y + teamNameHeight + gap + 96 + gap; // Ajustado para h-20 do nome do time
      const radarHeight = 476; // Altura fixa conforme preview
      const titleHeight = 40; // Espaço para o título
      const genStatsHeightValue = 160; // Altura das estatísticas gerais (h-40 atualizado)
      const genStatsHeightWithGap = genStatsHeightValue + gap; // Altura + gap
      
      ctx.fillStyle = '#7c3aed';
      this.roundRect(x, radarY, width, radarHeight, 16);
      ctx.fill();
      
      // Desenhar radar chart dentro da área (deixar espaço para o título)
      // Diminuir tamanho do gráfico e centralizar no box
      const titleBottomSpacing = 30; // Aumentado de 10 para 30px (espaçamento do título)
      const radarCenterX = x + width / 2;
      // Centralizar verticalmente, deixando mais espaço para o título embaixo
      const availableHeightForRadar = radarHeight - titleHeight - titleBottomSpacing;
      const radarCenterY = radarY + (radarHeight - titleHeight - titleBottomSpacing) / 2;
      
      // Diminuir tamanho do radar (usar menos espaço)
      const availableWidth = width - 80; // Padding lateral aumentado
      const availableHeight = availableHeightForRadar - 40; // Padding vertical
      // Usar 70% do espaço disponível (reduzido de 90%)
      const radarSize = Math.min(availableWidth * 0.70, availableHeight * 0.70, 350); // Reduzido máximo para 350px
      const radarRadius = radarSize / 2;
      
      // Calcular stats do radar
      const allPlayers = this.statsCalculator ? this.statsCalculator.getAllPlayers(matchData) : [];
      const radarStats = this.statsCalculator ? this.statsCalculator.calculateRadarStats(mainPlayer, allPlayers) : {};
      
      // Desenhar círculos de fundo
      for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        ctx.arc(radarCenterX, radarCenterY, (radarRadius / 5) * i, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(167, 139, 250, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      
      // Desenhar eixos e labels
      const axes = 6;
      const angleStep = (2 * Math.PI) / axes;
      const labels = ['Scoring', 'Knockouts', 'Damage Taken', 'Damage Dealt', 'Healing', 'Assists'];
      const values = [
        radarStats.scoring || 50,
        radarStats.knockouts || 50,
        radarStats.damageTaken || 50,
        radarStats.damageDealt || 50,
        radarStats.healing || 50,
        radarStats.assists || 50,
      ];
      
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.5)';
      ctx.lineWidth = 1;
      ctx.fillStyle = '#ffffff';
      // Aumentar tamanho da fonte dos labels (de 10px para 14px para melhor legibilidade)
      ctx.font = 'bold 14px "Exo 2", sans-serif';
      ctx.textAlign = 'center';
      
      for (let i = 0; i < axes; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x1 = radarCenterX + radarRadius * Math.cos(angle);
        const y1 = radarCenterY + radarRadius * Math.sin(angle);
        
        ctx.beginPath();
        ctx.moveTo(radarCenterX, radarCenterY);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        
        // Aumentar distância dos labels do centro (de 20 para 25px)
        const labelX = radarCenterX + (radarRadius + 25) * Math.cos(angle);
        const labelY = radarCenterY + (radarRadius + 25) * Math.sin(angle);
        ctx.fillText(labels[i], labelX, labelY);
      }
      
      // Desenhar polígono de dados
      ctx.beginPath();
      for (let i = 0; i < axes; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const value = Math.min(values[i] / 100, 1);
        const r = radarRadius * value;
        const px = radarCenterX + r * Math.cos(angle);
        const py = radarCenterY + r * Math.sin(angle);
        
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(167, 139, 250, 0.5)';
      ctx.fill();
      ctx.strokeStyle = '#a78bfa';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Título "Stat Distribution" abaixo do radar (dentro do container roxo)
      // Usar o mesmo titleBottomSpacing definido acima
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px "Exo 2", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Stat Distribution', x + width / 2, radarY + radarHeight - titleBottomSpacing);
      
      ctx.textAlign = 'left';
      
      // Estatísticas Gerais (Inferior) - h-32 = 128px, text-2xl = 24px, text-lg = 18px
      // No preview: container externo bg-purple-700 rounded-2xl p-4 h-32
      const genStatsY = radarY + radarHeight + gap;
      const genStatsHeight = genStatsHeightValue; // h-32 = 128px
      
      // Verificar se não extrapola a altura disponível
      const maxY = y + height;
      if (genStatsY + genStatsHeight > maxY) {
        console.warn(`⚠️ Estatísticas gerais extrapolam: ${genStatsY + genStatsHeight} > ${maxY}`);
        // Ajustar para não extrapolar
        const adjustedGenStatsY = maxY - genStatsHeight;
        if (adjustedGenStatsY > radarY + radarHeight) {
          // Recalcular altura do radar se necessário
          const newRadarHeight = adjustedGenStatsY - radarY - gap;
          if (newRadarHeight > 100) {
            // Redesenhar container do radar com nova altura
            ctx.fillStyle = '#7c3aed';
            this.roundRect(x, radarY, width, newRadarHeight, 16);
            ctx.fill();
          }
        }
      }
      
      // Container externo roxo (bg-purple-700 rounded-2xl p-4 h-32)
      // No preview: p-4 = 16px padding interno
      const genStatsContainerPadding = 16; // p-4
      ctx.fillStyle = '#7c3aed';
      this.roundRect(x, genStatsY, width, genStatsHeight, 16);
      ctx.fill();
      
      // Mudança: agora são 4 estatísticas (Score, Knockouts, Assists, Healing) ao invés de 3
      const genStats = [
        { label: 'Score', value: mainPlayer.playerScore || 0 },
        { label: 'Knockouts', value: mainPlayer.kills || 0 },
        { label: 'Assists', value: mainPlayer.assists || 0 },
        { label: 'Healing', value: mainPlayer.healing || 0 },
      ];
      
      // No preview: gap-3 = 12px entre colunas, border-4 = 4px border branca
      // Cada caixa: bg-purple-700 rounded-2xl px-2 py-2 border-4
      // Container interno: flex flex-row gap-3 w-full h-full
      const genStatsGap = 12; // gap-3 entre as caixas
      const genStatsBorder = 4; // border-4 = borda branca de 4px
      
      // Calcular largura de cada coluna considerando gap entre elas
      // Mudança: agora são 4 colunas ao invés de 3
      const genStatsContentWidth = width - (genStatsContainerPadding * 2);
      const genStatWidth = (genStatsContentWidth - (genStatsGap * 3)) / 4; // Mudado de 3 para 4 colunas
      const genStatsStartX = x + genStatsContainerPadding;
      
      // Altura das caixas internas: altura total do container - padding do container externo * 2
      const genStatsInnerHeight = genStatsHeight - (genStatsContainerPadding * 2);
      
      genStats.forEach((stat, i) => {
        const statBoxX = genStatsStartX + (genStatWidth + genStatsGap) * i;
        const statX = statBoxX + genStatWidth / 2;
        const statBoxY = genStatsY + genStatsContainerPadding;
        
        // Caixa individual com fundo roxo (bg-purple-700 rounded-2xl px-2 py-2 border-4)
        ctx.fillStyle = '#7c3aed';
        this.roundRect(statBoxX, statBoxY, genStatWidth, genStatsInnerHeight, 16);
        ctx.fill();
        
        // Borda branca (border-4) - desenhar POR CIMA do fundo
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = genStatsBorder;
        this.roundRect(statBoxX, statBoxY, genStatWidth, genStatsInnerHeight, 16);
        ctx.stroke();
        
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        
        // Usar o mesmo estilo das estatísticas pessoais
        // Tamanho da fonte do número: 36px (bold)
        // Tamanho da fonte da legenda: 18px
        // Espaçamento entre número e legenda: 8px
        const valueFontSize = 36; // Mesmo tamanho das estatísticas pessoais
        const labelFontSize = 18; // Mesmo tamanho das estatísticas pessoais
        const gapBetweenValueAndLabel = 8; // Mesmo espaçamento das estatísticas pessoais
        
        // Calcular altura total do conteúdo
        const contentHeight = valueFontSize + gapBetweenValueAndLabel + labelFontSize;
        // Padding top para centralizar: (genStatsInnerHeight - contentHeight) / 2
        const paddingTop = (genStatsInnerHeight - contentHeight) / 2;
        
        // Desenhar número primeiro (maior, em cima) - mesmo estilo das estatísticas pessoais
        ctx.font = `bold ${valueFontSize}px "Exo 2", sans-serif`;
        const valueY = statBoxY + paddingTop + valueFontSize;
        ctx.fillText(String(stat.value), statX, valueY);
        
        // Desenhar label abaixo (menor, embaixo) - mesmo estilo das estatísticas pessoais
        ctx.font = `${labelFontSize}px "Exo 2", sans-serif`; // Sem bold na legenda (igual às pessoais)
        const labelY = statBoxY + paddingTop + valueFontSize + gapBetweenValueAndLabel + labelFontSize;
        ctx.fillText(stat.label, statX, labelY);
      });
      
      ctx.textAlign = 'left';
    } catch (error) {
      console.error('❌ Erro ao desenhar seção central:', error);
      ctx.fillStyle = '#ff4444';
      ctx.font = '16px "Exo 2", sans-serif';
      ctx.fillText('Erro ao carregar dados da partida', x + 20, y + 100);
    }
  }
  
  // Desenhar seção direita (radar chart)
  async drawRightSection(x, y, width, height, mainPlayer, allPlayers) {
    const ctx = this.ctx;
    
    try {
      // Background roxo
      const gradient = this.drawGradient(x, y, width, height, '#9333ea', '#7e22ce');
      ctx.fillStyle = gradient;
      this.roundRect(x, y, width, height, 15);
      ctx.fill();
      
      // Título
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Exo 2", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Stat Distribution', x + width / 2, y + 40);
      ctx.textAlign = 'left';
      
      // Calcular stats do radar
      let radarStats = {};
      if (this.statsCalculator) {
        try {
          radarStats = this.statsCalculator.calculateRadarStats(mainPlayer, allPlayers);
        } catch (err) {
          console.warn('⚠️ Erro ao calcular stats do radar, usando valores padrão:', err);
          radarStats = {
            assists: 50,
            knockouts: 50,
            damageTaken: 50,
            damageDealt: 50,
            scoring: 50,
            healing: 50
          };
        }
      }
      
      // Desenhar radar chart
      this.drawRadarChart(x + 50, y + 80, width - 100, radarStats);
    } catch (error) {
      console.error('❌ Erro ao desenhar seção direita:', error);
    }
  }
  
  // Gerar imagem completa
  async generateAndDownload(matchData, sourcePlayerName) {
    try {
      console.log('📸 Gerando imagem com Canvas API...', { matchData, sourcePlayerName });
      
      if (!matchData || !matchData.fullMatchData) {
        throw new Error('Dados da partida inválidos');
      }
      
      // Inicializar canvas (1440x905: +20px largura, -5px altura)
      this.initCanvas(1400, 905);
      
      // Background principal (branco)
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(0, 0, 1400, 905);
      
      // Encontrar jogador principal de forma segura
      let allPlayers = [];
      let mainPlayer = null;
      
      if (this.statsCalculator && typeof this.statsCalculator.getAllPlayers === 'function') {
        try {
          allPlayers = this.statsCalculator.getAllPlayers(matchData);
        } catch (err) {
          console.warn('⚠️ Erro ao obter todos os jogadores:', err);
          allPlayers = [];
        }
      }
      
      // Se não conseguiu obter jogadores via statsCalculator, tentar extrair manualmente
      if (allPlayers.length === 0 && matchData.fullMatchData) {
        const { winnerTeam, defeatedTeam } = matchData.fullMatchData;
        if (winnerTeam && defeatedTeam) {
          allPlayers = [
            winnerTeam.player1, winnerTeam.player2, winnerTeam.player3,
            winnerTeam.player4, winnerTeam.player5,
            defeatedTeam.player1, defeatedTeam.player2, defeatedTeam.player3,
            defeatedTeam.player4, defeatedTeam.player5
          ].filter(p => p);
        }
      }
      
      // Encontrar o jogador principal
      if (allPlayers.length > 0) {
        mainPlayer = allPlayers.find(p => 
          p.playerName && sourcePlayerName && 
          p.playerName.toLowerCase() === sourcePlayerName.toLowerCase()
        ) || allPlayers[0];
      }
      
      if (!mainPlayer) {
        throw new Error('Jogador principal não encontrado. Verifique se a partida foi aberta corretamente.');
      }
      
      console.log('✅ Jogador principal encontrado:', mainPlayer.playerName);
      
      // Obter foto do usuário (prioridade 1) ou avatar do UniteAPI (prioridade 2)
      let userPhoto = null;
      if (this.photoUpload && typeof this.photoUpload.getPhoto === 'function') {
        try {
          userPhoto = await this.photoUpload.getPhoto();
          
          // Se não houver foto do usuário, tentar obter avatar do UniteAPI
          if (!userPhoto && typeof this.photoUpload.getAvatar === 'function') {
            try {
              userPhoto = await this.photoUpload.getAvatar();
              if (userPhoto) {
                console.log('✅ Usando avatar do UniteAPI como fallback');
              }
            } catch (err) {
              console.warn('⚠️ Erro ao obter avatar do UniteAPI:', err);
            }
          }
        } catch (err) {
          console.warn('⚠️ Erro ao obter foto do usuário:', err);
        }
      }
      
      // Desenhar seções (layout de 2 colunas conforme preview)
      // Preview: flex flex-row p-4 gap-5
      // ATUALIZADO: Diminuir seção esquerda em 50%
      const padding = 16; // p-4
      const paddingRight = 16; // Padding direito adicional (para canvas 1440)
      const gap = 20; // gap-5
      
      // Calcular baseado no preview de 1400px
      const previewTotalWidth = 1400 - (padding * 2); // 1368px
      const originalLeftWidth = (previewTotalWidth * 2) / 3; // 912px (w-2/3 original)
      
      // Diminuir 50% da largura da seção esquerda
      const leftWidth = originalLeftWidth * 0.7; // 456px (50% de 912px)
      const centerWidth = previewTotalWidth - gap - leftWidth; // 892px (espaço restante)
      
      const totalHeight = 905 - (padding * 2);
      
      console.log('🎨 Desenhando seção do jogador...');
      await this.drawPlayerSection(padding, padding, leftWidth, totalHeight, mainPlayer, userPhoto);
      
      console.log('🎨 Desenhando seção central...');
      await this.drawCenterSection(padding + leftWidth + gap, padding, centerWidth, totalHeight, matchData, mainPlayer);
      
      console.log('💾 Convertendo canvas para imagem...');
      // Converter canvas para blob
      const dataUrl = this.canvas.toDataURL('image/png', 1.0);
      
      // Download
      const link = document.createElement('a');
      const playerName = (mainPlayer.playerName || 'player').replace(/[^a-zA-Z0-9]/g, '_');
      const dateStr = matchData.date ? matchData.date.replace(/\//g, '-') : new Date().toISOString().slice(0, 10);
      link.href = dataUrl;
      link.download = `unite-stats-${playerName}-${dateStr}.png`;
      link.click();
      
      console.log('✅ Imagem gerada e download iniciado');
      return dataUrl;
    } catch (error) {
      console.error('❌ Erro ao gerar imagem:', error);
      console.error('Stack trace:', error.stack);
      throw error;
    }
  }
}

// Exportar
console.log('🔧 ImageGenerator: Exportando classe...');
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageGenerator;
  console.log('📦 ImageGenerator: Exportado via module.exports');
} else {
  window.ImageGenerator = ImageGenerator;
  console.log('📦 ImageGenerator: Exportado no window', { ImageGenerator: !!window.ImageGenerator });
}
