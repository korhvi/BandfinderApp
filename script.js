
document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', function () {
        const artistName = document.getElementById('search-input').value;
        fetchArtistInfo(artistName);
    });

    const homeButton = document.getElementById('home-button');
    homeButton.addEventListener('click', function () {
        window.location.href = 'index.html';
    });
});

async function fetchArtistInfo(artist) {
    const apiKey = 'dfa5ecd46c640751eb3a57f30ae610ce';
    const artistInfoUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artist)}&api_key=${apiKey}&format=json`;

    try {
        const response = await fetch(artistInfoUrl);
        const data = await response.json();
        displayArtistInfo(data);

        if (data.artist) {
            const mbid = data.artist.mbid;
            if (mbid) {
                const topTracksUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=${encodeURIComponent(artist)}&api_key=${apiKey}&format=json`;
                const topTracksResponse = await fetch(topTracksUrl);
                const topTracksData = await topTracksResponse.json();
                displayTopTracks(topTracksData);
            }

            const albumInfoUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=${encodeURIComponent(artist)}&api_key=${apiKey}&format=json`;
            const albumResponse = await fetch(albumInfoUrl);
            const albumData = await albumResponse.json();
            displayTopAlbums(albumData);

            const similarArtistsUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${encodeURIComponent(artist)}&api_key=${apiKey}&format=json`;
            const similarArtistsResponse = await fetch(similarArtistsUrl);
            const similarArtistsData = await similarArtistsResponse.json();
            displaySimilarArtists(similarArtistsData);
        }
    } catch (error) {
        console.error('Error fetching artist info:', error);
    }
}

function displayArtistInfo(data) {
    const resultsDiv = document.getElementById('results');
    if (data.artist) {
        const artistName = data.artist.name;
        const artistSummary = data.artist.bio.summary;
        resultsDiv.innerHTML = `<h2>${artistName}</h2>
                                <p>${artistSummary}</p>`;
    } else {
        resultsDiv.innerHTML = `<p>Artist not found. Try another search.</p>`;
    }
}

async function displayTopTracks(topTracksData) {
    const resultsDiv = document.getElementById('results');
    if (topTracksData.toptracks && topTracksData.toptracks.track.length > 0) {
        let topTracksHTML = '<h3>Top Tracks:</h3><div class="top-tracks-container">';
        topTracksData.toptracks.track.slice(0, 15).forEach(track => {
            topTracksHTML += `<div class="top-track" onclick="playTrack('${track.name}')">${track.name}</div>`;
        });
        topTracksHTML += '</div>';
        resultsDiv.insertAdjacentHTML('beforeend', topTracksHTML);
    }
}


function displayTopAlbums(albumData) {
    const resultsDiv = document.getElementById('results');
    if (albumData.topalbums && albumData.topalbums.album.length > 0) {
        let topAlbumsHTML = '<h3>Top Albums:</h3><div class="album-container">';
        albumData.topalbums.album.slice(0, 3).forEach(album => {
            topAlbumsHTML += `<div class="album">
                                <img src="${album.image[2]['#text']}" alt="${album.name}">
                                <p>${album.name}</p>
                              </div>`;
        });
        topAlbumsHTML += '</div>';
        resultsDiv.insertAdjacentHTML('beforeend', topAlbumsHTML);
    }
}

function displaySimilarArtists(similarArtistsData) {
    const resultsDiv = document.getElementById('results');
    if (similarArtistsData.similarartists && similarArtistsData.similarartists.artist.length > 0) {
        let similarArtistsHTML = '<h3>Similar Artists:</h3><div class="similar-artist-container">';
        similarArtistsData.similarartists.artist.slice(0, 12).forEach(artist => {
            similarArtistsHTML += `<div class="similar-artist" onclick="fetchArtistInfo('${artist.name}')">${artist.name}</div>`;
        });
        similarArtistsHTML += '</div>';
        resultsDiv.insertAdjacentHTML('beforeend', similarArtistsHTML);
    }
}
