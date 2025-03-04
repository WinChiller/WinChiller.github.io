import requests
from pprint import pprint
from datetime import datetime, timedelta

def get_chesscom_profile(username):
    # Add headers with User-Agent
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    url = f"https://api.chess.com/pub/player/{username}"
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        return f"Error: Unable to fetch data (Status Code: {response.status_code})"

def get_chesscom_stats(username):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    url = f"https://api.chess.com/pub/player/{username}/stats"
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        return None

def get_last_game(username):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    # Get the current month's games
    current_date = datetime.now()
    url = f"https://api.chess.com/pub/player/{username}/games/{current_date.year}/{current_date.month:02d}"
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        games = response.json().get('games', [])
        if games:
            # Get the most recent game
            last_game = games[-1]
            return {
                'white': last_game.get('white', {}).get('username'),
                'black': last_game.get('black', {}).get('username'),
                'time_control': last_game.get('time_control'),
                'pgn': last_game.get('pgn'),
                'result': last_game.get('white', {}).get('result') if username.lower() == last_game.get('white', {}).get('username', '').lower() 
                         else last_game.get('black', {}).get('result'),
                'url': last_game.get('url')
            }
    return None

def extract_first_move(pgn):
    if not pgn:
        return None
    # Find the moves section in the PGN
    moves_start = pgn.rfind(']')
    if moves_start == -1:
        return None
    moves = pgn[moves_start+1:].strip()
    # Get first move
    first_move = moves.split()[0]
    # Remove move number if present (e.g., "1.")
    if '.' in first_move:
        first_move = moves.split()[1]
    return first_move

def get_player_tournaments(username):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    url = f"https://api.chess.com/pub/player/{username}/tournaments"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()['finished'][:5]  # Get last 5 tournaments

def get_player_clubs(username):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    url = f"https://api.chess.com/pub/player/{username}/clubs"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()['clubs']

def get_detailed_stats(stats_data, category):
    if not stats_data or category not in stats_data:
        return None
    
    cat_stats = stats_data[category].get('record', {})
    return {
        'wins': cat_stats.get('win', 0),
        'losses': cat_stats.get('loss', 0),
        'draws': cat_stats.get('draw', 0),
        'win_rate': round(cat_stats.get('win', 0) / 
                         (cat_stats.get('win', 0) + cat_stats.get('loss', 0) + cat_stats.get('draw', 0)) * 100, 2)
                         if cat_stats else 0
    }

def get_monthly_games(username, months=1):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    current_date = datetime.now()
    games = []
    
    for _ in range(months):
        url = f"https://api.chess.com/pub/player/{username}/games/{current_date.year}/{current_date.month:02d}"
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            games.extend(response.json().get('games', []))
        current_date = current_date.replace(day=1) - timedelta(days=1)  # Go to previous month
    
    return games

def calculate_streaks(games):
    current_streak = 0
    max_streak = 0
    
    for game in games:
        result = game.get('result')
        if result == 'win':
            current_streak += 1
            max_streak = max(max_streak, current_streak)
        else:
            current_streak = 0
            
    return {
        'current_streak': current_streak,
        'best_streak': max_streak
    }

def analyze_openings(games):
    openings = {}
    for game in games:
        opening = game.get('opening')
        if opening:
            name = opening.get('name')
            if name in openings:
                openings[name] += 1
            else:
                openings[name] = 1
    return dict(sorted(openings.items(), key=lambda x: x[1], reverse=True)[:5])

def analyze_time_controls(games):
    time_controls = {}
    for game in games:
        tc = game.get('time_control')
        if tc in time_controls:
            time_controls[tc] += 1
        else:
            time_controls[tc] = 1
    return time_controls

