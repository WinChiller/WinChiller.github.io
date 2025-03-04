import { 
  GameAnalysis, 
  PlaystyleProfile, 
  PlaystyleType,
  OpeningPerformance,
  MatchupAnalysis
} from '@/types';

export class PlaystyleAnalysisService {
  // Grandmaster style references
  private gmStyles: Record<string, PlaystyleType> = {
    'Garry Kasparov': 'tacticalAttacker',
    'Anatoly Karpov': 'positionalPlayer',
    'Magnus Carlsen': 'endgameSpecialist',
    'Hikaru Nakamura': 'blitzSpeedster',
    'Tigran Petrosian': 'defensivePlayer',
    'Mikhail Tal': 'tacticalAttacker',
    'Vladimir Kramnik': 'positionalPlayer',
    'Jose Raul Capablanca': 'endgameSpecialist',
    'Alexander Alekhine': 'tacticalAttacker',
    'Bobby Fischer': 'tacticalAttacker'
  };

  // Analyze player style based on game history
  public analyzePlaystyle(gameHistory: GameAnalysis[]): PlaystyleProfile {
    if (gameHistory.length === 0) {
      return this.createDefaultProfile();
    }
    
    // Calculate key metrics
    const tacticsvPositional = this.calculateTacticalBalance(gameHistory);
    const aggressionScore = this.calculateAggressionScore(gameHistory);
    const defensiveStrength = this.calculateDefensiveStrength(gameHistory);
    const openingStability = this.calculateOpeningStability(gameHistory);
    const blunderRate = this.calculateBlunderRate(gameHistory);
    const accuracyVariance = this.calculateAccuracyVariance(gameHistory);
    
    // Determine primary playstyle
    const primaryStyle = this.determinePlaystyle({
      tacticsvPositional,
      aggressionScore,
      defensiveStrength,
      openingStability,
      blunderRate,
      accuracyVariance
    });
    
    // Determine secondary playstyle (if appropriate)
    const secondaryStyle = this.determineSecondaryPlaystyle({
      tacticsvPositional,
      aggressionScore,
      defensiveStrength,
      openingStability,
      blunderRate,
      accuracyVariance
    }, primaryStyle);
    
    // Find similar grandmaster
    const similarGrandmaster = this.findSimilarGrandmaster(primaryStyle);
    
    return {
      primaryStyle,
      secondaryStyle,
      tacticsvPositional,
      aggressionScore,
      defensiveStrength,
      openingStability,
      blunderRate,
      accuracyVariance,
      similarGrandmaster
    };
  }

  // Calculate tactical vs positional balance (0-100, higher = more tactical)
  private calculateTacticalBalance(games: GameAnalysis[]): number {
    // This is a simplified implementation
    // A more complete version would analyze move types, material imbalances,
    // sacrifices, attacking patterns, etc.
    
    let tacticalScore = 50; // Default balanced score
    
    // Factor 1: Blunder rate - tactical players tend to have higher blunder rates
    const blunderRate = this.calculateBlunderRate(games);
    tacticalScore += blunderRate * 0.2;
    
    // Factor 2: Winning with attacks - determine if wins come from attacks
    const attackWins = games.filter(game => {
      // Check if game was won and had sharp evaluation changes
      return game.result === (game.playerColor === 'white' ? '1-0' : '0-1') &&
        game.turningPoints.length > 0;
    }).length;
    
    const attackWinRate = games.length > 0 ? (attackWins / games.length) * 100 : 0;
    tacticalScore += attackWinRate * 0.3;
    
    // Factor 3: Evaluation volatility - tactical games have more swings
    const volatility = games.reduce((sum, game) => {
      // Calculate average change between consecutive evaluations
      let changes = 0;
      for (let i = 1; i < game.moveEvaluations.length; i++) {
        changes += Math.abs(
          game.moveEvaluations[i].evaluation - game.moveEvaluations[i-1].evaluation
        );
      }
      return sum + (changes / Math.max(1, game.moveEvaluations.length - 1));
    }, 0) / Math.max(1, games.length);
    
    tacticalScore += volatility * 15; // Scale factor for volatility
    
    // Ensure score is between 0-100
    return Math.max(0, Math.min(100, Math.round(tacticalScore)));
  }

