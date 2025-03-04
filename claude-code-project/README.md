# ReviewChess.com

ReviewChess is a comprehensive chess analysis tool that helps players evaluate their games, understand their playstyle, and improve their performance using data-driven insights.

## Features

### Game Analysis
- **Stockfish-Powered Insights**: Deep analysis with one of the strongest chess engines
- **Blunder Detection**: Identifies blunders, mistakes, and inaccuracies based on centipawn loss
- **Evaluation Graph**: Move-by-move evaluation chart showing game quality over time
- **Critical Mistake Highlights**: Focus on moves that significantly impacted the game
- **Consistency Rating**: Track how often you make the best moves
- **Opening Success Rate**: Analysis of win/loss percentages for different openings

### Playstyle Analysis
- **Player Categorization**: Identifies your chess personality from six distinct profiles
- **Grandmaster Comparisons**: See which famous players share your approach to chess
- **Playstyle Evolution**: Track how your chess personality evolves over time
- **Key Data Metrics**:
  - Tactical vs. positional balance
  - Aggressiveness score
  - Defensive strength
  - Opening stability

### Training Recommendations
- **Personalized Training**: Custom puzzles and drills based on your weaknesses
- **Opening Improvements**: Suggestions to enhance your repertoire

## Technical Implementation

### Backend
- Stockfish chess engine integration for deep analysis
- Database for tracking historical trends and user data

### Frontend
- Next.js with React for dynamic, interactive analysis reports
- TailwindCSS for responsive design
- Chart.js for data visualizations

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation
1. Clone the repository
   ```
   git clone https://github.com/yourusername/reviewchess.git
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Run the development server
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.