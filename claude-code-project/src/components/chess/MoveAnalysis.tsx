'use client';

import { MoveEvaluation } from '@/types';

interface MoveAnalysisProps {
  move: MoveEvaluation | null;
  nextMove?: MoveEvaluation | null;
  playerColor?: 'white' | 'black';
}

export default function MoveAnalysis({
  move,
  nextMove,
  playerColor = 'white'
}: MoveAnalysisProps) {
  if (!move) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold mb-2">Move Analysis</h3>
        <p className="text-gray-500">Select a move to see analysis</p>
      </div>
    );
  }

  // Helper function to format evaluation
  const formatEvaluation = (evaluation: number) => {
    if (evaluation === 0) return '0.00';
    
    const absEval = Math.abs(evaluation);
    const formattedEval = absEval.toFixed(2);
    
    return evaluation > 0 
      ? `+${formattedEval}` 
      : `-${formattedEval}`;
  };

  // Get quality label for the move
  const getMoveQualityLabel = () => {
    if (move.isBlunder) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Blunder
        </span>
      );
    } else if (move.isMistake) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Mistake
        </span>
      );
    } else if (move.isInaccuracy) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Inaccuracy
        </span>
      );
    } else if (move.centipawnLoss <= 5) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Best Move
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Good Move
        </span>
      );
    }
  };

  // Get a description of the move quality
  const getMoveDescription = () => {
    if (move.isBlunder) {
      return (
        <p className="text-red-700">
          This move loses significant advantage. The engine suggests {move.bestMove} instead, 
          which would maintain a more favorable position.
        </p>
      );
    } else if (move.isMistake) {
      return (
        <p className="text-yellow-700">
          This move misses a better opportunity. The engine recommends {move.bestMove} as a stronger alternative.
        </p>
      );
    } else if (move.isInaccuracy) {
      return (
        <p className="text-blue-700">
          A slightly imprecise move. {move.bestMove} would have been more precise.
        </p>
      );
    } else if (move.centipawnLoss <= 5) {
      return (
        <p className="text-green-700">
          An excellent move that matches the engine's top choice.
        </p>
      );
    } else {
      return (
        <p className="text-gray-700">
          A reasonable move. The engine slightly prefers {move.bestMove} but the difference is minor.
        </p>
      );
    }
  };

  // Calculate evaluation change if next move exists
  const getEvaluationChange = () => {
    if (!nextMove) return null;
    
    // For black's perspective, we invert the evaluation change
    const isPlayerMove = (move.moveNumber % 2 === 1 && playerColor === 'white') || 
                         (move.moveNumber % 2 === 0 && playerColor === 'black');
    
    // Calculate raw change
    let change = nextMove.evaluation - move.evaluation;
    
    // Adjust based on perspective
    if (playerColor === 'black') {
      change = -change;
    }
    
    // Format the change with appropriate sign
    const absChange = Math.abs(change);
    const formattedChange = absChange.toFixed(2);
    const changeText = change > 0 
      ? `+${formattedChange}` 
      : change < 0 
        ? `-${formattedChange}` 
        : '0.00';
    
    // Determine color based on if it's good for the player
    const changeColor = (change > 0 && isPlayerMove) || (change < 0 && !isPlayerMove)
      ? 'text-green-600'
      : change < 0 && isPlayerMove || (change > 0 && !isPlayerMove)
        ? 'text-red-600'
        : 'text-gray-600';
    
    return (
      <span className={changeColor}>
        {changeText}
      </span>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Move Analysis</h3>
        {getMoveQualityLabel()}
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-gray-700">Move</span>
          <span className="font-mono font-medium">{move.move}</span>
        </div>
        
        <div className="flex justify-between mb-2">
          <span className="text-gray-700">Position evaluation</span>
          <span className="font-mono">{formatEvaluation(move.evaluation)}</span>
        </div>
        
        {nextMove && (
          <div className="flex justify-between mb-2">
            <span className="text-gray-700">Evaluation change</span>
            <span className="font-mono">{getEvaluationChange()}</span>
          </div>
        )}
        
        <div className="flex justify-between mb-2">
          <span className="text-gray-700">Centipawn loss</span>
          <span className="font-mono">{move.centipawnLoss.toFixed(1)}</span>
        </div>
        
        <div className="flex justify-between mb-2">
          <span className="text-gray-700">Engine suggestion</span>
          <span className="font-mono">{move.bestMove || 'N/A'}</span>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        {getMoveDescription()}
      </div>
    </div>
  );
}