// Content Script principal do UniteApi Scraper - Versão Simplificada
// Este arquivo contém todas as funcionalidades principais sem dependências externas

console.log('🚀 Iniciando Content Script do UniteApi Scraper...');

// Verificar se os módulos foram carregados (agora via manifest.json)
setTimeout(() => {
  console.log('🔄 Verificando módulos carregados via manifest.json...');
  
  const modulesStatus = {
    ImageGenerator: !!window.ImageGenerator,
    PokemonData: !!(window.pokemonData || window.PokemonData),
    PhotoUpload: !!window.PhotoUpload,
    StatsCalculator: !!window.StatsCalculator,
    pokemonsData: !!window.pokemonsData,
    pokemonsCount: window.pokemonsData ? window.pokemonsData.length : 0
  };
  
  const allLoaded = !!(
    window.ImageGenerator &&
    (window.pokemonData || window.PokemonData) &&
    window.PhotoUpload &&
    window.StatsCalculator &&
    window.pokemonsData
  );
  
  if (allLoaded) {
    console.log('✅ Todos os módulos carregados com sucesso:', modulesStatus);
  } else {
    console.error('❌ Alguns módulos não foram carregados:', modulesStatus);
  }
}, 500);

// Classe Utils simplificada
class Utils {
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static generateMatchId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Classe MatchDataExtractor simplificada
class MatchDataExtractor {
  constructor() {
    this.matches = [];
    this.maxMatches = 56;
  }

  isAccordionExpanded(element) {
    try {
      // Verificação específica: procurar por tabelas com dados reais
      const allTables = element.querySelectorAll('table');

      for (const table of allTables) {
        const rows = table.querySelectorAll('tr');

        // Se a tabela tem mais de 2 linhas E está visível, está expandido
        if (rows.length > 2) {
          const rect = table.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            // Verificação adicional: procurar por dados reais de jogadores
            const hasPlayerData = table.querySelector('img[alt*="pokemon"]');
            if (hasPlayerData) {
              return true;
            }
          }
        }
      }

      // Verificação alternativa: procurar por elementos específicos que aparecem quando expandido
      const expandedIndicators = element.querySelectorAll(
        '[class*="sc-a6584c64-0"]'
      );
      if (expandedIndicators.length > 0) {
        // Verificar se há dados reais dentro do indicador
        const hasRealData = expandedIndicators[0].querySelector('table');
        if (hasRealData) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('❌ Erro ao verificar se accordion está expandido:', error);
      return false;
    }
  }

  async expandAllAccordionsOnly(matchElements) {
    try {
      console.log(
        `🔓 EXPANSÃO SIMPLIFICADA: ${matchElements.length} accordions`
      );

      // FASE 1: Clicar em todos os accordions rapidamente
      console.log('🎯 === FASE 1: CLICANDO EM TODOS OS ACCORDIONS ===');
      for (let i = 0; i < matchElements.length; i++) {
        const element = matchElements[i];
        console.log(`🎯 Clicando no accordion ${i + 1}...`);

        try {
          element.click();
          console.log(`🖱️ Clique realizado no accordion ${i + 1}`);
        } catch (error) {
          console.error(
            `❌ Erro ao clicar no accordion ${i + 1}:`,
            error.message
          );
        }
      }

      // FASE 2: Aguardar carregamento dos accordions (reduzido para ser mais responsivo)
      console.log('⏳ Aguardando carregamento dos accordions...');
      await Utils.delay(1000); // Reduzido de 3s para 1s

      // FASE 3: Aguardar renderização das tabelas (reduzido para ser mais responsivo)
      console.log('⏳ Aguardando renderização das tabelas...');
      await Utils.delay(2000); // Reduzido de 5s para 2s

      console.log('✅ === EXPANSÃO CONCLUÍDA ===');
      console.log(
        '🎯 Todos os accordions foram abertos e aguardando renderização...'
      );
      console.log(
        '🚀 Clique no botão "Iniciar Extração de Dados" quando estiver pronto!'
      );
    } catch (error) {
      console.error('❌ Erro durante expansão dos accordions:', error);
      throw error;
    }
  }

  findMatchElements(doc) {
    console.log('🔍 Procurando elementos de partida...');

    // Primeiro, procurar pelos containers que contêm as tabelas
    const tableContainers = doc.querySelectorAll('[class*="sc-a6584c64-0"]');
    console.log(
      `📦 Encontrados ${tableContainers.length} containers de tabela`
    );

    const elements = [];

    // Para cada container de tabela, encontrar o elemento pai que representa a partida
    tableContainers.forEach((container, index) => {
      try {
        // Procurar pelo elemento pai que contém os dados da partida
        // O container da tabela está dentro de um elemento maior que contém WIN/LOSE, data, etc.
        let parentElement = container.parentElement;

        // Subir na hierarquia até encontrar o elemento que contém os dados da partida
        while (parentElement && parentElement !== doc.body) {
          const text = parentElement.textContent || '';

          // Verificar se este elemento contém dados de partida
          const hasOutcome =
            text.includes('Victory') ||
            text.includes('LOSE') ||
            text.includes('WIN') ||
            text.includes('Defeat') ||
            text.includes('Surrendered');
          const hasScore = /\d+\s*[-–]\s*\d+/.test(text);
          const hasDate = /\d{2}-\d{2}-\d{4}/.test(text);
          const hasTime = /\d{1,2}:\d{2}/.test(text);

          if (hasOutcome && (hasScore || hasDate || hasTime)) {
            console.log(
              `✅ Container ${
                index + 1
              }: encontrado elemento pai com dados de partida`
            );
            elements.push(parentElement);
            break;
          }

          parentElement = parentElement.parentElement;
        }

        if (!parentElement || parentElement === doc.body) {
          console.log(
            `⚠️ Container ${
              index + 1
            }: não foi possível encontrar elemento pai válido`
          );
        }
      } catch (e) {
        console.log(`⚠️ Erro ao processar container ${index + 1}:`, e.message);
      }
    });

    // Fallback: se não encontrou containers, usar o método anterior
    if (elements.length === 0) {
      console.log('🔄 Fallback: usando método anterior de busca...');
      const selectors = [
        '[class*="sc-20c903f9"]',
        '[class*="sc-"]',
        'div:has(img[src*="pokemon"])',
      ];

      selectors.forEach(selector => {
        try {
          const found = doc.querySelectorAll(selector);
          elements.push(...Array.from(found));
        } catch (e) {
          // Ignorar erros de seletor
        }
      });
    }

    console.log(`🔍 Encontrados ${elements.length} elementos candidatos`);

    const validMatches = elements.filter((element, index) => {
      const text = element.textContent || element.innerText || '';
      const hasOutcome =
        text.includes('Victory') ||
        text.includes('LOSE') ||
        text.includes('WIN') ||
        text.includes('Defeat') ||
        text.includes('Surrendered');
      const hasScore = /\d+\s*[-–]\s*\d+/.test(text);
      const hasDate = /\d{2}-\d{2}-\d{4}/.test(text);
      const hasTime = /\d{1,2}:\d{2}/.test(text);

      const isValid = hasOutcome && (hasScore || hasDate || hasTime);
      if (isValid) {
        console.log(`✅ Elemento ${index + 1} é uma partida válida`);
      }
      return isValid;
    });

    const uniqueMatches = [];
    const seenTexts = new Set();

    validMatches.forEach(element => {
      const text = element.textContent?.trim() || '';
      const shortText = text.substring(0, 100);

      if (!seenTexts.has(shortText)) {
        seenTexts.add(shortText);
        uniqueMatches.push(element);
      }
    });

    console.log(
      `🎯 ${uniqueMatches.length} elementos únicos de partida encontrados`
    );
    return uniqueMatches;
  }

  async extractMatchesFromCurrentPage() {
    console.log(
      '🎮 Extraindo partidas da página atual (máximo 8 por página)...'
    );

    try {
      const matchElements = this.findMatchElements(document);
      console.log(
        `📊 Encontrados ${matchElements.length} elementos de partida`
      );

      if (matchElements.length > 0) {
        const limitedElements = matchElements.slice(0, 8);
        console.log(
          `🎯 Processando ${limitedElements.length} partidas (máximo 8 por página)`
        );

        console.log('📊 === EXTRAINDO DADOS DE TODAS AS PARTIDAS ===');

        let successCount = 0;
        let tableNotFoundCount = 0;
        let otherErrorCount = 0;

        for (let i = 0; i < limitedElements.length; i++) {
          const element = limitedElements[i];
          console.log(
            `📋 Extraindo dados da partida ${i + 1}/${limitedElements.length}`
          );

          try {
            const match = await this.parseMatchElement(element);
            console.log(`🔍 Partida processada:`, {
              hasOutcome: !!match?.outcome,
              hasError: !!match?.error,
              outcome: match?.outcome,
              error: match?.error,
              errorDetails: match?.errorDetails,
            });

            if (
              match &&
              match.outcome &&
              !match.outcome.includes('Error') &&
              !match.error
            ) {
              this.matches.push(match);
              successCount++;
              console.log(
                `✅ Partida ${i + 1} adicionada: ${match.date} ${
                  match.time
                } - ${match.outcome}`
              );
            } else if (match && match.error === 'TABELA_NAO_ENCONTRADA') {
              tableNotFoundCount++;
              console.log(
                `⚠️ Partida ${i + 1}: Tabela não encontrada - ${
                  match.errorDetails
                }`
              );
            } else if (match && match.error) {
              otherErrorCount++;
              console.log(
                `❌ Partida ${i + 1}: ${match.error} - ${
                  match.errorDetails || 'Erro desconhecido'
                }`
              );
            } else if (
              match &&
              match.outcome &&
              match.outcome.includes('Error')
            ) {
              otherErrorCount++;
              console.log(
                `❌ Partida ${i + 1}: Erro de processamento - ${
                  match.errorDetails || 'Erro desconhecido'
                }`
              );
            } else {
              console.log(`❓ Partida ${i + 1}: Estado desconhecido -`, match);
            }
          } catch (error) {
            otherErrorCount++;
            console.error(`❌ Erro ao processar partida ${i + 1}:`, error);
          }
        }

        // Verificar se há muitos erros de tabela não encontrada
        if (tableNotFoundCount > 0) {
          console.log(
            `⚠️ ${tableNotFoundCount} partidas com tabela não encontrada`
          );
          if (tableNotFoundCount === limitedElements.length) {
            // Todas as partidas falharam - mostrar erro específico
            throw new Error('TODAS_TABELAS_NAO_ENCONTRADAS');
          }
        }

        console.log(`📊 Resumo da extração:`);
        console.log(`   ✅ Sucessos: ${successCount}`);
        console.log(`   ⚠️ Tabela não encontrada: ${tableNotFoundCount}`);
        console.log(`   ❌ Outros erros: ${otherErrorCount}`);
      }

      console.log(`✅ Total de partidas extraídas: ${this.matches.length}`);
      return this.matches;
    } catch (error) {
      if (error.message === 'TODAS_TABELAS_NAO_ENCONTRADAS') {
        console.error(
          '❌ Erro crítico: Todas as partidas falharam - tabelas não encontradas'
        );
        throw new Error('TODAS_TABELAS_NAO_ENCONTRADAS');
      } else {
        console.error('Erro ao extrair partidas da página:', error);
        throw error;
      }
    }
  }

