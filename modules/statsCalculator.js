// Módulo para calcular estatísticas agregadas da partida

class StatsCalculator {
  // Calcular estatísticas gerais da partida
  calculateGeneralStats(matchData) {
    if (!matchData || !matchData.fullMatchData) {
      return {
        teamBattles: 0,
        koPerMin: 0,
        koAssistRatio: 0,
      };
    }

    const { winnerTeam, defeatedTeam } = matchData.fullMatchData;
    
    // Coletar todos os jogadores
    const allPlayers = [
      winnerTeam.player1,
      winnerTeam.player2,
      winnerTeam.player3,
      winnerTeam.player4,
      winnerTeam.player5,
      defeatedTeam.player1,
      defeatedTeam.player2,
      defeatedTeam.player3,
      defeatedTeam.player4,
      defeatedTeam.player5,
    ].filter(p => p !== null);

    // Calcular total de kills e assists
    const totalKills = allPlayers.reduce((sum, p) => sum + (p.kills || 0), 0);
    const totalAssists = allPlayers.reduce((sum, p) => sum + (p.assists || 0), 0);
    const totalDamage = allPlayers.reduce((sum, p) => sum + (p.damageDone || 0), 0);

    // Estimar team battles baseado em dano total
    // Assumindo que cada "team battle" resulta em ~5000-10000 de dano total
    const estimatedTeamBattles = Math.round(totalDamage / 7500);

    // Calcular KO/Min (assumindo partida de 10 minutos se não tiver tempo)
    const matchDuration = 10; // minutos (padrão)
    const koPerMin = totalKills / matchDuration;

    // Calcular (KO+A) ratio (sem F pois não temos esse dado)
    const koAssistRatio = totalKills + totalAssists;

    return {
      teamBattles: estimatedTeamBattles,
      koPerMin: Math.round(koPerMin * 10) / 10, // 1 casa decimal
      koAssistRatio: koAssistRatio,
      totalKills,
      totalAssists,
      totalDamage,
    };
  }

  // Calcular valores para gráfico radar
  calculateRadarStats(playerData, allPlayersData) {
    if (!playerData) {
      return {
        assists: 0,
        knockouts: 0,
        damageTaken: 0,
        damageDealt: 0,
        scoring: 0,
        interrupts: 0,
      };
    }

    // Garantir que allPlayersData é um array válido
    if (!Array.isArray(allPlayersData) || allPlayersData.length === 0) {
      allPlayersData = [playerData];
    }

    // Normalizar valores baseado nos máximos da partida
    try {
      const assists = allPlayersData.map(p => p && p.assists || 0);
      const kills = allPlayersData.map(p => p && p.kills || 0);
      const damageTaken = allPlayersData.map(p => p && p.damageTaken || 0);
      const damageDealt = allPlayersData.map(p => p && p.damageDone || 0);
      const scores = allPlayersData.map(p => p && p.playerScore || 0);
      const interrupts = allPlayersData.map(p => p && p.interrupts || 0);
      
      const maxAssists = Math.max(...assists, 1);
      const maxKills = Math.max(...kills, 1);
      const maxDamageTaken = Math.max(...damageTaken, 1);
      const maxDamageDealt = Math.max(...damageDealt, 1);
      const maxScore = Math.max(...scores, 1);
      const maxInterrupts = Math.max(...interrupts, 1);

      // Normalizar para escala 0-100
      return {
        assists: Math.round(((playerData.assists || 0) / maxAssists) * 100),
        knockouts: Math.round(((playerData.kills || 0) / maxKills) * 100),
        damageTaken: Math.round(((playerData.damageTaken || 0) / maxDamageTaken) * 100),
        damageDealt: Math.round(((playerData.damageDone || 0) / maxDamageDealt) * 100),
        scoring: Math.round(((playerData.playerScore || 0) / maxScore) * 100),
        interrupts: Math.round(((playerData.interrupts || 0) / maxInterrupts) * 100),
      };
    } catch (error) {
      console.error('❌ Erro ao calcular stats do radar:', error);
      return {
        assists: 50,
        knockouts: 50,
        damageTaken: 50,
        damageDealt: 50,
        scoring: 50,
        interrupts: 50,
      };
    }
  }

  // Obter todos os jogadores da partida
  getAllPlayers(matchData) {
    if (!matchData || !matchData.fullMatchData) {
      return [];
    }

    const { winnerTeam, defeatedTeam } = matchData.fullMatchData;
    
    return [
      winnerTeam.player1,
      winnerTeam.player2,
      winnerTeam.player3,
      winnerTeam.player4,
      winnerTeam.player5,
      defeatedTeam.player1,
      defeatedTeam.player2,
      defeatedTeam.player3,
      defeatedTeam.player4,
      defeatedTeam.player5,
    ].filter(p => p !== null);
  }
}

// Exportar
console.log('🔧 StatsCalculator: Exportando classe...');
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StatsCalculator;
  console.log('📦 StatsCalculator: Exportado via module.exports');
} else {
  window.StatsCalculator = StatsCalculator;
  console.log('📦 StatsCalculator: Exportado no window', { StatsCalculator: !!window.StatsCalculator });
}

