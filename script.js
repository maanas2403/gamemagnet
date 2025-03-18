// Replace The Movie DB API logic with GiantBomb API logic
const API_KEY = '2a295faa0e534f769010be3cef2a7b33';
const BASE_URL = 'https://api.rawg.io/api';

async function fetchGameDetails(gameName) {
    const response = await fetch(`${BASE_URL}/games?key=${API_KEY}&search=${gameName}`);
    const data = await response.json();
    return data.results[0]; // First game result
}

async function fetchRecommendedGames(selectedGame) {
    const response = await fetch(`${BASE_URL}/games?key=${API_KEY}&genres=${selectedGame.genres[0].slug}&platforms=${selectedGame.platforms[0].id}`);
    const data = await response.json();
    return data.results.sort((a, b) => b.rating - a.rating);
}

async function displayRecommendations(gameName) {
    const selectedGame = await fetchGameDetails(gameName);
    if (!selectedGame) return;

    const recommendations = await fetchRecommendedGames(selectedGame);

    const container = document.getElementById('recommendations');
    container.innerHTML = '';
    recommendations.forEach(game => {
        const gameElement = document.createElement('div');
        gameElement.classList.add('game');
        gameElement.innerHTML = `
            <img src="${game.background_image}" alt="${game.name}">
            <h3>${game.name}</h3>
            <p>Rating: ${game.rating || 'N/A'}</p>
        `;
        container.appendChild(gameElement);
    });
}

document.getElementById('search-button').addEventListener('click', () => {
    const gameName = document.getElementById('search-input').value;
    displayRecommendations(gameName);
});

