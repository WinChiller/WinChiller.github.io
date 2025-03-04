import { Chess } from 'chess.js';
import { StockfishEngine } from '../engine/stockfish';
import { 
  GameAnalysis, 
  MoveEvaluation,
  ChessMove
} from '@/types';

export class GameAnalysisService {
  private engine: StockfishEngine;
  
  constructor() {
    this.engine = new StockfishEngine();
  }

  // Analyze a complete game from PGN
  public async analyzeGame(
    pgn: string, 
    playerName: string, 
    depth: number = 18
  ): Promise<GameAnalysis> {
    const chess = new Chess();
    chess.loadPgn(pgn);
    
    // Extract game metadata
    const white = chess.header().White || 'Unknown';
    const black = chess.header().Black || 'Unknown';
    const playerColor = white === playerName ? 'white' : 'black';
    const opponent = playerColor === 'white' ? black : white;
    const date = chess.header().Date || new Date().toISOString().split('T')[0];
    const result = chess.header().Result as GameAnalysis['result'] || '*';
    const gameId = this.generateGameId(white, black, date);
    
    // Reset to initial position
    chess.reset();
    
    // Track positions and moves
    const positions: string[] = [chess.fen()];
    const moves: ChessMove[] = [];
    
    // Process all moves in the game
    const history = chess.history({ verbose: true }) as any[];
    
    for (const move of history) {
      chess.move(move);
      positions.push(chess.fen());
      moves.push({
        from: move.from,
        to: move.to,
        promotion: move.promotion,
        san: move.san,
        piece: move.piece,
        captured: move.captured,
        fen: chess.fen()
      });
    }
    
    // Analyze each position and calculate evaluations
    const moveEvaluations: MoveEvaluation[] = await this.analyzeMoves(positions, moves, depth);
    
    // Calculate game statistics
    const blunderCount = moveEvaluations.filter(m => m.isBlunder).length;
    const mistakeCount = moveEvaluations.filter(m => m.isMistake).length;
    const inaccuracyCount = moveEvaluations.filter(m => m.isInaccuracy).length;
    
    // Calculate average centipawn loss
    const playerMoves = moveEvaluations.filter(m => {
      const isWhiteMove = m.moveNumber % 2 === 1;
      return (isWhiteMove && playerColor === 'white') || (!isWhiteMove && playerColor === 'black');
    });
    
    const averageCentipawnLoss = playerMoves.length > 0
      ? playerMoves.reduce((sum, move) => sum + move.centipawnLoss, 0) / playerMoves.length
      : 0;
    
    // Calculate winning chances over time
    const winningChances = this.calculateWinningChances(moveEvaluations, playerColor);
    
    // Calculate consistency rating
    const consistencyRating = this.calculateConsistencyRating(playerMoves);
    
    // Identify critical mistakes
    const criticalMistakes = this.findCriticalMistakes(moveEvaluations, playerColor);
    
    // Identify turning points
    const turningPoints = this.findTurningPoints(moveEvaluations);
    
    // Assemble the complete analysis
    const analysis: GameAnalysis = {
      gameId,
      player: playerName,
      playerColor,
      opponent,
      date,
      result,
      opening: this.detectOpening(chess),
      timeControl: chess.header().TimeControl || undefined,
      moveEvaluations,
      blunderCount,
      mistakeCount,
      inaccuracyCount,
      averageCentipawnLoss,
      winningChances,
      consistencyRating,
      criticalMistakes,
      turningPoints
    };
    
    return analysis;
  }

  // Analyze a sequence of moves and calculate evaluations
  private async analyzeMoves(
    positions: string[], 
    moves: ChessMove[], 
    depth: number
  ): Promise<MoveEvaluation[]> {
    const evaluations: MoveEvaluation[] = [];
    
    // Analyze each position
    for (let i = 1; i < positions.length; i++) {
      const positionBefore = positions[i - 1];
      const positionAfter = positions[i];
      const moveInfo = moves[i - 1];
      
      // Convert algebraic move to UCI format
      const uciMove = `${moveInfo.from}${moveInfo.to}${moveInfo.promotion || ''}`;
      
      // Calculate centipawn loss for this move
      const centipawnLoss = await this.engine.calculateCentipawnLoss(
        positionBefore,
        positionAfter,
        uciMove,
        depth
      );
      
      // Get position evaluation after the move
      const { evaluation, bestMove } = await this.engine.analyzePosition(positionAfter, depth);
      
      // Determine move quality
      const { isBlunder, isMistake, isInaccuracy } = this.engine.categorizeMoveQuality(centipawnLoss);
      
      // Create the move evaluation object
      evaluations.push({
        moveNumber: Math.floor((i + 1) / 2),
        fen: positionAfter,
        move: moveInfo.san,
        evaluation,
        depth,
        bestMove,
        isMistake,
        isBlunder,
        isInaccuracy,
        centipawnLoss
      });
    }
    
    return evaluations;
  }

