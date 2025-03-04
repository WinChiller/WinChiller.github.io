'use client';
import Image from 'next/image';
import { ChessPiece as ChessPieceType } from '@/types';

interface ChessPieceProps {
  piece: string;
  square: string;
}

export default function ChessPiece({ piece, square }: ChessPieceProps) {
  // Determine color of piece from square coordinate
  const color = 
    piece === piece.toLowerCase() ? 'b' : 'w';
  
  // Use the lowercase piece type
  const pieceType = piece.toLowerCase();
  
  // Get piece image
  const getPieceImage = (color: string, pieceType: string) => {
    return `/pieces/${color}${pieceType}.svg`;
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-4/5 h-4/5 relative">
        <Image
          src={getPieceImage(color, pieceType)}
          alt={`${color === 'w' ? 'White' : 'Black'} ${getPieceName(pieceType)}`}
          fill={true}
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}

// Helper function to get the full piece name
function getPieceName(pieceType: string): string {
  switch (pieceType) {
    case 'p': return 'Pawn';
    case 'r': return 'Rook';
    case 'n': return 'Knight';
    case 'b': return 'Bishop';
    case 'q': return 'Queen';
    case 'k': return 'King';
    default: return 'Unknown';
  }
}