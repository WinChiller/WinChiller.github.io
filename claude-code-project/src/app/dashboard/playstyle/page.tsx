'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlaystyleProfile, PlaystyleType } from '@/types';

export default function PlaystylePage() {
  const [playstyle, setPlaystyle] = useState<PlaystyleProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockPlaystyle: PlaystyleProfile = {
        primaryStyle: 'tacticalAttacker',
        secondaryStyle: 'defensivePlayer',
        tacticsvPositional: 68,
        aggressionScore: 72,
        defensiveStrength: 61,
        openingStability: 45,
        blunderRate: 8.5,
        accuracyVariance: 12.3,
        similarGrandmaster: 'Mikhail Tal'
      };

      setPlaystyle(mockPlaystyle);
      setLoading(false);
    }, 1000);
  }, []);

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
  const getPlaystyleDescription = (style: PlaystyleType): string => {
    switch (style) {
      case 'tacticalAttacker':
        return 'You excel at spotting tactical opportunities and prefer active, attacking chess. You often create complications and aren\'t afraid to sacrifice material for initiative. While your aggressive style leads to brilliant wins, it can also result in higher blunder rates when calculations don\'t work out.';
      case 'positionalPlayer':
        return 'You prefer strategic maneuvers and long-term planning over immediate tactical strikes. Your play is characterized by careful piece placement, pawn structure management, and gradual accumulation of small advantages. You tend to have a lower blunder rate but may miss tactical opportunities.';
      case 'endgameSpecialist':
        return 'You demonstrate exceptional skill in converting small advantages in endgames. Your technical precision shines when pieces come off the board, and you have a good sense of which positions to simplify into. You excel at king and pawn endgames and understand opposition concepts well.';
      case 'blitzSpeedster':
        return 'You play quickly and intuitively, often relying on pattern recognition rather than deep calculation. Your style features high opening diversity and rapid development. While your speed can pressure opponents into mistakes, it also leads to occasional oversights in complex positions.';
      case 'defensivePlayer':
        return 'You excel at creating solid positions and defending against attacks. Patient and resilient, you prefer counterattacking after your opponent overextends. Your games often feature strong defensive structures, well-timed counters, and effective piece coordination in tight positions.';
      case 'unstablePlayer':
        return 'Your play shows significant inconsistency with high variance in move quality. You can produce brilliant ideas, but also make unexpected errors. Your games tend to have sharp swings in evaluation with an uneven balance between tactical and positional elements.';
      default:
        return 'Your playing style is balanced with no strong tendencies toward any particular approach.';
    }
  };

  // Helper function to get playstyle color classes
  const getPlaystyleColors = (style: PlaystyleType): { bg: string; border: string; text: string } => {
    switch (style) {
      case 'tacticalAttacker':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' };
      case 'positionalPlayer':
        return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' };
      case 'endgameSpecialist':
        return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' };
      case 'blitzSpeedster':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' };
      case 'defensivePlayer':
        return { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800' };
      case 'unstablePlayer':
        return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800' };
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800' };
    }
  };

  // Helper function to get grandmaster description
  const getGrandmasterDescription = (gm: string): string => {
    switch (gm) {
      case 'Garry Kasparov':
        return 'Like Kasparov, you prefer dynamic, attacking chess with a focus on piece activity and initiative. You're willing to take calculated risks for the advantage.';
      case 'Anatoly Karpov':
        return 'Similar to Karpov, you excel at subtle positional play, gradually accumulating small advantages, and have a minimalist approach to piece placement.';
      case 'Magnus Carlsen':
        return 'Like Carlsen, you demonstrate exceptional endgame technique and a practical approach, often willing to play seemingly equal positions that offer long-term winning chances.';
      case 'Hikaru Nakamura':
        return 'Similar to Nakamura, you thrive in complex tactical positions, especially in faster time controls, with strong pattern recognition and intuitive play.';
      case 'Tigran Petrosian':
        return 'Like Petrosian, you prioritize safety and security, with excellent prophylactic thinking and defensive resources. You rarely overextend and excel at neutralizing opponent initiatives.';
      case 'Mikhail Tal':
        return 'Similar to Tal, you display a creative attacking style with bold sacrifices and tactical complications. Your game is characterized by dynamic, unbalanced positions that can confuse opponents.';
      case 'Vladimir Kramnik':
        return 'Like Kramnik, you demonstrate strong strategic depth with a solid, technical approach. You excel at neutralizing opponent counterplay while building positional advantages.';
      case 'Jose Raul Capablanca':
        return 'Similar to Capablanca, you show technical precision, especially in endgames, with a simple, elegant approach to position evaluation and piece coordination.';
      case 'Alexander Alekhine':
        return 'Like Alekhine, you demonstrate imaginative attacking chess with complex tactical patterns. Your play is characterized by active piece play and dynamic imbalances.';
      default:
        return 'Your play shows similarities to multiple grandmaster styles, with a balanced approach to chess.';
    }
  };

  // Helper function to get strength and weakness descriptions
  const getStrengthsAndWeaknesses = (style: PlaystyleType): { strengths: string[]; weaknesses: string[] } => {
    switch (style) {
      case 'tacticalAttacker':
        return {
          strengths: [
            'Excellent calculation abilities',
            'Strong intuition for attacks',
            'Comfortable in complex positions',
            'Creates practical problems for opponents'
          ],
          weaknesses: [
            'Higher blunder rate in complicated positions',
            'May overextend attacking resources',
            'Can struggle in quiet positional games',
            'Sometimes overlooks defensive needs'
          ]
        };
      case 'positionalPlayer':
        return {
          strengths: [
            'Strong strategic understanding',
            'Excellent piece coordination',
            'Low blunder rate',
            'Patient long-term planning'
          ],
          weaknesses: [
            'May miss tactical opportunities',
            'Sometimes overly cautious',
            'Can struggle in very sharp positions',
            'May allow opponent too much counterplay'
          ]
        };
      case 'endgameSpecialist':
        return {
          strengths: [
            'Exceptional technical precision',
            'Good understanding of piece coordination',
            'Patient conversion of small advantages',
            'Strong king activity'
          ],
          weaknesses: [
            'May simplify prematurely',
            'Can struggle in complex middlegames',
            'Sometimes lacks aggression when needed',
            'May rely too much on technical skill'
          ]
        };
      case 'blitzSpeedster':
        return {
          strengths: [
            'Quick pattern recognition',
            'Good intuitive play',
            'Wide opening repertoire',
            'Creates time pressure for opponents'
          ],
          weaknesses: [
            'Higher error rate in complex positions',
            'May lack depth in calculations',
            'Sometimes plays too quickly in critical positions',
            'Inconsistent move quality'
          ]
        };
      case 'defensivePlayer':
        return {
          strengths: [
            'Excellent defensive resources',
            'Patient counterattacking',
            'Good prophylactic thinking',
            'Rarely overextends'
          ],
          weaknesses: [
            'Can be too passive',
            'May miss attacking opportunities',
            'Sometimes gives opponent too much space',
            'Can struggle to generate winning chances'
          ]
        };
      case 'unstablePlayer':
        return {
          strengths: [
            'Capable of brilliant ideas',
            'Unpredictable for opponents',
            'Some games show exceptional play',
            'Creative approach to positions'
          ],
          weaknesses: [
            'High variance in move quality',
            'Inconsistent results',
            'Difficulty maintaining focus',
            'Uneven tactical awareness'
          ]
        };
      default:
        return {
          strengths: ['Balanced approach to chess', 'No major weaknesses', 'Adaptable to different positions'],
          weaknesses: ['No particular strengths stand out', 'May lack specialization']
        };
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Chess Personality</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing your playstyle...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!playstyle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Chess Personality</h1>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg">
          <h2 className="font-bold text-lg mb-2">No Data Available</h2>
          <p>We need more games to analyze your playstyle. Please analyze some games first.</p>
          <Link href="/analysis">
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Analyze Games
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const primaryColors = getPlaystyleColors(playstyle.primaryStyle);
  const secondaryColors = playstyle.secondaryStyle 
    ? getPlaystyleColors(playstyle.secondaryStyle) 
    : { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800' };
  
  const { strengths, weaknesses } = getStrengthsAndWeaknesses(playstyle.primaryStyle);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/dashboard">
          <button className="flex items-center text-blue-600 hover:text-blue-800">
            <span className="mr-1">←</span> Back to Dashboard
          </button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Your Chess Personality</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Primary Playstyle Card */}
        <div className={`rounded-lg shadow-sm p-8 ${primaryColors.bg} ${primaryColors.border}`}>
          <h2 className={`text-2xl font-bold mb-3 ${primaryColors.text}`}>
            {getPlaystyleName(playstyle.primaryStyle)}
          </h2>
          <div className="text-lg font-semibold mb-2">Primary Style</div>
          <p className="text-gray-700 mb-6">
            {getPlaystyleDescription(playstyle.primaryStyle)}
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium mb-1">Tactics vs. Positional</div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 rounded-full bg-red-600" 
                  style={{ width: `${playstyle.tacticsvPositional}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-600">
                <span>Positional</span>
                <span>Tactical</span>
              </div>
            </div>
            <div>
              <div className="font-medium mb-1">Aggression Score</div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 rounded-full bg-orange-600" 
                  style={{ width: `${playstyle.aggressionScore}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-600">
                <span>Defensive</span>
                <span>Aggressive</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Secondary Style Card */}
        {playstyle.secondaryStyle && (
          <div className={`rounded-lg shadow-sm p-8 ${secondaryColors.bg} ${secondaryColors.border}`}>
            <h2 className={`text-2xl font-bold mb-3 ${secondaryColors.text}`}>
              {getPlaystyleName(playstyle.secondaryStyle)}
            </h2>
            <div className="text-lg font-semibold mb-2">Secondary Influence</div>
            <p className="text-gray-700 mb-6">
              {getPlaystyleDescription(playstyle.secondaryStyle)}
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium mb-1">Defensive Strength</div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 rounded-full bg-blue-600" 
                    style={{ width: `${playstyle.defensiveStrength}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-600">
                  <span>Weak</span>
                  <span>Strong</span>
                </div>
              </div>
              <div>
                <div className="font-medium mb-1">Opening Stability</div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 rounded-full bg-green-600" 
                    style={{ width: `${playstyle.openingStability}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-600">
                  <span>Varied</span>
                  <span>Stable</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Grandmaster Comparison */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg shadow-sm p-8 border border-amber-200">
          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-amber-200 flex items-center justify-center mb-4">
            <span className="text-3xl">👑</span>
          </div>
          <h2 className="text-xl font-bold text-amber-800 text-center mb-2">
            Similar to {playstyle.similarGrandmaster}
          </h2>
          <p className="text-gray-700 text-center mb-6">
            {getGrandmasterDescription(playstyle.similarGrandmaster || '')}
          </p>
          <div className="text-center">
            <Link href="/library/grandmasters">
              <button className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700">
                Learn More About {playstyle.similarGrandmaster}
              </button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-green-700 mb-4">Your Strengths</h2>
          <ul className="space-y-3">
            {strengths.map((strength, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2 text-green-500">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-red-700 mb-4">Areas for Improvement</h2>
          <ul className="space-y-3">
            {weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2 text-red-500">•</span>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Metrics Detail */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-12">
        <h2 className="text-xl font-bold mb-6">Detailed Metrics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">Tactical vs. Positional Balance</span>
              <span className="font-medium">{playstyle.tacticsvPositional}/100</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full mb-1">
              <div 
                className="h-2 rounded-full bg-blue-600" 
                style={{ width: `${playstyle.tacticsvPositional}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              Higher values indicate a preference for tactical play over positional understanding.
            </p>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">Aggression Score</span>
              <span className="font-medium">{playstyle.aggressionScore}/100</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full mb-1">
              <div 
                className="h-2 rounded-full bg-red-600" 
                style={{ width: `${playstyle.aggressionScore}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              Measures your attacking tendencies based on piece activity and pawn advances.
            </p>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">Defensive Strength</span>
              <span className="font-medium">{playstyle.defensiveStrength}/100</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full mb-1">
              <div 
                className="h-2 rounded-full bg-green-600" 
                style={{ width: `${playstyle.defensiveStrength}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              Reflects your ability to defend against attacks and recover from worse positions.
            </p>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">Opening Stability</span>
              <span className="font-medium">{playstyle.openingStability}/100</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full mb-1">
              <div 
                className="h-2 rounded-full bg-yellow-600" 
                style={{ width: `${playstyle.openingStability}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              Shows how consistently you play the same openings versus diversifying your repertoire.
            </p>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">Blunder Rate</span>
              <span className="font-medium">{playstyle.blunderRate}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full mb-1">
              <div 
                className="h-2 rounded-full bg-purple-600" 
                style={{ width: `${playstyle.blunderRate * 5}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              Percentage of moves classified as blunders (100+ centipawn loss).
            </p>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">Accuracy Variance</span>
              <span className="font-medium">{playstyle.accuracyVariance}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full mb-1">
              <div 
                className="h-2 rounded-full bg-orange-600" 
                style={{ width: `${playstyle.accuracyVariance * 4}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              Standard deviation in move accuracy, indicating consistency of play.
            </p>
          </div>
        </div>
      </div>
      
      {/* Training Recommendations */}
      <div className="bg-green-50 rounded-lg shadow-sm p-6 border border-green-200">
        <h2 className="text-xl font-bold text-green-800 mb-6">Personalized Training Plan</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <h3 className="text-lg font-semibold mb-3">Tactical Training</h3>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start text-sm">
                <span className="mr-2 text-green-600">•</span>
                <span>Study knight forks and discovered attacks</span>
              </li>
              <li className="flex items-start text-sm">
                <span className="mr-2 text-green-600">•</span>
                <span>Practice calculation with complex positions</span>
              </li>
              <li className="flex items-start text-sm">
                <span className="mr-2 text-green-600">•</span>
                <span>Focus on tactical motifs in the Sicilian</span>
              </li>
            </ul>
            <Link href="/training/tactics">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Start Training
              </button>
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <h3 className="text-lg font-semibold mb-3">Strategic Improvement</h3>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start text-sm">
                <span className="mr-2 text-green-600">•</span>
                <span>Study pawn structure fundamentals</span>
              </li>
              <li className="flex items-start text-sm">
                <span className="mr-2 text-green-600">•</span>
                <span>Practice positional evaluation</span>
              </li>
              <li className="flex items-start text-sm">
                <span className="mr-2 text-green-600">•</span>
                <span>Learn key defensive techniques</span>
              </li>
            </ul>
            <Link href="/training/strategy">
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Start Training
              </button>
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <h3 className="text-lg font-semibold mb-3">Opening Repertoire</h3>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start text-sm">
                <span className="mr-2 text-green-600">•</span>
                <span>Develop a solid response to 1.e4</span>
              </li>
              <li className="flex items-start text-sm">
                <span className="mr-2 text-green-600">•</span>
                <span>Study attacking lines in the Sicilian</span>
              </li>
              <li className="flex items-start text-sm">
                <span className="mr-2 text-green-600">•</span>
                <span>Learn key defensive structures</span>
              </li>
            </ul>
            <Link href="/training/openings">
              <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
                Start Training
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}