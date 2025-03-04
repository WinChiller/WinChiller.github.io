'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AnalysisPage() {
  const [pgn, setPgn] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);

  const handlePgnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPgn(e.target.value);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate inputs
    if (!pgn.trim()) {
      setError('Please enter PGN data');
      setIsLoading(false);
      return;
    }

    if (!playerName.trim()) {
      setError('Please enter your name');
      setIsLoading(false);
      return;
    }

    try {
      // In a real implementation, this would call your analysis API
      // For now, we'll just simulate a successful upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsUploaded(true);
    } catch (err) {
      setError('An error occurred during analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPgn(event.target.result.toString());
      }
    };
    reader.readAsText(file);
  };

  if (isUploaded) {
    return (
      <div className="bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Analysis Complete!</h1>
            <p className="text-lg text-gray-600">
              Your game has been successfully analyzed. View your results below.
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-center">
            <div className="text-green-500 text-5xl mb-4">
              <span>✓</span>
            </div>
            <h2 className="text-xl font-semibold text-green-800 mb-2">Analysis Successfully Completed</h2>
            <p className="text-green-700">
              Your game has been processed with Stockfish to provide detailed insights.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 mb-8">
            <Link href="/dashboard/game/demo-1">
              <div className="border border-blue-200 rounded-lg p-6 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
                <h3 className="text-xl font-semibold text-blue-800 mb-2">View Game Analysis</h3>
                <p className="text-blue-700 mb-4">
                  See your move-by-move analysis, blunders, and key turning points.
                </p>
                <div className="flex justify-between text-sm text-blue-600">
                  <span>20 moves analyzed</span>
                  <span>Consistency: 72%</span>
                </div>
              </div>
            </Link>
            
            <Link href="/dashboard/playstyle">
              <div className="border border-purple-200 rounded-lg p-6 bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer">
                <h3 className="text-xl font-semibold text-purple-800 mb-2">View Playstyle Analysis</h3>
                <p className="text-purple-700 mb-4">
                  Discover your chess personality, strengths, and areas for improvement.
                </p>
                <div className="flex justify-between text-sm text-purple-600">
                  <span>Primary Style: Tactical Attacker</span>
                  <span>Similar to: Mikhail Tal</span>
                </div>
              </div>
            </Link>
          </div>
          
          <div className="text-center">
            <Link href="/analysis">
              <button className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 mr-4">
                Analyze Another Game
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                Go to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Analyze Your Chess Game</h1>
          <p className="text-lg text-gray-600">
            Upload your game in PGN format to get detailed analysis and playstyle insights.
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">What You'll Get</h2>
          <ul className="space-y-2 text-blue-700">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Stockfish-powered move analysis with centipawn evaluation</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Identification of blunders, mistakes, and inaccuracies</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Critical turning points and winning chances graph</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Personalized playstyle analysis and training recommendations</span>
            </li>
          </ul>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name (as appears in the PGN)
            </label>
            <input
              type="text"
              id="name"
              value={playerName}
              onChange={handleNameChange}
              placeholder="e.g. John Smith, username123"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter your name exactly as it appears in the PGN file
            </p>
          </div>
          
          <div>
            <label htmlFor="pgn" className="block text-sm font-medium text-gray-700 mb-1">
              PGN Data
            </label>
            <textarea
              id="pgn"
              value={pgn}
              onChange={handlePgnChange}
              rows={10}
              placeholder="Paste your PGN data here..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="file-upload" className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50">
                Upload PGN File
              </label>
              <input 
                id="file-upload" 
                type="file" 
                accept=".pgn" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </div>
            <div className="flex space-x-4">
              <Link href="/">
                <button type="button" className="px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-2 rounded-md font-medium text-white ${
                  isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isLoading ? 'Analyzing...' : 'Analyze Game'}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}
        </form>
        
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Connect with Chess.com or Lichess</h2>
          <p className="text-gray-600 mb-6">
            Automatically import your games by connecting your online chess account.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50">
              <span className="text-gray-800 font-medium">Connect with Chess.com</span>
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50">
              <span className="text-gray-800 font-medium">Connect with Lichess</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}