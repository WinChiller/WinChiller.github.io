// Chess game and analysis types

export type ChessPiece = 'p' | 'n' | 'b' | 'r' | 'q' | 'k' | 'P' | 'N' | 'B' | 'R' | 'Q' | 'K';

export interface ChessPosition {
  square: string;
  piece: ChessPiece | null;
}

export interface ChessMove {
  from: string;
  to: string;
  promotion?: string;
  san: string;
  piece: ChessPiece;
  captured?: ChessPiece;
  fen: string;
}

export interface MoveEvaluation {
  moveNumber: number;
  fen: string;
  move: string;
  evaluation: number;
  depth: number;
  bestMove?: string;
  isMistake: boolean;
  isBlunder: boolean;
  isInaccuracy: boolean;
  centipawnLoss: number;
}

export interface GameAnalysis {
  gameId: string;
  player: string;
  playerColor: 'white' | 'black';
  opponent: string;
  date: string;
  result: '1-0' | '0-1' | '1/2-1/2' | '*';
  opening?: string;
  timeControl?: string;
  moveEvaluations: MoveEvaluation[];
  blunderCount: number;
  mistakeCount: number;
  inaccuracyCount: number;
  averageCentipawnLoss: number;
  winningChances: number[];
  consistencyRating: number;
  criticalMistakes: MoveEvaluation[];
  turningPoints: MoveEvaluation[];
}

// Playstyle types
export type PlaystyleType = 
  | 'tacticalAttacker' 
  | 'positionalPlayer' 
  | 'endgameSpecialist' 
  | 'blitzSpeedster' 
  | 'defensivePlayer' 
  | 'unstablePlayer';

export interface PlaystyleProfile {
  primaryStyle: PlaystyleType;
  secondaryStyle?: PlaystyleType;
  tacticsvPositional: number; // 0-100 scale, higher means more tactical
  aggressionScore: number; // 0-100 scale
  defensiveStrength: number; // 0-100 scale
  openingStability: number; // 0-100 scale
  blunderRate: number; // percentage
  accuracyVariance: number; // standard deviation
  similarGrandmaster?: string;
}

export interface OpeningPerformance {
  name: string;
  eco?: string;
  gamesPlayed: number;
  winRate: number;
  drawRate: number;
  lossRate: number;
  averageEvaluation: number;
}

export interface MatchupAnalysis {
  againstStyle: PlaystyleType;
  gamesPlayed: number;
  winRate: number;
  drawRate: number;
  lossRate: number;
  averageCentipawnLoss: number;
  recommendedCounterStrategy: string;
}

// User profile and dashboard types
export interface UserProfile {
  userId: string;
  username: string;
  rating?: number;
  platform?: 'chess.com' | 'lichess' | 'other';
  playstyleProfile: PlaystyleProfile;
  gameHistory: GameAnalysis[];
  openingPerformance: OpeningPerformance[];
  matchupAnalysis: MatchupAnalysis[];
  trainingRecommendations: string[];
}