  // Calculate aggression score (0-100)
  private calculateAggressionScore(games: GameAnalysis[]): number {
    if (games.length === 0) return 50;
    
    let aggressionScore = 50; // Default neutral score
    
    // Factor 1: Attacking moves ratio
    // This would ideally check for moves that increase piece activity,
    // push pawns forward, and create threats
    // Simplified version uses position changes as proxy
    let attackingMovesCount = 0;
    let totalMoves = 0;
    
    games.forEach(game => {
      // Count player's moves only
      const playerMoves = game.moveEvaluations.filter(move => {
        const isWhiteMove = move.moveNumber % 2 === 1;
        return (isWhiteMove && game.playerColor === 'white') || 
               (!isWhiteMove && game.playerColor === 'black');
      });
      
      totalMoves += playerMoves.length;
      
      // Simplistic approach: moves that increase evaluation are "attacking"
      for (let i = 1; i < playerMoves.length; i++) {
        const evaluationDiff = playerMoves[i].evaluation - playerMoves[i-1].evaluation;
        const improved = game.playerColor === 'white' ? evaluationDiff > 0 : evaluationDiff < 0;
        if (improved) {
          attackingMovesCount++;
        }
      }
    });
    
    const attackRatio = totalMoves > 0 ? (attackingMovesCount / totalMoves) : 0;
    aggressionScore += attackRatio * 50;
    
    // Factor 2: Opening choice aggressiveness
    // Would need database of opening classifications
    // Using a placeholder value for now
    aggressionScore += 0;
    
    // Ensure score is between 0-100
    return Math.max(0, Math.min(100, Math.round(aggressionScore)));
  }

  // Calculate defensive strength (0-100)
  private calculateDefensiveStrength(games: GameAnalysis[]): number {
    if (games.length === 0) return 50;
    
    let defensiveScore = 50; // Default neutral score
    
    // Factor 1: Comeback rate - how often player recovers from bad positions
    let recoveredGames = 0;
    let badPositions = 0;
    
    games.forEach(game => {
      let wasLosing = false;
      let didRecover = false;
      
      // Check for positions where player was losing by 2+ pawns
      for (let i = 0; i < game.moveEvaluations.length; i++) {
        const eval = game.moveEvaluations[i].evaluation;
        const isLosing = game.playerColor === 'white' ? eval < -2 : eval > 2;
        
        if (isLosing && !wasLosing) {
          wasLosing = true;
          badPositions++;
        }
        
        // Check if position improved later by at least 1.5 pawns
        if (wasLosing && !didRecover) {
          const laterEvals = game.moveEvaluations.slice(i+1);
          const recovered = laterEvals.some(laterEval => {
            const improvement = game.playerColor === 'white' 
              ? laterEval.evaluation - eval
              : eval - laterEval.evaluation;
            return improvement >= 1.5;
          });
          
          if (recovered) {
            didRecover = true;
            recoveredGames++;
          }
        }
      }
    });
    
    const recoveryRate = badPositions > 0 ? (recoveredGames / badPositions) : 0;
    defensiveScore += recoveryRate * 30;
    
    // Factor 2: Low blunder rate in worse positions
    defensiveScore -= this.calculateBlunderRate(games) * 0.3;
    
    // Ensure score is between 0-100
    return Math.max(0, Math.min(100, Math.round(defensiveScore)));
  }

  // Calculate opening stability (0-100)
  private calculateOpeningStability(games: GameAnalysis[]): number {
    if (games.length === 0) return 50;
    
    const openingCount: Record<string, number> = {};
    
    // Count openings played
    games.forEach(game => {
      const opening = game.opening || 'Unknown';
      openingCount[opening] = (openingCount[opening] || 0) + 1;
    });
    
    // Calculate opening diversity (lower = more stable)
    const uniqueOpenings = Object.keys(openingCount).length;
    const openingDiversity = uniqueOpenings / games.length;
    
    // Convert to stability score (inverse of diversity)
    let stabilityScore = 100 - (openingDiversity * 100);
    
    // Adjust stability score based on how frequently top openings are played
    const sortedOpenings = Object.entries(openingCount)
      .sort((a, b) => b[1] - a[1]);
    
    if (sortedOpenings.length > 0) {
      const topOpeningFrequency = sortedOpenings[0][1] / games.length;
      stabilityScore += topOpeningFrequency * 20;
    }
    
    // Ensure score is between 0-100
    return Math.max(0, Math.min(100, Math.round(stabilityScore)));
  }

