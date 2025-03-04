from flask import Flask, request, jsonify
import json
import chess
import chess.engine
import chess.pgn
import sqlite3
import requests
from datetime import datetime, timedelta
from collections import defaultdict
from stockfish import Stockfish
from flask_cors import CORS
import sys
import traceback
import flask
import os
import io
import re
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Force flush print statements
sys.stdout.flush()

# Update this path to point to your Stockfish executable using absolute path
ENGINE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "stockfish-windows-x86-64-avx2", "stockfish", "stockfish-windows-x86-64-avx2.exe"))

# Initialize Stockfish with proper parameters
try:
    stockfish = Stockfish(
        path=ENGINE_PATH,
        parameters={
            "Debug Log File": "",
            "Threads": 2,
            "Minimum Thinking Time": 30
        }
    )
    print(f"✅ Stockfish initialized successfully at: {ENGINE_PATH}")
except Exception as e:
    print(f"❌ Failed to initialize Stockfish: {e}")
    print(f"Current working directory: {os.getcwd()}")
    print(f"Checking if file exists: {os.path.exists(ENGINE_PATH)}")

# Database setup
DATABASE = 'chess_analysis.db'

def get_db():
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    return db

def init_db():
    with app.app_context():
        db = get_db()
        db.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL
            )
        ''')
        db.execute('''
            CREATE TABLE IF NOT EXISTS games (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                pgn TEXT,
                blunders TEXT,
                mistakes TEXT,
                inaccuracies TEXT,
                evaluations TEXT,
                consistency_rating REAL,
                timestamp DATETIME,
                opening TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        db.commit()

init_db()

def get_all_games(username, time_filter='all'):
    """Get all games from Chess.com API with time filtering"""
    print(f"\n===== FETCHING GAMES FOR {username} WITH FILTER {time_filter} =====")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    # First check if the player exists
    player_url = f"https://api.chess.com/pub/player/{username}"
    print(f"Checking if player exists: {player_url}")
    
    try:
        player_response = requests.get(player_url, headers=headers)
        print(f"Player lookup status code: {player_response.status_code}")
        
        if player_response.status_code != 200:
            print(f"Player {username} not found: {player_response.status_code}")
            return None
    except Exception as e:
        print(f"Error connecting to Chess.com API (player lookup): {e}")
        return None
    
    # Try to get archives (list of monthly game collections)
    archives_url = f"https://api.chess.com/pub/player/{username}/games/archives"
    print(f"Fetching archives from: {archives_url}")
    
    try:
        archives_response = requests.get(archives_url, headers=headers)
        print(f"Archives lookup status code: {archives_response.status_code}")
        
        if archives_response.status_code != 200:
            print(f"Failed to get archives: {archives_response.status_code}")
            return None
    except Exception as e:
        print(f"Error connecting to Chess.com API (archives): {e}")
        return None
    
    # Process the archives response
    try:
        archives_data = archives_response.json()
        print(f"Archives response type: {type(archives_data)}")
        
        # Handle different response formats
        if isinstance(archives_data, list):
            # If API returns archives array directly
            archives = archives_data
        elif isinstance(archives_data, dict) and 'archives' in archives_data:
            # If API returns object with archives property
            archives = archives_data['archives']
        else:
            # Log the unexpected format for debugging
            print(f"Unexpected archives response format: {type(archives_data)}")
            print(f"Response content sample: {str(archives_data)[:200]}...")
            archives = []
            
        print(f"Found {len(archives)} archive URLs")
    except Exception as e:
        print(f"Error parsing archives response: {e}")
        print(f"Raw response: {archives_response.text[:200]}...")
        archives = []
    
    if not archives:
        print("No archives found")
        return []
    
    # Calculate date threshold based on time_filter
    now = datetime.now()
    filter_date = None
    
    if time_filter == '7days':
        filter_date = now - timedelta(days=7)
    elif time_filter == '30days':
        filter_date = now - timedelta(days=30)
    elif time_filter == '90days':
        filter_date = now - timedelta(days=90)
    elif time_filter == '1year':
        filter_date = now - timedelta(days=365)
    elif time_filter == '2years':
        filter_date = now - timedelta(days=730)
    elif time_filter == '3years':
        filter_date = now - timedelta(days=1095)
    # 'all' will use no filter
    
    # Sort archives by date (most recent first)
    # Archives format: https://api.chess.com/pub/player/{username}/games/{yyyy}/{mm}
    archives.sort(reverse=True)
    
    formatted_games = []
    
    print(f"Fetching games from {len(archives)} archives...")
    
    # Get games from all archives (limit to 5 archives for performance if not filtered)
    archive_limit = 5 if time_filter == 'all' else len(archives)
    for archive_url in archives[:archive_limit]:
        # Extract date from archive URL
        parts = archive_url.split('/')
        if len(parts) >= 2:
            try:
                year = int(parts[-2])
                month = int(parts[-1])
                archive_date = datetime(year=year, month=month, day=1)
                
                # Skip archives that are older than our filter date
                if filter_date and archive_date < filter_date:
                    continue
            except (ValueError, IndexError):
                # Continue with the archive if we can't parse the date
                pass
        
        print(f"Processing archive: {archive_url}")
        try:
            response = requests.get(archive_url, headers=headers)
            if response.status_code != 200:
                print(f"Failed to get games from {archive_url}: {response.status_code}")
                continue
            
            try:
                archive_data = response.json()
                games = archive_data.get('games', [])
                print(f"Found {len(games)} games in archive")
                
                if not games:
                    print(f"No games found in archive {archive_url}")
                    continue
            except Exception as e:
                print(f"Error parsing games from archive {archive_url}: {e}")
                print(f"Response: {response.text[:200]}...")
                continue
        except Exception as e:
            print(f"Error connecting to archive {archive_url}: {e}")
            continue
        
        # Format the games as needed
        for game in games:
            # Skip games without PGN
            if not game.get('pgn'):
                continue
                
            # Get game end time for filtering
            end_time_str = game.get('end_time')
            if end_time_str and filter_date:
                end_time = datetime.fromtimestamp(int(end_time_str))
                if end_time < filter_date:
                    continue
            
            # Extract opening data if available
            opening = None
            pgn = game.get('pgn', '')
            
            # Try to extract opening information
            eco_match = re.search(r'\[ECO "([^"]+)"\]', pgn)
            opening_match = re.search(r'\[Opening "([^"]+)"\]', pgn)
            
            if eco_match and opening_match:
                opening = f"{eco_match.group(1)}: {opening_match.group(1)}"
            elif opening_match:
                opening = opening_match.group(1)
            elif eco_match:
                opening = eco_match.group(1)
            
            player_color = 'white' if username.lower() == game.get('white', {}).get('username', '').lower() else 'black'
            player_result = game.get('white' if player_color == 'white' else 'black', {}).get('result', '')
            
            formatted_games.append({
                'white': game.get('white', {}).get('username'),
                'black': game.get('black', {}).get('username'),
                'time_control': game.get('time_control'),
                'pgn': pgn,
                'result': player_result,
                'url': game.get('url'),
                'end_time': end_time_str,
                'opening': opening,
                'player_color': player_color,
                # Add a win/loss/draw indicator
                'outcome': 'win' if player_result == 'win' else ('loss' if player_result == 'loss' else 'draw')
            })
    
    print(f"Total games found for {username}: {len(formatted_games)}")
    return formatted_games

def get_recent_games(username):
    """Legacy function for backward compatibility"""
    return get_all_games(username, time_filter='30days')

def analyze_opening_stats(games):
    """Analyze opening statistics from a list of games"""
    if not games:
        print("No games provided for opening stats analysis")
        return []
        
    opening_stats = defaultdict(lambda: {'total': 0, 'wins': 0, 'losses': 0, 'draws': 0})
    
    print(f"Analyzing opening stats for {len(games)} games")
    
    for game in games:
        if not isinstance(game, dict):
            print(f"Warning: Expected game to be a dictionary, got {type(game)}")
            continue
            
        opening = game.get('opening')
        if not opening:
            opening = "Unknown Opening"
            
        opening_stats[opening]['total'] += 1
        
        outcome = game.get('outcome')
        if outcome == 'win':
            opening_stats[opening]['wins'] += 1
        elif outcome == 'loss':
            opening_stats[opening]['losses'] += 1
        else:
            opening_stats[opening]['draws'] += 1
    
    # Calculate win rates
    result = []
    for opening, stats in opening_stats.items():
        if stats['total'] >= 3:  # Only include openings played at least 3 times
            win_rate = (stats['wins'] / stats['total']) * 100
            result.append({
                'opening': opening,
                'total': stats['total'],
                'wins': stats['wins'],
                'losses': stats['losses'],
                'draws': stats['draws'],
                'win_rate': round(win_rate, 1)
            })
    
    # Sort by most played
    print(f"Found {len(result)} openings with at least 3 games")
    return sorted(result, key=lambda x: x['total'], reverse=True)

def determine_player_profile(analysis_data):
    """Determine the player's chess profile based on analysis data"""
    # Extract relevant metrics
    blunder_rate = analysis_data.get('blunder_rate', 0)
    positional_score = analysis_data.get('positional_score', 0)
    tactical_score = analysis_data.get('tactical_score', 0)
    endgame_score = analysis_data.get('endgame_score', 0)
    avg_move_time = analysis_data.get('avg_move_time', 0)
    evaluation_variance = analysis_data.get('evaluation_variance', 0)
    defensive_score = analysis_data.get('defensive_score', 0)
    
    # Profile scoring
    profile_scores = {
        'Tactical Attacker': tactical_score * 0.5 + blunder_rate * 0.3 - defensive_score * 0.2,
        'Positional Player': positional_score * 0.6 - blunder_rate * 0.3 + defensive_score * 0.1,
        'Endgame Specialist': endgame_score * 0.7 - blunder_rate * 0.3,
        'Blitz Speedster': (1 / max(avg_move_time, 0.1)) * 0.6 + blunder_rate * 0.4,
        'Defensive Player': defensive_score * 0.6 - blunder_rate * 0.2 + positional_score * 0.2,
        'Unstable Player': blunder_rate * 0.5 + evaluation_variance * 0.5 - positional_score * 0.2
    }
    
    # Determine primary and secondary profiles
    sorted_profiles = sorted(profile_scores.items(), key=lambda x: x[1], reverse=True)
    primary_profile = sorted_profiles[0][0]
    secondary_profile = sorted_profiles[1][0]
    
    # Calculate confidence score (how much the primary profile outscores the secondary)
    confidence = min(100, max(0, (sorted_profiles[0][1] - sorted_profiles[1][1]) / sorted_profiles[0][1] * 100))
    
    # Create profile descriptions
    descriptions = {
        'Tactical Attacker': "You thrive in sharp tactical positions, often taking calculated risks to outmaneuver opponents. Your play is characterized by aggressive moves and complex calculations, though this sometimes leads to higher blunder rates in tense positions.",
        'Positional Player': "Your strength lies in long-term strategic planning and gradual advantage building. You demonstrate excellent control of the board, focusing on piece coordination and pawn structure while maintaining a low blunder rate.",
        'Endgame Specialist': "You excel at converting advantages in the later stages of games. Your technical precision shines in simplified positions, and you demonstrate strong endgame technique with a methodical approach to winning won positions.",
        'Blitz Speedster': "Your rapid decision-making and instinctive play make you a formidable opponent in faster time controls. You play a diverse range of openings and can create pressure through quick, purposeful moves.",
        'Defensive Player': "You show remarkable resilience and defensive resourcefulness. Your play is characterized by solid positional understanding, patience in difficult positions, and an ability to neutralize opponents' attacks.",
        'Unstable Player': "Your play shows significant variance between games. While capable of brilliant moves, consistency remains a challenge. Working on reducing blunders and building a more stable positional foundation would benefit your results."
    }
    
    return {
        'primary_profile': primary_profile,
        'secondary_profile': secondary_profile,
        'description': descriptions[primary_profile],
        'confidence': round(confidence, 1),
        'profile_scores': {k: round(v, 2) for k, v in profile_scores.items()}
    }

def log_message(message, level="INFO"):
    """Custom logging function"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {level}: {message}")
    sys.stdout.flush()

def force_print(message):
    """Force print to all possible outputs"""
    print(message)  # Standard print
    sys.stdout.write(f"{message}\n")  # Write to stdout
    sys.stdout.flush()  # Force flush
    os.system(f'echo "{message}"')  # System echo

def analyze_game(pgn_text, is_user_white=True):
    """Analyze a single game using Stockfish."""
    game = chess.pgn.read_game(io.StringIO(pgn_text))
    if not game:
        return None
    
    evaluations = []
    blunders = []
    mistakes = []
    inaccuracies = []
    move_analysis = []
    
    # Additional metrics for player profiling
    phase_scores = {"opening": [], "middlegame": [], "endgame": []}
    tactical_positions = 0
    positional_positions = 0
    piece_sacs = 0
    defensive_moves = 0
    material_count = []
    
    board = game.board()
    move_count = 0
    for i, move in enumerate(game.mainline_moves()):
        # Only analyze the user's moves based on color
        is_white_move = (i % 2 == 0)
        if (is_user_white and not is_white_move) or (not is_user_white and is_white_move):
            board.push(move)
            continue
            
        move_count += 1
        board.push(move)
        stockfish.set_position(board.move_stack)
        eval = stockfish.get_evaluation()
        
        # Convert mate scores to high numerical values
        score = eval['value']
        if eval['type'] == 'mate':
            score = 10000 if score > 0 else -10000
            
        evaluations.append(score)
        
        # Determine game phase (rough estimate)
        total_pieces = len(board.pieces(chess.PAWN, chess.WHITE)) + len(board.pieces(chess.PAWN, chess.BLACK)) + \
                     len(board.pieces(chess.KNIGHT, chess.WHITE)) + len(board.pieces(chess.KNIGHT, chess.BLACK)) + \
                     len(board.pieces(chess.BISHOP, chess.WHITE)) + len(board.pieces(chess.BISHOP, chess.BLACK)) + \
                     len(board.pieces(chess.ROOK, chess.WHITE)) + len(board.pieces(chess.ROOK, chess.BLACK)) + \
                     len(board.pieces(chess.QUEEN, chess.WHITE)) + len(board.pieces(chess.QUEEN, chess.BLACK))
        
        material_count.append(total_pieces)
        
        if move_count <= 10:
            phase = "opening"
        elif total_pieces <= 10:
            phase = "endgame"
        else:
            phase = "middlegame"
            
        phase_scores[phase].append(score)
        
        # Check for tactical vs positional positions
        if abs(score) > 100:
            tactical_positions += 1
        else:
            positional_positions += 1
            
        # Check for piece sacrifices (rough estimation)
        if (board.is_capture(move) and 
            board.piece_at(move.to_square) and 
            board.piece_at(move.from_square) and
            board.piece_at(move.to_square).piece_type > board.piece_at(move.from_square).piece_type):
            piece_sacs += 1
            
        # Check for defensive moves (rough estimation)
        if eval['type'] == 'cp' and score < -50:
            defensive_moves += 1
        
        # Detect blunders, mistakes, and inaccuracies
        if len(evaluations) > 1:
            diff = abs(evaluations[-1] - evaluations[-2])
            move_str = f"Move {i+1}: {move.uci()}"
            if diff > 300:
                blunders.append(move_str)
            elif diff > 100:
                mistakes.append(move_str)
            elif diff > 50:
                inaccuracies.append(move_str)
                
        # Build move analysis entry
        move_info = {
            'move_number': i + 1,
            'move': move.uci(),
            'evaluation': score,
            'phase': phase
        }
        
        if len(evaluations) > 1:
            move_info['eval_change'] = evaluations[-1] - evaluations[-2]
            
        move_analysis.append(move_info)
    
    # Calculate metrics for player profiling
    blunder_rate = len(blunders) / max(1, move_count)
    avg_opening_score = sum(phase_scores["opening"]) / max(1, len(phase_scores["opening"])) if phase_scores["opening"] else 0
    avg_middlegame_score = sum(phase_scores["middlegame"]) / max(1, len(phase_scores["middlegame"])) if phase_scores["middlegame"] else 0
    avg_endgame_score = sum(phase_scores["endgame"]) / max(1, len(phase_scores["endgame"])) if phase_scores["endgame"] else 0
    
    positional_score = positional_positions / max(1, move_count)
    tactical_score = tactical_positions / max(1, move_count) + piece_sacs / max(1, move_count)
    endgame_score = len(phase_scores["endgame"]) / max(1, move_count)
    defensive_score = defensive_moves / max(1, move_count)
    
    # Calculate evaluation variance (consistency measure)
    evaluation_variance = np.var(evaluations) if evaluations else 0
    
    analysis_result = {
        'evaluations': evaluations,
        'blunders': blunders,
        'mistakes': mistakes,
        'inaccuracies': inaccuracies,
        'move_analysis': move_analysis,
        'metrics': {
            'blunder_rate': blunder_rate,
            'positional_score': positional_score,
            'tactical_score': tactical_score,
            'endgame_score': endgame_score,
            'defensive_score': defensive_score,
            'evaluation_variance': min(1.0, evaluation_variance / 10000) if evaluation_variance > 0 else 0,
            'avg_move_time': 0,  # We don't have move time data from PGN
            'opening_score': avg_opening_score,
            'middlegame_score': avg_middlegame_score,
            'endgame_score': avg_endgame_score
        }
    }
    
    return analysis_result

@app.route('/', methods=['GET'])
def index():
    """Root endpoint that returns basic API information."""
    return jsonify({
        'status': 'success',
        'message': 'Welcome to the Chess Analysis API',
        'endpoints': {
            '/analyze': 'POST - Analyze chess games for a given username',
            '/playstyle': 'GET - Get playstyle information for a user'
        },
        'version': '1.0.0'
    })

@app.route('/analyze', methods=['POST'])
def analyze_games():
    print("\n=== ANALYZE REQUEST RECEIVED ===")
    try:
        data = request.json
        username = data.get('username', '').strip()
        time_filter = data.get('time_filter', 'all')
        
        if not username:
            return jsonify({
                'status': 'error',
                'message': 'Username is required'
            }), 400
            
        print(f"Looking up games for: {username} with time filter: {time_filter}")
        
        # Try to get games
        games = get_all_games(username, time_filter)
        
        if not games or len(games) == 0:
            print(f"No games found for {username}")
            return jsonify({
                'status': 'success',  # Return success to avoid error alert
                'username': username,
                'evaluations': [],
                'blunders': [],
                'mistakes': [],
                'inaccuracies': [],
                'opening_stats': [],
                'player_profile': {
                    'primary_profile': 'Unknown',
                    'secondary_profile': 'Unknown',
                    'description': f'Not enough games found for {username}. Please check the username and try a different time filter.',
                    'confidence': 0,
                    'profile_scores': {}
                },
                'metrics': {
                    'blunder_rate': 0,
                    'positional_score': 0,
                    'tactical_score': 0,
                    'endgame_score': 0,
                    'defensive_score': 0,
                    'evaluation_variance': 0,
                    'avg_move_time': 0
                },
                'games_analyzed': 0,
                'total_games': 0
            })

        # Get opening statistics
        opening_stats = analyze_opening_stats(games)
        
        # Limit to analyzing the most recent 10 games for performance
        games_to_analyze = games[:10]
        
        aggregated_metrics = {
            'blunder_rate': 0,
            'positional_score': 0,
            'tactical_score': 0,
            'endgame_score': 0,
            'defensive_score': 0,
            'evaluation_variance': 0,
            'avg_move_time': 0
        }
        
        all_evaluations = []
        all_blunders = []
        all_mistakes = []
        all_inaccuracies = []
        analyzed_count = 0
        
        for i, game in enumerate(games_to_analyze):
            pgn = game.get('pgn')
            if not pgn:
                continue
                
            is_user_white = game.get('player_color') == 'white'
            
            print(f"Analyzing game {i+1}/{len(games_to_analyze)}: {game.get('url')}")
            
            analysis = analyze_game(pgn, is_user_white)
            if not analysis:
                continue
                
            analyzed_count += 1
            all_evaluations.extend(analysis['evaluations'])
            all_blunders.extend(analysis['blunders'])
            all_mistakes.extend(analysis['mistakes'])
            all_inaccuracies.extend(analysis['inaccuracies'])
            
            # Accumulate metrics for player profiling
            for metric in aggregated_metrics:
                aggregated_metrics[metric] += analysis['metrics'][metric]
        
        # Average the metrics
        if analyzed_count > 0:
            for metric in aggregated_metrics:
                aggregated_metrics[metric] /= analyzed_count
        
        # Determine player profile
        player_profile = determine_player_profile(aggregated_metrics)
        
        print(f"Analysis complete: {analyzed_count} games analyzed")
        
        # Add CORS headers to ensure the response can be processed by the frontend
        response = jsonify({
            'status': 'success',
            'username': username,
            'evaluations': all_evaluations[:100],  # Limit to 100 evaluations for frontend performance
            'blunders': all_blunders[:20],         # Limit to 20 most recent blunders
            'mistakes': all_mistakes[:20],         # Limit to 20 most recent mistakes
            'inaccuracies': all_inaccuracies[:20], # Limit to 20 most recent inaccuracies
            'opening_stats': opening_stats[:10],   # Limit to top 10 openings
            'player_profile': player_profile,
            'metrics': {k: round(v, 3) for k, v in aggregated_metrics.items()},
            'games_analyzed': analyzed_count,
            'total_games': len(games)
        })
        
        # Log the response being sent
        print(f"Sending response with {analyzed_count} analyzed games")
        return response

    except Exception as e:
        print(f"Error during analysis: {str(e)}")
        traceback.print_exc()  # Print the full traceback for debugging
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/playstyle', methods=['GET'])
def get_playstyle():
    username = request.args.get('username')
    time_filter = request.args.get('time_filter', 'all')
    
    if not username:
        return jsonify({
            'status': 'error',
            'message': 'Username is required'
        }), 400
    
    # Get games
    games = get_all_games(username, time_filter)
    
    if not games:
        return jsonify({
            'status': 'success',
            'username': username,
            'total_games': 0,
            'opening_stats': [],
            'message': f'No games found for user {username}.'
        })
    
    # Get opening statistics
    opening_stats = analyze_opening_stats(games)
    
    # Calculate win rates by color
    white_games = [g for g in games if g.get('player_color') == 'white']
    black_games = [g for g in games if g.get('player_color') == 'black']
    
    white_wins = sum(1 for g in white_games if g.get('outcome') == 'win')
    black_wins = sum(1 for g in black_games if g.get('outcome') == 'win')
    
    white_win_rate = round((white_wins / len(white_games) * 100) if white_games else 0, 1)
    black_win_rate = round((black_wins / len(black_games) * 100) if black_games else 0, 1)
    
    return jsonify({
        'status': 'success',
        'username': username,
        'total_games': len(games),
        'opening_stats': opening_stats[:10],
        'color_stats': {
            'white': {
                'games': len(white_games),
                'win_rate': white_win_rate
            },
            'black': {
                'games': len(black_games),
                'win_rate': black_win_rate
            }
        }
    })

if __name__ == '__main__':
    print("\n🚀 Starting Flask Server...")
    print(f"Stockfish path: {ENGINE_PATH}")
    sys.stdout.flush()
    app.run(debug=True, port=5000)