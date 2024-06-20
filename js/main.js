// url for Rest Countries api
let url = 'https://restcountries.com/v3.1/name/';
let map = L.map('map');

/* searchCountry function try to search and show details about certain country.
 After finding country, finds country's location based on its capital cordinates 
 and show it with Open Street Map and ajax leaflet library */
const searchCountry = async (countryToSearch) => {
   // document.getElementById("weatherCont").style.visibility = "hidden";
   document.getElementById("weatherCont").style.display = "none";
    // Rest Countries api
    try {
        const response = await fetch(url + countryToSearch);              // Start fetch.
        if (!response.ok) throw new Error('something went wrong'); // If there is an error throw error message.
        const country = await response.json();                     // Convert the loaded JSON text to a JavaScript object.

        let ul = document.getElementById('countryDetails');
        ul.innerHTML = '';

        // console.log(country)

        let li = document.createElement('li');
        // Elements for country's name
        let name = document.createElement('h2');
        name.innerText = country[0].name.common;
        li.appendChild(name);

        // Elements for country's capital
        let capital = document.createElement('p');
        capital.innerText = `Capital: ${country[0].capital}`;
        li.appendChild(capital);

        // Elements for country's lanquages
        let languages = document.createElement('p');
        // Put object values to list
        let languagesList = Object.values(country[0].languages);
        languages.innerHTML = `Languages: ${languagesList.join(", ")}`;
        li.appendChild(languages);

        // Elements for Country's currencies
        let currencies = document.createElement('p');
        // Put object values to list
        let currenciesValues = Object.values(country[0].currencies);
        currenciesValues = Object.values(currenciesValues[0]);
        // currency's name=currenciesValues[0] and currency's symbol=currenciesValues[1]
        currencies.innerHTML = `Currency: ${currenciesValues[0]} (${currenciesValues[1]})`;
        li.appendChild(currencies);

        try {
            // Elements for Country's flag
            let flag = document.createElement('img');
            flag.src = country[0].flags.png;
            flag.className = 'flag';
            li.appendChild(flag);
        } catch (error) {
            console.log(error);
        }

        // Country's capital's coordinates
        let lat = country[0].capitalInfo.latlng[0];
        let lon = country[0].capitalInfo.latlng[1];

        let br = document.createElement("br");
        li.appendChild(br);

        // Elements show temperature button
        let buttonShowWeather = document.createElement("button");
        buttonShowWeather.textContent = 'Show temperature';
        buttonShowWeather.className = 'weatherButton';

        buttonShowWeather.addEventListener('click', () => showWeather(lat, lon));

        li.appendChild(buttonShowWeather);
        ul.appendChild(li);

        // Open Street Map api elements and features
        map.remove('map');

        map = L.map('map').setView([lat, lon], 3);
        let tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap',
            maxZoom: 18,
        });
        tiles.addTo(map);

        let locationMarker = L.marker([lat, lon]).addTo(map);
        let locationName = country[0].capital;
        locationMarker.bindPopup("<b>" + locationName + "</b>").openPopup();

        document.getElementById("map").style.visibility = "visible";

        // Scroll right in to id "cont" element
        document.getElementById('cont').scrollIntoView();

    } catch (error) {
        console.log(error);
    }
}

// showWeather function search (based on capital's coordinates) and show 7 days temperatures in the linechart.
const showWeather = async (latitude, longitude) => {
    // Use Open-Meteo weather api - https://open-meteo.com/en
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relativehumidity_2m,windspeed_10m`);
        if (!response.ok) throw new Error('something went wrong'); // If there is an error throw error message
        const weather = await response.json();
        // console.log(weather)

        let time = weather.hourly.time;
        let temperature = weather.hourly.temperature_2m;

        let xValues = [];
        let yValues = [];

        // For loop for selecting temperature values and time values from 12 o'clock each day.
        for (i = 12; i < 168; i = i + 24) {
            // Substring to show only yyyy-mm-dd values.
            xValues.push(time[i].substring(0, 10));
            yValues.push(temperature[i]);
            // console.log(time[i])
        }

        // Line chart settings. 
        new Chart("myChart", {
            type: "line",
            data: {
                labels: xValues,
                datasets: [{
                    fill: false,
                    lineTension: 0,
                    backgroundColor: "rgba(0,0,255,1.0)",
                    borderColor: "rgba(0,0,255,0.1)",
                    data: yValues
                }]
            },
            options: {
                legend: { display: false },
                scales: {
                    yAxes: [{ ticks: { min: Math.floor(Math.min(...yValues) - 1), max: Math.ceil(Math.max(...yValues) + 1) } }],
                }
            }
        });

        //document.getElementById("weatherCont").style.visibility = "visible";
        document.getElementById("weatherCont").style.display = "flex";

    } catch (error) {
        console.log(error);
    }
}

const button = document.getElementById('searchButton');

// activateSearch function check if user has select some country's name value and if so pass the value to searchCountry function.
const activateSearch = () => {
    let country = document.getElementById('countrySearch').value;
    if (country) {
        searchCountry(country);
    }
}

button.addEventListener('click', activateSearch);