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
  
  initCanvas(width = 1400, height = 900) {
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
    
    const labels = ['Assists', 'KO', 'Dmg Taken', 'Dmg Dealt', 'Score', 'Interrupts'];
    const values = [
      stats.assists || 0,
      stats.knockouts || 0,
      stats.damageTaken || 0,
      stats.damageDealt || 0,
      stats.scoring || 0,
      stats.interrupts || 0,
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
    const padding = 20; // gap-5 = 20px (gap interno das seções)
    const gap = 20; // gap-5 = 20px (gap interno das seções)
    let currentY = y + padding;
    
    // Calcular altura disponível para garantir que não extrapole
    const maxY = y + height;
    
    // Barra do Nome do Jogador (Topo) - h-16 = 64px, text-3xl = 30px
    ctx.fillStyle = '#ea580c';
    this.roundRect(x + padding, currentY, width - (padding * 2), 64, 16);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px "Exo 2", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(mainPlayer.playerName || 'Unknown', x + width / 2, currentY + 44);
    ctx.textAlign = 'left';
    currentY += 64 + gap;
    
    // Layout em duas colunas
    const colLeftWidth = 288; // w-72 = 288px
    const colRightWidth = width - colLeftWidth - (padding * 2) - gap;
    
    // Coluna Esquerda: Foto
    const colLeftX = x + padding;
    
    // Foto Quadrada (w-72 h-[280px] = 288x280px)
    if (userPhoto) {
      const photoImg = await this.loadImage(userPhoto);
      if (photoImg) {
        ctx.fillStyle = '#ea580c';
        this.roundRect(colLeftX, currentY, 288, 280, 16);
        ctx.fill();
        ctx.save();
        this.roundRect(colLeftX, currentY, 288, 280, 16);
        ctx.clip();
        ctx.drawImage(photoImg, colLeftX, currentY, 288, 280);
        ctx.restore();
      }
    } else {
      // Placeholder se não tiver foto
      ctx.fillStyle = '#ea580c';
      this.roundRect(colLeftX, currentY, 288, 280, 16);
      ctx.fill();
    }
    
    // Coluna Direita: Habilidades e Battle Item
    const colRightX = colLeftX + 288 + gap;
    const itemHeight = 80; // h-20 = 80px
    const itemGap = 20; // gap-5 = 20px
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
      this.roundRect(abilitiesColX, itemY, abilitiesColWidth, itemHeight, 16);
      ctx.fill();
      
      if (ability1Url) {
        const abilityImg = await this.loadImage(ability1Url);
        if (abilityImg) {
          // Desenhar imagem quadrada centralizada
          const imgSize = Math.min(abilitiesColWidth - 20, itemHeight - 20);
          const imgX = abilitiesColX + (abilitiesColWidth - imgSize) / 2;
          const imgY = itemY + (itemHeight - imgSize) / 2;
          ctx.drawImage(abilityImg, imgX, imgY, imgSize, imgSize);
        }
      }
      itemY += itemHeight + itemGap;
    } else {
      ctx.fillStyle = '#f97316';
      this.roundRect(abilitiesColX, itemY, abilitiesColWidth, itemHeight, 16);
      ctx.fill();
      itemY += itemHeight + itemGap;
    }
    
    // Ability 2 - Segunda habilidade disponível
    if (abilities.length > 1) {
      const ability2 = abilities[1];
      const ability2Url = typeof ability2 === 'object' ? ability2.url : null;
      
      ctx.fillStyle = '#f97316';
      this.roundRect(abilitiesColX, itemY, abilitiesColWidth, itemHeight, 16);
      ctx.fill();
      
      if (ability2Url) {
        const abilityImg = await this.loadImage(ability2Url);
        if (abilityImg) {
          // Desenhar imagem quadrada centralizada
          const imgSize = Math.min(abilitiesColWidth - 20, itemHeight - 20);
          const imgX = abilitiesColX + (abilitiesColWidth - imgSize) / 2;
          const imgY = itemY + (itemHeight - imgSize) / 2;
          ctx.drawImage(abilityImg, imgX, imgY, imgSize, imgSize);
        }
      }
      itemY += itemHeight + itemGap;
    } else {
      ctx.fillStyle = '#f97316';
      this.roundRect(abilitiesColX, itemY, abilitiesColWidth, itemHeight, 16);
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
          const imgSize = Math.min(abilitiesColWidth - 20, itemHeight - 20);
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
    
    // Pokémon Imagem (abaixo da foto/items) - h-48 = 192px, w-60 h-60 = 240x240px
    const pokemonY = currentY + 280 + gap;
    let pokemonImagePath = `/public/pokemons/stat-${(mainPlayer.pokemon || 'unknown').toLowerCase().replace(/\s+/g, '-')}.png`;
    
    if (this.pokemonData && typeof this.pokemonData.getPokemonImagePath === 'function') {
      try {
        const customPath = this.pokemonData.getPokemonImagePath(mainPlayer.pokemon, 'complete');
        if (customPath) pokemonImagePath = customPath;
      } catch (err) {
        console.warn('⚠️ Erro ao obter caminho do pokemon:', err);
      }
    }
    
    ctx.fillStyle = '#f97316';
    const pokemonContainerHeight = 192; // h-48
    this.roundRect(x + padding, pokemonY, width - (padding * 2), pokemonContainerHeight, 16);
    ctx.fill();
    
    const pokemonImg = await this.loadImage(pokemonImagePath);
    if (pokemonImg) {
      // Aplicar clip para overflow-hidden
      ctx.save();
      this.roundRect(x + padding, pokemonY, width - (padding * 2), pokemonContainerHeight, 16);
      ctx.clip();
      
      // Centralizar imagem 240x240px no container de 192px de altura
      const pokemonWidth = 240;
      const pokemonHeight = 240;
      const pokemonX = x + (width - pokemonWidth) / 2;
      const pokemonImgY = pokemonY + (pokemonContainerHeight - pokemonHeight) / 2;
      ctx.drawImage(pokemonImg, pokemonX, pokemonImgY, pokemonWidth, pokemonHeight);
      
      ctx.restore();
    }
    
    // Estatísticas Pessoais (2 linhas)
    const statsY = pokemonY + 192 + gap;
    
    // Primeira linha: Score, Knockouts, Assists, Interrupts - h-32 = 128px, text-4xl = 36px, text-lg = 18px
    ctx.fillStyle = '#f97316';
    this.roundRect(x + padding, statsY, width - (padding * 2), 128, 16);
    ctx.fill();
    
    const statsRow1 = [
      { label: 'Score', value: mainPlayer.playerScore || 0 },
      { label: 'Knockouts', value: mainPlayer.kills || 0 },
      { label: 'Assists', value: mainPlayer.assists || 0 },
      { label: 'Interrupts', value: mainPlayer.interrupts || 0 },
    ];
    
    const statWidth = (width - (padding * 2)) / 4;
    statsRow1.forEach((stat, i) => {
      const statX = x + padding + (statWidth * i) + statWidth / 2;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px "Exo 2", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(stat.value), statX, statsY + 50);
      
      ctx.font = '18px "Exo 2", sans-serif';
      ctx.fillText(stat.label, statX, statsY + 85);
    });
    
    // Segunda linha: Damage Dealt, Damage Taken, Recovery - h-32 = 128px
    const statsRow2Y = statsY + 128 + gap;
    ctx.fillStyle = '#f97316';
    this.roundRect(x + padding, statsRow2Y, width - (padding * 2), 128, 16);
    ctx.fill();
    
    const statsRow2 = [
      { label: 'Damage Dealt', value: (mainPlayer.damageDone || 0).toLocaleString() },
      { label: 'Damage Taken', value: (mainPlayer.damageTaken || 0).toLocaleString() },
      { label: 'Recovery', value: (mainPlayer.damageHealed || 0).toLocaleString() },
    ];
    
    const statWidthRow2 = (width - (padding * 2)) / 3;
    statsRow2.forEach((stat, i) => {
      const statX = x + padding + (statWidthRow2 * i) + statWidthRow2 / 2;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px "Exo 2", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(stat.value), statX, statsRow2Y + 50);
      
      ctx.font = '18px "Exo 2", sans-serif';
      ctx.fillText(stat.label, statX, statsRow2Y + 85);
    });
    
    ctx.textAlign = 'left';
    
    // Verificar se extrapolou a altura
    const finalY = statsRow2Y + 128;
    if (finalY > maxY) {
      console.warn(`⚠️ Seção do jogador extrapolou: ${finalY} > ${maxY} (diferença: ${finalY - maxY}px)`);
    }
  }
  
  // Desenhar seção central - Layout atualizado
  async drawCenterSection(x, y, width, height, matchData, mainPlayer) {
    const ctx = this.ctx;
    const padding = 16;
    const gap = 12;
    
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
      
      const teamScore = isWinner ? winnerTeam.totalScore : defeatedTeam.totalScore;
      const opponentScore = isWinner ? defeatedTeam.totalScore : winnerTeam.totalScore;
      
      let currentY = y + padding;
      
      // Placar da Partida (Topo) - h-16 (64px) para nome, h-20 (80px) para score, text-3xl (30px)
      const teamWidth = (width - padding * 2 - gap) / 2;
      
      // Time 1 (Roxo)
      ctx.fillStyle = '#7c3aed';
      this.roundRect(x + padding, currentY, teamWidth, 64, 16);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px "Exo 2", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isWinner ? 'Your Team' : 'Enemy Team', x + padding + teamWidth / 2, currentY + 44);
      
      currentY += 64 + gap;
      
      ctx.fillStyle = '#7c3aed';
      this.roundRect(x + padding, currentY, teamWidth, 80, 16);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px "Exo 2", sans-serif';
      ctx.fillText(`Score: ${teamScore}`, x + padding + teamWidth / 2, currentY + 50);
      
      // Time 2 (Laranja)
      const team2X = x + padding + teamWidth + gap;
      currentY = y + padding;
      
      ctx.fillStyle = '#ea580c';
      this.roundRect(team2X, currentY, teamWidth, 64, 16);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px "Exo 2", sans-serif';
      ctx.fillText(isWinner ? 'Enemy Team' : 'Your Team', team2X + teamWidth / 2, currentY + 44);
      
      currentY += 64 + gap;
      
      ctx.fillStyle = '#f97316';
      this.roundRect(team2X, currentY, teamWidth, 80, 16);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px "Exo 2", sans-serif';
      ctx.fillText(`Score: ${opponentScore}`, team2X + teamWidth / 2, currentY + 50);
      
      ctx.textAlign = 'left';
      
      // Radar Chart (Centro) - com título "Stat Distribution" abaixo
      const radarY = y + padding + 64 + gap + 80 + gap;
      const titleHeight = 40; // Espaço para o título
      const genStatsHeightValue = 128; // Altura das estatísticas gerais (h-32)
      const genStatsHeightWithGap = genStatsHeightValue + gap; // Altura + gap
      const radarHeight = height - (radarY - y) - genStatsHeightWithGap - titleHeight;
      
      ctx.fillStyle = '#7c3aed';
      this.roundRect(x + padding, radarY, width - (padding * 2), radarHeight, 16);
      ctx.fill();
      
      // Desenhar radar chart dentro da área (deixar espaço para o título)
      // No preview: SVG tem viewBox="0 0 200 200" e max-w-xs (320px)
      const radarCenterX = x + width / 2;
      const radarCenterY = radarY + (radarHeight - titleHeight) / 2;
      // Limitar tamanho máximo do radar para corresponder ao preview (max-w-xs = 320px)
      const maxRadarSize = 320;
      const availableWidth = width - padding * 2 - 40;
      const availableHeight = radarHeight - titleHeight - 40;
      const radarSize = Math.min(maxRadarSize, availableWidth, availableHeight);
      const radarRadius = radarSize / 2;
      
      // Calcular stats do radar
      const allPlayers = this.statsCalculator ? this.statsCalculator.getAllPlayers(matchData) : [];
      const radarStats = this.statsCalculator ? this.statsCalculator.calculateRadarStats(mainPlayer, allPlayers) : {};
      
      // Desenhar círculos de fundo
      for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        ctx.arc(radarCenterX, radarCenterY, (radarRadius / 5) * i, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(167, 139, 250, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      
      // Desenhar eixos e labels
      const axes = 6;
      const angleStep = (2 * Math.PI) / axes;
      const labels = ['Interrupts', 'Knockouts', 'Damage Taken', 'Damage Dealt', 'Scoring', 'Assists'];
      const values = [
        radarStats.interrupts || 50,
        radarStats.knockouts || 50,
        radarStats.damageTaken || 50,
        radarStats.damageDealt || 50,
        radarStats.scoring || 50,
        radarStats.assists || 50,
      ];
      
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.3)';
      ctx.lineWidth = 1;
      ctx.fillStyle = '#e9d5ff';
      ctx.font = '10px "Exo 2", sans-serif';
      ctx.textAlign = 'center';
      
      for (let i = 0; i < axes; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x1 = radarCenterX + radarRadius * Math.cos(angle);
        const y1 = radarCenterY + radarRadius * Math.sin(angle);
        
        ctx.beginPath();
        ctx.moveTo(radarCenterX, radarCenterY);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        
        const labelX = radarCenterX + (radarRadius + 20) * Math.cos(angle);
        const labelY = radarCenterY + (radarRadius + 20) * Math.sin(angle);
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
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px "Exo 2", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Stat Distribution', x + width / 2, radarY + radarHeight - 10);
      
      ctx.textAlign = 'left';
      
      // Estatísticas Gerais (Inferior) - h-32 = 128px, text-2xl = 24px, text-lg = 18px
      const genStatsY = radarY + radarHeight + gap;
      const genStatsHeight = genStatsHeightValue; // h-32 (já declarado acima)
      
      // Verificar se não extrapola a altura disponível
      const maxY = y + height;
      if (genStatsY + genStatsHeight > maxY) {
        console.warn(`⚠️ Estatísticas gerais extrapolam: ${genStatsY + genStatsHeight} > ${maxY}`);
        // Ajustar para não extrapolar
        const adjustedGenStatsY = maxY - genStatsHeight - padding;
        if (adjustedGenStatsY > radarY + radarHeight) {
          // Recalcular altura do radar se necessário
          const newRadarHeight = adjustedGenStatsY - radarY - gap;
          if (newRadarHeight > 100) {
            // Redesenhar container do radar com nova altura
            ctx.fillStyle = '#7c3aed';
            this.roundRect(x + padding, radarY, width - (padding * 2), newRadarHeight, 16);
            ctx.fill();
          }
        }
      }
      
      const generalStats = this.statsCalculator ? this.statsCalculator.calculateGeneralStats(matchData) : {};
      
      const genStats = [
        { label: 'KO / Min', value: generalStats.koPerMin || '0' },
        { label: '(KO+A)', value: generalStats.koAssistRatio || 0 },
        { label: 'AVG EXP/min', value: generalStats.avgExpPerMin || 0 },
      ];
      
      const genStatWidth = (width - padding * 2 - gap * 2) / 3;
      
      genStats.forEach((stat, i) => {
        const statX = x + padding + (genStatWidth + gap) * i + genStatWidth / 2;
        
        ctx.fillStyle = '#7c3aed';
        this.roundRect(x + padding + (genStatWidth + gap) * i, genStatsY, genStatWidth, genStatsHeight, 16);
        ctx.fill();
        
        // Borda
        ctx.strokeStyle = '#a78bfa';
        ctx.lineWidth = 4;
        this.roundRect(x + padding + (genStatWidth + gap) * i, genStatsY, genStatWidth, genStatsHeight, 16);
        ctx.stroke();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px "Exo 2", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(stat.label, statX, genStatsY + 40);
        
        ctx.font = 'bold 24px "Exo 2", sans-serif';
        ctx.fillText(String(stat.value), statX, genStatsY + 75);
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
            interrupts: 50
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
      
      // Inicializar canvas
      this.initCanvas(1400, 900);
      
      // Background principal (branco)
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(0, 0, 1400, 900);
      
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
      
      // Obter foto do usuário
      let userPhoto = null;
      if (this.photoUpload && typeof this.photoUpload.getPhoto === 'function') {
        try {
          userPhoto = await this.photoUpload.getPhoto();
        } catch (err) {
          console.warn('⚠️ Erro ao obter foto do usuário:', err);
        }
      }
      
      // Desenhar seções (layout de 2 colunas: esquerda 5/12, centro 7/12)
      // No preview: p-4 = 16px, gap-4 = 16px
      const padding = 16; // p-4
      const gap = 16; // gap-4
      const totalWidth = 1400 - (padding * 2);
      const leftWidth = (totalWidth / 12) * 5; // 5/12 da largura
      const centerWidth = (totalWidth / 12) * 7; // 7/12 da largura
      const totalHeight = 900 - (padding * 2); // Altura total disponível
      
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
