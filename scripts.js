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

const MS_PER_HOUR = 60 * 60 * 1000;

function parseInitTimestamp(init) {
    if (typeof init !== 'string' || init.length < 10) {
        return new Date();
    }

    const year = Number(init.slice(0, 4));
    const month = Number(init.slice(4, 6)) - 1;
    const day = Number(init.slice(6, 8));
    const hour = Number(init.slice(8, 10));

    if ([year, month, day, hour].some(Number.isNaN)) {
        return new Date();
    }

    return new Date(Date.UTC(year, month, day, hour));
}

function getDailyForecasts(dataseries, baseDate) {
    const dayMap = new Map();

    dataseries.forEach(entry => {
        const forecastDate = new Date(baseDate.getTime() + entry.timepoint * MS_PER_HOUR);
        const dayKey = forecastDate.toISOString().split('T')[0];
        if (!dayMap.has(dayKey)) {
            dayMap.set(dayKey, []);
        }
        dayMap.get(dayKey).push({ data: entry, forecastDate });
    });

    const sortedDays = Array.from(dayMap.entries()).sort(
        (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
    );

    const dailyForecasts = [];
    for (const [, entries] of sortedDays) {
        entries.sort((a, b) => {
            const hourDiff = Math.abs(a.forecastDate.getUTCHours() - 12) -
                Math.abs(b.forecastDate.getUTCHours() - 12);
            if (hourDiff !== 0) {
                return hourDiff;
            }
            return a.forecastDate.getTime() - b.forecastDate.getTime();
        });

        dailyForecasts.push(entries[0]);
        if (dailyForecasts.length === 7) {
            break;
        }
    }

    return dailyForecasts;
}

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

            const baseDate = parseInitTimestamp(data.init);
            const dailyForecasts = getDailyForecasts(data.dataseries, baseDate);

            selectedCityElement.textContent =
                cityName.charAt(0).toUpperCase() + cityName.slice(1);

            forecastGrid.innerHTML = '';

            dailyForecasts.forEach(({ data: day, forecastDate }) => {
                const weatherItem = document.createElement('div');
                weatherItem.className = 'weather-item';
                weatherItem.innerHTML = `
                    <div>${forecastDate.toLocaleDateString()}</div>
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
