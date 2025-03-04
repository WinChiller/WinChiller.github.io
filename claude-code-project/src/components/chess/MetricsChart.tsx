'use client';

import { useEffect, useState } from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface MetricsChartProps {
  tacticsvPositional: number;
  aggressionScore: number;
  defensiveStrength: number;
  openingStability: number;
  blunderRate: number;
  consistencyRating?: number;
}

export default function MetricsChart({
  tacticsvPositional,
  aggressionScore,
  defensiveStrength,
  openingStability,
  blunderRate,
  consistencyRating
}: MetricsChartProps) {
  const [chartData, setChartData] = useState({
    labels: ['Tactical', 'Aggressive', 'Defensive', 'Opening Stability', 'Consistency'],
    datasets: [
      {
        label: 'Your Profile',
        data: [0, 0, 0, 0, 0],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
      },
    ],
  });

  useEffect(() => {
    // Process data for chart
    // Normalize all values to 0-100 scale
    const consistency = consistencyRating || 100 - Math.min(blunderRate * 5, 100);
    
    setChartData({
      labels: ['Tactical', 'Aggressive', 'Defensive', 'Opening Stability', 'Consistency'],
      datasets: [
        {
          label: 'Your Profile',
          data: [
            tacticsvPositional,
            aggressionScore,
            defensiveStrength,
            openingStability,
            consistency
          ],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
        },
      ],
    });
  }, [tacticsvPositional, aggressionScore, defensiveStrength, openingStability, blunderRate, consistencyRating]);

  // Chart options
  const options = {
    scales: {
      r: {
        min: 0,
        max: 100,
        beginAtZero: true,
        ticks: {
          stepSize: 20,
          backdropColor: 'transparent',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.raw}/100`;
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Player Metrics</h3>
      <div className="h-80">
        <Radar data={chartData} options={options as any} />
      </div>
    </div>
  );
}