def get_games_by_timeframe(username, days):
    """Fetch games for a specific timeframe"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    games = []
    current_date = end_date
    
    while current_date >= start_date:
        url = f"https://api.chess.com/pub/player/{username}/games/{current_date.year}/{current_date.month:02d}"
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            month_games = response.json().get('games', [])
            # Filter games by date
            for game in month_games:
                game_date = datetime.fromtimestamp(game.get('end_time', 0))
                if start_date <= game_date <= end_date:
                    games.append(game)
        current_date = current_date.replace(day=1) - timedelta(days=1)  # Go to previous month
    
    return games

def analyze_openings_detailed(games, username):
    """Analyze openings with win/loss statistics"""
    opening_stats = {}
    
    for game in games:
        opening = game.get('opening')
        if not opening:
            continue
            
        name = opening.get('name')
        if not name:
            continue
            
        # Determine if the player won - Fixed logic here
        is_white = game['white']['username'].lower() == username.lower()
        player_result = game['white']['result'] if is_white else game['black']['result']
        
        if name not in opening_stats:
            opening_stats[name] = {
                'total_games': 0,
                'wins': 0,
                'losses': 0,
                'draws': 0
            }
        
        opening_stats[name]['total_games'] += 1
        if player_result == 'win':
            opening_stats[name]['wins'] += 1
        elif player_result == 'lose':
            opening_stats[name]['losses'] += 1
        else:
            opening_stats[name]['draws'] += 1
    
    # Calculate win rates and sort by total games
    for stats in opening_stats.values():
        total = stats['total_games']
        stats['win_rate'] = round((stats['wins'] / total * 100), 1) if total > 0 else 0
    
    # Sort by total games and get top 10
    sorted_openings = dict(sorted(
        opening_stats.items(), 
        key=lambda x: x[1]['total_games'], 
        reverse=True
    )[:10])
    
    return sorted_openings

def print_opening_analysis(username):
    timeframes = {
        '7 days': 7,
        '30 days': 30,
        '90 days': 90,
        '1 year': 365,
    }
    
    for timeframe_name, days in timeframes.items():
        games = get_games_by_timeframe(username, days)
        if not games:
            continue
            
        print(f"\nOpening Analysis ({timeframe_name}):")
        print("-" * 50)
        opening_stats = analyze_openings_detailed(games, username)
        
        if opening_stats:
            print(f"{'Opening':<30} {'Games':<8} {'Win%':<8} {'W/L/D'}")
            print("-" * 50)
            for opening, stats in opening_stats.items():
                print(
                    f"{opening[:29]:<30} "
                    f"{stats['total_games']:<8} "
                    f"{stats['win_rate']}%{' ':<3} "
                    f"{stats['wins']}/{stats['losses']}/{stats['draws']}"
                )
        else:
            print("No games found in this timeframe")
        print()

if __name__ == "__main__":
    username = input("Enter your Chess.com username: ")
    profile_data = get_chesscom_profile(username)
    stats_data = get_chesscom_stats(username)
    last_game_data = get_last_game(username)
    recent_games = get_monthly_games(username, months=3)  # Last 3 months
    
    if isinstance(profile_data, dict):
        print("\nChess.com Profile Information:")
        print("-" * 30)
        
        # Print profile information
        important_fields = [
            ('Player', profile_data.get('username')),
            ('Name', profile_data.get('name')),
            ('Title', profile_data.get('title')),
            ('Location', profile_data.get('location')),
            ('Status', profile_data.get('status')),
        ]
        
        for field, value in important_fields:
            if value:
                print(f"{field:<12}: {value}")

        # Print ratings information
        if stats_data:
            print("\nRatings Information:")
            print("-" * 30)
            
            # Dictionary to store different time controls and their paths in the API response
            rating_categories = {
                'Rapid': ('chess_rapid', 'last'),
                'Blitz': ('chess_blitz', 'last'),
                'Bullet': ('chess_bullet', 'last'),
                'Daily': ('chess_daily', 'last'),
                'Puzzle': ('tactics', 'last'),
            }
            
            for category, (key, subkey) in rating_categories.items():
                if key in stats_data:
                    rating = stats_data[key].get(subkey, {}).get('rating', 'Not rated')
                    games = stats_data[key].get(subkey, {}).get('games', 0)
                    if rating != 'Not rated':
                        print(f"{category:<12}: {rating} ({games} games)")

        # Print last game information
        if last_game_data:
            print("\nLast Game Information:")
            print("-" * 30)
            print(f"White       : {last_game_data['white']}")
            print(f"Black       : {last_game_data['black']}")
            
            # Convert time control to minutes
            time_control = int(last_game_data['time_control']) if last_game_data['time_control'].isdigit() else "Custom"
            if isinstance(time_control, int):
                time_control = f"{time_control // 60} minutes"
            print(f"Time Control: {time_control}")
            
            # Extract and display first move
            first_move = extract_first_move(last_game_data['pgn'])
            if first_move:
                print(f"First Move  : {first_move}")
            
            print(f"Result      : {last_game_data['result']}")
            print(f"Game URL    : {last_game_data['url']}")

        # Add new sections
        if recent_games:
            print("\nGaming Statistics (Last 3 Months):")
            print("-" * 30)
            
            # Show favorite time controls
            time_prefs = analyze_time_controls(recent_games)
            print("\nFavorite Time Controls:")
            for tc, count in time_prefs.items():
                print(f"- {tc}: {count} games")
            
            # Show opening preferences
            openings = analyze_openings(recent_games)
            print("\nMost Played Openings:")
            for opening, count in openings.items():
                print(f"- {opening}: {count} times")
            
            # Show streaks
            streaks = calculate_streaks(recent_games)
            print(f"\nCurrent Winning Streak: {streaks['current_streak']}")
            print(f"Best Winning Streak: {streaks['best_streak']}")

        # Add opening analysis section
        print("\nDetailed Opening Analysis")
        print("=" * 50)
        print_opening_analysis(username)
    else:
        print(profile_data)  # Print error message if not successful