  // Calculate blunder rate (percentage)
  private calculateBlunderRate(games: GameAnalysis[]): number {
    if (games.length === 0) return 0;
    
    let totalPlayerMoves = 0;
    let totalBlunders = 0;
    
    games.forEach(game => {
      // Count player's moves only
      game.moveEvaluations.forEach(move => {
        const isWhiteMove = move.moveNumber % 2 === 1;
        const isPlayerMove = (isWhiteMove && game.playerColor === 'white') || 
                           (!isWhiteMove && game.playerColor === 'black');
        
        if (isPlayerMove) {
          totalPlayerMoves++;
          if (move.isBlunder) {
            totalBlunders++;
          }
        }
      });
    });
    
    return totalPlayerMoves > 0 
      ? (totalBlunders / totalPlayerMoves) * 100 
      : 0;
  }

  // Calculate accuracy variance (standard deviation)
  private calculateAccuracyVariance(games: GameAnalysis[]): number {
    if (games.length === 0) return 0;
    
    // Get all centipawn losses
    const centipawnLosses: number[] = [];
    
    games.forEach(game => {
      game.moveEvaluations.forEach(move => {
        const isWhiteMove = move.moveNumber % 2 === 1;
        const isPlayerMove = (isWhiteMove && game.playerColor === 'white') || 
                           (!isWhiteMove && game.playerColor === 'black');
        
        if (isPlayerMove) {
          centipawnLosses.push(move.centipawnLoss);
        }
      });
    });
    
    if (centipawnLosses.length === 0) return 0;
    
    // Calculate mean
    const mean = centipawnLosses.reduce((sum, val) => sum + val, 0) / centipawnLosses.length;
    
    // Calculate variance
    const variance = centipawnLosses.reduce((sum, val) => {
      const diff = val - mean;
      return sum + (diff * diff);
    }, 0) / centipawnLosses.length;
    
    // Return standard deviation (square root of variance)
    return Math.sqrt(variance);
  }

  // Determine primary playstyle based on metrics
  private determinePlaystyle(metrics: {
    tacticsvPositional: number;
    aggressionScore: number;
    defensiveStrength: number;
    openingStability: number;
    blunderRate: number;
    accuracyVariance: number;
  }): PlaystyleType {
    // Tactical Attacker criteria
    if (metrics.tacticsvPositional > 70 && 
        metrics.aggressionScore > 70 &&
        metrics.blunderRate > 8) {
      return 'tacticalAttacker';
    }
    
    // Positional Player criteria
    if (metrics.tacticsvPositional < 40 &&
        metrics.blunderRate < 5 &&
        metrics.accuracyVariance < 15) {
      return 'positionalPlayer';
    }
    
    // Endgame Specialist criteria
    if (metrics.tacticsvPositional < 60 &&
        metrics.tacticsvPositional > 40 &&
        metrics.blunderRate < 7 &&
        metrics.defensiveStrength > 65) {
      return 'endgameSpecialist';
    }
    
    // Blitz Speedster criteria
    if (metrics.openingStability < 30 &&
        metrics.blunderRate > 10 &&
        metrics.accuracyVariance > 20) {
      return 'blitzSpeedster';
    }
    
    // Defensive Player criteria
    if (metrics.defensiveStrength > 75 &&
        metrics.aggressionScore < 40 &&
        metrics.blunderRate < 6) {
      return 'defensivePlayer';
    }
    
    // Unstable Player criteria
    if (metrics.blunderRate > 12 &&
        metrics.accuracyVariance > 25) {
      return 'unstablePlayer';
    }
    
    // Default - most common type
    if (metrics.tacticsvPositional > 50) {
      return 'tacticalAttacker';
    } else {
      return 'positionalPlayer';
    }
  }

  // Determine secondary playstyle (if any)
  private determineSecondaryPlaystyle(
    metrics: {
      tacticsvPositional: number;
      aggressionScore: number;
      defensiveStrength: number;
      openingStability: number;
      blunderRate: number;
      accuracyVariance: number;
    },
    primaryStyle: PlaystyleType
  ): PlaystyleType | undefined {
    // Only assign secondary style if there's a strong tendency
    // that doesn't conflict with primary style
    
    if (primaryStyle !== 'endgameSpecialist' && 
        metrics.defensiveStrength > 70) {
      return 'endgameSpecialist';
    }
    
    if (primaryStyle !== 'tacticalAttacker' && 
        metrics.tacticsvPositional > 65) {
      return 'tacticalAttacker';
    }
    
    if (primaryStyle !== 'defensivePlayer' && 
        metrics.aggressionScore < 35) {
      return 'defensivePlayer';
    }
    
    // No strong secondary style
    return undefined;
  }

