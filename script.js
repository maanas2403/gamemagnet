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

        // ✅ Step 2: Fetch Games by Tags (If Available)
        let tagGames = [];
        if (selectedGame.tags && selectedGame.tags.length > 0) {
            console.log("Tags Found:", selectedGame.tags);

            for (let tag of selectedGame.tags.slice(0, 3)) { // Limit to 3 tags to optimize API calls
                let tagResponse = await fetch(`${BASE_URL}/games?key=${API_KEY}&tags=${tag.id}`);
                
                if (tagResponse.ok) {
                    let tagData = await tagResponse.json();
                    tagGames.push(...tagData.results);
                } else {
                    console.warn(`Failed to fetch games for tag ID: ${tag.id}`);
                }
            }
        } else {
            console.warn("No tags found for this game.");
        }

        // ✅ Step 3: Remove Duplicates (Series + Tag-Based Games)
        let recommendedGames = [...seriesGames, ...tagGames];
        recommendedGames = [...new Map(recommendedGames.map(game => [game.id, game])).values()];

        // ✅ Step 4: Exclude the Original Selected Game
        recommendedGames = recommendedGames.filter(game => game.id !== selectedGame.id);

        // ✅ Step 5: Sort by Rating (Highest First)
        recommendedGames.sort((a, b) => (b.rating || 0) - (a.rating || 0));

        console.log("Final Recommended Games List (Sorted by Rating):", recommendedGames);
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

    // ✅ Collect Images: background_image + short_screenshots
    let images = [game.background_image]; // Start with main background image
    if (game.short_screenshots && game.short_screenshots.length > 0) {
        images.push(...game.short_screenshots.map(s => s.image));
    }

    let currentIndex = 0; // Track which image is currently shown

    // ✅ Function to Update Image
    function updateImage(index) {
        document.getElementById('carousel-image').src = images[index];
    }

    // ✅ Setup Image Navigation
    function showNextImage() {
        currentIndex = (currentIndex + 1) % images.length; // Loop forward
        updateImage(currentIndex);
    }

    function showPrevImage() {
        currentIndex = (currentIndex - 1 + images.length) % images.length; // Loop backward
        updateImage(currentIndex);
    }

    // ✅ Info Box Content (Including Image Carousel)
    infoContent.innerHTML = `
        <div class="info-content">
            <div class="image-carousel">
                <button id="prev-image">❮</button>
                <img id="carousel-image" src="${images[0]}" alt="${game.name}">
                <button id="next-image">❯</button>
            </div>
            <div class="info-details">
                <h2>${game.name}</h2>
                <p><strong>Released:</strong> ${game.released || 'Unknown'}</p>
                <p><strong>Rating:</strong> ${game.rating || 'N/A'}</p>
                <p><strong>Genres:</strong> ${game.genres.map(g => g.name).join(', ') || 'N/A'}</p>
                <p><strong>Platforms:</strong> ${game.platforms.map(p => p.platform.name).join(', ') || 'N/A'}</p>
                <p><strong>Description:</strong> ${game.description_raw || 'No description available.'}</p>
            </div>
        </div>
        <button id="close-info">✖</button>
    `;

    // ✅ Display the Info Box
    infoBox.style.display = 'flex';

    // ✅ Attach Event Listeners
    document.getElementById('next-image').addEventListener('click', showNextImage);
    document.getElementById('prev-image').addEventListener('click', showPrevImage);
    document.getElementById('close-info').addEventListener('click', function () {
        infoBox.style.display = 'none';
    });
}






