'use client';

interface ChessSquareProps {
  square: string;
  children?: React.ReactNode;
  isSelected?: boolean;
  isLegalMove?: boolean;
  isHighlighted?: boolean;
  isLastMoveFrom?: boolean;
  isLastMoveTo?: boolean;
  onClick?: () => void;
}

export default function ChessSquare({
  square,
  children,
  isSelected = false,
  isLegalMove = false,
  isHighlighted = false,
  isLastMoveFrom = false,
  isLastMoveTo = false,
  onClick
}: ChessSquareProps) {
  // Determine if this is a light or dark square
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0); // 0-7
  const rank = parseInt(square[1]) - 1; // 0-7
  const isLight = (file + rank) % 2 === 0;
  
  // Base class
  let className = `chess-square ${isLight ? 'chess-square-light' : 'chess-square-dark'}`;
  
  // Apply highlight classes
  if (isSelected) {
    className += ' bg-blue-300 bg-opacity-70';
  } else if (isLegalMove) {
    className += ' cursor-pointer';
    if (children) {
      className += ' relative';
    } else {
      className += isLight 
        ? ' bg-blue-200 bg-opacity-50' 
        : ' bg-blue-400 bg-opacity-50';
    }
  } else if (isHighlighted) {
    className += ' bg-yellow-300 bg-opacity-60';
  } else if (isLastMoveFrom) {
    className += ' bg-green-200 bg-opacity-60';
  } else if (isLastMoveTo) {
    className += ' bg-green-400 bg-opacity-60';
  }
  
  if (onClick) {
    className += ' cursor-pointer';
  }
  
  // Helper function to render a dot for legal moves onto squares with pieces
  const renderLegalMoveIndicator = () => {
    if (isLegalMove && children) {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 bg-opacity-70 z-10"></div>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div 
      className={className}
      onClick={onClick}
      data-square={square}
    >
      {renderLegalMoveIndicator()}
      {children}
      <div className="absolute bottom-0.5 right-0.5 text-xs opacity-60 pointer-events-none">
        {square === 'a1' || square === 'h1' || square === 'a8' || square === 'h8' ? square : ''}
      </div>
    </div>
  );
}