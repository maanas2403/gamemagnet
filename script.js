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
    const response = await fetch(`${BASE_URL}/games?key=${API_KEY}&genres=${selectedGame.genres[0].id}&platforms=${selectedGame.platforms[0].id}`);
    const data = await response.json();
    return data.results.sort((a, b) => b.rating - a.rating);
}

// Display recommendations as hoverable boxes
async function displayRecommendations(gameId) {
    const container = document.getElementById('recommendations');
    
    if (!container) {
        console.error("Element with ID 'recommendations' not found!");
        return;
    }
    
    container.innerHTML = '<p>Loading...</p>'; // Debugging step
    
    const selectedGame = await fetchGameDetails(gameId);
    if (!selectedGame) {
        console.error("No game details found.");
        container.innerHTML = '<p>No game details found.</p>';
        return;
    }

    const recommendations = await fetchRecommendedGames(selectedGame);

    // ✅ Print the list of recommended games in console
    console.log("Recommended Games List:", recommendations);

    container.innerHTML = ''; // Clear previous content

    recommendations.forEach(game => {
        console.log(`Game: ${game.name}, Rating: ${game.rating}, Released: ${game.released}`);

        const gameElement = document.createElement('div');
        gameElement.classList.add('game');
        gameElement.innerHTML = `
            <img src="${game.background_image}" alt="${game.name}">
            <h3>${game.name}</h3>
        `;
        gameElement.addEventListener('click', () => displayGameInfo(game));
        container.appendChild(gameElement);
    });
}


// Display detailed game info in a modal
function displayGameInfo(game) {
    const infoBox = document.getElementById('game-info');
    const infoContent = document.getElementById('info-content');

    infoContent.innerHTML = `
        <h2>${game.name}</h2>
        <img src="${game.background_image}" width="300">
        <p><strong>Rating:</strong> ${game.rating || 'N/A'}</p>
        <p><strong>Released:</strong> ${game.released || 'Unknown'}</p>
        <p><strong>Genres:</strong> ${game.genres.map(g => g.name).join(', ')}</p>
        <p><strong>Platforms:</strong> ${game.platforms.map(p => p.platform.name).join(', ')}</p>
        <p><strong>Description:</strong> ${game.description_raw || 'No description available'}</p>
    `;

    infoBox.classList.remove('hidden');
}

// Close the info box
document.getElementById('close-info').addEventListener('click', () => {
    document.getElementById('game-info').classList.add('hidden');
});