  async parseMatchElement(element) {
    try {
      console.log('🔍 === PARSEANDO ELEMENTO DE PARTIDA ===');

      const match = {
        id: Utils.generateMatchId(),
        extractedAt: new Date().toISOString(),
      };

      const text = element.textContent || element.innerText;
      console.log('📋 Texto da partida (primeiros 400 chars):');
      console.log(text.substring(0, 400));

      // Resultado da partida
      if (text.includes('Victory') || text.includes('WIN')) {
        match.outcome = 'Victory';
      } else if (text.includes('LOSE') || text.includes('Defeat')) {
        match.outcome = 'Defeat';
      } else if (text.includes('Surrendered')) {
        match.outcome = 'Surrendered';
      } else {
        match.outcome = 'Unknown';
      }

      // Data e hora
      const dateMatch = text.match(/(\d{2}-\d{2}-\d{4})\s+(\d{2}:\d{2})/);
      if (dateMatch) {
        match.date = dateMatch[1];
        match.time = dateMatch[2];
      }

      // Mapa
      const mapMatch = text.match(
        /(Theia Sky Ruins|Mer Stadium|Shivre City|Auroma Park|Remoat Stadium)/
      );
      if (mapMatch) {
        match.map = mapMatch[1];
      }

      // Extrair dados completos dos jogadores
      try {
        const matchData = await this.extractAllPlayersData(element, match);

        // Verificar se os dados são válidos
        if (matchData) {
          // Contar jogadores válidos (não nulos)
          const winnerPlayers = [
            matchData.winnerTeam.player1,
            matchData.winnerTeam.player2,
            matchData.winnerTeam.player3,
            matchData.winnerTeam.player4,
            matchData.winnerTeam.player5,
          ].filter(p => p !== null);

          const defeatedPlayers = [
            matchData.defeatedTeam.player1,
            matchData.defeatedTeam.player2,
            matchData.defeatedTeam.player3,
            matchData.defeatedTeam.player4,
            matchData.defeatedTeam.player5,
          ].filter(p => p !== null);

          const totalPlayers = winnerPlayers.length + defeatedPlayers.length;

          // Log para debug
          console.log(
            `🔍 Validação: ${winnerPlayers.length} vencedores + ${defeatedPlayers.length} derrotados = ${totalPlayers} total`
          );

          // Se temos pelo menos 8 jogadores (4 por equipe), consideramos válido
          if (totalPlayers >= 8) {
            match.fullMatchData = matchData;
            match.totalPlayers = totalPlayers;
            console.log(`✅ Partida válida com ${totalPlayers} jogadores`);
            return match;
          } else {
            console.warn(`⚠️ Partida com poucos jogadores: ${totalPlayers}`);
            // Tentar extração alternativa
            const alternativeData = this.extractAlternativeMatchData(
              element,
              match
            );
            if (alternativeData) {
              const altWinnerPlayers = [
                alternativeData.winnerTeam.player1,
                alternativeData.winnerTeam.player2,
                alternativeData.winnerTeam.player3,
                alternativeData.winnerTeam.player4,
                alternativeData.winnerTeam.player5,
              ].filter(p => p !== null);

              const altDefeatedPlayers = [
                alternativeData.defeatedTeam.player1,
                alternativeData.defeatedTeam.player2,
                alternativeData.defeatedTeam.player3,
                alternativeData.defeatedTeam.player4,
                alternativeData.defeatedTeam.player5,
              ].filter(p => p !== null);

              const altTotalPlayers =
                altWinnerPlayers.length + altDefeatedPlayers.length;

              if (altTotalPlayers >= 8) {
                match.fullMatchData = alternativeData;
                match.totalPlayers = altTotalPlayers;
                console.log(
                  `✅ Dados alternativos válidos com ${altTotalPlayers} jogadores`
                );
                return match;
              }
            }

            // Se ainda não conseguiu, marcar como erro
            match.error = 'INSUFFICIENT_PLAYERS';
            match.errorDetails = `Partida tem apenas ${totalPlayers} jogadores`;
            return match;
          }
        }
      } catch (error) {
        if (error.message === 'TABELA_NAO_ENCONTRADA') {
          // Erro específico de tabela não encontrada
          throw new Error('TABELA_NAO_ENCONTRADA');
        } else {
          // Outros erros de extração
          throw error;
        }
      }

      console.log('✅ Partida processada:', match);
      return match;
    } catch (error) {
      if (error.message === 'TABELA_NAO_ENCONTRADA') {
        console.error(
          '❌ Erro específico: Tabela de dados não encontrada na partida'
        );
        return {
          id: Utils.generateMatchId(),
          outcome: 'Error - Tabela não encontrada',
          extractedAt: new Date().toISOString(),
          error: 'TABELA_NAO_ENCONTRADA',
          errorDetails:
            'Não foi possível encontrar a tabela de dados dos jogadores nesta partida',
        };
      } else {
        console.error('❌ Erro ao processar elemento de partida:', error);
        return {
          id: Utils.generateMatchId(),
          outcome: 'Error',
          extractedAt: new Date().toISOString(),
          error: 'PROCESSING_ERROR',
          errorDetails:
            error.message || 'Erro desconhecido ao processar partida',
        };
      }
    }
  }

  async extractAllPlayersData(element, match) {
    try {
      console.log('👥 Extraindo dados de todos os jogadores...');
      await Utils.delay(1000);

      // Debug: verificar a estrutura do elemento
      console.log('🔍 Estrutura do elemento:', element);

      // A tabela está dentro de um div com classe sc-a6584c64-0
      // Vamos procurar de forma mais específica
      const tableContainer = element.querySelector('[class*="sc-a6584c64-0"]');
      console.log('📦 Container da tabela encontrado:', tableContainer);

      if (tableContainer) {
        const table = tableContainer.querySelector('table');
        console.log('📊 Tabela encontrada:', table);

        if (table) {
          console.log('✅ Tabela de jogadores encontrada, extraindo dados...');
          const matchData = this.extractCompleteMatchDataFromTable(
            table,
            match,
            element
          );

          if (matchData) {
            // Verificar se os dados são válidos (exatamente 10 jogadores total)
            const winnerPlayers = [
              matchData.winnerTeam.player1,
              matchData.winnerTeam.player2,
              matchData.winnerTeam.player3,
              matchData.winnerTeam.player4,
              matchData.winnerTeam.player5,
            ].filter(p => p !== null);

            const defeatedPlayers = [
              matchData.defeatedTeam.player1,
              matchData.defeatedTeam.player2,
              matchData.defeatedTeam.player3,
              matchData.defeatedTeam.player4,
              matchData.defeatedTeam.player5,
            ].filter(p => p !== null);

            const totalPlayers = winnerPlayers.length + defeatedPlayers.length;

            if (totalPlayers !== 10) {
              console.warn(
                `⚠️ Dados inválidos: ${totalPlayers} jogadores em vez de 10`
              );
              console.warn('🔄 Tentando extração alternativa...');

              // Tentar extração alternativa
              const alternativeData = this.extractAlternativeMatchData(
                table,
                match
              );
              if (
                alternativeData &&
                alternativeData.winnerTeam.player1 &&
                alternativeData.winnerTeam.player2 &&
                alternativeData.winnerTeam.player3 &&
                alternativeData.winnerTeam.player4 &&
                alternativeData.winnerTeam.player5 &&
                alternativeData.defeatedTeam.player1 &&
                alternativeData.defeatedTeam.player2 &&
                alternativeData.defeatedTeam.player3 &&
                alternativeData.defeatedTeam.player4 &&
                alternativeData.defeatedTeam.player5
              ) {
                matchData = alternativeData;
                console.log('✅ Dados alternativos extraídos com sucesso');
              }
            }

            match.fullMatchData = matchData;
            match.totalPlayers = totalPlayers;

            console.log(
              `✅ Dados completos extraídos: ${match.totalPlayers} jogadores total`
            );
            return matchData;
          } else {
            console.log('❌ Falha ao extrair dados estruturados da tabela');
            return null;
          }
        } else {
          console.log('❌ Tabela não encontrada dentro do container');
        }
      } else {
        console.log('❌ Container da tabela não encontrado');

        // Fallback: procurar por qualquer tabela no elemento
        const allTables = element.querySelectorAll('table');
        console.log(
          `🔍 Fallback: encontradas ${allTables.length} tabelas no elemento`
        );

        if (allTables.length > 0) {
          const firstTable = allTables[0];
          console.log('✅ Usando primeira tabela encontrada como fallback');

          const matchData = this.extractCompleteMatchDataFromTable(
            firstTable,
            match,
            element
          );
          if (matchData) {
            const winnerPlayers = [
              matchData.winnerTeam.player1,
              matchData.winnerTeam.player2,
              matchData.winnerTeam.player3,
              matchData.winnerTeam.player4,
              matchData.winnerTeam.player5,
            ].filter(p => p !== null);

            const defeatedPlayers = [
              matchData.defeatedTeam.player1,
              matchData.defeatedTeam.player2,
              matchData.defeatedTeam.player3,
              matchData.defeatedTeam.player4,
              matchData.defeatedTeam.player5,
            ].filter(p => p !== null);

            const totalPlayers = winnerPlayers.length + defeatedPlayers.length;

            // Se temos pelo menos 8 jogadores, consideramos válido
            if (totalPlayers >= 8) {
              match.fullMatchData = matchData;
              match.totalPlayers = totalPlayers;
              console.log(
                `✅ Dados completos extraídos via fallback: ${match.totalPlayers} jogadores total`
              );
              return matchData;
            } else {
              console.warn(`⚠️ Fallback com poucos jogadores: ${totalPlayers}`);
              return null;
            }
          }
        }
      }

      // Se chegou até aqui, não conseguiu extrair dados
      console.log('❌ Nenhuma tabela de dados encontrada');
      throw new Error('TABELA_NAO_ENCONTRADA');

      return null;
    } catch (error) {
      if (error.message === 'TABELA_NAO_ENCONTRADA') {
        console.error('❌ Erro específico: Tabela de dados não encontrada');
        throw error; // Re-throw para ser capturado pelo método superior
      } else {
        console.error('❌ Erro ao extrair dados de todos os jogadores:', error);
        return null;
      }
    }
  }

  extractCompleteMatchDataFromTable(table, match, element = null) {
    try {
      console.log('🔍 Extraindo dados completos da tabela...');

      const matchDate = this.extractMatchDate(match);
      const matchType = this.extractMatchType(match);

      const winnerTeam = this.extractWinnerTeamFromTable(table);
      const defeatedTeam = this.extractDefeatedTeamFromTable(table);

      if (!winnerTeam || !defeatedTeam) {
        console.log('❌ Falha ao extrair dados das equipes');
        return null;
      }

      // Extrair informação sobre qual time é Purple e qual é Orange baseado na cor do resultado
      let purpleScore = null;
      let orangeScore = null;
      
      if (element) {
        // Procurar pelos elementos com as cores dos scores
        // #7D46E2 (roxo) = Purple Team, #F67C1B (laranja) = Orange Team
        const scoreElements = element.querySelectorAll('p[color]');
        for (const scoreEl of scoreElements) {
          const color = scoreEl.getAttribute('color');
          const score = parseInt(scoreEl.textContent.trim());
          
          if (color === '#7D46E2' || color === '#7d46e2') {
            // Roxo = Purple Team
            purpleScore = score;
            console.log(`🟣 Purple Team score encontrado: ${score}`);
          } else if (color === '#F67C1B' || color === '#f67c1b') {
            // Laranja = Orange Team
            orangeScore = score;
            console.log(`🟠 Orange Team score encontrado: ${score}`);
          }
        }
      }

      const matchData = {
        matchDate: matchDate,
        matchType: matchType,
        winnerTeam: winnerTeam,
        defeatedTeam: defeatedTeam,
        purpleScore: purpleScore,
        orangeScore: orangeScore,
      };

      console.log('✅ Dados estruturados extraídos com sucesso');
      return matchData;
    } catch (error) {
      console.error('❌ Erro ao extrair dados completos da tabela:', error);
      return null;
    }
  }

