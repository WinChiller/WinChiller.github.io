from flask import Flask, request, jsonify
import requests
from collections import Counter
from datetime import datetime
import chess.pgn
import io
from flask_cors import CORS
import traceback
import statistics

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Personality-driven feedback templates
PERSONALITY_FEEDBACK = {
    'positive': {
        'intro': "Great job on your chess journey! Let's look at your strengths and areas for growth.",
        'strength': "You're showing excellent potential with {opening}. Keep developing this strength!",
        'improvement': "With a bit more focus on {mistake} prevention, you'll see even better results!",
        'conclusion': "You're on the right track! Keep practicing and enjoying the game."
    },
    'tactical': {
        'intro': "Let's analyze your tactical performance and find winning combinations.",
        'strength': "Your aggressive play with {opening} creates tactical opportunities.",
        'improvement': "Watch out for {mistake}s - they often come from missed tactical sequences.",
        'conclusion': "Focus on calculation and tactical patterns to sharpen your game."
    },
    'strategic': {
        'intro': "Let's examine your strategic approach and positional understanding.",
        'strength': "Your choice of {opening} shows good strategic awareness.",
        'improvement': "{mistake}s often indicate positions where the long-term plan wasn't clear.",
        'conclusion': "Continue developing your strategic understanding and positional play."
    },
    'critical': {
        'intro': "Let's critically examine your game patterns and decision-making.",
        'strength': "While {opening} suits your style, there's room for improvement in execution.",
        'improvement': "The frequency of {mistake}s suggests a need for more careful evaluation.",
        'conclusion': "Address these critical areas to significantly improve your results."
    },
    'motivational': {
        'intro': "You're taking great steps to improve your chess! Let's build on that momentum.",
        'strength': "Your confidence with {opening} is showing - keep building on this!",
        'improvement': "Don't let {mistake}s discourage you - they're opportunities to learn!",
        'conclusion': "Every game makes you stronger. Keep pushing forward!"
    },
    'calm': {
        'intro': "Let's take a balanced look at your chess development.",
        'strength': "Your steady approach with {opening} provides a solid foundation.",
        'improvement': "Consider how {mistake}s affect your position's harmony.",
        'conclusion': "Maintain your composed approach while working on these aspects."
    }
}

# ECO Opening explanations dictionary
OPENING_EXPLANATIONS = {
    # Common e4 openings (B20-B99)
    "B20": "Sicilian Defense - A sharp, aggressive defense against e4 where Black immediately fights for the center with c5.",
    "B21": "Sicilian Defense, Smith-Morra Gambit - White sacrifices a pawn for rapid development and attacking chances.",
    "B22": "Sicilian Defense, Alapin Variation - A solid anti-Sicilian where White plays c3.",
    "B23": "Sicilian Defense, Closed - Characterized by the moves 1.e4 c5 2.Nc3, leading to more positional play.",
    
    # e4 e5 openings (C20-C99)
    "C20": "King's Pawn Game - Starting with 1.e4 e5, the most common chess opening.",
    "C23": "Bishop's Opening - White develops the king's bishop early to attack Black's weakest square, f7.",
    "C25": "Vienna Game - A flexible opening where White develops the knight to c3 before deciding on a specific setup.",
    "C30": "King's Gambit - An aggressive opening where White sacrifices a pawn for rapid development.",
    "C42": "Petrov's Defense - A solid counter to 1.e4, mirroring White's move with 1...e5.",
    "C45": "Scotch Game - An open game characterized by early d-pawn advance and piece exchanges.",
    
    # d4 openings (D00-D99)
    "D00": "Queen's Pawn Game - Starting with 1.d4, a solid positional opening.",
    "D02": "Queen's Pawn Game, Zukertort Variation - White develops the knight to f3 preparing for a flexible setup.",
    "D04": "Queen's Pawn Game, Colle System - A solid system where White builds a strong pawn center.",
    "D10": "Queen's Gambit Declined, Slav Defense - A solid defense where Black supports the d5 pawn with c6.",
    "D20": "Queen's Gambit Accepted - Black temporarily accepts White's pawn sacrifice for counterplay.",
    
    # Flank openings (A00-A99)
    "A00": "Irregular Openings - Any opening that doesn't begin with 1.e4 or 1.d4.",
    "A04": "Reti Opening - A flexible flank opening starting with 1.Nf3.",
    "A10": "English Opening - Starting with 1.c4, controlling the center from the flank.",
    "A20": "English Opening, King's English - Black responds to 1.c4 with e5.",
    "A40": "Queen's Pawn, Modern Defense - Black responds to 1.d4 with unconventional setups.",
    
    # Semi-Open Games (B00-B19)
    "B00": "Uncommon King's Pawn Opening - Various responses to 1.e4 besides 1...e5 or 1...c5.",
    "B01": "Scandinavian Defense - Black immediately challenges White's center with 1...d5.",
    "B06": "Modern Defense - Black develops flexibly with g6 and Bg7.",
    "B07": "Pirc Defense - A hypermodern opening where Black allows White to build a center to later counterattack.",
    
    # Indian Defenses (E00-E99)
    "E00": "Queen's Pawn, Indian Defense - Black fianchettoes one or both bishops.",
    "E20": "Nimzo-Indian Defense - A solid opening where Black pins White's knight with ...Bb4.",
    "E60": "King's Indian Defense - A hypermodern opening where Black allows White to build a large pawn center.",
}

