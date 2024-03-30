document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', function() {
        const artistName = document.getElementById('search-input').value;
        fetchArtistInfo(artistName);
    });
});

function fetchArtistInfo(artist) {

    const apiKey = 'dfa5ecd46c640751eb3a57f30ae610ce';
    const url = `http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artist)}&api_key=${apiKey}&format=json`;

    fetch(url)
    .then(response => response.json())
    .then(data => {
        displayArtistInfo(data);
    })
    .catch(error => console.error('Error fetching data:', error));
}

function displayArtistInfo(data) {
    const resultsDiv = document.getElementById('results');
    if (data.artist) {
        resultsDiv.innerHTML = `<h2>${data.artist.name}</h2>
                                <img src="${data.artist.image[2]['#text']}" alt="${data.artist.name}" style="max-width:100%;height:auto;">
                                <p>${data.artist.bio.summary}</p>`;
    } else {
        resultsDiv.innerHTML = `<p>Artist not found. Try another search.</p>`;
    }
}