  extractAlternativeMatchData(element, match) {
    try {
      console.log('🔄 Tentando extração alternativa de dados...');

      // Procurar pela tabela dentro do elemento
      const table = element.querySelector('table');
      if (!table) {
        console.log('❌ Tabela não encontrada para extração alternativa');
        return null;
      }

      // Procurar por todas as linhas da tabela
      const allRows = table.querySelectorAll('tr');
      const playerRows = [];

      for (const row of allRows) {
        const firstCell = row.querySelector('td');
        if (firstCell) {
          const hasPokemonImg = firstCell.querySelector('img[alt*="pokemon"]');
          if (hasPokemonImg) {
            playerRows.push(row);
          }
        }
      }

      console.log(
        `🔍 Encontradas ${playerRows.length} linhas de jogadores na tabela`
      );

      // Aceitar partidas com pelo menos 8 jogadores (4 por equipe)
      if (playerRows.length < 8) {
        console.warn(
          `⚠️ Número insuficiente de jogadores: ${playerRows.length}`
        );
        return null;
      }

      // Dividir em duas equipes (primeiros 5 e últimos 5)
      const winnerRows = playerRows.slice(0, 5);
      const defeatedRows = playerRows.slice(5, 10);

      // Extrair dados dos jogadores
      const winnerPlayers = winnerRows
        .map((row, index) => this.extractPlayerDataFromTableRow(row, index + 1))
        .filter(p => p !== null);

      const defeatedPlayers = defeatedRows
        .map((row, index) => this.extractPlayerDataFromTableRow(row, index + 6))
        .filter(p => p !== null);

      const winnerTeam = {
        totalScore: 0,
        player1: winnerPlayers[0] || null,
        player2: winnerPlayers[1] || null,
        player3: winnerPlayers[2] || null,
        player4: winnerPlayers[3] || null,
        player5: winnerPlayers[4] || null,
      };

      const defeatedTeam = {
        totalScore: 0,
        player1: defeatedPlayers[0] || null,
        player2: defeatedPlayers[1] || null,
        player3: defeatedPlayers[2] || null,
        player4: defeatedPlayers[3] || null,
        player5: defeatedPlayers[4] || null,
      };

      const matchData = {
        matchDate: this.extractMatchDate(match),
        matchType: this.extractMatchType(match),
        winnerTeam: winnerTeam,
        defeatedTeam: defeatedTeam,
      };

      console.log('✅ Extração alternativa concluída com sucesso');
      return matchData;
    } catch (error) {
      console.error('❌ Erro na extração alternativa:', error);
      return null;
    }
  }

  extractMatchDate(match) {
    try {
      if (match.date && match.time) {
        return `${match.date} ${match.time}`;
      }
      return 'Unknown';
    } catch (error) {
      return 'Unknown';
    }
  }

  extractMatchType(match) {
    try {
      const text = match.textContent || '';
      if (text.includes('Duo Q.')) return 'Duo Q.';
      if (text.includes('Solo Q.')) return 'Solo Q.';
      if (text.includes('Trio Q.')) return 'Trio Q.';
      if (text.includes('Five S.')) return 'Five S.';
      return 'Standard';
    } catch (error) {
      return 'Standard';
    }
  }

  extractWinnerTeamFromTable(table) {
    try {
      console.log('🏆 Extraindo dados da equipe vencedora...');

      // Procurar pelo cabeçalho que contém "Victory -"
      const victoryHeader = Array.from(table.querySelectorAll('th')).find(th =>
        th.textContent.includes('Victory')
      );

      if (!victoryHeader) {
        console.log('❌ Cabeçalho Victory não encontrado');
        return null;
      }

      const scoreText = victoryHeader.textContent;
      const scoreMatch = scoreText.match(/Victory\s*-\s*(\d+)/);
      const totalScore = scoreMatch ? parseInt(scoreMatch[1]) : 0;

      console.log(`🏆 Score da equipe vencedora: ${totalScore}`);

      // Procurar pelas linhas da equipe vencedora
      // As linhas estão após o cabeçalho Victory até encontrar o cabeçalho Defeated
      const victoryRows = this.getTeamRows(table, victoryHeader, 'Victory');
      if (victoryRows.length === 0) {
        console.log('❌ Nenhuma linha da equipe vencedora encontrada');
        return null;
      }

      const players = victoryRows
        .map((row, index) => this.extractPlayerDataFromTableRow(row, index + 1))
        .filter(player => player !== null);

      console.log(`✅ Equipe vencedora: ${players.length} jogadores extraídos`);

      return {
        totalScore: totalScore,
        player1: players[0] || null,
        player2: players[1] || null,
        player3: players[2] || null,
        player4: players[3] || null,
        player5: players[4] || null,
      };
    } catch (error) {
      console.error('❌ Erro ao extrair dados da equipe vencedora:', error);
      return null;
    }
  }

  extractDefeatedTeamFromTable(table) {
    try {
      console.log('💀 Extraindo dados da equipe derrotada...');

      // Procurar pelo cabeçalho que contém "Defeated -"
      const defeatedHeader = Array.from(table.querySelectorAll('th')).find(th =>
        th.textContent.includes('Defeated')
      );

      if (!defeatedHeader) {
        console.log('❌ Cabeçalho Defeated não encontrado');
        return null;
      }

      const scoreText = defeatedHeader.textContent;
      const scoreMatch = scoreText.match(/Defeated\s*-\s*(\d+)/);
      const totalScore = scoreMatch ? parseInt(scoreMatch[1]) : 0;

      console.log(`💀 Score da equipe derrotada: ${totalScore}`);

      // Procurar pelas linhas da equipe derrotada
      const defeatedRows = this.getTeamRows(table, defeatedHeader, 'Defeated');
      if (defeatedRows.length === 0) {
        console.log('❌ Nenhuma linha da equipe derrotada encontrada');
        return null;
      }

      const players = defeatedRows
        .map((row, index) => this.extractPlayerDataFromTableRow(row, index + 1))
        .filter(player => player !== null);

      console.log(`✅ Equipe derrotada: ${players.length} jogadores extraídos`);

      return {
        totalScore: totalScore,
        players: players,
        player1: players[0] || null,
        player2: players[1] || null,
        player3: players[2] || null,
        player4: players[3] || null,
        player5: players[4] || null,
      };
    } catch (error) {
      console.error('❌ Erro ao extrair dados da equipe derrotada:', error);
      return null;
    }
  }

  getTeamRows(table, teamHeader, teamType) {
    try {
      const rows = [];
      let currentRow = teamHeader.parentElement.nextElementSibling;
      let playerCount = 0;
      const maxPlayers = 5; // Máximo de 5 jogadores por equipe

      console.log(`🔍 Procurando linhas para equipe ${teamType}...`);

      while (
        currentRow &&
        currentRow.tagName === 'TR' &&
        playerCount < maxPlayers
      ) {
        const firstCell = currentRow.querySelector('td');
        if (firstCell) {
          const cellText = firstCell.textContent || '';

          // Se encontrou outro cabeçalho de equipe, parar
          if (cellText.includes('Victory') || cellText.includes('Defeated')) {
            console.log(`🛑 Encontrado cabeçalho de outra equipe: ${cellText}`);
            break;
          }

          // Verificar se é uma linha de jogador (tem imagem de pokemon)
          const hasPokemonImg = firstCell.querySelector('img[alt*="pokemon"]');
          if (hasPokemonImg) {
            console.log(
              `✅ Linha de jogador encontrada: ${cellText.substring(0, 50)}...`
            );
            rows.push(currentRow);
            playerCount++;

            // Se já temos 5 jogadores, parar
            if (playerCount >= maxPlayers) {
              console.log(
                `🛑 Limite de ${maxPlayers} jogadores atingido para equipe ${teamType}`
              );
              break;
            }
          } else {
            console.log(
              `⚠️ Linha ignorada (sem pokemon): ${cellText.substring(0, 50)}...`
            );
          }
        }

        currentRow = currentRow.nextElementSibling;
      }

      console.log(
        `📋 Encontradas ${rows.length} linhas para equipe ${teamType} (máximo: ${maxPlayers})`
      );

      // Verificar se temos exatamente 5 jogadores
      if (rows.length !== maxPlayers) {
        console.warn(
          `⚠️ Equipe ${teamType} tem ${rows.length} jogadores em vez de ${maxPlayers}`
        );
      }

      return rows;
    } catch (error) {
      console.error(`❌ Erro ao obter linhas da equipe ${teamType}:`, error);
      return [];
    }
  }

  extractPlayerDataFromTableRow(row, playerNumber) {
    try {
      const cells = row.querySelectorAll('td');
      if (cells.length < 6) {
        console.log(
          `⚠️ Linha ${playerNumber} tem apenas ${cells.length} células`
        );
        return null;
      }

      const pokemonCell = cells[0];
      const playerCell = cells[1];
      const scoreCell = cells[2];
      const kaiCell = cells[3];
      const damageCell = cells[4];
      const abilitiesCell = cells[5];

      console.log(`🔍 Extraindo dados do jogador ${playerNumber}...`);

      const playerData = {
        pokemon: this.extractPokemonFromCell(pokemonCell),
        battleItem: this.extractBattleItemFromCell(pokemonCell),
        heldItems: this.extractHeldItemsFromCell(row), // Procurar em toda a linha
        playerName: this.extractPlayerNameFromCell(playerCell),
        playerScore: this.extractScoreFromCell(scoreCell),
        kills: this.extractKillsFromCell(kaiCell),
        assists: this.extractAssistsFromCell(kaiCell),
        interrupts: this.extractInterruptsFromCell(kaiCell),
        damageDone: this.extractDamageDoneFromCell(damageCell),
        damageTaken: this.extractDamageTakenFromCell(damageCell),
        damageHealed: this.extractDamageHealedFromCell(damageCell),
        abilities: this.extractAbilitiesFromCell(abilitiesCell),
      };

      console.log(
        `✅ Jogador ${playerNumber} extraído: ${playerData.playerName} (${playerData.pokemon})`
      );
      return playerData;
    } catch (error) {
      console.error(
        `❌ Erro ao extrair dados do jogador ${playerNumber}:`,
        error
      );
      return null;
    }
  }

