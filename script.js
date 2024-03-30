document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', function() {
        const artistName = document.getElementById('search-input').value;
        fetchArtistInfo(artistName);
    });

    const homeButton = document.getElementById('home-button');
    homeButton.addEventListener('click', function() {
        window.location.href = 'index.html';
    });
});

function fetchArtistInfo(artist) {
    const apiKey = 'dfa5ecd46c640751eb3a57f30ae610ce';
    const artistInfoUrl = `http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artist)}&api_key=${apiKey}&format=json`;

    fetch(artistInfoUrl)
    .then(response => response.json())
    .then(data => {
        displayArtistInfo(data);
    })
    .catch(error => console.error('Error fetching artist info:', error));
}

function displayArtistInfo(data) {
    const resultsDiv = document.getElementById('results');
    if (data.artist) {
        const artistName = data.artist.name;
        const artistImage = data.artist.image[2]['#text'];
        const artistSummary = data.artist.bio.summary;
        const artistImgElement = document.createElement('img');
        artistImgElement.setAttribute('src', artistImage);
        artistImgElement.setAttribute('alt', artistName);
        artistImgElement.setAttribute('style', 'max-width: 100%; height: auto;');
        resultsDiv.innerHTML = `<h2>${artistName}</h2>
                                <p>${artistSummary}</p>`;
        resultsDiv.appendChild(artistImgElement);

        if (data.artist.similar && data.artist.similar.artist.length > 0) {
            let similarArtistsHTML = '<h3>Similar Artists:</h3><ul>';
            data.artist.similar.artist.forEach(artist => {
                similarArtistsHTML += `<li><a href="#" class="similar-artist">${artist.name}</a></li>`;
            });
            similarArtistsHTML += '</ul>';
            resultsDiv.innerHTML += similarArtistsHTML;

            const artistLinks = document.querySelectorAll('.similar-artist');
            artistLinks.forEach(link => {
                link.addEventListener('click', function(event) {
                    event.preventDefault();
                    const similarArtistName = this.textContent;
                    document.getElementById('search-input').value = similarArtistName;
                    fetchArtistInfo(similarArtistName);
                });
            });
        }
    } else {
        resultsDiv.innerHTML = `<p>Artist not found. Try another search.</p>`;
    }
}
