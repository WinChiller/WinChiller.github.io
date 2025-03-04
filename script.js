// Add this at the top of your file to check if the script loads
console.log('Script loaded!');

document.addEventListener('DOMContentLoaded', () => {
    // Initialize time filter dropdown
    const timeFilterSelect = document.createElement('select');
    timeFilterSelect.id = 'timeFilterSelect';
    timeFilterSelect.innerHTML = `
        <option value="7days">Last 7 days</option>
        <option value="30days" selected>Last 30 days</option>
        <option value="90days">Last 90 days</option>
        <option value="1year">Last year</option>
        <option value="2years">Last 2 years</option>
        <option value="3years">Last 3 years</option>
        <option value="all">All time</option>
    `;
    
    const filterLabel = document.createElement('label');
    filterLabel.htmlFor = 'timeFilterSelect';
    filterLabel.textContent = 'Time period: ';
    
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container';
    filterContainer.appendChild(filterLabel);
    filterContainer.appendChild(timeFilterSelect);
    
    const form = document.getElementById('usernameForm');
    form.appendChild(filterContainer);
    
    // Add loading spinner container
    const loadingSpinner = document.createElement('div');
    loadingSpinner.id = 'loadingSpinner';
    loadingSpinner.className = 'spinner';
    loadingSpinner.style.display = 'none';
    document.querySelector('.container').appendChild(loadingSpinner);
    
    // Create sections for opening stats and player profile
    const resultsDiv = document.getElementById('results');
    
    const openingStatsDiv = document.createElement('div');
    openingStatsDiv.id = 'openingStats';
    openingStatsDiv.innerHTML = '<h2>Your Openings</h2>';
    
    const profileDiv = document.createElement('div');
    profileDiv.id = 'playerProfile';
    profileDiv.innerHTML = '<h2>Your Chess Profile</h2>';
    
    // Insert them before the first element in resultsDiv
    resultsDiv.insertBefore(profileDiv, resultsDiv.firstChild);
    resultsDiv.insertBefore(openingStatsDiv, resultsDiv.firstChild);
});

document.getElementById('usernameForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('usernameInput').value;
    const timeFilter = document.getElementById('timeFilterSelect').value;
    console.log('Analyzing games for:', username, 'with filter:', timeFilter);
    
    // Show loading spinner
    const spinner = document.getElementById('loadingSpinner');
    spinner.style.display = 'block';
    
    try {
        const response = await fetch('http://127.0.0.1:5000/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                username: username,
                time_filter: timeFilter
            })
        });

        const data = await response.json();
        console.log('Received response:', data);
        
        // Hide loading spinner
        spinner.style.display = 'none';

        if (data.status === 'error') {
            alert(data.message);
            return;
        }

        if (data.evaluations && data.evaluations.length > 0) {
            displayResults(data);
        } else {
            alert('No analysis data received');
        }
    } catch (error) {
        console.error('Error:', error);
        // Hide loading spinner on error
        spinner.style.display = 'none';
        alert('Error analyzing games: ' + error.message);
    }
});

