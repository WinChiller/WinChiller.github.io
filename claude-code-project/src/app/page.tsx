import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container mx-auto text-center px-4">
          <h1 className="hero-title">AI-Powered Chess Analysis<br />and Playstyle Insights</h1>
          <p className="hero-subtitle">
            Understand your games, refine your style, and improve your strategy with
            advanced Stockfish analysis and personalized recommendations.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/analysis">
              <button className="cta-button primary-cta">
                Analyze Your Games
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="cta-button secondary-cta">
                View Demo Analysis
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Game Analysis Section */}
      <section className="analysis-section bg-white">
        <div className="container mx-auto">
          <h2 className="section-heading">Game Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg shadow-md bg-blue-50">
              <div className="text-blue-500 text-4xl mb-4">
                <i className="fas fa-chess-knight"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Stockfish-Powered Insights</h3>
              <p className="text-gray-700">
                Deep analysis with one of the strongest chess engines to identify your best improvement opportunities.
              </p>
            </div>
            <div className="p-6 rounded-lg shadow-md bg-red-50">
              <div className="text-red-500 text-4xl mb-4">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Blunder Detection</h3>
              <p className="text-gray-700">
                Automatically identify blunders, mistakes, and inaccuracies based on centipawn loss evaluation.
              </p>
            </div>
            <div className="p-6 rounded-lg shadow-md bg-green-50">
              <div className="text-green-500 text-4xl mb-4">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Evaluation Graph</h3>
              <p className="text-gray-700">
                Visualize game quality over time with move-by-move evaluation charts showing critical moments.
              </p>
            </div>
            <div className="p-6 rounded-lg shadow-md bg-purple-50">
              <div className="text-purple-500 text-4xl mb-4">
                <i className="fas fa-route"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Critical Mistake Highlights</h3>
              <p className="text-gray-700">
                Focus on the moves that significantly impacted the game outcome to improve decision making.
              </p>
            </div>
            <div className="p-6 rounded-lg shadow-md bg-yellow-50">
              <div className="text-yellow-500 text-4xl mb-4">
                <i className="fas fa-star"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Consistency Rating</h3>
              <p className="text-gray-700">
                Track how often you make the best moves to measure improvement in your chess strength over time.
              </p>
            </div>
            <div className="p-6 rounded-lg shadow-md bg-indigo-50">
              <div className="text-indigo-500 text-4xl mb-4">
                <i className="fas fa-book"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Opening Success Rate</h3>
              <p className="text-gray-700">
                Analyze your win and loss percentages for different openings to refine your repertoire.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Playstyle Analysis Section */}
      <section className="analysis-section bg-gray-50">
        <div className="container mx-auto">
          <h2 className="section-heading">Playstyle & Personality Analysis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="playstyle-card tactical-attacker">
              <h3 className="text-xl font-semibold mb-3 text-red-800">Tactical Attacker</h3>
              <p className="text-gray-700 mb-4">
                High aggression and frequent tactical play, with a tendency toward higher-risk moves.
              </p>
              <div className="flex justify-between text-sm text-gray-600 border-t pt-3">
                <span>Blunder Rate: High</span>
                <span>Tactical Depth: High</span>
              </div>
            </div>
            
            <div className="playstyle-card positional-player">
              <h3 className="text-xl font-semibold mb-3 text-blue-800">Positional Player</h3>
              <p className="text-gray-700 mb-4">
                Prioritizes long-term control with strategic piece placement and steady pressure.
              </p>
              <div className="flex justify-between text-sm text-gray-600 border-t pt-3">
                <span>Blunder Rate: Low</span>
                <span>Positional Play: High</span>
              </div>
            </div>
            
            <div className="playstyle-card endgame-specialist">
              <h3 className="text-xl font-semibold mb-3 text-green-800">Endgame Specialist</h3>
              <p className="text-gray-700 mb-4">
                Excels at late-game conversion with accurate technique and patient maneuvering.
              </p>
              <div className="flex justify-between text-sm text-gray-600 border-t pt-3">
                <span>Endgame Skill: High</span>
                <span>Accuracy: Moderate</span>
              </div>
            </div>
            
            <div className="playstyle-card blitz-speedster">
              <h3 className="text-xl font-semibold mb-3 text-yellow-800">Blitz Speedster</h3>
              <p className="text-gray-700 mb-4">
                Plays quickly with dynamic, intuitive decisions and high opening diversity.
              </p>
              <div className="flex justify-between text-sm text-gray-600 border-t pt-3">
                <span>Speed: Very High</span>
                <span>Blunder Rate: High</span>
              </div>
            </div>
            
            <div className="playstyle-card defensive-player">
              <h3 className="text-xl font-semibold mb-3 text-purple-800">Defensive Player</h3>
              <p className="text-gray-700 mb-4">
                Focuses on solid structures, counterattacking, and capitalizing on opponent mistakes.
              </p>
              <div className="flex justify-between text-sm text-gray-600 border-t pt-3">
                <span>Defense: Excellent</span>
                <span>Counterplay: Strong</span>
              </div>
            </div>
            
            <div className="playstyle-card unstable-player">
              <h3 className="text-xl font-semibold mb-3 text-orange-800">Unstable Player</h3>
              <p className="text-gray-700 mb-4">
                Inconsistent performance with high variance in move quality and strategic approach.
              </p>
              <div className="flex justify-between text-sm text-gray-600 border-t pt-3">
                <span>Consistency: Poor</span>
                <span>Variance: High</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Grandmaster Comparisons</h3>
              <p className="text-gray-700 mb-4">
                See which famous players share your approach to chess, from tactical wizards like Kasparov to
                positional specialists like Karpov.
              </p>
              <div className="flex items-center space-x-3 text-gray-600">
                <span>Example:</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Your style: 70% Mikhail Tal</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Playstyle Evolution</h3>
              <p className="text-gray-700 mb-4">
                Track how your chess personality changes over time as you grow as a player, from tactical to
                positional or defensive to aggressive.
              </p>
              <div className="h-20 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-gray-500 text-sm">Evolution Chart Visualization</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Metrics Section */}
      <section className="analysis-section bg-white">
        <div className="container mx-auto">
          <h2 className="section-heading">Key Data Metrics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="metric-chart">
              <h3 className="text-xl font-semibold mb-3">Tactical vs. Positional Balance</h3>
              <div className="h-40 bg-gray-100 rounded flex items-center justify-center mb-4">
                <span className="text-gray-500 text-sm">Balance Chart Visualization</span>
              </div>
              <p className="text-gray-700">
                Measures your balance between sharp tactical play and long-term strategic planning.
              </p>
            </div>
            
            <div className="metric-chart">
              <h3 className="text-xl font-semibold mb-3">Aggressiveness Score</h3>
              <div className="h-40 bg-gray-100 rounded flex items-center justify-center mb-4">
                <span className="text-gray-500 text-sm">Aggressiveness Meter</span>
              </div>
              <p className="text-gray-700">
                Based on pawn storms, early queen development, and attack frequency.
              </p>
            </div>
            
            <div className="metric-chart">
              <h3 className="text-xl font-semibold mb-3">Defensive Strength</h3>
              <div className="h-40 bg-gray-100 rounded flex items-center justify-center mb-4">
                <span className="text-gray-500 text-sm">Defense Rating Chart</span>
              </div>
              <p className="text-gray-700">
                Measured by comeback rate, fortress-building ability, and blunder recovery.
              </p>
            </div>
            
            <div className="metric-chart">
              <h3 className="text-xl font-semibold mb-3">Opening Stability</h3>
              <div className="h-40 bg-gray-100 rounded flex items-center justify-center mb-4">
                <span className="text-gray-500 text-sm">Opening Report</span>
              </div>
              <p className="text-gray-700">
                Based on theory adherence, deviation from book moves, and opening diversity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to Understand Your Chess Style?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Upload your games or sync with Chess.com to get personalized insights and improve your play.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/analysis">
              <button className="cta-button primary-cta bg-white text-blue-900 hover:bg-gray-100">
                Analyze My Games
              </button>
            </Link>
            <Link href="/pricing">
              <button className="cta-button border border-white hover:bg-blue-800">
                See Pricing
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="analysis-section bg-gray-50">
        <div className="container mx-auto">
          <h2 className="section-heading">Frequently Asked Questions</h2>
          
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">How accurate is the playstyle analysis?</h3>
              <p className="text-gray-700">
                Our analysis is based on thousands of data points from your games, using advanced statistical models 
                to identify patterns in your play. While no system is perfect, our categorizations have been validated 
                against known player profiles with high accuracy.
              </p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">How many games should I upload for the best results?</h3>
              <p className="text-gray-700">
                For the most accurate playstyle analysis, we recommend at least 20 games, preferably from the last 
                3-6 months. However, you'll get useful insights even from analyzing a single game.
              </p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Can I use this for games from any chess platform?</h3>
              <p className="text-gray-700">
                Yes! You can directly sync with Chess.com and Lichess, or manually upload PGN files from any source. 
                Our system works with standard chess notation from any platform.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Do you store my game data?</h3>
              <p className="text-gray-700">
                We securely store your analyzed games to track your progress over time. You can delete your data at 
                any time from your account settings. We never share your game data with third parties.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}