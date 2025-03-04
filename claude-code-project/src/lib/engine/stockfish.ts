import { MoveEvaluation } from '@/types';

// This is a TypeScript wrapper for the Stockfish chess engine
export class StockfishEngine {
  private engine: Worker | null = null;
  private isReady = false;
  private resolveReady: (() => void) | null = null;
  private depthReached = 0;
  private currentEvaluation: number | null = null;
  private currentBestMove: string | null = null;
  private onEvaluationCallback: ((evaluation: number, bestMove: string, depth: number) => void) | null = null;

  constructor() {
    // We need to initialize the engine in the browser
    if (typeof window !== 'undefined') {
      this.engine = new Worker('/stockfish.js');
      
      this.engine.onmessage = (e) => {
        this.handleMessage(e.data);
      };
      
      this.init();
    }
  }

  private init() {
    return new Promise<void>((resolve) => {
      this.resolveReady = resolve;
      this.sendCommand('uci');
      this.sendCommand('isready');
    });
  }

  private handleMessage(message: string) {
    // Ready confirmation
    if (message === 'readyok') {
      this.isReady = true;
      if (this.resolveReady) {
        this.resolveReady();
        this.resolveReady = null;
      }
    }
    
    // Depth info
    if (message.startsWith('info depth')) {
      const depthMatch = message.match(/depth (\d+)/);
      if (depthMatch) {
        this.depthReached = parseInt(depthMatch[1], 10);
      }
      
      // Score info - handling both mate and centipawn scores
      const scoreMatch = message.match(/score (cp|mate) (-?\d+)/);
      if (scoreMatch) {
        const scoreType = scoreMatch[1];
        const scoreValue = parseInt(scoreMatch[2], 10);
        
        if (scoreType === 'cp') {
          this.currentEvaluation = scoreValue / 100; // Convert centipawns to pawns
        } else if (scoreType === 'mate') {
          // Convert mate score to a high evaluation value
          this.currentEvaluation = scoreValue > 0 ? 100 : -100;
        }
      }
      
      // Best move info in analysis
      const pvMatch = message.match(/pv ([a-h][1-8][a-h][1-8][qrbn]?)/);
      if (pvMatch) {
        this.currentBestMove = pvMatch[1];
      }
      
      // Call the evaluation callback if available
      if (this.onEvaluationCallback && this.currentEvaluation !== null && this.currentBestMove) {
        this.onEvaluationCallback(
          this.currentEvaluation,
          this.currentBestMove,
          this.depthReached
        );
      }
    }
    
    // Best move result
    if (message.startsWith('bestmove')) {
      const bestMoveMatch = message.match(/bestmove ([a-h][1-8][a-h][1-8][qrbn]?)/);
      if (bestMoveMatch) {
        this.currentBestMove = bestMoveMatch[1];
      }
    }
  }

  private sendCommand(command: string) {
    if (this.engine) {
      this.engine.postMessage(command);
    }
  }

  // Set the position using FEN notation
  public setPosition(fen: string) {
    this.sendCommand(`position fen ${fen}`);
  }

  // Analyze the current position to a specific depth
  public async analyzePosition(
    fen: string, 
    depth: number = 18,
    callback?: (evaluation: number, bestMove: string, depth: number) => void
  ): Promise<{ evaluation: number; bestMove: string; depth: number }> {
    if (!this.isReady) {
      await this.init();
    }
    
    this.currentEvaluation = null;
    this.currentBestMove = null;
    this.depthReached = 0;
    
    if (callback) {
      this.onEvaluationCallback = callback;
    }
    
    this.setPosition(fen);
    this.sendCommand(`go depth ${depth}`);
    
    // Wait for analysis to complete
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.depthReached >= depth && this.currentEvaluation !== null && this.currentBestMove) {
          clearInterval(checkInterval);
          this.sendCommand('stop');
          this.onEvaluationCallback = null;
          
          resolve({
            evaluation: this.currentEvaluation,
            bestMove: this.currentBestMove,
            depth: this.depthReached
          });
        }
      }, 100);
    });
  }

  // Calculate centipawn loss for a move
  public async calculateCentipawnLoss(
    positionBeforeMove: string,
    positionAfterMove: string,
    actualMove: string,
    depth: number = 18
  ): Promise<number> {
    // Analyze the position before the move to find the best move
    const beforeAnalysis = await this.analyzePosition(positionBeforeMove, depth);
    
    // If the best move is the same as the actual move, there's no loss
    if (beforeAnalysis.bestMove === actualMove) {
      return 0;
    }
    
    // Analyze what would have happened with the best move
    const bestMoveFen = ''; // Need to calculate this using chess.js
    const bestMoveAnalysis = await this.analyzePosition(bestMoveFen, depth);
    
    // Analyze the position after the actual move
    const afterAnalysis = await this.analyzePosition(positionAfterMove, depth);
    
    // Calculate the centipawn loss
    const bestEval = beforeAnalysis.evaluation;
    const actualEval = afterAnalysis.evaluation;
    
    // The loss depends on which side is to move
    const isWhiteToMove = positionBeforeMove.includes(' w ');
    let centipawnLoss = 0;
    
    if (isWhiteToMove) {
      centipawnLoss = Math.max(0, Math.round((bestEval - actualEval) * 100));
    } else {
      centipawnLoss = Math.max(0, Math.round((actualEval - bestEval) * 100));
    }
    
    return centipawnLoss;
  }

  // Categorize a move based on centipawn loss
  public categorizeMoveQuality(centipawnLoss: number): {
    isBlunder: boolean;
    isMistake: boolean;
    isInaccuracy: boolean;
  } {
    return {
      isBlunder: centipawnLoss >= 100, // Loss of a pawn or more
      isMistake: centipawnLoss >= 50 && centipawnLoss < 100, // Significant but less than a pawn
      isInaccuracy: centipawnLoss >= 20 && centipawnLoss < 50, // Small but noticeable error
    };
  }

  // Clean up when the component is unmounted
  public destroy() {
    if (this.engine) {
      this.engine.terminate();
      this.engine = null;
    }
  }
}