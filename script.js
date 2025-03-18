// Replace The Movie DB API logic with GiantBomb API logic
const API_KEY = 'f348ad92bad3b8147d5e6eea66f5d1de7555532f';
const PROXY_URL = "https://cors-anywhere.herokuapp.com/";
const BASE_URL = `${PROXY_URL}https://www.giantbomb.com/api/search/?api_key=${API_KEY}&format=json&query=Grand%20theft%20auto&resources=game`;

async function fetchGameDetails(gameName) {
    const response = await fetch(`${BASE_URL}/search/?api_key=${API_KEY}&format=json&query=${gameName}&resources=game`);
    const data = await response.json();
    return data.results[0]; // Assuming first result is the most relevant
}

async function fetchRecommendedGames(selectedGame) {
    const genres = selectedGame.genres.map(genre => genre.id);
    const platforms = selectedGame.platforms.map(platform => platform.id);
    
    const response = await fetch(`${BASE_URL}/games/?api_key=${API_KEY}&format=json`);
    const data = await response.json();
    
    const recommendedGames = data.results.filter(game =>
        game.genres.some(genre => genres.includes(genre.id)) &&
        game.platforms.some(platform => platforms.includes(platform.id))
    ).sort((a, b) => b.original_game_rating - a.original_game_rating);
    
    return recommendedGames;
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
            <img src="${game.image.medium_url}" alt="${game.name}">
            <h3>${game.name}</h3>
            <p>Rating: ${game.original_game_rating || 'N/A'}</p>
        `;
        container.appendChild(gameElement);
    });
}

// Event listener for search functionality
document.getElementById('search-button').addEventListener('click', () => {
    const gameName = document.getElementById('search-input').value;
    displayRecommendations(gameName);
});
