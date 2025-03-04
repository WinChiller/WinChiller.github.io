'use client';

import { useState, useEffect } from 'react';
import { GameAnalysis } from '@/types';
import GameAnalysisView from '@/components/chess/GameAnalysisView';
import Link from 'next/link';

export default function GamePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [analysis, setAnalysis] = useState<GameAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, we would fetch the data from an API
    // For now, we'll just use mock data
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      try {
        // Mock data
        const mockAnalysis: GameAnalysis = {
          gameId: id,
          player: 'JohnDoe',
          playerColor: 'white',
          opponent: 'JaneSmith',
          date: '2023-12-15',
          result: '1-0',
          opening: 'Sicilian Defense: Najdorf Variation',
          timeControl: '10+0',
          moveEvaluations: [
            {
              moveNumber: 1,
              fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
              move: 'e4',
              evaluation: 0.2,
              depth: 18,
              bestMove: 'e4',
              isMistake: false,
              isBlunder: false,
              isInaccuracy: false,
              centipawnLoss: 0
            },
            {
              moveNumber: 1,
              fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
              move: 'c5',
              evaluation: 0.3,
              depth: 18,
              bestMove: 'c5',
              isMistake: false,
              isBlunder: false,
              isInaccuracy: false,
              centipawnLoss: 10
            },
            {
              moveNumber: 2,
              fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
              move: 'Nf3',
              evaluation: 0.2,
              depth: 18,
              bestMove: 'Nf3',
              isMistake: false,
              isBlunder: false,
              isInaccuracy: false,
              centipawnLoss: 10
            },
            {
              moveNumber: 2,
              fen: 'r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
              move: 'Nc6',
              evaluation: 0.3,
              depth: 18,
              bestMove: 'd6',
              isMistake: false,
              isBlunder: false,
              isInaccuracy: true,
              centipawnLoss: 30
            },
            {
              moveNumber: 3,
              fen: 'r1bqkbnr/pp1ppppp/2n5/2p5/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 3',
              move: 'd4',
              evaluation: 0.4,
              depth: 18,
              bestMove: 'd4',
              isMistake: false,
              isBlunder: false,
              isInaccuracy: false,
              centipawnLoss: 0
            },
            {
              moveNumber: 3,
              fen: 'r1bqkbnr/pp1ppppp/2n5/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4',
              move: 'cxd4',
              evaluation: 0.3,
              depth: 18,
              bestMove: 'cxd4',
              isMistake: false,
              isBlunder: false,
              isInaccuracy: false,
              centipawnLoss: 10
            },
            {
              moveNumber: 4,
              fen: 'r1bqkbnr/pp1ppppp/2n5/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq - 0 4',
              move: 'Nxd4',
              evaluation: 0.4,
              depth: 18,
              bestMove: 'Nxd4',
              isMistake: false,
              isBlunder: false,
              isInaccuracy: false,
              centipawnLoss: 0
            },
            {
              moveNumber: 4,
              fen: 'r1bqkbnr/pp2pppp/2n5/3p4/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 0 5',
              move: 'd5',
              evaluation: 0.6,
              depth: 18,
              bestMove: 'e5',
              isMistake: false,
              isBlunder: false,
              isInaccuracy: true,
              centipawnLoss: 20
            },
            {
              moveNumber: 5,
              fen: 'r1bqkbnr/pp2pppp/2n5/3p4/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq - 1 5',
              move: 'Nc3',
              evaluation: 0.5,
              depth: 18,
              bestMove: 'Nc3',
              isMistake: false,
              isBlunder: false,
              isInaccuracy: false,
              centipawnLoss: 10
            },
            {
              moveNumber: 5,
              fen: 'r1bqkb1r/pp2pppp/2n2n2/3p4/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 2 6',
              move: 'Nf6',
              evaluation: 0.7,
              depth: 18,
              bestMove: 'e5',
              isMistake: true,
              isBlunder: false,
              isInaccuracy: false,
              centipawnLoss: 50
            },
            {
              moveNumber: 6,
              fen: 'r1bqkb1r/pp2pppp/2n2n2/3p4/3NP3/2N1B3/PPP2PPP/R2QKB1R b KQkq - 3 6',
              move: 'Be3',
              evaluation: 0.6,
              depth: 18,
              bestMove: 'Nxc6',
              isMistake: false,
              isBlunder: false,
              isInaccuracy: true,
              centipawnLoss: 30
            },
            {
              moveNumber: 6,
              fen: 'r1bqkb1r/1p2pppp/p1n2n2/3p4/3NP3/2N1B3/PPP2PPP/R2QKB1R w KQkq - 0 7',
              move: 'a6',
              evaluation: 1.2,
              depth: 18,
              bestMove: 'e5',
              isMistake: true,
              isBlunder: false,
              isInaccuracy: false,
              centipawnLoss: 60
            },
            {
              moveNumber: 7,
              fen: 'r1bqkb1r/1p2pppp/p1n2n2/3p4/3NP3/2N1BP2/PPP3PP/R2QKB1R b KQkq - 0 7',
              move: 'f3',
              evaluation: 1.0,
              depth: 18,
              bestMove: 'f4',
              isMistake: false,
              isBlunder: false,
              isInaccuracy: false,
              centipawnLoss: 20
            },
            {
              moveNumber: 7,
              fen: 'r1bqkb1r/1p3ppp/p1n1pn2/3p4/3NP3/2N1BP2/PPP3PP/R2QKB1R w KQkq - 0 8',
              move: 'e6',
              evaluation: 1.1,
              depth: 18,
              bestMove: 'g6',
              isMistake: false,
              isBlunder: false,
              isInaccuracy: false,
              centipawnLoss: 10
            },
            {
              moveNumber: 8,
              fen: 'r1bqkb1r/1p3ppp/p1n1pn2/3p4/3NP3/2N1BP2/PPPQ2PP/R3KB1R b KQkq - 1 8',
              move: 'Qd2',
              evaluation: 1.0,
              depth: 18,
              bestMove: 'Qf2',
              isMistake: false,
              isBlunder: false,
              isInaccuracy: true,
              centipawnLoss: 30
            },
            {
              moveNumber: 8,
              fen: 'r1b1kb1r/1p3ppp/p1n1pn2/q2p4/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQkq - 2 9',
              move: 'Qa5',
              evaluation: 0.4,
              depth: 18,
              bestMove: 'Bb4',
              isMistake: true,
              isBlunder: false,
              isInaccuracy: false,
              centipawnLoss: 60
            },
            {
              moveNumber: 9,
              fen: 'r1b1kb1r/1p3ppp/p1n1pn2/q2p4/3NP3/2N1BP2/PPPQ2PP/2KR1B1R b kq - 3 9',
              move: 'O-O-O',
              evaluation: 0.3,
              depth: 18,
              bestMove: 'O-O-O',
              isMistake: false,
              isBlunder: false,
              isInaccuracy: false,
              centipawnLoss: 10
            },
            {
              moveNumber: 9,
              fen: 'r1b1k2r/1p3ppp/p1n1pn2/q2p4/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w kq - 4 10',
              move: 'O-O',
              evaluation: 1.5,
              depth: 18,
              bestMove: 'Be7',
              isMistake: false,
              isBlunder: true,
              isInaccuracy: false,
              centipawnLoss: 120
            },
            {
              moveNumber: 10,
              fen: 'r1b1k2r/1p3ppp/p1n1pn2/q2p4/3NP3/2N1BP2/PPPQ1BPP/2KR3R b kq - 5 10',
              move: 'Bf2',
              evaluation: 1.3,
              depth: 18,
              bestMove: 'g4',
              isMistake: false,
              isBlunder: false,
              isInaccuracy: false,
              centipawnLoss: 20
            }
          ],
          blunderCount: 1,
          mistakeCount: 3,
          inaccuracyCount: 4,
          averageCentipawnLoss: 28.3,
          winningChances: [55, 53, 54, 55, 56, 57, 58, 61, 57, 59, 58, 62, 61, 54, 53, 70, 68],
          consistencyRating: 72,
          criticalMistakes: [],
          turningPoints: []
        };
        
        setAnalysis(mockAnalysis);
        setLoading(false);
      } catch (err) {
        setError('Failed to load analysis. Please try again.');
        setLoading(false);
      }
    }, 1000);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <h2 className="font-bold text-lg mb-2">Error</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg">
        <h2 className="font-bold text-lg mb-2">Game Not Found</h2>
        <p>The game analysis you're looking for could not be found.</p>
        <Link href="/dashboard">
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Back to Dashboard
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/dashboard">
          <button className="flex items-center text-blue-600 hover:text-blue-800">
            <span className="mr-1">←</span> Back to Dashboard
          </button>
        </Link>
      </div>

      <GameAnalysisView analysis={analysis} />
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-4">Playstyle Analysis</h3>
          <p className="text-gray-700 mb-4">
            Based on your moves in this game, your play showed characteristics of a
            <span className="font-medium text-blue-700"> Tactical Attacker</span> with elements of
            <span className="font-medium text-purple-700"> Defensive Play</span>.
          </p>
          <Link href="/dashboard/playstyle">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              View Full Playstyle Analysis
            </button>
          </Link>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-4">Training Recommendations</h3>
          <ul className="space-y-2 text-gray-700 mb-6">
            <li className="flex items-start">
              <span className="mr-2 text-green-600">•</span>
              <span>Practice endgame techniques - you missed winning chances in simplified positions</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-green-600">•</span>
              <span>Focus on tactical patterns involving knight forks</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-green-600">•</span>
              <span>Study openings with better responses to the Sicilian Defense</span>
            </li>
          </ul>
          <Link href="/training">
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Start Training
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}