  extractPokemonFromCell(cell) {
    try {
      const img = cell.querySelector('img[alt*="pokemon"]');
      if (img && img.src) {
        const match = img.src.match(/t_Square_([^.]+)\.png/);
        if (match) {
          const extractedName = match[1].toLowerCase();
          // Aplicar mapeamento se PokemonMapper estiver disponível
          if (typeof window !== 'undefined' && window.PokemonMapper) {
            return window.PokemonMapper.mapPokemonName(extractedName);
          }
          return extractedName;
        }
      }
      return 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  extractBattleItemFromCell(cell) {
    try {
      // O item de batalha está em um div com classe sc-d3561975-0 ou kipVmY
      // Pode ter alt="Used item"
      const itemElement = cell.querySelector('[class*="sc-d3561975-0"] img, [class*="kipVmY"] img, img[alt*="Used item"], img[alt*="item"]');
      if (itemElement) {
        // Pegar URL original da imagem
        let imageUrl = null;
        
        // Priorizar srcset (geralmente tem melhor qualidade)
        if (itemElement.srcset) {
          const srcsetUrls = itemElement.srcset.split(',').map(s => s.trim().split(' ')[0]);
          if (srcsetUrls.length > 0) {
            imageUrl = srcsetUrls[srcsetUrls.length - 1]; // Pegar a última (maior resolução)
          }
        }
        
        // Fallback para src se srcset não disponível
        if (!imageUrl && itemElement.src) {
          imageUrl = itemElement.src;
        }
        
        if (imageUrl) {
          // Aumentar resolução da imagem
          const highResUrl = this.increaseImageResolution(imageUrl, 96);
          return highResUrl;
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Erro ao extrair battle item:', error);
      return null;
    }
  }

  extractPlayerNameFromCell(cell) {
    try {
      // Modo Ranked: O nome do jogador está em um link <a> com um parágrafo <p> dentro
      let nameElement = cell.querySelector('a p');

      // Modo Tournaments: O nome do jogador está diretamente em um <p> sem link <a>
      if (!nameElement) {
        // Procurar por um parágrafo <p> que contenha o nome do jogador
        // O nome geralmente está em um <p> com classe específica ou estilo específico
        const paragraphs = cell.querySelectorAll('p');
        for (const p of paragraphs) {
          // Verificar se este parágrafo contém texto que não seja apenas números ou símbolos
          const text = p.textContent?.trim();
          // Ignorar parágrafos que são apenas números (score), ou que contêm "|" (K|A|i)
          if (text && !/^\d+$/.test(text) && !text.includes('|') && text.length > 0) {
            // Verificar se não é um parágrafo de nível (como "13", "12", etc)
            const isLevel = /^\d{1,2}$/.test(text);
            if (!isLevel) {
              nameElement = p;
              break;
            }
          }
        }
      }

      if (nameElement) {
        // Preservar exatamente o nome como está no HTML, incluindo caracteres especiais
        // Remover elementos filhos (SVGs, divs, imagens) e pegar apenas o texto
        const clone = nameElement.cloneNode(true);
        // Remover elementos SVG, divs e imagens que podem estar dentro
        clone.querySelectorAll('svg, div, img').forEach(el => el.remove());
        let text = clone.textContent?.trim();

        // Se o texto ainda contém muitos espaços extras, limpar
        if (text) {
          text = text.replace(/\s+/g, ' ').trim();
        }

        // Verificar se o texto não está vazio após a limpeza
        if (text && text.length > 0) {
          return text;
        }
      }
      return 'Unknown';
    } catch (error) {
      console.error('❌ Erro ao extrair nome do jogador:', error);
      return 'Unknown';
    }
  }

  extractScoreFromCell(cell) {
    try {
      const text = cell.textContent?.trim();
      const score = parseInt(text);
      return isNaN(score) ? 0 : score;
    } catch (error) {
      return 0;
    }
  }

  extractKillsFromCell(cell) {
    try {
      const text = cell.textContent?.trim();
      if (text && text.includes('|')) {
        const parts = text.split('|');
        return parseInt(parts[0]?.trim()) || 0;
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }

  extractAssistsFromCell(cell) {
    try {
      const text = cell.textContent?.trim();
      if (text && text.includes('|')) {
        const parts = text.split('|');
        return parseInt(parts[1]?.trim()) || 0;
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }

  extractInterruptsFromCell(cell) {
    try {
      const text = cell.textContent?.trim();
      if (text && text.includes('|')) {
        const parts = text.split('|');
        return parseInt(parts[2]?.trim()) || 0;
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }

  extractDamageDoneFromCell(cell) {
    try {
      // Os dados de dano estão em divs com classe sc-5695c1de-7
      const damageElements = cell.querySelectorAll(
        '[class*="sc-5695c1de-7"] p'
      );
      if (damageElements.length >= 1) {
        return parseInt(damageElements[0]?.textContent?.trim()) || 0;
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }

  extractDamageTakenFromCell(cell) {
    try {
      const damageElements = cell.querySelectorAll(
        '[class*="sc-5695c1de-7"] p'
      );
      if (damageElements.length >= 2) {
        return parseInt(damageElements[1]?.textContent?.trim()) || 0;
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }

  extractDamageHealedFromCell(cell) {
    try {
      const damageElements = cell.querySelectorAll(
        '[class*="sc-5695c1de-7"] p'
      );
      if (damageElements.length >= 3) {
        return parseInt(damageElements[2]?.textContent?.trim()) || 0;
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }

  // Função auxiliar para aumentar resolução de URL do UniteAPI
  increaseImageResolution(url, targetWidth = 96) {
    if (!url) return null;
    
    try {
      // Se já é uma URL do UniteAPI com _next/image, ajustar parâmetros
      if (url.includes('_next/image')) {
        // Extrair o parâmetro url= da query string
        const urlMatch = url.match(/url=([^&]+)/);
        if (urlMatch) {
          const spritePath = decodeURIComponent(urlMatch[1]);
          return `https://uniteapi.dev/_next/image?url=${encodeURIComponent(spritePath)}&w=${targetWidth}&q=100`;
        }
        // Se já tem w=, substituir
        if (url.includes('w=')) {
          return url.replace(/w=\d+/, `w=${targetWidth}`).replace(/q=\d+/, 'q=100');
        }
        // Adicionar parâmetros se não tiver
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}w=${targetWidth}&q=100`;
      }
      
      // Se é uma URL relativa do UniteAPI com /Sprites/, converter
      if (url.includes('/Sprites/')) {
        const spriteMatch = url.match(/\/Sprites\/([^?&]+)/);
        if (spriteMatch) {
          const spritePath = spriteMatch[1];
          return `https://uniteapi.dev/_next/image?url=%2FSprites%2F${encodeURIComponent(spritePath)}&w=${targetWidth}&q=100`;
        }
      }
      
      // Se já é uma URL completa do UniteAPI, adicionar/ajustar parâmetros
      if (url.includes('uniteapi.dev')) {
        try {
          const urlObj = new URL(url);
          urlObj.searchParams.set('w', targetWidth.toString());
          urlObj.searchParams.set('q', '100');
          return urlObj.toString();
        } catch (e) {
          // Se falhar ao criar URL object, tentar substituição simples
          const separator = url.includes('?') ? '&' : '?';
          return `${url}${separator}w=${targetWidth}&q=100`;
        }
      }
      
      return url;
    } catch (error) {
      console.warn('⚠️ Erro ao aumentar resolução da imagem:', url, error);
      return url; // Retornar URL original em caso de erro
    }
  }

  extractAbilitiesFromCell(cell) {
    try {
      const abilityImgs = cell.querySelectorAll('img[alt*="ability"], img[alt*="Pokemon ability"]');
      const abilities = [];

      // Pegar TODAS as habilidades na ordem que aparecem
      for (const img of abilityImgs) {
        // Pegar URL original da imagem
        let imageUrl = null;
        
        // Priorizar srcset (geralmente tem melhor qualidade)
        if (img.srcset) {
          // srcset pode ter múltiplas URLs: "url1 1x, url2 2x"
          // Pegar a última (geralmente maior resolução)
          const srcsetUrls = img.srcset.split(',').map(s => s.trim().split(' ')[0]);
          if (srcsetUrls.length > 0) {
            imageUrl = srcsetUrls[srcsetUrls.length - 1];
          }
        }
        
        // Fallback para src se srcset não disponível
        if (!imageUrl && img.src) {
          imageUrl = img.src;
        }
        
        if (imageUrl) {
          // Extrair código da habilidade
          const match = imageUrl.match(/t_Skill_[^_]+_([^.]+)/i);
          if (match) {
            const abilityCode = match[1].toLowerCase();
            let code = null;
            
            // Extrair código exato: S11, S12, S21, S22, etc.
            if (abilityCode.includes('s11')) {
              code = 's11';
            } else if (abilityCode.includes('s12')) {
              code = 's12';
            } else if (abilityCode.includes('s21')) {
              code = 's21';
            } else if (abilityCode.includes('s22')) {
              code = 's22';
            } else if (abilityCode.includes('s13')) {
              code = 's13';
            } else if (abilityCode.includes('s23')) {
              code = 's23';
            } else if (abilityCode.includes('s24')) {
              code = 's24';
            } else {
              code = abilityCode;
            }
            
            if (code) {
              // Aumentar resolução da imagem
              const highResUrl = this.increaseImageResolution(imageUrl, 96);
              
              // Adicionar na ordem que aparece (primeira imagem = primeira habilidade)
              abilities.push({ code, url: highResUrl });
            }
          }
        }
      }

      // Retornar na ordem que aparecem no HTML
      // Se tiver s1x e s2x misturados, ordenar: s1x primeiro, s2x depois
      // Caso contrário, manter ordem original
      if (abilities.length > 0) {
        const hasS1 = abilities.some(a => a.code.startsWith('s1'));
        const hasS2 = abilities.some(a => a.code.startsWith('s2'));
        
        // Se tiver ambos tipos, ordenar
        if (hasS1 && hasS2) {
          const s1Abilities = abilities.filter(a => a.code.startsWith('s1'));
          const s2Abilities = abilities.filter(a => a.code.startsWith('s2'));
          return [...s1Abilities, ...s2Abilities];
        }
      }

      // Caso contrário, retornar na ordem que aparecem
      return abilities;
    } catch (error) {
      console.error('❌ Erro ao extrair habilidades:', error);
      return [];
    }
  }
  
  extractHeldItemsFromCell(rowOrCell) {
    // Held items não estão disponíveis no UniteAPI
    // Retornar array vazio
    return [];
  }
}

// Classe principal do scraper
class UniteApiScraper {
  constructor() {
    this.matchExtractor = new MatchDataExtractor();
    this.isScraping = false;
    this.isExtracting = false; // Adicionado para controlar o fluxo de extração
    this.maxMatches = 56;
    this.init();
  }

  init() {
    console.log('✅ UniteApi Scraper inicializado (versão simplificada)');
    console.log('🌍 URL da página:', window.location.href);

    // Verificar se está na versão /pt/ que não funciona
    if (this.checkIfPortugueseVersion()) {
      this.showPortugueseVersionWarning();
      return; // Não continuar inicialização se estiver em /pt/
    }

    // Importar fonte Sora
    this.importSoraFont();
  }

  // Verificar se está na versão portuguesa (/pt/)
  checkIfPortugueseVersion() {
    const url = window.location.href;
    return url.includes('/pt/');
  }

  // Mostrar aviso para versão portuguesa
  showPortugueseVersionWarning() {
    try {
      // Garantir que a fonte Sora está importada
      this.importSoraFont();
      
      this.removeExistingNotifications();

      const notification = document.createElement('div');
      notification.id = 'unite-scraper-pt-warning';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
        color: #ffffff;
        padding: 25px;
        border-radius: 15px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.6);
        z-index: 10000;
        font-family: "Sora", sans-serif;
        max-width: 400px;
        border: 2px solid #ff9800;
        animation: slideIn 0.3s ease-out;
      `;

      // Criar URL em inglês substituindo /pt/ por /en/
      const currentUrl = window.location.href;
      const englishUrl = currentUrl.replace('/pt/', '/en/');

      notification.innerHTML = `
        <div style="margin-bottom: 20px;">
          <div style="
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #ff9800, #f57c00);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            font-size: 24px;
            float: left;
          ">⚠️</div>
          <div style="margin-left: 65px; font-family: 'Sora', sans-serif;">
            <div style="font-weight: 600; font-size: 20px; margin-bottom: 5px; color: #ff9800; font-family: 'Sora', sans-serif;">Versão Portuguesa Não Suportada</div>
            <div style="color: #b0b0b0; font-size: 14px; line-height: 1.4; font-family: 'Sora', sans-serif;">
              A extensão não funciona na versão /pt/ do site.
            </div>
          </div>
          <div style="clear: both;"></div>
        </div>

        <div style="
          background: rgba(255, 152, 0, 0.1);
          border: 1px solid rgba(255, 152, 0, 0.3);
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
        ">
          <div style="color: #b0b0b0; font-size: 13px; line-height: 1.6; font-family: 'Sora', sans-serif;">
            Por favor, acesse a versão em inglês do site para usar a extensão.
          </div>
        </div>

        <button id="redirect-to-en-btn" style="
          width: 100%;
          background: linear-gradient(135deg, #ff9800, #f57c00);
          color: white;
          border: none;
          padding: 15px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 10px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
          font-family: 'Sora', sans-serif;
        ">
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
            <span>🌐 Ir para Versão em Inglês</span>
          </div>
        </button>

        <button id="close-pt-warning" style="
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          color: #b0b0b0;
          cursor: pointer;
          padding: 5px;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          font-size: 16px;
        ">✕</button>
      `;

      // Adicionar estilos CSS
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        #redirect-to-en-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 152, 0, 0.4) !important;
        }

        #close-pt-warning:hover {
          background: rgba(255,255,255,0.1) !important;
          color: #ffffff !important;
        }

        #unite-scraper-pt-warning {
          backdrop-filter: blur(10px);
        }
      `;
      document.head.appendChild(style);

      document.body.appendChild(notification);

      // Event listener para redirecionar
      document
        .getElementById('redirect-to-en-btn')
        .addEventListener('click', () => {
          window.location.href = englishUrl;
        });

      document.getElementById('close-pt-warning').addEventListener('click', () => {
        notification.remove();
      });

      console.log('⚠️ Versão portuguesa detectada - aviso exibido');
    } catch (error) {
      console.error('❌ Erro ao mostrar aviso de versão portuguesa:', error);
    }
  }

  importSoraFont() {
    try {
      // Verificar se a fonte já foi importada
      if (
        document.querySelector(
          'link[href*="fonts.googleapis.com/css2?family=Sora"]'
        )
      ) {
        console.log('✅ Fonte Sora já importada');
        return;
      }

      // Criar link para importar a fonte Sora
      const fontLink = document.createElement('link');
      fontLink.rel = 'preconnect';
      fontLink.href = 'https://fonts.googleapis.com';

      const fontLink2 = document.createElement('link');
      fontLink2.rel = 'preconnect';
      fontLink2.href = 'https://fonts.gstatic.com';
      fontLink2.crossOrigin = 'anonymous';

      const fontLink3 = document.createElement('link');
      fontLink3.rel = 'stylesheet';
      fontLink3.href =
        'https://fonts.googleapis.com/css2?family=Sora:wght@100..800&display=swap';

      // Adicionar ao head do documento
      document.head.appendChild(fontLink);
      document.head.appendChild(fontLink2);
      document.head.appendChild(fontLink3);

      console.log('✅ Fonte Sora importada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao importar fonte Sora:', error);
    }
  }

  async startScraping() {
    if (this.isScraping) {
      console.log('⚠️ Scraping já em andamento...');
      return;
    }

    // Verificar se está na versão /pt/ que não funciona
    if (this.checkIfPortugueseVersion()) {
      this.showPortugueseVersionWarning();
      return;
    }

    console.log('🎮 Iniciando interface do scraper...');
    this.isScraping = true;

    try {
      // Mostrar tela inicial com opções
      this.showInitialOptionsScreen();
    } catch (error) {
      console.error('❌ Erro ao mostrar interface inicial:', error);
      this.showErrorNotification('Erro ao mostrar interface: ' + error.message);
    } finally {
      this.isScraping = false;
    }
  }

  showInitialOptionsScreen() {
    try {
      this.removeExistingNotifications();

      const notification = document.createElement('div');
      notification.id = 'unite-scraper-initial';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
        color: #ffffff;
        padding: 25px;
        border-radius: 15px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.6);
        z-index: 10000;
        font-family: "Sora", sans-serif;
        max-width: 380px;
        border: 1px solid #404040;
        animation: slideIn 0.3s ease-out;
      `;

      notification.innerHTML = `
        <div style="margin-bottom: 20px;">
          <div style="
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #FF4600, #ea580c);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            font-size: 24px;
            float: left;
          ">📸</div>
          <div style="margin-left: 65px;">
            <div style="font-weight: 600; font-size: 20px; margin-bottom: 5px; color: #fff;">Gerar Imagem</div>
              <div style="color: #b0b0b0; font-size: 14px; line-height: 1.4;">
               Gere imagem de estatísticas da partida.
             </div>
          </div>
          <div style="clear: both;"></div>
        </div>

        <div style="
          background: rgba(33, 150, 243, 0.1);
          border: 1px solid rgba(33, 150, 243, 0.3);
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
        ">
          <div style="color: #64b5f6; font-size: 13px; line-height: 1.6; font-weight: 600; margin-bottom: 10px;">
            📋 Instruções:
          </div>
          <ol style="color: #b0b0b0; font-size: 12px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>Abra a partida que deseja gerar a imagem (clique no accordion para expandir)</li>
            <li>Certifique-se de que a tabela de dados está visível</li>
            <li>Clique no botão abaixo para gerar a imagem</li>
          </ol>
        </div>

        <button id="generate-image-main-btn" style="
            width: 100%;
            background: linear-gradient(135deg, #FF4600, #ea580c);
            color: white;
            border: none;
            padding: 15px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            margin-bottom: 10px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255, 70, 0, 0.3);
          ">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
              <span>📸 Gerar Imagem da Partida Aberta</span>
            </div>
          </button>

        <button id="upload-photo-btn" style="
            width: 100%;
            background: transparent;
            color: #b0b0b0;
            border: 1px solid #404040;
            padding: 12px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            margin-bottom: 20px;
            transition: all 0.3s ease;
          ">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
              <span>📷 Fazer Upload de Foto</span>
            </div>
          </button>

        <button id="close-initial" style="
           position: absolute;
           top: 15px;
           right: 15px;
           background: none;
           border: none;
           color: #b0b0b0;
           cursor: pointer;
           padding: 5px;
           border-radius: 50%;
           width: 24px;
           height: 24px;
           display: flex;
           align-items: center;
           justify-content: center;
           transition: all 0.2s ease;
           font-size: 16px;
         ">✕</button>
      `;

      // Adicionar estilos CSS
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        #generate-image-main-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 70, 0, 0.4) !important;
        }

        #upload-photo-btn:hover {
          background: rgba(255, 70, 0, 0.1) !important;
          border-color: rgba(255, 70, 0, 0.5) !important;
          color: #ffffff !important;
        }

        #close-initial:hover {
           background: rgba(255,255,255,0.1) !important;
           color: #ffffff !important;
         }

        #unite-scraper-initial {
           backdrop-filter: blur(10px);
         }

         /* Estilos para todos os botões de fechar */
         [id*="close"]:hover {
           background: rgba(255,255,255,0.1) !important;
           color: #ffffff !important;
         }
      `;
      document.head.appendChild(style);

      document.body.appendChild(notification);

      // Event listener para o botão principal
      document
        .getElementById('generate-image-main-btn')
        .addEventListener('click', () => {
          this.startGenerateImageFlow();
        });

      // Event listener para o botão de upload de foto
      document
        .getElementById('upload-photo-btn')
        .addEventListener('click', () => {
          if (window.PhotoUpload) {
            const photoUpload = new window.PhotoUpload();
            photoUpload.createUploadInterface(async (uploaded) => {
              if (uploaded) {
                console.log('✅ Foto do usuário salva com sucesso');
              }
            });
          }
        });

      document.getElementById('close-initial').addEventListener('click', () => {
        this.removeExistingNotifications();
      });

      // Extrair avatar do perfil automaticamente
      this.extractAvatarFromProfile().catch(err => {
        console.warn('⚠️ Não foi possível extrair avatar do perfil:', err);
      });

      console.log('✅ Tela inicial exibida');
    } catch (error) {
      console.error('❌ Erro ao mostrar tela inicial:', error);
    }
  }

  // Novo fluxo simplificado: extrair apenas a partida aberta e gerar imagem
  async startGenerateImageFlow() {
    try {
      console.log('🚀 Iniciando fluxo de geração de imagem...');
      
      // Remover notificação inicial
      this.removeExistingNotifications();
      
      // Mostrar loading
      this.showLoadingNotification();
      this.updateProgress(20, 'Procurando partida aberta...');
      
      // Passo 1: Encontrar partida aberta (accordion expandido)
      const matchElements = this.matchExtractor.findMatchElements(document);
      if (matchElements.length === 0) {
        this.removeLoadingNotification();
        this.showErrorNotification('Nenhuma partida encontrada na página. Certifique-se de estar na página de histórico de partidas.');
        return;
      }
      
      // Encontrar qual accordion está expandido
      let openMatchElement = null;
      for (const element of matchElements) {
        if (this.matchExtractor.isAccordionExpanded(element)) {
          openMatchElement = element;
          break;
        }
      }
      
      if (!openMatchElement) {
        this.removeLoadingNotification();
        this.showErrorNotification(
          'Nenhuma partida está aberta. Por favor, abra (expanda) a partida que deseja gerar a imagem antes de clicar no botão.',
          () => {
            // Callback de retry - tentar novamente
            this.startGenerateImageFlow();
          }
        );
        return;
      }
      
      this.updateProgress(40, 'Partida encontrada! Extraindo dados...');
      
      // Aguardar um pouco para garantir que os dados estão carregados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Passo 2: Extrair dados apenas da partida aberta
      this.updateProgress(60, 'Processando dados da partida...');
      const match = await this.matchExtractor.parseMatchElement(openMatchElement);
      
      if (!match || !match.fullMatchData) {
        this.removeLoadingNotification();
        this.showErrorNotification('Não foi possível extrair dados da partida. Certifique-se de que a tabela de dados está visível e tente novamente.');
        return;
      }
      
      this.updateProgress(90, 'Dados extraídos! Gerando imagem...');
      
      // Passo 3: Gerar imagem diretamente
      const sourcePlayerInfo = this.extractSourcePlayerInfo();
      await this.generateImageForMatch(match, sourcePlayerInfo.sourcePlayerName);
      
      this.updateProgress(100, 'Imagem gerada com sucesso!');
      
      // Remover loading após um breve delay
      setTimeout(() => {
        this.removeLoadingNotification();
      }, 1500);
      
      console.log('✅ Fluxo de geração concluído com sucesso');
    } catch (error) {
      console.error('❌ Erro no fluxo de geração:', error);
      this.removeLoadingNotification();
      this.showErrorNotification('Erro ao processar: ' + error.message);
    }
  }

  showLoadingNotification() {
    try {
      this.removeExistingNotifications();

      const notification = document.createElement('div');
      notification.id = 'unite-scraper-loading';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
        color: #ffffff;
        padding: 25px;
        border-radius: 15px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.6);
        z-index: 10000;
        font-family: "Sora", sans-serif;
        max-width: 380px;
        border: 1px solid #404040;
        animation: slideIn 0.3s ease-out;
      `;

      notification.innerHTML = `
        <div style="margin-bottom: 20px;">
          <div style="
            width: 50px;
            height: 50px;
            border: 3px solid #404040;
            border-top: 3px solid #FF4600;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 15px;
            float: left;
          "></div>
          <div style="margin-left: 65px;">
            <div style="font-weight: 600; font-size: 18px; margin-bottom: 5px;">Coletando dados...</div>
            <div style="color: #b0b0b0; font-size: 14px;">Analisando partidas da página</div>
          </div>
          <div style="clear: both;"></div>
        </div>

        <div style="margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #b0b0b0; font-size: 14px;">Progresso</span>
            <span id="progress-text" style="color: #FF4600; font-weight: 600;">0%</span>
          </div>
          <div style="
            width: 100%;
            height: 6px;
            background: #404040;
            border-radius: 3px;
            overflow: hidden;
          ">
            <div id="progress-bar" style="
              width: 0%;
              height: 100%;
              background: linear-gradient(90deg, #FF4600, #ea580c);
              border-radius: 3px;
              transition: width 0.3s ease;
            "></div>
          </div>
        </div>

        <div style="
          background: rgba(255, 70, 0, 0.1);
          border: 1px solid rgba(255, 70, 0, 0.3);
          border-radius: 8px;
          padding: 12px;
          font-size: 12px;
          color: #b0b0b0;
          line-height: 1.4;
        ">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <span style="color: #FF4600; margin-right: 8px;">ℹ️</span>
            <span style="font-weight: 600; color: #ffffff;">Status da Extração</span>
          </div>
          <div id="status-text">Iniciando análise da página...</div>
        </div>
      `;

      // Adicionar estilos CSS
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        #unite-scraper-loading {
          backdrop-filter: blur(10px);
        }
      `;
      document.head.appendChild(style);

      document.body.appendChild(notification);

      // Iniciar progresso simulado
      this.startProgressSimulation();

      console.log('🔄 Notificação de loading exibida');
    } catch (error) {
      console.error('❌ Erro ao mostrar loading:', error);
    }
  }

  startProgressSimulation() {
    let progress = 0;
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const statusText = document.getElementById('status-text');

    if (!progressBar || !progressText || !statusText) return;

    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 90) progress = 90; // Não chegar a 100% até finalizar

      progressBar.style.width = progress + '%';
      progressText.textContent = Math.round(progress) + '%';

      // Atualizar status baseado no progresso
      if (progress < 20) {
        statusText.textContent = 'Procurando elementos de partida...';
      } else if (progress < 40) {
        statusText.textContent = 'Verificando accordions expandidos...';
      } else if (progress < 60) {
        statusText.textContent = 'Expandindo accordions fechados...';
      } else if (progress < 80) {
        statusText.textContent = 'Extraindo dados dos jogadores...';
      } else {
        statusText.textContent = 'Finalizando extração...';
      }

      // Parar quando chegar próximo ao fim
      if (progress >= 90) {
        clearInterval(interval);
      }
    }, 200);

    // Salvar intervalo para poder parar depois
    this.progressInterval = interval;
  }

  updateProgress(percentage, status) {
    try {
      const progressBar = document.getElementById('progress-bar');
      const progressText = document.getElementById('progress-text');
      const statusText = document.getElementById('status-text');

      if (progressBar && progressText && statusText) {
        progressBar.style.width = percentage + '%';
        progressText.textContent = Math.round(percentage) + '%';
        if (status) {
          statusText.textContent = status;
        }
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar progresso:', error);
    }
  }

  removeLoadingNotification() {
    try {
      // Parar intervalo de progresso
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
      }

      const loading = document.getElementById('unite-scraper-loading');
      if (loading) {
        loading.remove();
      }
    } catch (error) {
      console.error('❌ Erro ao remover loading:', error);
    }
  }

  showSuccessNotification(matchCount) {
    // Esta função não é mais usada no novo fluxo, mas mantida para compatibilidade
    // O fluxo agora vai direto para o seletor de partidas
    console.log(`✅ ${matchCount} partidas extraídas com sucesso`);
  }

  showNoDataNotification() {
    try {
      this.removeExistingNotifications();

      const notification = document.createElement('div');
      notification.id = 'unite-scraper-notification';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
        color: #ffffff;
        padding: 25px;
        border-radius: 15px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.6);
        z-index: 10000;
        font-family: "Sora", sans-serif;
        max-width: 380px;
        border: 1px solid #ff9800;
        animation: slideIn 0.3s ease-out;
      `;

      notification.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
          <div style="
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #ff9800, #f57c00);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            font-size: 24px;
          ">⚠️</div>
          <div>
            <div style="font-weight: 600; font-size: 20px; margin-bottom: 5px;">Nenhum Dado Encontrado</div>
            <div style="color: #b0b0b0; font-size: 14px;">Verifique se há partidas na página</div>
          </div>
        </div>

        <div style="
          background: rgba(255, 152, 0, 0.1);
          border: 1px solid rgba(255, 152, 0, 0.3);
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 20px;
        ">
          <div style="color: #b0b0b0; font-size: 13px; line-height: 1.4;">
            Não foi possível encontrar dados de partidas nesta página.
            Certifique-se de estar em uma página que contenha histórico de partidas.
          </div>
        </div>

        <button id="close-notification" style="
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          color: #b0b0b0;
          cursor: pointer;
          padding: 5px;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          font-size: 16px;
        ">✕</button>
      `;

      document.body.appendChild(notification);

      document
        .getElementById('close-notification')
        .addEventListener('click', () => {
          this.removeExistingNotifications();
        });

      setTimeout(() => {
        this.removeExistingNotifications();
      }, 15000);

      console.log('⚠️ Notificação de "sem dados" exibida');
    } catch (error) {
      console.error('❌ Erro ao mostrar notificação de sem dados:', error);
    }
  }

  showErrorNotification(errorMessage, retryCallback = null) {
    try {
      this.removeExistingNotifications();

      const notification = document.createElement('div');
      notification.id = 'unite-scraper-notification';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
        color: #ffffff;
        padding: 25px;
        border-radius: 15px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.6);
        z-index: 10000;
        font-family: "Sora", sans-serif;
        max-width: 380px;
        border: 1px solid #f44336;
        animation: slideIn 0.3s ease-out;
      `;

      // Botão de retry se callback fornecido
      const retryButton = retryCallback ? `
        <button id="retry-action-btn" style="
          width: 100%;
          background: linear-gradient(135deg, #FF4600, #ea580c);
          color: white;
          border: none;
          padding: 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 10px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 70, 0, 0.3);
          font-family: 'Sora', sans-serif;
        ">
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
            <span>🔄 Tentar Novamente</span>
          </div>
        </button>
      ` : '';

      notification.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
          <div style="
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #f44336, #d32f2f);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            font-size: 24px;
          ">❌</div>
          <div>
            <div style="font-weight: 600; font-size: 20px; margin-bottom: 5px;">Erro na Extração</div>
            <div style="color: #b0b0b0; font-size: 14px;">Ocorreu um problema</div>
          </div>
        </div>

        <div style="
          background: rgba(244, 67, 54, 0.1);
          border: 1px solid rgba(244, 67, 54, 0.3);
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 20px;
        ">
          <div style="color: #b0b0b0; font-size: 13px; line-height: 1.4;">
            ${errorMessage || 'Ocorreu um erro durante a extração dos dados.'}
          </div>
        </div>

        ${retryButton}

        <button id="close-notification" style="
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          color: #b0b0b0;
          cursor: pointer;
          padding: 5px;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          font-size: 16px;
        ">✕</button>
      `;

      document.body.appendChild(notification);

      // Event listener para botão de retry
      if (retryCallback) {
        const retryBtn = document.getElementById('retry-action-btn');
        if (retryBtn) {
          retryBtn.addEventListener('click', () => {
            this.removeExistingNotifications();
            retryCallback();
          });
          
          // Adicionar estilo hover
          retryBtn.addEventListener('mouseenter', () => {
            retryBtn.style.transform = 'translateY(-2px)';
            retryBtn.style.boxShadow = '0 6px 20px rgba(255, 70, 0, 0.4) !important';
          });
          retryBtn.addEventListener('mouseleave', () => {
            retryBtn.style.transform = 'translateY(0)';
            retryBtn.style.boxShadow = '0 4px 15px rgba(255, 70, 0, 0.3)';
          });
        }
      }

      document
        .getElementById('close-notification')
        .addEventListener('click', () => {
          this.removeExistingNotifications();
        });

      // Aumentar timeout se tiver botão de retry (usuário pode querer tentar)
      const timeout = retryCallback ? 60000 : 20000;
      setTimeout(() => {
        this.removeExistingNotifications();
      }, timeout);

      console.log('❌ Notificação de erro exibida');
    } catch (error) {
      console.error('❌ Erro ao mostrar notificação de erro:', error);
    }
  }

  showTableNotFoundError() {
    try {
      this.removeExistingNotifications();

      const notification = document.createElement('div');
      notification.id = 'unite-scraper-notification';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
        color: #ffffff;
        padding: 25px;
        border-radius: 15px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.6);
        z-index: 10000;
        font-family: "Sora", sans-serif;
        max-width: 380px;
        border: 1px solid #f44336;
        animation: slideIn 0.3s ease-out;
      `;

      notification.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
          <div style="
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #f44336, #d32f2f);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            font-size: 24px;
          ">⚠️</div>
          <div>
            <div style="font-weight: 600; font-size: 20px; margin-bottom: 5px;">Erro de Extração</div>
            <div style="color: #b0b0b0; font-size: 14px;">Não foi possível encontrar a tabela de dados dos jogadores nesta partida.</div>
          </div>
        </div>

        <div style="
          background: rgba(244, 67, 54, 0.1);
          border: 1px solid rgba(244, 67, 54, 0.3);
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 20px;
        ">
          <div style="color: #b0b0b0; font-size: 13px; line-height: 1.4;">
            Verifique se a partida selecionada contém dados de jogadores.
            Se a partida estiver correta, o scraper pode precisar de uma atualização.
          </div>
        </div>

        <button id="close-notification" style="
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          color: #b0b0b0;
          cursor: pointer;
          padding: 5px;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          font-size: 16px;
        ">✕</button>
      `;

      document.body.appendChild(notification);

      document
        .getElementById('close-notification')
        .addEventListener('click', () => {
          this.removeExistingNotifications();
        });

      setTimeout(() => {
        this.removeExistingNotifications();
      }, 20000);

      console.log('❌ Notificação de erro de tabela não encontrada exibida');
    } catch (error) {
      console.error(
        '❌ Erro ao mostrar notificação de erro de tabela não encontrada:',
        error
      );
    }
  }

  removeExistingNotifications() {
    const existing = document.getElementById('unite-scraper-notification');
    if (existing) {
      existing.remove();
    }

    // Também remover notificação de loading se existir
    const loading = document.getElementById('unite-scraper-loading');
    if (loading) {
      loading.remove();
    }

    // Remover tela inicial se existir
    const initial = document.getElementById('unite-scraper-initial');
    if (initial) {
      initial.remove();
    }

    // Remover aviso de versão portuguesa se existir
    const ptWarning = document.getElementById('unite-scraper-pt-warning');
    if (ptWarning) {
      ptWarning.remove();
    }
  }

  downloadDataAutomatically(matches) {
    try {
      if (!matches || matches.length === 0) {
        console.log('⚠️ Nenhum dado para download');
        return;
      }

      console.log('📥 Iniciando download automático...');

      // Extrair informações do jogador source
      const sourcePlayerInfo = this.extractSourcePlayerInfo();

      // Preparar dados para download
      const dataToDownload = {
        totalMatches: matches.length,
        sourcePlayerName: sourcePlayerInfo.sourcePlayerName,
        sourcePlayerID: sourcePlayerInfo.sourcePlayerID,
        matches: matches,
        extractedAt: new Date().toISOString(),
        source: window.location.href,
        scraperVersion: '1.0.0',
      };

      // Criar nome do arquivo personalizado
      const now = new Date();
      const dateStr = now
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, '-')
        .replace('T', '_');
      const playerName = sourcePlayerInfo.sourcePlayerName.replace(
        /[^a-zA-Z0-9]/g,
        '_'
      );
      const fileName = `${playerName}_${matches.length}partidas_${dateStr}.json`;

      // Criar blob e fazer download
      const jsonString = JSON.stringify(dataToDownload, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Criar link de download
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = fileName;
      downloadLink.style.display = 'none';

      // Adicionar ao DOM e clicar
      document.body.appendChild(downloadLink);
      downloadLink.click();

      // Limpar
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);

      console.log(`✅ Download automático concluído: ${fileName}`);
    } catch (error) {
      console.error('❌ Erro no download automático:', error);
      this.showErrorNotification('Erro ao fazer download dos dados');
    }
  }

  async startDataExtraction() {
    if (this.isExtracting) {
      console.log('⚠️ Extração já em andamento...');
      return;
    }

    console.log('📊 Iniciando extração de dados...');
    this.isExtracting = true;

    try {
      // Mostrar notificação de loading
      this.showLoadingNotification();

      // Extrair os dados
      const matches = await this.matchExtractor.extractMatchesFromCurrentPage();

      console.log(`🎉 === EXTRAÇÃO CONCLUÍDA ===`);
      console.log(`📊 Total de partidas extraídas: ${matches.length}`);

      // Remover loading
      this.removeLoadingNotification();

      if (matches.length > 0) {
        // No novo fluxo, não mostramos notificação de sucesso
        // O fluxo vai direto para o seletor de partidas
        console.log(`✅ ${matches.length} partidas extraídas`);
      } else {
        // Se não há dados, mostrar erro
        this.showNoDataNotification();
      }
    } catch (error) {
      console.error('❌ Erro durante a extração:', error);
      this.removeLoadingNotification();

      if (error.message === 'TODAS_TABELAS_NAO_ENCONTRADAS') {
        console.log('⚠️ Todas as tabelas não foram encontradas');
        this.showTableNotFoundError();
      } else {
        this.showErrorNotification(error.message);
      }
    } finally {
      this.isExtracting = false;
    }
  }

  extractSourcePlayerInfo() {
    try {
      console.log('🔍 Extraindo informações do jogador source...');

      // Procurar pelo nome do jogador (está em um parágrafo com classe sc-6d6ea15e-1)
      const nameElement = document.querySelector('.sc-6d6ea15e-1.gpvunk');
      const sourcePlayerName = nameElement
        ? nameElement.textContent?.trim()
        : 'Unknown';

      // Procurar pelo ID do jogador (está em um parágrafo com classe sc-6d6ea15e-3 e cor #C3646F)
      const idElement = document.querySelector('.sc-6d6ea15e-3.htZWtT');
      const sourcePlayerID = idElement
        ? idElement.textContent?.trim()
        : 'Unknown';

      console.log(
        `✅ Jogador source encontrado: ${sourcePlayerName} (${sourcePlayerID})`
      );

      return {
        sourcePlayerName: sourcePlayerName,
        sourcePlayerID: sourcePlayerID,
      };
    } catch (error) {
      console.error('❌ Erro ao extrair informações do jogador source:', error);
      return {
        sourcePlayerName: 'Unknown',
        sourcePlayerID: 'Unknown',
      };
    }
  }

  // Extrair avatar do perfil do UniteAPI
  async extractAvatarFromProfile() {
    try {
      console.log('🔍 Extraindo avatar do perfil do UniteAPI...');

      // Procurar por imagens que contenham t_CreateRole_ (avatar do personagem)
      const avatarImages = document.querySelectorAll('img[src*="t_CreateRole_"], img[srcset*="t_CreateRole_"]');
      
      let avatarUrl = null;

      // Tentar encontrar a imagem do avatar
      for (const img of avatarImages) {
        // Priorizar srcset (geralmente tem melhor qualidade)
        if (img.srcset) {
          const srcsetUrls = img.srcset.split(',').map(s => s.trim().split(' ')[0]);
          if (srcsetUrls.length > 0) {
            avatarUrl = srcsetUrls[srcsetUrls.length - 1]; // Pegar a última (maior resolução)
            break;
          }
        }
        
        // Fallback para src se srcset não disponível
        if (!avatarUrl && img.src) {
          avatarUrl = img.src;
          break;
        }
      }

      // Se não encontrou t_CreateRole_, tentar t_activity_bg_ (background do avatar)
      if (!avatarUrl) {
        const bgImages = document.querySelectorAll('img[src*="t_activity_bg_"], img[srcset*="t_activity_bg_"]');
        for (const img of bgImages) {
          if (img.srcset) {
            const srcsetUrls = img.srcset.split(',').map(s => s.trim().split(' ')[0]);
            if (srcsetUrls.length > 0) {
              avatarUrl = srcsetUrls[srcsetUrls.length - 1];
              break;
            }
          }
          if (!avatarUrl && img.src) {
            avatarUrl = img.src;
            break;
          }
        }
      }

      if (avatarUrl) {
        // Aumentar resolução da imagem usando o método do matchExtractor
        const highResUrl = this.matchExtractor.increaseImageResolution(avatarUrl, 256);
        
        // Salvar no storage
        if (window.PhotoUpload) {
          const photoUpload = new window.PhotoUpload();
          await photoUpload.saveAvatar(highResUrl);
          console.log('✅ Avatar extraído e salvo:', highResUrl);
        }
        
        return highResUrl;
      } else {
        console.log('⚠️ Avatar não encontrado na página de perfil');
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao extrair avatar do perfil:', error);
      return null;
    }
  }

  forceCleanExtraction() {
    console.log('🧹 === FORÇANDO EXTRAÇÃO LIMPA ===');
    this.matchExtractor.matches = [];
    this.isScraping = false;
    this.isExtracting = false; // Adicionado para controlar o fluxo de extração

    // Limpar todas as notificações
    this.removeExistingNotifications();

    console.log('✅ Todos os dados anteriores foram limpos');
  }

  generateExtractionReport() {
    const matches = this.matchExtractor.matches;
    const sourcePlayerInfo = this.extractSourcePlayerInfo();

    return {
      totalMatches: matches.length,
      sourcePlayerName: sourcePlayerInfo.sourcePlayerName,
      sourcePlayerID: sourcePlayerInfo.sourcePlayerID,
      matches: matches,
      extractedAt: new Date().toISOString(),
    };
  }

  formatDataForExport(format = 'json') {
    if (format === 'json') {
      return this.generateExtractionReport();
    }
    return null;
  }

  async startAccordionExpansion() {
    if (this.isScraping) {
      console.log('⚠️ Expansão já em andamento...');
      return;
    }

    console.log('🔓 Iniciando expansão dos accordions...');
    this.isScraping = true;

    // Aplicar estilo de "concluído" imediatamente
    this.markAccordionExpansionComplete();

    try {
      // Expandir os accordions silenciosamente
      const matchElements = this.matchExtractor.findMatchElements(document);
      await this.matchExtractor.expandAllAccordionsOnly(matchElements);

      console.log('✅ Accordions expandidos com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao expandir accordions:', error);
      this.showErrorNotification(
        'Erro ao expandir accordions: ' + error.message
      );
    } finally {
      this.isScraping = false;
    }
  }

  showAccordionExpansionSuccess() {
    try {
      this.removeExistingNotifications();

      const notification = document.createElement('div');
      notification.id = 'unite-scraper-notification';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
        color: #ffffff;
        padding: 25px;
        border-radius: 15px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.6);
        z-index: 10000;
        font-family: "Sora", sans-serif;
        max-width: 380px;
        border: 2px solid #4CAF50;
        animation: slideIn 0.3s ease-out;
      `;

      notification.innerHTML = `
        <div style="margin-bottom: 20px;">
          <div style="
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            font-size: 24px;
            float: left;
          ">🔓</div>
          <div style="margin-left: 65px;">
            <div style="font-weight: 600; font-size: 20px; margin-bottom: 5px; color: #4CAF50;">Accordions Expandidos!</div>
            <div style="color: #b0b0b0; font-size: 14px; line-height: 1.4;">
              Todos os accordions foram abertos com sucesso.<br>
              Agora você pode extrair os dados das partidas.
            </div>
          </div>
          <div style="clear: both;"></div>
        </div>

        <div style="margin-bottom: 20px;">
          <button id="extract-now-btn" style="
            width: 100%;
            background: linear-gradient(135deg, #2196F3, #1976D2);
            color: white;
            border: none;
            padding: 15px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
            margin-bottom: 10px;
          ">
            <div style="display: flex; align-items: center; justify-content: center;">
              <span>Extrair dados</span>
            </div>
          </button>

          <button id="expand-more-btn" style="
            width: 100%;
            background: linear-gradient(135deg, #FF9800, #F57C00);
            color: white;
            border: none;
            padding: 15px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
          ">
            <div style="display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 18px; margin-right: 8px;">🔄</span>
              <span>Expandir Novamente</span>
            </div>
            <div style="font-size: 11px; opacity: 0.8; margin-top: 5px; font-weight: normal;">Reabrir accordions</div>
          </button>
        </div>

                 <button id="close-success" style="
           position: absolute;
           top: 15px;
           right: 15px;
           background: none;
           border: none;
           color: #b0b0b0;
           cursor: pointer;
           padding: 5px;
           border-radius: 50%;
           width: 24px;
           height: 24px;
           display: flex;
           align-items: center;
           justify-content: center;
           transition: all 0.2s ease;
           font-size: 16px;
         ">✕</button>
      `;

      document.body.appendChild(notification);

      // Event listeners
      document
        .getElementById('extract-now-btn')
        .addEventListener('click', () => {
          this.startDataExtraction();
        });

      document
        .getElementById('expand-more-btn')
        .addEventListener('click', () => {
          this.startAccordionExpansion();
        });

      document.getElementById('close-success').addEventListener('click', () => {
        this.removeExistingNotifications();
      });

      console.log('✅ Notificação de sucesso na expansão exibida');
    } catch (error) {
      console.error('❌ Erro ao mostrar notificação de sucesso:', error);
    }
  }

  showAccordionExpansionLoading() {
    try {
      this.removeExistingNotifications();

      const notification = document.createElement('div');
      notification.id = 'unite-scraper-loading';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
        color: #ffffff;
        padding: 25px;
        border-radius: 15px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.6);
        z-index: 10000;
        font-family: "Sora", sans-serif;
        max-width: 380px;
        border: 1px solid #4CAF50;
        animation: slideIn 0.3s ease-out;
      `;

      notification.innerHTML = `
        <div style="margin-bottom: 20px;">
          <div style="
            width: 50px;
            height: 50px;
            border: 3px solid #404040;
            border-top: 3px solid #4CAF50;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 15px;
            float: left;
          "></div>
          <div style="margin-left: 65px;">
            <div style="font-weight: 600; font-size: 18px; margin-bottom: 5px; color: #4CAF50;">Expandindo Accordions...</div>
            <div style="color: #b0b0b0; font-size: 14px;">Abrindo todas as partidas</div>
          </div>
          <div style="clear: both;"></div>
        </div>

        <div style="margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #b0b0b0; font-size: 14px;">Progresso</span>
            <span id="progress-text" style="color: #4CAF50; font-weight: 600;">0%</span>
          </div>
          <div style="
            width: 100%;
            height: 6px;
            background: #404040;
            border-radius: 3px;
            overflow: hidden;
          ">
            <div id="progress-bar" style="
              width: 0%;
              height: 100%;
              background: linear-gradient(90deg, #4CAF50, #45a049);
              border-radius: 3px;
              transition: width 0.3s ease;
            "></div>
          </div>
        </div>

        <div style="
          background: rgba(76, 175, 80, 0.1);
          border: 1px solid rgba(76, 175, 80, 0.3);
          border-radius: 8px;
          padding: 12px;
          font-size: 12px;
          color: #b0b0b0;
          line-height: 1.4;
        ">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <span style="font-weight: 600; color: #ffffff;">Status da Expansão</span>
          </div>
          <div id="status-text">Iniciando expansão dos accordions...</div>
        </div>
      `;

      // Adicionar estilos CSS
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        #unite-scraper-loading {
          backdrop-filter: blur(10px);
        }
      `;
      document.head.appendChild(style);

      document.body.appendChild(notification);

      // Iniciar progresso específico para expansão
      this.startAccordionExpansionProgress();

      console.log('🔄 Notificação de loading de expansão exibida');
    } catch (error) {
      console.error('❌ Erro ao mostrar loading de expansão:', error);
    }
  }

  startAccordionExpansionProgress() {
    let progress = 0;
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const statusText = document.getElementById('status-text');

    if (!progressBar || !progressText || !statusText) return;

    const interval = setInterval(() => {
      progress += Math.random() * 25; // Mais rápido para expansão
      if (progress > 90) progress = 90; // Não chegar a 100% até finalizar

      progressBar.style.width = progress + '%';
      progressText.textContent = Math.round(progress) + '%';

      // Atualizar status específico para expansão
      if (progress < 25) {
        statusText.textContent = 'Procurando elementos de partida...';
      } else if (progress < 50) {
        statusText.textContent = 'Clicando nos accordions...';
      } else if (progress < 75) {
        statusText.textContent = 'Aguardando abertura...';
      } else {
        statusText.textContent = 'Finalizando expansão...';
      }

      // Parar quando chegar próximo ao fim
      if (progress >= 90) {
        clearInterval(interval);
      }
    }, 100); // Mais rápido para expansão

    // Salvar intervalo para poder parar depois
    this.progressInterval = interval;
  }

  markAccordionExpansionComplete() {
    try {
      const expandButton = document.getElementById('expand-accordions-btn');
      if (expandButton) {
        // Adicionar emoji de check e mudar o texto
        expandButton.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center;">
            <span>Accordions expandidos</span>
          </div>
        `;

        // Mudar estilo para indicar que foi concluído
        expandButton.style.background = 'rgba(76, 175, 80, 0.1)';
        expandButton.style.borderColor = '#4CAF50';
        expandButton.style.color = '#4CAF50';
        expandButton.style.cursor = 'default';

        // Remover event listener para evitar cliques repetidos
        expandButton.removeEventListener('click', this.startAccordionExpansion);

        console.log('✅ Botão de expandir accordions marcado como concluído');
      }
    } catch (error) {
      console.error('❌ Erro ao marcar expansão como concluída:', error);
    }
  }

  showMatchSelector(matches) {
    try {
      if (!matches || matches.length === 0) {
        this.showErrorNotification('Nenhuma partida disponível para gerar imagem');
        return;
      }

      this.removeExistingNotifications();

      const notification = document.createElement('div');
      notification.id = 'match-selector';
      notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
        color: #ffffff;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.6);
        z-index: 10001;
        font-family: "Sora", sans-serif;
        max-width: 500px;
        width: 90%;
        border: 1px solid #404040;
        max-height: 80vh;
        overflow-y: auto;
      `;

      notification.innerHTML = `
        <div style="margin-bottom: 20px;">
          <h3 style="font-weight: 600; font-size: 20px; margin-bottom: 10px;">Selecionar Partida</h3>
          <p style="color: #b0b0b0; font-size: 14px;">Escolha uma partida para gerar a imagem de estatísticas</p>
        </div>
        
        <div id="matches-list" style="margin-bottom: 20px; max-height: 400px; overflow-y: auto;">
          ${matches.map((match, index) => `
            <div class="match-item" data-index="${index}" style="
              background: rgba(255, 70, 0, 0.1);
              border: 1px solid rgba(255, 70, 0, 0.3);
              border-radius: 10px;
              padding: 15px;
              margin-bottom: 10px;
              cursor: pointer;
              transition: all 0.3s ease;
            ">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 600; margin-bottom: 5px;">
                    ${match.outcome || 'Unknown'} - ${match.date || 'N/A'} ${match.time || ''}
                  </div>
                  <div style="color: #b0b0b0; font-size: 12px;">
                    ${match.map || 'Unknown Map'} | ${match.totalPlayers || 0} jogadores
                  </div>
                </div>
                <div style="
                  background: ${match.outcome === 'Victory' ? '#4CAF50' : '#f44336'};
                  color: white;
                  padding: 5px 10px;
                  border-radius: 20px;
                  font-size: 12px;
                  font-weight: 600;
                ">
                  ${match.outcome === 'Victory' ? '✓' : '✗'}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div style="display: flex; gap: 10px;">
          <button id="cancel-select-btn" style="
            flex: 1;
            background: transparent;
            color: #b0b0b0;
            border: 1px solid #404040;
            padding: 12px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
          ">Cancelar</button>
        </div>
      `;

      document.body.appendChild(notification);

      // Event listeners
      const matchItems = notification.querySelectorAll('.match-item');
      matchItems.forEach((item, index) => {
        item.addEventListener('click', () => {
          this.generateImageForMatch(matches[index]);
          notification.remove();
        });
        
        item.addEventListener('mouseenter', () => {
          item.style.background = 'rgba(255, 70, 0, 0.2)';
          item.style.borderColor = 'rgba(255, 70, 0, 0.5)';
        });
        
        item.addEventListener('mouseleave', () => {
          item.style.background = 'rgba(255, 70, 0, 0.1)';
          item.style.borderColor = 'rgba(255, 70, 0, 0.3)';
        });
      });

      document.getElementById('cancel-select-btn').addEventListener('click', () => {
        notification.remove();
      });

      console.log('✅ Seletor de partidas exibido');
    } catch (error) {
      console.error('❌ Erro ao mostrar seletor de partidas:', error);
      this.showErrorNotification('Erro ao mostrar seletor de partidas');
    }
  }

  async generateImageForMatch(match, sourcePlayerName) {
    try {
      console.log('📸 Gerando imagem para partida:', match);

      // Aguardar módulos carregarem (com timeout)
      let attempts = 0;
      const maxAttempts = 20; // 2 segundos no total
      while (!window.ImageGenerator && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      // Verificar se os módulos estão carregados
      if (!window.ImageGenerator) {
        console.error('❌ Módulos não carregados após espera:', {
          ImageGenerator: !!window.ImageGenerator,
          PokemonData: !!window.PokemonData,
          PhotoUpload: !!window.PhotoUpload,
          StatsCalculator: !!window.StatsCalculator,
          pokemonsData: !!window.pokemonsData
        });
        this.showErrorNotification('Módulos não carregados. Recarregue a página e tente novamente.');
        return;
      }

      // Gerar imagem (avatar será usado como fallback se não houver foto do usuário)
      const imageGenerator = new window.ImageGenerator();
      await imageGenerator.generateAndDownload(match, sourcePlayerName);

      console.log('✅ Imagem gerada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao gerar imagem:', error);
      this.showErrorNotification('Erro ao gerar imagem: ' + error.message);
    }
  }
}

// Inicialização automática
let attempts = 0;
const maxAttempts = 3;

const initScraper = () => {
  if (attempts >= maxAttempts) {
    console.log('⚠️ Máximo de tentativas atingido para inicializar o scraper');
    return;
  }

  attempts++;
  if (!window.scraper) {
    try {
      // Expor a classe globalmente
      window.UniteApiScraper = UniteApiScraper;
      console.log('✅ Classe UniteApiScraper exposta globalmente');

      // Criar instância do scraper
      window.scraper = new UniteApiScraper();
      console.log('✅ Scraper inicializado com sucesso na tentativa', attempts);

      // Expor métodos globais
      window.runUniteApiScraper = () => {
        if (window.scraper) {
          console.log('🚀 Executando scraper via método global...');
          window.scraper.startScraping();
        } else {
          console.error('❌ Scraper não encontrado');
        }
      };

      window.runUniteApiMultiPageScraper = () => {
        if (window.scraper) {
          console.log(
            '🔄 Executando scraper multi-página via método global...'
          );
          window.scraper.startScraping();
        } else {
          console.error('❌ Scraper não encontrado');
        }
      };

      window.forceCleanExtraction = () => {
        if (window.scraper) {
          console.log('🧹 Forçando limpeza de dados...');
          window.scraper.forceCleanExtraction();
        } else {
          console.error('❌ Scraper não encontrado');
        }
      };

      window.generateExtractionReport = () => {
        if (window.scraper) {
          console.log('📊 Gerando relatório de extração...');
          const report = window.scraper.generateExtractionReport();
          console.log('📋 Relatório gerado:', report);
          return report;
        } else {
          console.error('❌ Scraper não encontrado');
          return null;
        }
      };

      window.exportData = (format = 'json') => {
        if (window.scraper) {
          console.log(`📤 Exportando dados no formato ${format}...`);
          const data = window.scraper.formatDataForExport(format);
          console.log('✅ Dados exportados com sucesso');
          return data;
        } else {
          console.error('❌ Scraper não encontrado');
          return null;
        }
      };

      window.downloadData = () => {
        if (window.scraper) {
          console.log('📥 Iniciando download manual...');
          const matches = window.scraper.matchExtractor.matches;
          if (matches && matches.length > 0) {
            window.scraper.downloadDataAutomatically(matches);
          } else {
            console.log('⚠️ Nenhum dado disponível para download');
          }
        } else {
          console.error('❌ Scraper não encontrado');
        }
      };

      window.showDataSummary = () => {
        if (window.scraper) {
          const matches = window.scraper.matchExtractor.matches;
          if (matches && matches.length > 0) {
            console.log('📊 === RESUMO DOS DADOS COLETADOS ===');
            console.log(`🎮 Total de partidas: ${matches.length}`);
            console.log(`📅 Última extração: ${new Date().toLocaleString()}`);

            matches.forEach((match, index) => {
              console.log(`\n📋 Partida ${index + 1}:`);
              console.log(`   🏆 Resultado: ${match.outcome || 'N/A'}`);
              console.log(
                `   📅 Data: ${match.date || 'N/A'} ${match.time || ''}`
              );
              console.log(`   🗺️ Mapa: ${match.map || 'N/A'}`);
              console.log(`   👥 Jogadores: ${match.totalPlayers || 'N/A'}`);
            });

            console.log('\n💡 Use downloadData() para baixar os dados em JSON');
          } else {
            console.log('⚠️ Nenhum dado coletado ainda');
          }
        } else {
          console.error('❌ Scraper não encontrado');
        }
      };

      console.log('✅ Métodos globais expostos:');
      console.log('   - runUniteApiScraper() - Extração da página atual');
      console.log('   - runUniteApiMultiPageScraper() - Extração multi-página');
      console.log('   - forceCleanExtraction() - Limpeza de dados');
      console.log('   - generateExtractionReport() - Gerar relatório');
      console.log('   - exportData(format) - Exportar dados');
      console.log('   - downloadData() - Download manual dos dados');
      console.log(
        '   - showDataSummary() - Mostrar resumo dos dados coletados'
      );
      console.log('💡 O scraper só executa quando solicitado pelo usuário');

      // Adicionar listener para cliques no ícone da extensão
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'executeScraper') {
          console.log('🎯 Comando recebido para executar scraper...');
          if (window.scraper) {
            window.scraper.startScraping();
            sendResponse({ success: true, message: 'Scraper iniciado' });
          } else {
            sendResponse({ success: false, message: 'Scraper não encontrado' });
          }
        }
        return true; // Manter a mensagem ativa para resposta assíncrona
      });

      console.log('✅ Scraper inicializado e aguardando comando do usuário...');
    } catch (error) {
      console.error(
        '❌ Erro ao inicializar scraper na tentativa',
        attempts,
        ':',
        error
      );
      setTimeout(initScraper, 2000);
    }
  }
};

// Tentar inicializar o scraper
if (document.readyState === 'complete') {
  initScraper();
} else {
  window.addEventListener('load', () => {
    setTimeout(initScraper, 1000);
  });
}

console.log(
  '✅ Content Script do UniteApi carregado - versão simplificada e funcional'
);
console.log('📦 Todas as funcionalidades principais incluídas');

