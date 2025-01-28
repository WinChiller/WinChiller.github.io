async function fetchAnalysis() {
    const username = document.getElementById("username").value;
    const button = document.getElementById("analyzeButton");
    const resultsDiv = document.getElementById("results");

    if (!username) {
        alert("Please enter a Chess.com username.");
        return;
    }

    // Show loading state
    button.disabled = true;
    button.innerHTML = '<span class="button-text">Analyzing...</span>';
    resultsDiv.innerHTML = '<div class="loading-state">Analyzing your chess games...<br>This may take a moment.</div>';

    try {
        console.log('Fetching analysis for:', username); // Debug log
        const response = await fetch(`http://127.0.0.1:5000/analyze?username=${username}`);
        console.log('Response received:', response.status); // Debug log
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data received:', data); // Debug log

        if (data.error) {
            resultsDiv.innerHTML = `
                <div class="error-message">
                    ${data.error}
                </div>
            `;
            return;
        }

        console.log('Received data:', data); // Debug log

        // Update the results HTML
        resultsDiv.innerHTML = `
            <h2>Analysis for ${username}</h2>
            
            <div class="stats-overview">
                <div class="stat-box">
                    <h4>Games Analyzed</h4>
                    <div class="stat-value">${data.analysis.total_games_analyzed}</div>
                </div>
                <div class="stat-box">
                    <h4>Blunder Rate</h4>
                    <div class="stat-value">${data.analysis.blunder_rate?.toFixed(1) || 0}%</div>
                </div>
                <div class="stat-box">
                    <h4>Tactical Accuracy</h4>
                    <div class="stat-value">${data.analysis.tactical_opportunities_taken?.toFixed(1) || 0}%</div>
                </div>
            </div>

            <div class="openings-section">
                <h3>Common Openings</h3>
                ${data.analysis.common_openings?.map(opening => `
                    <div class="opening-card">
                        <div class="opening-header">${opening.name}</div>
                        <div class="opening-stats">
                            <span>Played: ${opening.count} times</span>
                            <span>${opening.percentage}%</span>
                        </div>
                        <div class="opening-explanation">${opening.explanation || ''}</div>
                    </div>
                `).join('') || 'No opening data available'}
            </div>

            <div class="improvement-section">
                <h3>Areas for Improvement</h3>
                ${data.analysis.common_mistakes?.map(mistake => `
                    <div class="mistake-card ${mistake.type.toLowerCase()}">
                        <div class="mistake-type">${mistake.type}</div>
                        <div class="mistake-count">${mistake.count} times (${mistake.percentage}% of games)</div>
                    </div>
                `).join('') || 'No mistake data available'}
            </div>
        `;
    } catch (error) {
        console.error("Error details:", error); // Detailed error logging
        resultsDiv.innerHTML = `
            <div class="error-message">
                Error: ${error.message}<br>
                Please make sure the server is running and try again.
            </div>
        `;
    } finally {
        // Reset button state
        button.disabled = false;
        button.innerHTML = '<span class="button-text">Analyze Games</span><span class="button-icon">→</span>';
    }
}

// Add event listener when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    const analyzeButton = document.getElementById("analyzeButton");
    if (analyzeButton) {
        analyzeButton.addEventListener("click", fetchAnalysis);
    } else {
        console.error("Analyze button not found!");
    }
});