function displayResults(data) {
    // Display opening statistics
    displayOpeningStats(data.opening_stats);
    
    // Display player profile
    displayPlayerProfile(data.player_profile, data.metrics);
    
    // Display move analysis
    const blunders = document.getElementById('blunders');
    const mistakes = document.getElementById('mistakes');
    const inaccuracies = document.getElementById('inaccuracies');

    blunders.innerHTML = `<h3>Blunders (${data.blunders.length})</h3><ul>${data.blunders.map(move => `<li>${move}</li>`).join('')}</ul>`;
    mistakes.innerHTML = `<h3>Mistakes (${data.mistakes.length})</h3><ul>${data.mistakes.map(move => `<li>${move}</li>`).join('')}</ul>`;
    inaccuracies.innerHTML = `<h3>Inaccuracies (${data.inaccuracies.length})</h3><ul>${data.inaccuracies.map(move => `<li>${move}</li>`).join('')}</ul>`;

    // Display evaluation graph
    if (data.evaluations && data.evaluations.length > 0) {
        // Clear previous chart if it exists
        const canvas = document.getElementById('analysisGraph');
        const ctx = canvas.getContext('2d');
        
        // Get label data 
        const moveLabels = data.evaluations.map((_, i) => `Move ${i + 1}`);
        
        // Create new chart
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: moveLabels,
                datasets: [{
                    label: 'Evaluation',
                    data: data.evaluations,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false,
                        max: 1000, 
                        min: -1000
                    }
                }
            }
        });
    }

    // Create heatmap
    if (data.evaluations && data.evaluations.length > 0) {
        const heatmap = d3.select('#heatmap');
        heatmap.selectAll('*').remove(); // Clear previous heatmap
        
        const svg = heatmap.append('svg')
            .attr('width', 800)
            .attr('height', 100);
    
        const heatmapData = data.evaluations.map((score, i) => ({ 
            move: i + 1, 
            score: Math.max(-1000, Math.min(1000, score)) // Clamp values
        }));
        
        svg.selectAll('rect')
            .data(heatmapData)
            .enter()
            .append('rect')
            .attr('x', (d, i) => i * (800 / heatmapData.length))
            .attr('y', d => 50 - Math.min(45, Math.abs(d.score) / 20))
            .attr('width', (800 / heatmapData.length) - 1)
            .attr('height', d => Math.min(90, Math.abs(d.score) / 10))
            .attr('fill', d => d.score > 0 ? '#4CAF50' : '#f44336')
            .attr('opacity', 0.7);
    }
}

function displayOpeningStats(openingStats) {
    const openingStatsDiv = document.getElementById('openingStats');
    
    if (!openingStats || openingStats.length === 0) {
        openingStatsDiv.innerHTML = '<h2>Your Openings</h2><p>Not enough games to analyze opening statistics.</p>';
        return;
    }
    
    let html = '<h2>Your Openings</h2>';
    html += '<table class="opening-stats">';
    html += '<tr><th>Opening</th><th>Games</th><th>Win Rate</th><th>W/L/D</th></tr>';
    
    openingStats.forEach(opening => {
        html += `
            <tr>
                <td>${opening.opening}</td>
                <td>${opening.total}</td>
                <td>${opening.win_rate}%</td>
                <td>${opening.wins}/${opening.losses}/${opening.draws}</td>
            </tr>
        `;
    });
    
    html += '</table>';
    openingStatsDiv.innerHTML = html;
}

function displayPlayerProfile(profile, metrics) {
    const profileDiv = document.getElementById('playerProfile');
    
    if (!profile) {
        profileDiv.innerHTML = '<h2>Your Chess Profile</h2><p>Not enough games to determine your chess profile.</p>';
        return;
    }
    
    let html = `
        <h2>Your Chess Profile</h2>
        <div class="profile-card">
            <h3 class="profile-title">${profile.primary_profile}</h3>
            <p class="profile-description">${profile.description}</p>
            <div class="profile-confidence">Confidence: ${profile.confidence}%</div>
            <div class="profile-secondary">Secondary style: ${profile.secondary_profile}</div>
        </div>
        
        <div class="profile-metrics">
            <h3>Playing Style Metrics</h3>
            <div class="metrics-container">
                <div class="metric">
                    <div class="metric-label">Blunder Rate</div>
                    <div class="metric-value">${Math.round(metrics.blunder_rate * 100)}%</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Tactical</div>
                    <div class="metric-bar">
                        <div class="metric-fill" style="width: ${Math.min(100, metrics.tactical_score * 100)}%"></div>
                    </div>
                </div>
                <div class="metric">
                    <div class="metric-label">Positional</div>
                    <div class="metric-bar">
                        <div class="metric-fill" style="width: ${Math.min(100, metrics.positional_score * 100)}%"></div>
                    </div>
                </div>
                <div class="metric">
                    <div class="metric-label">Defensive</div>
                    <div class="metric-bar">
                        <div class="metric-fill" style="width: ${Math.min(100, metrics.defensive_score * 100)}%"></div>
                    </div>
                </div>
                <div class="metric">
                    <div class="metric-label">Endgame</div>
                    <div class="metric-bar">
                        <div class="metric-fill" style="width: ${Math.min(100, metrics.endgame_score * 100)}%"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    profileDiv.innerHTML = html;
}