document.addEventListener('DOMContentLoaded', () => {
    // Function to fetch data from the API and filter it based on the search term
    async function fetchData(searchTerm) {
        try {
            // Fetch data from the local JSON file
            const response = await fetch('http://localhost:8000/travel_recommendation_api.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Ensure the expected structure exists in the JSON data
            if (!data.beaches || !data.countries || !data.temples) {
                throw new Error('Invalid data structure');
            }

            // Filter beaches based on the search term
            const matchingBeaches = data.beaches.filter(beach =>
                beach.name.toLowerCase().includes(searchTerm.toLowerCase())
            );

            // Filter countries and cities based on the search term
            const matchingCountries = data.countries.filter(country =>
                country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                country.cities.some(city => city.name.toLowerCase().includes(searchTerm.toLowerCase()))
            );

            // Flatten the city details from matching countries
            const matchingCities = matchingCountries.flatMap(country =>
                country.cities.filter(city =>
                    city.name.toLowerCase().includes(searchTerm.toLowerCase())
                ).map(city => ({
                    countryName: country.name,
                    cityName: city.name,
                    imageUrl: city.imageUrl,
                    description: city.description
                }))
            );

            // Filter temples based on the search term
            const matchingTemples = data.temples.filter(temple =>
                temple.name.toLowerCase().includes(searchTerm.toLowerCase())
            );

            // Create results object with filtered data
            const results = {
                beaches: matchingBeaches.map(beach => ({
                    name: beach.name,
                    imageUrl: beach.imageUrl,
                    description: beach.description
                })),
                cities: matchingCities,
                temples: matchingTemples.map(temple => ({
                    name: temple.name,
                    imageUrl: temple.imageUrl,
                    description: temple.description
                }))
            };

            // Display the results
            displayResults(results);
        } catch (error) {
            console.error('Error fetching the JSON file:', error);
        }
    }

    // Function to display the search results in the result panel
    function displayResults(results) {
        const resultPanel = document.getElementById('resultPanel');
        const resultContent = document.getElementById('resultContent');
        const allResults = [...results.beaches, ...results.cities, ...results.temples];
        let currentIndex = 0;

        // If there are results, display the result panel and show the first result
        if (allResults.length > 0) {
            resultPanel.style.display = 'block';
            resultPanel.classList.add('resultPanelVisible');
           
            showResult(allResults[currentIndex]);
        } else {
            resultPanel.style.display = 'none';
            resultPanel.classList.remove('resultPanelVisible');
            prevButton.style.display = 'none';
            nextButton.style.display = 'none';
        }

        // Function to show a specific result
        function showResult(result) {
            resultContent.innerHTML = `
                <h3>${result.name || result.cityName}</h3>
                <img src="${result.imageUrl}" alt="${result.name || result.cityName}">
                <p>${result.description}</p>
                ${result.countryName ? `<p><strong>Country:</strong> ${result.countryName}</p>` : ''}
            `;
            prevButton.style.display = currentIndex > 0 ? 'block' : 'none';
            nextButton.style.display = currentIndex < allResults.length - 1 ? 'block' : 'none';
        }

        // Ensure event listeners are added only once
        document.getElementById('prevButton').addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                showResult(allResults[currentIndex]);
            }
        });

        document.getElementById('nextButton').addEventListener('click', () => {
            if (currentIndex < allResults.length - 1) {
                currentIndex++;
                showResult(allResults[currentIndex]);
            }
        });
    }

    // Event listener for the search button
    document.getElementById('searchButton').addEventListener('click', () => {
        const searchTerm = document.getElementById('searchBar').value;
        fetchData(searchTerm);
    });

    // Event listener for the reset button
    document.getElementById('resetButton').addEventListener('click', () => {
        document.getElementById('resultPanel').style.display = 'none';
        document.getElementById('searchBar').value = '';
    });
});
