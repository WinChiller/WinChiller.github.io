'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { MoveEvaluation } from '@/types';

// Register Chart.js components
Chart.register(...registerables);

interface EvaluationChartProps {
  moves: MoveEvaluation[];
  currentMove?: number;
  onSelectMove?: (index: number) => void;
  playerColor?: 'white' | 'black';
}

export default function EvaluationChart({
  moves,
  currentMove,
  onSelectMove,
  playerColor = 'white'
}: EvaluationChartProps) {
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [
      {
        label: 'Evaluation',
        data: [] as number[],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        pointRadius: 3,
        pointHoverRadius: 6,
        tension: 0.1
      }
    ]
  });
  
  // Update chart when moves change
  useEffect(() => {
    if (moves.length === 0) return;
    
    const moveNumbers = moves.map((move, index) => {
      const moveNum = Math.ceil((index + 1) / 2);
      return index % 2 === 0 ? `${moveNum}.` : `${moveNum}...`;
    });
    
    // Process evaluations to cap extreme values for better visualization
    const capEvaluation = (eval: number) => {
      const MAX_EVAL = 5; // Cap at ±5 pawns for better visualization
      return Math.max(-MAX_EVAL, Math.min(MAX_EVAL, eval));
    };
    
    // For black's perspective, we invert the evaluation
    const processedEvals = moves.map(move => {
      let eval = capEvaluation(move.evaluation);
      return playerColor === 'black' ? -eval : eval;
    });
    
    setChartData({
      labels: moveNumbers,
      datasets: [
        {
          label: 'Evaluation',
          data: processedEvals,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          pointRadius: 3,
          pointHoverRadius: 6,
          tension: 0.1
        }
      ]
    });
  }, [moves, playerColor]);
  
  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          title: (tooltipItems: any) => {
            const index = tooltipItems[0].dataIndex;
            return `Move ${moves[index]?.move}`;
          },
          label: (tooltipItem: any) => {
            const index = tooltipItem.dataIndex;
            const value = tooltipItem.raw as number;
            const formattedValue = Math.abs(value).toFixed(2);
            
            // Format the evaluation for display
            const evalText = 
              value === 0 ? 'Equal' : 
              value > 0 ? `+${formattedValue}` : 
              `-${formattedValue}`;
            
            // Determine who's ahead
            const sign = playerColor === 'black' ? -1 : 1;
            const isGood = (value * sign) > 0;
            
            const evaluation = `Evaluation: ${evalText}`;
            const advantage = isGood 
              ? `${playerColor === 'white' ? 'White' : 'Black'} is ahead` 
              : `${playerColor === 'white' ? 'Black' : 'White'} is ahead`;
            
            return [evaluation, advantage];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value: any) {
            if (value === 0) return '0.0';
            const formattedValue = Math.abs(parseFloat(value)).toFixed(1);
            return value > 0 ? `+${formattedValue}` : `-${formattedValue}`;
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    onClick: (e: any, elements: any) => {
      if (elements.length > 0 && onSelectMove) {
        const index = elements[0].index;
        onSelectMove(index);
      }
    }
  };
  
  // Add a horizontal line at 0 for equal position
  const annotation = {
    type: 'line',
    borderColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    scaleID: 'y',
    value: 0
  };
  
  // Highlight current move if set
  useEffect(() => {
    if (currentMove !== undefined && currentMove >= 0 && currentMove < moves.length) {
      // Update the dataset to highlight the current move
      const newDataset = { ...chartData.datasets[0] };
      newDataset.pointBackgroundColor = chartData.datasets[0].data.map((_, index) => 
        index === currentMove ? 'rgb(220, 38, 38)' : 'rgb(59, 130, 246)'
      );
      newDataset.pointRadius = chartData.datasets[0].data.map((_, index) => 
        index === currentMove ? 6 : 3
      );
      
      setChartData({
        labels: chartData.labels,
        datasets: [newDataset]
      });
    }
  }, [currentMove, moves.length, chartData]);
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold mb-4">Position Evaluation</h3>
      <div className="h-64">
        <Line data={chartData} options={options as any} />
      </div>
      <div className="mt-2 text-sm text-gray-500 text-center">
        Move Number
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center">
          <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
          <span>Positive values favor White</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
          <span>Current position</span>
        </div>
      </div>
    </div>
  );
}