  // Calculate winning chances based on evaluations
  private calculateWinningChances(
    evaluations: MoveEvaluation[], 
    playerColor: 'white' | 'black'
  ): number[] {
    return evaluations.map(eval => {
      // Convert evaluation to winning percentage (sigmoid function)
      let winChance = 1 / (1 + Math.exp(-eval.evaluation * 0.5));
      
      // Adjust based on player color
      if (playerColor === 'black') {
        winChance = 1 - winChance;
      }
      
      return Math.round(winChance * 100);
    });
  }

  // Calculate player consistency rating (0-100)
  private calculateConsistencyRating(playerMoves: MoveEvaluation[]): number {
    if (playerMoves.length === 0) return 0;
    
    // Count of good moves (non-mistakes)
    const goodMoves = playerMoves.filter(
      m => !m.isBlunder && !m.isMistake && !m.isInaccuracy
    ).length;
    
    // Basic consistency is the percentage of good moves
    const baseRating = (goodMoves / playerMoves.length) * 100;
    
    // Penalize for blunders more heavily
    const blunderPenalty = (playerMoves.filter(m => m.isBlunder).length / playerMoves.length) * 30;
    
    // Calculate final rating (0-100)
    return Math.max(0, Math.min(100, Math.round(baseRating - blunderPenalty)));
  }

  // Find critical mistakes that significantly changed the evaluation
  private findCriticalMistakes(
    evaluations: MoveEvaluation[],
    playerColor: 'white' | 'black'
  ): MoveEvaluation[] {
    const criticalMistakes: MoveEvaluation[] = [];
    
    for (let i = 1; i < evaluations.length; i++) {
      const prev = evaluations[i - 1];
      const curr = evaluations[i];
      
      // Check if this is the player's move
      const isWhiteMove = curr.moveNumber % 2 === 1;
      const isPlayerMove = (isWhiteMove && playerColor === 'white') || 
                           (!isWhiteMove && playerColor === 'black');
      
      if (!isPlayerMove) continue;
      
      // Calculate evaluation change
      const evalChange = prev.evaluation - curr.evaluation;
      const significantChange = Math.abs(evalChange) >= 1.5; // 1.5 pawns or more
      
      // Check if the move was a significant mistake
      if (significantChange && (curr.isBlunder || curr.isMistake)) {
        criticalMistakes.push(curr);
      }
    }
    
    return criticalMistakes;
  }

  // Find turning points in the game where advantage shifted significantly
  private findTurningPoints(evaluations: MoveEvaluation[]): MoveEvaluation[] {
    const turningPoints: MoveEvaluation[] = [];
    
    for (let i = 1; i < evaluations.length; i++) {
      const prev = evaluations[i - 1];
      const curr = evaluations[i];
      
      // Check if advantage changed sides
      const advantageChanged = (prev.evaluation > 0.5 && curr.evaluation < -0.5) || 
                               (prev.evaluation < -0.5 && curr.evaluation > 0.5);
      
      if (advantageChanged) {
        turningPoints.push(curr);
      }
    }
    
    return turningPoints;
  }

  // Detect the opening name from the chess game
  private detectOpening(chess: Chess): string {
    // This is a placeholder. In a real implementation, we would use
    // an opening database to identify the opening based on the moves
    return chess.header().Opening || 'Unknown Opening';
  }

  // Generate a unique ID for a game
  private generateGameId(white: string, black: string, date: string): string {
    return `${white}-${black}-${date}-${Math.floor(Math.random() * 1000)}`;
  }

  // Clean up when no longer needed
  public destroy(): void {
    this.engine.destroy();
  }
}