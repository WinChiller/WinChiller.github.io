'use client';

import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import Chessboard from './Chessboard';
import MoveList from './MoveList';
import EvaluationChart from './EvaluationChart';
import MoveAnalysis from './MoveAnalysis';
import { GameAnalysis } from '@/types';

interface GameAnalysisViewProps {
  analysis: GameAnalysis;
}

export default function GameAnalysisView({ analysis }: GameAnalysisViewProps) {
  const [chess] = useState<Chess>(new Chess());
  const [currentMove, setCurrentMove] = useState<number>(-1);
  const [positions, setPositions] = useState<string[]>(['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1']);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  
  // Initialize with game moves
  useEffect(() => {
    if (!analysis || !analysis.moveEvaluations || analysis.moveEvaluations.length === 0) {
      return;
    }
    
    // Reset chess and build position history
    chess.reset();
    const positionHistory = [chess.fen()];
    
    try {
      // Replay all moves to generate FEN positions and collect move info
      analysis.moveEvaluations.forEach((moveEval, index) => {
        // In a real implementation, you would need the actual moves
        // For now, we're assuming moveEval.move contains the move in SAN format
        if (moveEval.move) {
          const move = chess.move(moveEval.move);
          if (move) {
            positionHistory.push(chess.fen());
          }
        }
      });
      
      setPositions(positionHistory);
    } catch (error) {
      console.error('Error replaying game:', error);
    }
  }, [analysis, chess]);
  
  // Handler for move selection
  const handleSelectMove = (moveIndex: number) => {
    setCurrentMove(moveIndex);
    
    // When a move is selected, determine the lastMove for highlighting
    if (moveIndex >= 0 && moveIndex < analysis.moveEvaluations.length) {
      chess.reset();
      
      // Replay the game up to the selected move
      for (let i = 0; i <= moveIndex; i++) {
        const moveEval = analysis.moveEvaluations[i];
        if (moveEval.move) {
          const move = chess.move(moveEval.move);
          
          // Set the lastMove for highlighting if this is the current move
          if (move && i === moveIndex) {
            setLastMove({
              from: move.from,
              to: move.to
            });
          }
        }
      }
    } else {
      setLastMove(null);
    }
  };

  // Handler for navigation buttons
  const handleNavigation = (direction: 'first' | 'prev' | 'next' | 'last') => {
    switch (direction) {
      case 'first':
        handleSelectMove(-1); // Initial position before any moves
        break;
      case 'prev':
        if (currentMove > -1) {
          handleSelectMove(currentMove - 1);
        }
        break;
      case 'next':
        if (currentMove < analysis.moveEvaluations.length - 1) {
          handleSelectMove(currentMove + 1);
        }
        break;
      case 'last':
        handleSelectMove(analysis.moveEvaluations.length - 1);
        break;
    }
  };

  // Get current position FEN
  const getCurrentPosition = () => {
    const positionIndex = currentMove + 1; // +1 because positions includes initial position
    return positions[positionIndex] || positions[0];
  };

  // Get the current and next move for analysis
  const getCurrentMove = () => {
    if (currentMove < 0 || currentMove >= analysis.moveEvaluations.length) {
      return null;
    }
    return analysis.moveEvaluations[currentMove];
  };

  const getNextMove = () => {
    if (currentMove < 0 || currentMove >= analysis.moveEvaluations.length - 1) {
      return null;
    }
    return analysis.moveEvaluations[currentMove + 1];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-2xl font-bold mb-6">Game Analysis: {analysis.player} vs {analysis.opponent}</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Chessboard and navigation */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <Chessboard 
              fen={getCurrentPosition()}
              flip={analysis.playerColor === 'black'}
              lastMove={lastMove}
            />
            
            {/* Move navigation */}
            <div className="flex justify-between mt-4">
              <button 
                onClick={() => handleNavigation('first')}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md"
                disabled={currentMove === -1}
              >
                &laquo; Start
              </button>
              
              <button 
                onClick={() => handleNavigation('prev')}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md"
                disabled={currentMove === -1}
              >
                &lt; Prev
              </button>
              
              <button 
                onClick={() => handleNavigation('next')}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md"
                disabled={currentMove === analysis.moveEvaluations.length - 1}
              >
                Next &gt;
              </button>
              
              <button 
                onClick={() => handleNavigation('last')}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md"
                disabled={currentMove === analysis.moveEvaluations.length - 1}
              >
                End &raquo;
              </button>
            </div>
          </div>
          
          {/* Evaluation chart */}
          <div className="mt-6">
            <EvaluationChart 
              moves={analysis.moveEvaluations}
              currentMove={currentMove}
              onSelectMove={handleSelectMove}
              playerColor={analysis.playerColor}
            />
          </div>
        </div>
        
        {/* Right column - Move list and analysis */}
        <div>
          <MoveList 
            moves={analysis.moveEvaluations}
            currentMove={currentMove}
            onSelectMove={handleSelectMove}
          />
          
          <div className="mt-6">
            <MoveAnalysis 
              move={getCurrentMove()}
              nextMove={getNextMove()}
              playerColor={analysis.playerColor}
            />
          </div>
          
          {/* Game statistics summary */}
          <div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold mb-4">Game Statistics</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Blunders</div>
                <div className="text-2xl font-bold text-red-600">{analysis.blunderCount}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600">Mistakes</div>
                <div className="text-2xl font-bold text-yellow-600">{analysis.mistakeCount}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600">Inaccuracies</div>
                <div className="text-2xl font-bold text-blue-600">{analysis.inaccuracyCount}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600">Avg. Centipawn Loss</div>
                <div className="text-2xl font-bold text-gray-800">{analysis.averageCentipawnLoss.toFixed(1)}</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600 mb-1">Consistency Rating</div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${getConsistencyColorClass(analysis.consistencyRating)}`}
                  style={{ width: `${analysis.consistencyRating}%` }}
                ></div>
              </div>
              <div className="text-right text-gray-600 mt-1">{analysis.consistencyRating}%</div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600 mb-2">Opening</div>
              <div className="font-medium">{analysis.opening || 'Unknown Opening'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get color class for consistency rating
function getConsistencyColorClass(rating: number): string {
  if (rating >= 90) return 'bg-green-600';
  if (rating >= 80) return 'bg-green-500';
  if (rating >= 70) return 'bg-green-400';
  if (rating >= 60) return 'bg-yellow-500';
  if (rating >= 50) return 'bg-yellow-600';
  if (rating >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}