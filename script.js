// Header responsive
const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('menu');

if (menuBtn && menu) {
    menuBtn.setAttribute('aria-expanded', 'false');

    menuBtn.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (e) => {
        const target = e.target;
        if (!menu.contains(target) && !menuBtn.contains(target) && menu.classList.contains('open')) {
            menu.classList.remove('open');
            menuBtn.setAttribute('aria-expanded', 'false');
        }
    });
}

const searchButton = document.getElementById('searchButton');
const clearButton = document.getElementById('clearButton');
const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('resultsContainer');

let recommendationsData = null;

const fallbackData = {
    countries: [
        {
            id: 1,
            name: 'Australia',
            cities: [
                {
                    name: 'Sydney, Australia',
                    imageUrl: 'assets/images/sydney.jpg',
                    description: 'A vibrant city known for its iconic landmarks like the Sydney Opera House and Sydney Harbour Bridge.'
                },
                {
                    name: 'Melbourne, Australia',
                    imageUrl: 'assets/images/melbourne.jpg',
                    description: 'A cultural hub famous for its art, food, and diverse neighborhoods.'
                }
            ]
        },
        {
            id: 2,
            name: 'Japan',
            cities: [
                {
                    name: 'Tokyo, Japan',
                    imageUrl: 'assets/images/tokyo.jpg',
                    description: 'A bustling metropolis blending tradition and modernity, famous for its cherry blossoms and rich culture.'
                },
                {
                    name: 'Kyoto, Japan',
                    imageUrl: 'assets/images/kyoto.jpg',
                    description: 'Known for its historic temples, gardens, and traditional tea houses.'
                }
            ]
        },
        {
            id: 3,
            name: 'Brazil',
            cities: [
                {
                    name: 'Rio de Janeiro, Brazil',
                    imageUrl: 'assets/images/rio.jpg',
                    description: 'A lively city known for its stunning beaches, vibrant carnival celebrations, and iconic landmarks.'
                },
                {
                    name: 'São Paulo, Brazil',
                    imageUrl: 'assets/images/sao-paulo.jpg',
                    description: 'The financial hub with diverse culture, arts, and a vibrant nightlife.'
                }
            ]
        }
    ],
    temples: [
        {
            id: 1,
            name: 'Angkor Wat, Cambodia',
            imageUrl: 'assets/images/angkor-wat.jpg',
            description: 'A UNESCO World Heritage site and the largest religious monument in the world.'
        },
        {
            id: 2,
            name: 'Taj Mahal, India',
            imageUrl: 'assets/images/taj-mahal.jpg',
            description: 'An iconic symbol of love and a masterpiece of Mughal architecture.'
        }
    ],
    beaches: [
        {
            id: 1,
            name: 'Bora Bora, French Polynesia',
            imageUrl: 'assets/images/bora-bora.jpg',
            description: 'An island known for its stunning turquoise waters and luxurious overwater bungalows.'
        },
        {
            id: 2,
            name: 'Copacabana Beach, Brazil',
            imageUrl: 'assets/images/copacabana.jpg',
            description: 'A famous beach in Rio de Janeiro, Brazil, with a vibrant atmosphere and scenic views.'
        }
    ]
};

// Load the travel recommendations data from the JSON file.
// If the browser cannot fetch the file, fall back to a bundled dataset.
async function loadData() {
    if (recommendationsData) {
        return recommendationsData;
    }

    try {
        const response = await fetch('./travel_recommendation_api.json', { cache: 'no-store' });
        if (!response.ok) {
            throw new Error('Unable to load travel data');
        }

        recommendationsData = await response.json();
        return recommendationsData;
    } catch (error) {
        console.warn('Falling back to bundled travel data:', error);
        recommendationsData = fallbackData;
        return recommendationsData;
    }
}

// Normalize text for case-insensitive and partial matching.
function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
}

// Search the JSON data for country, city, temple, and beach matches.
function searchRecommendations(data, query) {
    const normalizedQuery = normalizeText(query);

    if (!data || !normalizedQuery) {
        return [];
    }

    const results = [];
    const seen = new Set();

    const addResult = (item, type) => {
        const uniqueKey = `${type}:${item.name}`;
        if (seen.has(uniqueKey)) {
            return;
        }

        seen.add(uniqueKey);
        results.push({ ...item, type });
    };

    const countryMatch = data.countries.find((country) => normalizeText(country.name).includes(normalizedQuery));

    if (countryMatch) {
        countryMatch.cities.forEach((city) => addResult(city, 'city'));
        return results;
    }

    data.countries.forEach((country) => {
        country.cities.forEach((city) => {
            const matchesName = normalizeText(city.name).includes(normalizedQuery);
            const matchesDescription = normalizeText(city.description).includes(normalizedQuery);

            if (matchesName || matchesDescription) {
                addResult(city, 'city');
            }
        });
    });

    data.temples.forEach((temple) => {
        const matchesName = normalizeText(temple.name).includes(normalizedQuery);
        const matchesDescription = normalizeText(temple.description).includes(normalizedQuery);

        if (matchesName || matchesDescription) {
            addResult(temple, 'temple');
        }
    });

    data.beaches.forEach((beach) => {
        const matchesName = normalizeText(beach.name).includes(normalizedQuery);
        const matchesDescription = normalizeText(beach.description).includes(normalizedQuery);

        if (matchesName || matchesDescription) {
            addResult(beach, 'beach');
        }
    });

    return results;
}

// Create a single card using the existing card markup structure.
function createCard(item) {
    const card = document.createElement('div');
    card.className = 'card';

    const image = document.createElement('img');
    image.className = 'card-image';
    image.src = item.imageUrl;
    image.alt = item.name;

    const content = document.createElement('div');
    content.className = 'card-content';

    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = item.name;

    const description = document.createElement('p');
    description.className = 'description';
    description.textContent = item.description;

    content.appendChild(title);
    content.appendChild(description);
    card.appendChild(image);
    card.appendChild(content);

    return card;
}

// Render the results into the hero section or show a friendly message when empty.
function renderResults(results) {
    if (!resultsContainer) {
        return;
    }

    resultsContainer.innerHTML = '';

    if (results.length === 0) {
        const emptyState = document.createElement('p');
        emptyState.textContent = 'No results found.';
        resultsContainer.appendChild(emptyState);
        return;
    }

    const fragment = document.createDocumentFragment();
    results.forEach((item) => {
        fragment.appendChild(createCard(item));
    });

    resultsContainer.appendChild(fragment);
}

// Handle the search action when the user clicks the Search button.
async function handleSearch() {
    const data = await loadData();
    const query = searchInput ? searchInput.value : '';
    const results = searchRecommendations(data, query);
    renderResults(results);
}

if (searchButton) {
    searchButton.addEventListener('click', handleSearch);
}

if (clearButton && searchInput && resultsContainer) {
    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        resultsContainer.innerHTML = '';
    });
}