def get_chess_data(username):
    try:
        headers = {
            'User-Agent': 'ChessAnalyzer/1.0'
        }
        # Get player games from Chess.com API
        games_url = f"https://api.chess.com/pub/player/{username}/games/archives"
        archives_response = requests.get(games_url, headers=headers)
        archives_response.raise_for_status()
        archives = archives_response.json()['archives']

        # Get the most recent archive
        latest_archive = archives[-1]
        games_response = requests.get(latest_archive, headers=headers)
        games_response.raise_for_status()
        games_data = games_response.json()

        # Get player profile
        profile_url = f"https://api.chess.com/pub/player/{username}"
        profile_response = requests.get(profile_url, headers=headers)
        profile_response.raise_for_status()
        profile_data = profile_response.json()

        # Get player stats
        stats_url = f"https://api.chess.com/pub/player/{username}/stats"
        stats_response = requests.get(stats_url, headers=headers)
        stats_response.raise_for_status()
        stats_data = stats_response.json()

        return {
            "profile": profile_data,
            "stats": stats_data,
            "games": games_data.get('games', [])
        }
    except requests.exceptions.RequestException as e:
        print(f"Error fetching chess data: {str(e)}")
        return {"error": f"Failed to fetch chess data: {str(e)}"}

def analyze_game_pgn(pgn_text, player_color):
    try:
        game = chess.pgn.read_game(io.StringIO(pgn_text))
        if not game:
            return None, []

        opening = game.headers.get("ECO", "") + " " + game.headers.get("Opening", "")
        
        mistakes = []
        node = game
        while node.variations:
            node = node.variation(0)
            comment = node.comment.lower()
            
            # Check if it's the player's move
            is_player_move = (
                (player_color == "white" and node.turn())
                or (player_color == "black" and not node.turn())
            )
            
            if is_player_move:
                if "mistake" in comment:
                    mistakes.append("Mistake")
                elif "blunder" in comment:
                    mistakes.append("Blunder")
                elif "inaccuracy" in comment:
                    mistakes.append("Inaccuracy")
                
        return opening.strip(), mistakes

    except Exception as e:
        print(f"Error analyzing game: {e}")
        return None, []

def get_personality_feedback(personality, common_openings, common_mistakes):
    if personality not in PERSONALITY_FEEDBACK:
        personality = 'calm'  # Default to calm if invalid personality
    
    feedback = PERSONALITY_FEEDBACK[personality]
    
    # Get the most common opening and mistake
    main_opening = common_openings[0]["name"] if common_openings else "your preferred openings"
    main_mistake = common_mistakes[0]["type"].lower() if common_mistakes else "tactical oversights"
    
    return {
        'intro': feedback['intro'],
        'strength': feedback['strength'].format(opening=main_opening),
        'improvement': feedback['improvement'].format(mistake=main_mistake),
        'conclusion': feedback['conclusion']
    }

def determine_personality_type(analysis_data):
    """Determine personality type based on playing style and statistics"""
    blunder_rate = analysis_data.get('blunder_rate', 0)
    tactical_rate = analysis_data.get('tactical_opportunities_taken', 0)
    opening_variety = len(analysis_data.get('common_openings', []))
    aggressive_score = analysis_data.get('aggressive_score', 0)
    
    if blunder_rate < 5 and tactical_rate > 70:
        return 'tactical'
    elif blunder_rate < 3 and opening_variety < 3:
        return 'strategic'
    elif blunder_rate > 10:
        return 'critical'
    elif aggressive_score > 70:
        return 'motivational'
    elif tactical_rate < 40 and blunder_rate < 7:
        return 'calm'
    else:
        return 'positive'

