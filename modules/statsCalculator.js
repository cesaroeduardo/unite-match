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
  // Usa valores de referência fixos (médias) ao invés de normalização relativa
  calculateRadarStats(playerData, allPlayersData) {
    if (!playerData) {
      return {
        assists: 0,
        knockouts: 0,
        damageTaken: 0,
        damageDealt: 0,
        scoring: 0,
        healing: 0,
      };
    }

    // Valores de referência (médias) que representam 100%
    const REFERENCE_VALUES = {
      knockouts: 15,        // 15 knockouts = 100%
      assists: 20,          // 20 assists = 100%
      scoring: 250,         // 300 scoring = 100%
      damageDealt: 170000,  // 170k damage dealt = 100%
      damageTaken: 120000,  // 120k damage taken = 100%
      healing: 170000,      // 170k healing = 100%
    };

    try {
      // Calcular porcentagem baseada nos valores de referência
      // Limitar a 100% máximo
      const calculatePercentage = (value, reference) => {
        const percentage = (value / reference) * 100;
        return Math.min(Math.round(percentage), 100);
      };

      return {
        assists: calculatePercentage(playerData.assists || 0, REFERENCE_VALUES.assists),
        knockouts: calculatePercentage(playerData.kills || 0, REFERENCE_VALUES.knockouts),
        damageTaken: calculatePercentage(playerData.damageTaken || 0, REFERENCE_VALUES.damageTaken),
        damageDealt: calculatePercentage(playerData.damageDone || 0, REFERENCE_VALUES.damageDealt),
        scoring: calculatePercentage(playerData.playerScore || 0, REFERENCE_VALUES.scoring),
        healing: calculatePercentage(playerData.healing || 0, REFERENCE_VALUES.healing),
      };
    } catch (error) {
      console.error('❌ Erro ao calcular stats do radar:', error);
      return {
        assists: 0,
        knockouts: 0,
        damageTaken: 0,
        damageDealt: 0,
        scoring: 0,
        healing: 0,
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

