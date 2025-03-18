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
    try {
        console.log(`Fetching recommendations for game ID: ${selectedGame.id}`);

        // ✅ Step 1: Fetch Game Series
        let seriesGames = [];
        let seriesResponse = await fetch(`${BASE_URL}/games/${selectedGame.id}/game-series?key=${API_KEY}`);
        if (seriesResponse.ok) {
            let seriesData = await seriesResponse.json();
            seriesGames = seriesData.results;
        }

        // ✅ Step 2: Fetch Games by Creators
        let creatorGames = [];
        if (selectedGame.creators && selectedGame.creators.length > 0) {
            console.log("Creators Found:", selectedGame.creators);

            for (let creator of selectedGame.creators) {
                let creatorResponse = await fetch(`${BASE_URL}/creators/${creator.id}/games?key=${API_KEY}`);
                
                if (creatorResponse.ok) {
                    let creatorData = await creatorResponse.json();
                    creatorGames.push(...creatorData.results);
                } else {
                    console.warn(`Failed to fetch games for creator ID: ${creator.id}`);
                }
            }
        } else {
            console.warn("No creators found for this game.");
        }

        // ✅ Step 3: Filter creator-based games by matching genre
        const selectedGenres = selectedGame.genres.map(g => g.id);
        creatorGames = creatorGames.filter(game =>
            game.id !== selectedGame.id && // Exclude the selected game
            game.genres.some(g => selectedGenres.includes(g.id)) // Must have at least one common genre
        );

        // ✅ Step 4: Combine series games + filtered creator games & remove duplicates
        let recommendedGames = [...seriesGames, ...creatorGames];
        recommendedGames = [...new Map(recommendedGames.map(game => [game.id, game])).values()];

        console.log("Recommended Games List:", recommendedGames);
        return recommendedGames;

    } catch (error) {
        console.error("Error fetching recommended games:", error);
        return [];
    }
}


// Display selected game & recommendations
async function displayRecommendations(gameId) {
    const selectedGame = await fetchGameDetails(gameId);

    // ✅ Show Selected Game (Only Image & Title, No Details)
    const selectedContainer = document.getElementById('selected-game');
    selectedContainer.innerHTML = `
        <div class="game" onclick="displayGameInfo(${gameId})">
            <img src="${selectedGame.background_image}" alt="${selectedGame.name}">
            <h2>${selectedGame.name}</h2>
        </div>
    `;
    selectedContainer.style.display = 'block';

    // ✅ Display Recommended Games
    const recommendations = await fetchRecommendedGames(selectedGame);
    const container = document.getElementById('recommendations');
    container.innerHTML = '';

    recommendations.forEach(game => {
        const gameElement = document.createElement('div');
        gameElement.classList.add('game');
        gameElement.innerHTML = `
            <img src="${game.background_image}" alt="${game.name}">
            <h3>${game.name}</h3>`
        ;
        gameElement.addEventListener('click', () => displayGameInfo(game.id));
        container.appendChild(gameElement);
    });
}


// ✅ Display Game Info
// ✅ Display Game Info in the Information Box
async function displayGameInfo(gameId) {
    const game = await fetchGameDetails(gameId);

    if (!game) {
        console.error("Game details not found.");
        return;
    }

    const infoBox = document.getElementById('game-info');
    const infoContent = document.getElementById('info-content');

    // ✅ Provide fallback values if data is missing
    const gameImage = game.background_image || 'default-image.jpg'; 
    const gameName = game.name || 'Unknown Title';
    const releasedDate = game.released || 'Unknown';
    const rating = game.rating || 'N/A';
    const genres = game.genres ? game.genres.map(g => g.name).join(', ') : 'N/A';
    const platforms = game.platforms ? game.platforms.map(p => p.platform.name).join(', ') : 'N/A';
    const description = game.description_raw || 'No description available.';

    // ✅ Update Info Box Content
    infoContent.innerHTML = `
        <div class="info-content">
            <div class="info-details">
            <h2>${gameName}</h2>
            <img src="${gameImage}" alt="${gameName}">
                <p><strong>Released:</strong> ${releasedDate}</p>
                <p><strong>Rating:</strong> ${rating}</p>
                <p><strong>Genres:</strong> ${genres}</p>
                <p><strong>Platforms:</strong> ${platforms}</p>
                <p><strong>Description:</strong> ${description}</p>
            </div>
        </div>
        <button id="close-info">✖</button>  <!-- Close Button -->
    `;

    // ✅ Ensure Info Box is Visible
    infoBox.style.display = 'flex';

    // ✅ Attach Event Listener AFTER Adding Close Button
    setTimeout(() => {
        document.getElementById('close-info').addEventListener('click', function () {
            infoBox.style.display = 'none';
        });
    }, 100); // Delay to ensure button exists before attaching event
}





