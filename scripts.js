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

const HUMIDITY_TOOLTIP_BASE = 'Relative humidity at 2 meters above ground level';

const getHumidityDetails = (rh2m) => {
    const parseHumidityNumber = (value) => {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }

        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (!trimmed) {
                return null;
            }

            const sanitized = trimmed.endsWith('%') ? trimmed.slice(0, -1) : trimmed;
            const numeric = Number(sanitized);
            return Number.isFinite(numeric) ? numeric : null;
        }

        return null;
    };

    const fallback = {
        display: 'N/A',
        tooltip: `${HUMIDITY_TOOLTIP_BASE}. Data unavailable.`,
    };

    if (rh2m && typeof rh2m === 'object' && !Array.isArray(rh2m)) {
        const min = parseHumidityNumber(rh2m.min);
        const max = parseHumidityNumber(rh2m.max);

        if (min !== null && max !== null) {
            return {
                display: `${min}–${max}%`,
                tooltip: `${HUMIDITY_TOOLTIP_BASE}. Displayed as the minimum–maximum range for this forecast period.`,
            };
        }

        if (min !== null) {
            return {
                display: `${min}%`,
                tooltip: `${HUMIDITY_TOOLTIP_BASE}. Only the minimum value is available for this forecast period.`,
            };
        }

        if (max !== null) {
            return {
                display: `${max}%`,
                tooltip: `${HUMIDITY_TOOLTIP_BASE}. Only the maximum value is available for this forecast period.`,
            };
        }
    }

    const singleValue = parseHumidityNumber(rh2m);
    if (singleValue !== null) {
        return {
            display: `${singleValue}%`,
            tooltip: `${HUMIDITY_TOOLTIP_BASE}. Displayed as a single representative value for this forecast period.`,
        };
    }

    if (typeof rh2m === 'string' && rh2m.trim()) {
        const trimmed = rh2m.trim();
        const withUnit = trimmed.endsWith('%') ? trimmed : `${trimmed}%`;
        return {
            display: withUnit,
            tooltip: `${HUMIDITY_TOOLTIP_BASE}.`,
        };
    }

    return fallback;
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
                const humidityDetails = getHumidityDetails(day.rh2m);
                weatherItem.innerHTML = `
                    <div>${date.toLocaleDateString()}</div>
                    <div style="font-size: 2rem;">${WEATHER_ICONS[day.weather] || '🌈'}</div>
                    <div>${day.temp2m}°C</div>
                    <div>
                        Humidity (2m):
                        <span class="humidity-value" title="${humidityDetails.tooltip}">${humidityDetails.display}</span>
                    </div>
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