  // Find similar grandmaster based on playstyle
  private findSimilarGrandmaster(style: PlaystyleType): string {
    const candidates = Object.entries(this.gmStyles)
      .filter(([_, gmStyle]) => gmStyle === style)
      .map(([name, _]) => name);
    
    if (candidates.length === 0) {
      return 'Unknown';
    }
    
    // Pick a random GM from the matching candidates
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  // Analyze opening performance
  public analyzeOpeningPerformance(games: GameAnalysis[]): OpeningPerformance[] {
    if (games.length === 0) return [];
    
    const openingStats: Record<string, {
      gamesPlayed: number;
      wins: number;
      draws: number;
      losses: number;
      totalEvaluation: number;
    }> = {};
    
    // Collect stats for each opening
    games.forEach(game => {
      const opening = game.opening || 'Unknown Opening';
      
      if (!openingStats[opening]) {
        openingStats[opening] = {
          gamesPlayed: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          totalEvaluation: 0
        };
      }
      
      openingStats[opening].gamesPlayed++;
      
      // Count result
      if (game.result === '1/2-1/2') {
        openingStats[opening].draws++;
      } else if (
        (game.result === '1-0' && game.playerColor === 'white') ||
        (game.result === '0-1' && game.playerColor === 'black')
      ) {
        openingStats[opening].wins++;
      } else if (
        (game.result === '0-1' && game.playerColor === 'white') ||
        (game.result === '1-0' && game.playerColor === 'black')
      ) {
        openingStats[opening].losses++;
      }
      
      // Average evaluation after opening (typically move 10-15)
      const openingEndIndex = Math.min(15, game.moveEvaluations.length) - 1;
      if (openingEndIndex >= 0) {
        const openingEval = game.moveEvaluations[openingEndIndex].evaluation;
        openingStats[opening].totalEvaluation += 
          game.playerColor === 'white' ? openingEval : -openingEval;
      }
    });
    
    // Convert to OpeningPerformance objects
    return Object.entries(openingStats).map(([name, stats]) => ({
      name,
      gamesPlayed: stats.gamesPlayed,
      winRate: stats.gamesPlayed > 0 ? (stats.wins / stats.gamesPlayed) * 100 : 0,
      drawRate: stats.gamesPlayed > 0 ? (stats.draws / stats.gamesPlayed) * 100 : 0,
      lossRate: stats.gamesPlayed > 0 ? (stats.losses / stats.gamesPlayed) * 100 : 0,
      averageEvaluation: stats.gamesPlayed > 0 ? stats.totalEvaluation / stats.gamesPlayed : 0
    })).sort((a, b) => b.gamesPlayed - a.gamesPlayed);
  }

  // Analyze matchups against different playstyles
  public analyzeMatchups(
    games: GameAnalysis[], 
    opponentStyles: Record<string, PlaystyleType>
  ): MatchupAnalysis[] {
    if (games.length === 0) return [];
    
    const matchupStats: Record<PlaystyleType, {
      gamesPlayed: number;
      wins: number;
      draws: number;
      losses: number;
      totalCentipawnLoss: number;
    }> = {
      tacticalAttacker: { gamesPlayed: 0, wins: 0, draws: 0, losses: 0, totalCentipawnLoss: 0 },
      positionalPlayer: { gamesPlayed: 0, wins: 0, draws: 0, losses: 0, totalCentipawnLoss: 0 },
      endgameSpecialist: { gamesPlayed: 0, wins: 0, draws: 0, losses: 0, totalCentipawnLoss: 0 },
      blitzSpeedster: { gamesPlayed: 0, wins: 0, draws: 0, losses: 0, totalCentipawnLoss: 0 },
      defensivePlayer: { gamesPlayed: 0, wins: 0, draws: 0, losses: 0, totalCentipawnLoss: 0 },
      unstablePlayer: { gamesPlayed: 0, wins: 0, draws: 0, losses: 0, totalCentipawnLoss: 0 }
    };
    
    // Collect stats for each matchup
    games.forEach(game => {
      const opponentName = game.opponent;
      const opponentStyle = opponentStyles[opponentName] || 'tacticalAttacker';
      
      matchupStats[opponentStyle].gamesPlayed++;
      matchupStats[opponentStyle].totalCentipawnLoss += game.averageCentipawnLoss;
      
      // Count result
      if (game.result === '1/2-1/2') {
        matchupStats[opponentStyle].draws++;
      } else if (
        (game.result === '1-0' && game.playerColor === 'white') ||
        (game.result === '0-1' && game.playerColor === 'black')
      ) {
        matchupStats[opponentStyle].wins++;
      } else if (
        (game.result === '0-1' && game.playerColor === 'white') ||
        (game.result === '1-0' && game.playerColor === 'black')
      ) {
        matchupStats[opponentStyle].losses++;
      }
    });
    
    // Generate strategy recommendations
    const recommendations: Record<PlaystyleType, string> = {
      tacticalAttacker: "Simplify positions and avoid tactical complications",
      positionalPlayer: "Create imbalances and seek tactical opportunities",
      endgameSpecialist: "Keep pieces on the board and avoid simplification",
      blitzSpeedster: "Play solid openings and maintain a steady pace",
      defensivePlayer: "Maintain patience and develop slow attacking plans",
      unstablePlayer: "Maintain steady pressure and avoid wild complications"
    };
    
    // Convert to MatchupAnalysis objects
    return Object.entries(matchupStats)
      .filter(([_, stats]) => stats.gamesPlayed > 0)
      .map(([style, stats]) => ({
        againstStyle: style as PlaystyleType,
        gamesPlayed: stats.gamesPlayed,
        winRate: (stats.wins / stats.gamesPlayed) * 100,
        drawRate: (stats.draws / stats.gamesPlayed) * 100,
        lossRate: (stats.losses / stats.gamesPlayed) * 100,
        averageCentipawnLoss: stats.totalCentipawnLoss / stats.gamesPlayed,
        recommendedCounterStrategy: recommendations[style as PlaystyleType]
      })).sort((a, b) => b.gamesPlayed - a.gamesPlayed);
  }

  // Generate training recommendations
  public generateTrainingRecommendations(
    profile: PlaystyleProfile, 
    games: GameAnalysis[]
  ): string[] {
    const recommendations: string[] = [];
    
    // Recommendations based on playstyle
    if (profile.primaryStyle === 'tacticalAttacker') {
      recommendations.push("Practice positional and endgame puzzles to balance your tactical skills");
      recommendations.push("Work on reducing your blunder rate by implementing a pre-move check routine");
    } else if (profile.primaryStyle === 'positionalPlayer') {
      recommendations.push("Practice tactical puzzles to improve calculation abilities");
      recommendations.push("Study attacking games by Tal, Kasparov and Alekhine to develop attacking skills");
    } else if (profile.primaryStyle === 'endgameSpecialist') {
      recommendations.push("Study complex middlegame positions to improve strategic planning");
      recommendations.push("Practice aggressive openings that lead to dynamic positions");
    } else if (profile.primaryStyle === 'blitzSpeedster') {
      recommendations.push("Slow down and practice longer time controls to develop deeper calculation");
      recommendations.push("Develop a more consistent opening repertoire");
    } else if (profile.primaryStyle === 'defensivePlayer') {
      recommendations.push("Practice attacking patterns and piece sacrifices");
      recommendations.push("Study games with dynamic pawn structures to improve attacking skills");
    } else if (profile.primaryStyle === 'unstablePlayer') {
      recommendations.push("Focus on reducing blunders with systematic thought process");
      recommendations.push("Practice basic tactics and pattern recognition");
    }
    
    // Recommendations based on metrics
    if (profile.blunderRate > 10) {
      recommendations.push("Use a blunder check technique: look for checks, captures, and threats before each move");
    }
    
    if (profile.tacticsvPositional < 30) {
      recommendations.push("Train with tactical puzzles focusing on combinations and sacrifices");
    } else if (profile.tacticsvPositional > 70) {
      recommendations.push("Study positional concepts like pawn structures, weak squares, and piece placement");
    }
    
    if (profile.openingStability < 40) {
      recommendations.push("Develop a more focused opening repertoire with 2-3 main openings for each color");
    }
    
    // Limit to 5 recommendations
    return recommendations.slice(0, 5);
  }

  // Create default profile when no games are available
  private createDefaultProfile(): PlaystyleProfile {
    return {
      primaryStyle: 'positionalPlayer',
      tacticsvPositional: 50,
      aggressionScore: 50,
      defensiveStrength: 50,
      openingStability: 50,
      blunderRate: 5,
      accuracyVariance: 15
    };
  }
}