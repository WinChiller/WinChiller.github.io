'use client';

import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import ChessSquare from './ChessSquare';
import ChessPiece from './ChessPiece';
import { ChessPosition } from '@/types';

interface ChessboardProps {
  fen?: string;
  position?: string;
  flip?: boolean;
  interactive?: boolean;
  onMove?: (move: { from: string; to: string; promotion?: string }) => void;
  highlightSquares?: string[];
  lastMove?: { from: string; to: string };
}

export default function Chessboard({
  fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Default starting position
  flip = false,
  interactive = false,
  onMove,
  highlightSquares = [],
  lastMove
}: ChessboardProps) {
  const [chess] = useState<Chess>(new Chess(fen));
  const [positions, setPositions] = useState<ChessPosition[]>([]);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);

  // Initialize board positions
  useEffect(() => {
    try {
      chess.load(fen);
      updateBoardPositions();
    } catch (error) {
      console.error('Invalid FEN:', error);
    }
  }, [fen, chess]);

  // Update the positions array based on the current chess state
  const updateBoardPositions = () => {
    const squares: ChessPosition[] = [];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

    for (const rank of ranks) {
      for (const file of files) {
        const square = `${file}${rank}`;
        const piece = chess.get(square);
        squares.push({
          square,
          piece: piece ? piece.type : null
        });
      }
    }

    setPositions(squares);
  };

  // Handle square click for interactive board
  const handleSquareClick = (square: string) => {
    if (!interactive) return;

    if (selectedSquare) {
      // Attempt to move
      if (legalMoves.includes(square)) {
        try {
          // Check if this is a pawn promotion
          let promotionPiece = undefined;
          const moveInfo = {
            from: selectedSquare,
            to: square,
            promotion: promotionPiece
          };

          const move = chess.move(moveInfo);
          
          if (move) {
            updateBoardPositions();
            if (onMove) onMove(moveInfo);
          }
        } catch (error) {
          console.error('Invalid move:', error);
        }
      }
      
      // Clear selection regardless of move validity
      setSelectedSquare(null);
      setLegalMoves([]);
    } else {
      // Select the square and show legal moves
      const piece = chess.get(square);
      if (piece) {
        setSelectedSquare(square);
        
        // Find legal moves from this square
        const moves = chess.moves({ square, verbose: true });
        setLegalMoves(moves.map(move => move.to));
      }
    }
  };

  // Generate the chess board squares
  const renderBoard = () => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    
    // If flipped, reverse the arrays
    const displayFiles = flip ? [...files].reverse() : files;
    const displayRanks = flip ? [...ranks].reverse() : ranks;
    
    const squares = [];
    
    for (const rank of displayRanks) {
      for (const file of displayFiles) {
        const square = `${file}${rank}`;
        const position = positions.find(pos => pos.square === square);
        const piece = position?.piece;
        
        const isSelected = square === selectedSquare;
        const isLegalMove = legalMoves.includes(square);
        const isHighlighted = highlightSquares.includes(square);
        const isLastMoveFrom = lastMove && lastMove.from === square;
        const isLastMoveTo = lastMove && lastMove.to === square;
        
        squares.push(
          <ChessSquare 
            key={square} 
            square={square}
            isSelected={isSelected}
            isLegalMove={isLegalMove}
            isHighlighted={isHighlighted}
            isLastMoveFrom={isLastMoveFrom}
            isLastMoveTo={isLastMoveTo}
            onClick={() => handleSquareClick(square)}
          >
            {piece && <ChessPiece piece={piece} square={square} />}
          </ChessSquare>
        );
      }
    }
    
    return squares;
  };

  return (
    <div className="chess-board">
      {renderBoard()}
    </div>
  );
}