'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlaystyleType } from '@/types';

// Mock data interface
interface GameSummary {
  id: string;
  date: string;
  opponent: string;
  result: '1-0' | '0-1' | '1/2-1/2' | '*';
  playerColor: 'white' | 'black';
  opening?: string;
  blunders: number;
  mistakes: number;
  inaccuracies: number;
  averageCentipawnLoss: number;
  consistencyRating: number;
}

interface PlaystyleSummary {
  primaryStyle: PlaystyleType;
  secondaryStyle?: PlaystyleType;
  similarGrandmaster?: string;
  tacticsvPositional: number;
  aggressionScore: number;
  defensiveStrength: number;
  blunderRate: number;
}

export default function Dashboard() {
  const [games, setGames] = useState<GameSummary[]>([]);
  const [playstyle, setPlaystyle] = useState<PlaystyleSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Mock game data
      const mockGames: GameSummary[] = [
        {
          id: 'demo-1',
          date: '2023-12-15',
          opponent: 'JaneSmith',
          result: '1-0',
          playerColor: 'white',
          opening: 'Sicilian Defense: Najdorf Variation',
          blunders: 1,
          mistakes: 3,
          inaccuracies: 4,
          averageCentipawnLoss: 28.3,
          consistencyRating: 72
        },
        {
          id: 'demo-2',
          date: '2023-12-14',
          opponent: 'ChessMaster42',
          result: '0-1',
          playerColor: 'black',
          opening: "Queen's Gambit Accepted",
          blunders: 2,
          mistakes: 1,
          inaccuracies: 3,
          averageCentipawnLoss: 35.6,
          consistencyRating: 65
        },
        {
          id: 'demo-3',
          date: '2023-12-12',
          opponent: 'GrandWizard',
          result: '1/2-1/2',
          playerColor: 'white',
          opening: 'Ruy Lopez: Berlin Defense',
          blunders: 0,
          mistakes: 2,
          inaccuracies: 5,
          averageCentipawnLoss: 22.1,
          consistencyRating: 78
        }
      ];

      // Mock playstyle data
      const mockPlaystyle: PlaystyleSummary = {
        primaryStyle: 'tacticalAttacker',
        secondaryStyle: 'defensivePlayer',
        similarGrandmaster: 'Mikhail Tal',
        tacticsvPositional: 68,
        aggressionScore: 72,
        defensiveStrength: 61,
        blunderRate: 8.5
      };

      setGames(mockGames);
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

  // Helper function for result styling
  const getResultStyle = (result: string, playerColor: 'white' | 'black') => {
    const isWin = (result === '1-0' && playerColor === 'white') || 
                 (result === '0-1' && playerColor === 'black');
    const isDraw = result === '1/2-1/2';
    
    if (isWin) return 'text-green-600 font-medium';
    if (isDraw) return 'text-yellow-600 font-medium';
    return 'text-red-600 font-medium';
  };

  // Helper function to get consistency rating color
  const getConsistencyColor = (rating: number) => {
    if (rating >= 80) return 'text-green-600';
    if (rating >= 70) return 'text-green-500';
    if (rating >= 60) return 'text-yellow-500';
    if (rating >= 50) return 'text-yellow-600';
    if (rating >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your chess data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/analysis">
          <button className="mt-4 md:mt-0 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm">
            Analyze New Game
          </button>
        </Link>
      </div>
      
      {/* Playstyle Summary */}
      {playstyle && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Chess Personality</h2>
              <div className="flex flex-wrap items-center">
                <span className="mr-2">Primary Style:</span>
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  {getPlaystyleName(playstyle.primaryStyle)}
                </span>
                {playstyle.secondaryStyle && (
                  <>
                    <span className="mx-2">with</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      {getPlaystyleName(playstyle.secondaryStyle)}
                    </span>
                    <span className="ml-2">tendencies</span>
                  </>
                )}
              </div>
            </div>
            <Link href="/dashboard/playstyle">
              <button className="mt-4 md:mt-0 px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50">
                View Full Analysis
              </button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
              <div className="text-sm text-amber-800 mb-1">Similar to</div>
              <div className="text-xl font-medium">{playstyle.similarGrandmaster || 'Unknown'}</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-800 mb-1">Playing Style</div>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                  <div 
                    className="h-2.5 rounded-full bg-blue-600" 
                    style={{ width: `${playstyle.tacticsvPositional}%` }}
                  ></div>
                </div>
                <span className="text-sm whitespace-nowrap">{playstyle.tacticsvPositional}% tactical</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-lg border border-red-200">
              <div className="text-sm text-red-800 mb-1">Aggression Score</div>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                  <div 
                    className="h-2.5 rounded-full bg-red-600" 
                    style={{ width: `${playstyle.aggressionScore}%` }}
                  ></div>
                </div>
                <span className="text-sm whitespace-nowrap">{playstyle.aggressionScore}/100</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm text-green-800 mb-1">Blunder Rate</div>
              <div className="text-xl font-medium">{playstyle.blunderRate}%</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Recent Games */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
        <h2 className="text-2xl font-bold mb-6">Recent Games</h2>
        
        {games.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">You haven't analyzed any games yet.</p>
            <Link href="/analysis">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Analyze Your First Game
              </button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Opponent</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Result</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Opening</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Quality</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Mistakes</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game) => (
                  <tr key={game.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm text-gray-700">{game.date}</td>
                    <td className="px-4 py-4 font-medium">{game.opponent}</td>
                    <td className={`px-4 py-4 ${getResultStyle(game.result, game.playerColor)}`}>
                      {game.result}
                      <span className="ml-1 text-gray-500 font-normal">
                        ({game.playerColor === 'white' ? 'W' : 'B'})
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 max-w-[200px] truncate">
                      {game.opening || 'Unknown Opening'}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="inline-flex items-center">
                        <span className={`font-medium ${getConsistencyColor(game.consistencyRating)}`}>
                          {game.consistencyRating}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center space-x-2 text-sm">
                        <span className="inline-flex items-center text-red-600">
                          <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                          {game.blunders}
                        </span>
                        <span className="inline-flex items-center text-yellow-600">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
                          {game.mistakes}
                        </span>
                        <span className="inline-flex items-center text-blue-600">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                          {game.inaccuracies}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link href={`/dashboard/game/${game.id}`}>
                        <button className="text-blue-600 hover:text-blue-800">
                          View Analysis
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Statistical Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Improvement Over Time</h3>
          <div className="h-48 flex items-center justify-center bg-gray-100 rounded">
            <span className="text-gray-500">Chart Placeholder</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Opening Performance</h3>
          <div className="h-48 flex items-center justify-center bg-gray-100 rounded">
            <span className="text-gray-500">Chart Placeholder</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Training Recommendations</h3>
          <ul className="space-y-3">
            <li className="flex items-start text-sm">
              <span className="mr-2 text-green-600">•</span>
              <span>Practice knight endgames to improve technique</span>
            </li>
            <li className="flex items-start text-sm">
              <span className="mr-2 text-green-600">•</span>
              <span>Study tactical patterns involving pins and skewers</span>
            </li>
            <li className="flex items-start text-sm">
              <span className="mr-2 text-green-600">•</span>
              <span>Work on Sicilian Defense theory and plans</span>
            </li>
          </ul>
          <div className="mt-4 text-right">
            <Link href="/training">
              <button className="text-sm text-blue-600 hover:text-blue-800">
                View All Recommendations →
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}