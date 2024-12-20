const CITIES = {
    london: { lat: 51.5074, lon: -0.1278 },
    paris: { lat: 48.8566, lon: 2.3522 },
    berlin: { lat: 52.5200, lon: 13.4050 },
    rome: { lat: 41.9028, lon: 12.4964 },
    madrid: { lat: 40.4168, lon: -3.7038 },
    amsterdam: { lat: 52.3676, lon: 4.9041 },
    vienna: { lat: 48.2082, lon: 16.3738 },
    prague: { lat: 50.0755, lon: 14.4378 }
};

const WEATHER_ICONS = {
    clear: '☀️',
    pcloudy: '🌤️',
    mcloudy: '⛅',
    cloudy: '☁️',
    humid: '🌫️',
    lightrain: '🌦️',
    oshower: '🌧️',
    ishower: '🌧️',
    lightsnow: '🌨️',
    rain: '🌧️',
    snow: '❄️',
    rainsnow: '🌨️',
    ts: '⛈️',
    tsrain: '⛈️'
};

document.addEventListener('DOMContentLoaded', () => {
    const citySelect = document.getElementById('city-select');
    const weatherDisplay = document.getElementById('weather-display');
    const selectedCityElement = document.getElementById('selected-city');
    const forecastGrid = document.getElementById('forecast-grid');

    citySelect.addEventListener('change', async (e) => {
        const cityName = e.target.value;
        if (!cityName) {
            weatherDisplay.style.display = 'none';
            return;
        }

        const city = CITIES[cityName];
        try {
            const response = await fetch(
                `https://www.7timer.info/bin/api.pl?lon=${city.lon}&lat=${city.lat}&product=civil&output=json`
            );
            const data = await response.json();

            selectedCityElement.textContent =
                cityName.charAt(0).toUpperCase() + cityName.slice(1);
            
            forecastGrid.innerHTML = '';

            data.dataseries.slice(0, 7).forEach(day => {
                const date = new Date();
                date.setHours(date.getHours() + day.timepoint);

                const weatherItem = document.createElement('div');
                weatherItem.className = 'weather-item';
                weatherItem.innerHTML = `
                    <div>${date.toLocaleDateString()}</div>
                    <div style="font-size: 2rem;">${WEATHER_ICONS[day.weather] || '🌈'}</div>
                    <div>${day.temp2m}°C</div>
                    <div>Humidity: ${day.rh2m}%</div>
                `;
                forecastGrid.appendChild(weatherItem);
            });

            weatherDisplay.style.display = 'block';
        } catch (error) {
            console.error('Error fetching weather data:', error);
            alert('Failed to fetch weather data. Please try again later.');
        }
    });
});
