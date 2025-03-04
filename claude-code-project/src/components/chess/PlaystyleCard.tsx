'use client';

import { PlaystyleType } from '@/types';

interface PlaystyleCardProps {
  type: PlaystyleType;
  isActive?: boolean;
  onClick?: () => void;
}

export default function PlaystyleCard({ 
  type, 
  isActive = false,
  onClick
}: PlaystyleCardProps) {
  // Helper function to get playstyle name for display
  const getPlaystyleName = (style: PlaystyleType): string => {
    switch (style) {
      case 'tacticalAttacker': return 'Tactical Attacker';
      case 'positionalPlayer': return 'Positional Player';
      case 'endgameSpecialist': return 'Endgame Specialist';
      case 'blitzSpeedster': return 'Blitz Speedster';
      case 'defensivePlayer': return 'Defensive Player';
      case 'unstablePlayer': return 'Unstable Player';
      default: return style;
    }
  };

  // Helper function to get playstyle description
  const getShortDescription = (style: PlaystyleType): string => {
    switch (style) {
      case 'tacticalAttacker':
        return 'High aggression and tactical play with higher-risk moves.';
      case 'positionalPlayer':
        return 'Strategic play with long-term planning and solid positions.';
      case 'endgameSpecialist':
        return 'Strong technical skills when converting advantages in endgames.';
      case 'blitzSpeedster':
        return 'Fast, intuitive decisions with diverse opening repertoire.';
      case 'defensivePlayer':
        return 'Solid defensive play with strong counterattacking skills.';
      case 'unstablePlayer':
        return 'Variable play quality with both brilliant ideas and errors.';
      default:
        return 'Balanced play with no particular stylistic tendency.';
    }
  };

  // Helper function to get style attributes
  const getStyleAttributes = (style: PlaystyleType): {
    bgColor: string;
    textColor: string;
    borderColor: string;
    icon: string;
    strengths: string;
    weaknesses: string;
  } => {
    switch (style) {
      case 'tacticalAttacker':
        return {
          bgColor: 'bg-red-50',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          icon: '⚔️',
          strengths: 'Calculation, Sharp attacks',
          weaknesses: 'Higher blunder rate'
        };
      case 'positionalPlayer':
        return {
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200',
          icon: '♟️',
          strengths: 'Steady play, Piece coordination',
          weaknesses: 'Can miss tactics'
        };
      case 'endgameSpecialist':
        return {
          bgColor: 'bg-green-50',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          icon: '👑',
          strengths: 'Technical precision, Patience',
          weaknesses: 'Middlegame complications'
        };
      case 'blitzSpeedster':
        return {
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200',
          icon: '⚡',
          strengths: 'Quick intuition, Time pressure',
          weaknesses: 'Error-prone in complexity'
        };
      case 'defensivePlayer':
        return {
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-800',
          borderColor: 'border-purple-200',
          icon: '🛡️',
          strengths: 'Solid defense, Counterattacks',
          weaknesses: 'Can be too passive'
        };
      case 'unstablePlayer':
        return {
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-800',
          borderColor: 'border-orange-200',
          icon: '🎭',
          strengths: 'Creative ideas, Unpredictable',
          weaknesses: 'Inconsistent results'
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
          icon: '♛',
          strengths: 'Balanced approach',
          weaknesses: 'No specialization'
        };
    }
  };

  const style = getStyleAttributes(type);
  const activeClasses = isActive 
    ? `${style.borderColor} border-2 transform -translate-y-1 shadow-lg` 
    : 'border-gray-100 hover:shadow-md hover:-translate-y-1';

  return (
    <div 
      className={`rounded-lg p-5 ${style.bgColor} border ${activeClasses} transition-all duration-200 cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex items-start">
        <div className="text-2xl mr-3">{style.icon}</div>
        <div>
          <h3 className={`text-lg font-semibold mb-1 ${style.textColor}`}>
            {getPlaystyleName(type)}
          </h3>
          <p className="text-sm text-gray-700 mb-3">
            {getShortDescription(type)}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-green-600 font-medium">Strengths:</span>
              <div className="text-gray-600">{style.strengths}</div>
            </div>
            <div>
              <span className="text-red-600 font-medium">Weaknesses:</span>
              <div className="text-gray-600">{style.weaknesses}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}