def analyze_move_quality(moves, player_color):
    """Analyze the quality of moves in a game"""
    quality_stats = {
        'good_moves': 0,
        'excellent_moves': 0,
        'inaccuracies': 0,
        'mistakes': 0,
        'blunders': 0,
        'missed_wins': 0,
        'total_moves': 0
    }
    
    for move in moves:
        if move['color'] == player_color:
            quality_stats['total_moves'] += 1
            if '!!' in move.get('annotation', ''):
                quality_stats['excellent_moves'] += 1
            elif '!' in move.get('annotation', ''):
                quality_stats['good_moves'] += 1
            elif '??' in move.get('annotation', ''):
                quality_stats['blunders'] += 1
            elif '?' in move.get('annotation', ''):
                quality_stats['mistakes'] += 1
            elif '∓' in move.get('annotation', ''):
                quality_stats['inaccuracies'] += 1
            elif '#' in move.get('annotation', ''):
                quality_stats['missed_wins'] += 1
    
    return quality_stats

def calculate_opening_success_rate(games, openings):
    """Calculate success rate for each opening"""
    opening_stats = {}
    for game in games:
        opening = game.get('opening', '')
        result = game.get('result', '')
        if opening and result:
            if opening not in opening_stats:
                opening_stats[opening] = {'wins': 0, 'losses': 0, 'draws': 0, 'total': 0}
            opening_stats[opening]['total'] += 1
            if result == '1-0':
                opening_stats[opening]['wins'] += 1
            elif result == '0-1':
                opening_stats[opening]['losses'] += 1
            else:
                opening_stats[opening]['draws'] += 1
    
    # Calculate success rates
    for opening in opening_stats:
        total = opening_stats[opening]['total']
        wins = opening_stats[opening]['wins']
        draws = opening_stats[opening]['draws']
        opening_stats[opening]['success_rate'] = ((wins + (draws * 0.5)) / total) * 100 if total > 0 else 0
    
    return opening_stats

def analyze_games(games, username):
    try:
        total_games = len(games)
        if total_games == 0:
            return {
                "analysis": {
                    "total_games_analyzed": 0,
                    "common_openings": [],
                    "common_mistakes": [],
                    "blunder_rate": 0,
                    "tactical_opportunities_taken": 0
                }
            }

        openings = []
        mistakes = []
        blunders = 0
        tactical_opportunities = 0

        for game in games:
            # Extract game data
            if game.get('pgn'):
                # Basic opening detection
                opening = game.get('opening', {}).get('name', 'Unknown Opening')
                openings.append(opening)

                # Count mistakes and blunders based on game analysis
                white_username = game.get('white', {}).get('username', '').lower()
                is_white = username.lower() == white_username
                result = game.get('white' if is_white else 'black', {}).get('result', '')
                
                if result == 'checkmated':
                    blunders += 1
                
                # Simple tactical opportunity detection
                if '!' in game.get('pgn', ''):
                    tactical_opportunities += 1

        # Calculate statistics
        blunder_rate = (blunders / total_games) * 100 if total_games > 0 else 0
        tactical_rate = (tactical_opportunities / total_games) * 100 if total_games > 0 else 0

        # Get common openings
        opening_counter = Counter(openings)
        common_openings = [
            {"name": opening, "count": count, "percentage": (count/total_games)*100}
            for opening, count in opening_counter.most_common(5)
        ]

        # Analyze common mistakes
        mistake_types = ["Blunder", "Missed Tactic", "Time Trouble"]
        common_mistakes = [
            {"type": mistake, "count": blunders, "percentage": (blunders/total_games)*100}
            for mistake in mistake_types
        ]

        return {
            "analysis": {
                "total_games_analyzed": total_games,
                "common_openings": common_openings,
                "common_mistakes": common_mistakes,
                "blunder_rate": blunder_rate,
                "tactical_opportunities_taken": tactical_rate
            }
        }
    except Exception as e:
        print(f"Error in analyze_games: {str(e)}")
        print(traceback.format_exc())  # Print full traceback
        return {"error": f"Analysis failed: {str(e)}"}

@app.route('/analyze', methods=['GET'])
def analyze():
    try:
        username = request.args.get('username')
        if not username:
            return jsonify({"error": "No username provided."})

        print(f"Analyzing user: {username}")  # Debug print
        
        data = get_chess_data(username)
        if 'error' in data:
            return jsonify(data)

        print(f"Retrieved {len(data['games'])} games")  # Debug print

        # Analyze the games data
        analysis_results = analyze_games(data['games'], username)
        if 'error' in analysis_results:
            return jsonify(analysis_results)

        result = {
            "profile": data['profile'],
            "stats": data['stats'],
            "analysis": analysis_results['analysis']
        }

        return jsonify(result)
    except Exception as e:
        print(f"Error in analyze route: {str(e)}")
        print(traceback.format_exc())  # Print full traceback
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)
