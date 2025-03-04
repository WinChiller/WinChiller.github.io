'use client';

import { MoveEvaluation } from '@/types';

interface MoveListProps {
  moves: MoveEvaluation[];
  currentMove?: number;
  onSelectMove?: (index: number) => void;
}

export default function MoveList({ 
  moves,
  currentMove,
  onSelectMove
}: MoveListProps) {
  // Group moves by move number (1. e4 e5, 2. Nf3 Nc6, etc.)
  const groupedMoves: { 
    moveNumber: number; 
    white?: MoveEvaluation; 
    black?: MoveEvaluation;
  }[] = [];

  moves.forEach((move, index) => {
    const moveNumber = move.moveNumber;
    const isWhiteMove = index % 2 === 0;
    
    if (isWhiteMove) {
      groupedMoves.push({
        moveNumber,
        white: move
      });
    } else {
      // Find the last group and add the black move
      const lastGroup = groupedMoves[groupedMoves.length - 1];
      if (lastGroup) {
        lastGroup.black = move;
      }
    }
  });

  // Helper function to render quality indicator
  const renderQualityIndicator = (move: MoveEvaluation) => {
    if (move.isBlunder) {
      return <span className="inline-block w-3 h-3 rounded-full bg-red-500 ml-1" title="Blunder"></span>;
    } else if (move.isMistake) {
      return <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 ml-1" title="Mistake"></span>;
    } else if (move.isInaccuracy) {
      return <span className="inline-block w-3 h-3 rounded-full bg-blue-300 ml-1" title="Inaccuracy"></span>;
    }
    return null;
  };

  // Helper function to format evaluation in pawns
  const formatEvaluation = (evaluation: number) => {
    if (evaluation === 0) return '0.00';
    
    const absEval = Math.abs(evaluation);
    const formattedEval = absEval.toFixed(2);
    
    return evaluation > 0 
      ? `+${formattedEval}` 
      : `-${formattedEval}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="p-3 bg-gray-50 border-b border-gray-200 font-semibold">
        Move List
      </div>
      
      <div className="p-2 max-h-96 overflow-y-auto">
        {groupedMoves.length === 0 ? (
          <div className="text-gray-500 text-center py-4">No moves to display</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-600">
                <th className="p-2 w-12">#</th>
                <th className="p-2">White</th>
                <th className="p-2 text-right w-16">Eval</th>
                <th className="p-2">Black</th>
                <th className="p-2 text-right w-16">Eval</th>
              </tr>
            </thead>
            <tbody>
              {groupedMoves.map((group, index) => (
                <tr key={index} className="hover:bg-blue-50">
                  <td className="p-2 text-gray-500">{group.moveNumber}.</td>
                  
                  {/* White's move */}
                  <td 
                    className={`p-2 font-mono ${currentMove === index * 2 ? 'bg-blue-100 font-bold' : ''}`}
                    onClick={() => onSelectMove && group.white && onSelectMove(index * 2)}
                  >
                    {group.white ? (
                      <span className="inline-flex items-center">
                        <span>{group.white.move}</span>
                        {renderQualityIndicator(group.white)}
                      </span>
                    ) : null}
                  </td>
                  
                  <td className="p-2 text-right font-mono text-gray-600">
                    {group.white ? formatEvaluation(group.white.evaluation) : null}
                  </td>
                  
                  {/* Black's move */}
                  <td 
                    className={`p-2 font-mono ${currentMove === index * 2 + 1 ? 'bg-blue-100 font-bold' : ''}`}
                    onClick={() => onSelectMove && group.black && onSelectMove(index * 2 + 1)}
                  >
                    {group.black ? (
                      <span className="inline-flex items-center">
                        <span>{group.black.move}</span>
                        {renderQualityIndicator(group.black)}
                      </span>
                    ) : null}
                  </td>
                  
                  <td className="p-2 text-right font-mono text-gray-600">
                    {group.black ? formatEvaluation(group.black.evaluation) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}