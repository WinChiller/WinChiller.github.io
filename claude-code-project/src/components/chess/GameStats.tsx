'use client';

interface GameStatsProps {
  blunderCount: number;
  mistakeCount: number;
  inaccuracyCount: number;
  averageCentipawnLoss: number;
  consistencyRating: number;
  openingName?: string;
  result: '1-0' | '0-1' | '1/2-1/2' | '*';
  playerColor: 'white' | 'black';
}

export default function GameStats({
  blunderCount,
  mistakeCount,
  inaccuracyCount,
  averageCentipawnLoss,
  consistencyRating,
  openingName = 'Unknown Opening',
  result,
  playerColor
}: GameStatsProps) {
  // Helper function to get result for display
  const getResultText = () => {
    const isPlayerWhite = playerColor === 'white';
    if (result === '1-0') return isPlayerWhite ? 'Win' : 'Loss';
    if (result === '0-1') return isPlayerWhite ? 'Loss' : 'Win';
    if (result === '1/2-1/2') return 'Draw';
    return 'Ongoing';
  };

  // Helper function to get color for result
  const getResultColor = () => {
    const resultText = getResultText();
    if (resultText === 'Win') return 'text-green-600';
    if (resultText === 'Loss') return 'text-red-600';
    if (resultText === 'Draw') return 'text-yellow-600';
    return 'text-gray-600';
  };

  // Helper function to get color for consistency rating
  const getConsistencyColor = () => {
    if (consistencyRating >= 90) return 'text-green-600';
    if (consistencyRating >= 80) return 'text-green-500';
    if (consistencyRating >= 70) return 'text-green-400';
    if (consistencyRating >= 60) return 'text-yellow-500';
    if (consistencyRating >= 50) return 'text-yellow-600';
    if (consistencyRating >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  // Helper function to get color for average centipawn loss
  const getCentipawnLossColor = () => {
    if (averageCentipawnLoss <= 10) return 'text-green-600';
    if (averageCentipawnLoss <= 20) return 'text-green-500';
    if (averageCentipawnLoss <= 30) return 'text-green-400';
    if (averageCentipawnLoss <= 40) return 'text-yellow-500';
    if (averageCentipawnLoss <= 50) return 'text-yellow-600';
    if (averageCentipawnLoss <= 70) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Game Statistics</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-sm text-gray-600">Result</div>
          <div className={`text-2xl font-bold ${getResultColor()}`}>{getResultText()}</div>
        </div>
        
        <div>
          <div className="text-sm text-gray-600">Opening</div>
          <div className="text-lg font-medium truncate" title={openingName}>
            {openingName}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-sm text-gray-600">Blunders</div>
          <div className="text-2xl font-bold text-red-600">{blunderCount}</div>
        </div>
        
        <div className="text-center">
          <div className="text-sm text-gray-600">Mistakes</div>
          <div className="text-2xl font-bold text-yellow-600">{mistakeCount}</div>
        </div>
        
        <div className="text-center">
          <div className="text-sm text-gray-600">Inaccuracies</div>
          <div className="text-2xl font-bold text-blue-600">{inaccuracyCount}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-600 mb-1">Avg. Centipawn Loss</div>
          <div className={`text-xl font-bold ${getCentipawnLossColor()}`}>
            {averageCentipawnLoss.toFixed(1)}
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-600 mb-1">Consistency Rating</div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full ${
                consistencyRating >= 70 ? 'bg-green-500' : 
                consistencyRating >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${consistencyRating}%` }}
            ></div>
          </div>
          <div className={`text-right mt-1 ${getConsistencyColor()}`}>
            {consistencyRating}%
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100">
        <h4 className="font-medium mb-2">Quality Summary</h4>
        <div className="flex items-center">
          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="flex h-full">
              <div 
                className="bg-red-500 h-full" 
                style={{ width: `${(blunderCount / Math.max(1, blunderCount + mistakeCount + inaccuracyCount)) * 100}%` }}
              ></div>
              <div 
                className="bg-yellow-500 h-full" 
                style={{ width: `${(mistakeCount / Math.max(1, blunderCount + mistakeCount + inaccuracyCount)) * 100}%` }}
              ></div>
              <div 
                className="bg-blue-500 h-full" 
                style={{ width: `${(inaccuracyCount / Math.max(1, blunderCount + mistakeCount + inaccuracyCount)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div className="flex text-xs mt-2 text-gray-600 justify-between">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
            <span>Blunders</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
            <span>Mistakes</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
            <span>Inaccuracies</span>
          </div>
        </div>
      </div>
    </div>
  );
}