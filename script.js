// Replace The Movie DB API logic with GiantBomb API logic
const API_KEY = '2a295faa0e534f769010be3cef2a7b33';
const BASE_URL = 'https://api.rawg.io/api';

// Handle search input
document.getElementById('search-input').addEventListener('input', async function() {
    const query = this.value.trim();
    if (query.length < 2) {
        document.getElementById('search-results').style.display = 'none';
        return;
    }

    const response = await fetch(`${BASE_URL}/games?key=${API_KEY}&search=${query}`);
    const data = await response.json();
    
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';
    
    data.results.slice(0, 5).forEach(game => {
        const div = document.createElement('div');
        div.textContent = game.name;
        div.addEventListener('click', () => {
            document.getElementById('search-input').value = game.name;
            resultsContainer.style.display = 'none';
            displayRecommendations(game.id);
        });
        resultsContainer.appendChild(div);
    });

    resultsContainer.style.display = 'block';
});

// Fetch game details
async function fetchGameDetails(gameId) {
    const response = await fetch(`${BASE_URL}/games/${gameId}?key=${API_KEY}`);
    const data = await response.json();
    return data;
}

// Fetch recommended games
async function fetchRecommendedGames(selectedGame) {
    const response = await fetch(`${BASE_URL}/games?key=${API_KEY}`);
    const data = await response.json();
    
    const selectedGameId = selectedGame.id;
    const selectedGenres = selectedGame.genres.map(g => g.id);
    const selectedPlatforms = selectedGame.platforms.map(p => p.platform.id);

    const recommendedGames = data.results.filter(game =>
        game.id !== selectedGameId &&
        (game.genres.some(g => selectedGenres.includes(g.id)) ||
        game.platforms.some(p => selectedPlatforms.includes(p.platform.id)))
    ).sort((a, b) => b.rating - a.rating);

    console.log("Recommended Games List:", recommendedGames);
    return recommendedGames;
}

// Display selected game & recommendations
async function displayRecommendations(gameId) {
    const selectedGame = await fetchGameDetails(gameId);

    // Show Selected Game
    const selectedContainer = document.getElementById('selected-game');
    selectedContainer.innerHTML = `
        <h2>${selectedGame.name}</h2>
        <img src="${selectedGame.background_image}" alt="${selectedGame.name}">
        <p><strong>Rating:</strong> ${selectedGame.rating || 'N/A'}</p>
    `;
    selectedContainer.classList.remove('hidden');
    selectedContainer.addEventListener('click', () => displayGameInfo(selectedGame)); // ✅ Clicking on selected game

    // Display Recommended Games
    const recommendations = await fetchRecommendedGames(selectedGame);
    const container = document.getElementById('recommendations');
    container.innerHTML = '';

    recommendations.forEach(game => {
        const gameElement = document.createElement('div');
        gameElement.classList.add('game');
        gameElement.innerHTML = `
            <img src="${game.background_image}" alt="${game.name}">
            <h3>${game.name}</h3>
        `;
        gameElement.addEventListener('click', () => displayGameInfo(game)); // ✅ Clicking on recommended games
        container.appendChild(gameElement);
    });
}

// ✅ Display Game Info in the Information Box
// ✅ Display Game Info in the Information Box
// ✅ Display Game Info in the Information Box
function displayGameInfo(game) {
    const infoBox = document.getElementById('game-info');
    const infoContent = document.getElementById('info-content');

    infoContent.innerHTML = `
        <div class="info-content">
            <img src="${game.background_image}" alt="${game.name}">
            <div class="info-details">
                <h2>${game.name}</h2>
                <p><strong>Released:</strong> ${game.released}</p>
                <p><strong>Rating:</strong> ${game.rating || 'N/A'}</p>
                <p><strong>Genres:</strong> ${game.genres.map(g => g.name).join(', ')}</p>
                <p><strong>Platforms:</strong> ${game.platforms.map(p => p.platform.name).join(', ')}</p>
                <p><strong>Description:</strong> ${game.description_raw || 'No description available.'}</p>
            </div>
        </div>
        <button id="close-info">✖</button> <!-- ✅ Moved inside dynamically -->
    `;

    infoBox.classList.remove('hidden'); // Show info box

    // ✅ Add event listener dynamically after content is set
    document.getElementById('close-info').addEventListener('click', function () {
        infoBox.classList.add('hidden');
    });
}

