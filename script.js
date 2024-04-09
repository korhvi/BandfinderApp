document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');

    searchButton.addEventListener('click', searchHandler);
    searchInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            searchHandler();
        }
    });

    const homeButton = document.getElementById('home-button');
    homeButton.addEventListener('click', function () {
        window.location.href = 'index.html';
    });
});

async function searchHandler() {
    const artistName = document.getElementById('search-input').value.trim();
    if (artistName !== '') { 
        await fetchArtistInfo(artistName);
    }
}

async function fetchArtistInfo(artist) {
    const apiKey = 'dfa5ecd46c640751eb3a57f30ae610ce';
    const artistInfoUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artist)}&api_key=${apiKey}&format=json`;

    try {
        const response = await fetch(artistInfoUrl);
        const data = await response.json();
        displayArtistInfo(data);

        if (data.artist) {
            const albumInfoUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=${encodeURIComponent(artist)}&api_key=${apiKey}&format=json`;
            const albumResponse = await fetch(albumInfoUrl);
            const albumData = await albumResponse.json();
            displayTopAlbums(albumData);

            if (albumData.topalbums && albumData.topalbums.album.length > 0) {
                for (let i = 0; i < Math.min(albumData.topalbums.album.length, 4); i++) {
                    const albumName = albumData.topalbums.album[i].name;
                    await displayAlbumTracks(artist, albumName);
                }
            }

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

function displayTopAlbums(albumData) {
    const resultsDiv = document.getElementById('results');
    if (albumData.topalbums && albumData.topalbums.album.length > 0) {
        let topAlbumsHTML = '<h3>Top Albums:</h3><div class="album-container">';
        albumData.topalbums.album.slice(0, 4).forEach(album => {
            const imageIndex = 3;
            const imageUrl = album.image[imageIndex]['#text'];
            topAlbumsHTML += `<div class="album" id="${album.name}" onmouseover="displayAlbumTracks('${encodeURIComponent(album.artist.name)}', '${album.name}')">
                                <img src="${imageUrl}" alt="${album.name}">
                                <p>${album.name}</p>
                                <div class="album-tracks" id="${album.name}-tracks"></div>
                              </div>`;
        });
        topAlbumsHTML += '</div>';
        resultsDiv.insertAdjacentHTML('beforeend', topAlbumsHTML);
    }
}



async function displayAlbumTracks(artist, albumName) {
    const apiKey = 'dfa5ecd46c640751eb3a57f30ae610ce';
    const artistEncoded = encodeURIComponent(artist);
    const albumEncoded = encodeURIComponent(albumName);
    const tracksInfoUrl = `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&artist=${artistEncoded}&album=${albumEncoded}&api_key=${apiKey}&format=json`;

    try {
        const albumTracksDiv = document.getElementById(`${albumName}-tracks`);
        albumTracksDiv.classList.add('tracks');
        const tracksResponse = await fetch(tracksInfoUrl);
        if (!tracksResponse.ok) {
            throw new Error('Failed to fetch album tracks');
        }
        
        const tracksData = await tracksResponse.json();
        const tracksHTML = tracksData.album.tracks.track.map((track, index) => `<p>${index + 1}. ${track.name}</p>`).join('');
        
        albumTracksDiv.innerHTML = tracksHTML;

        albumTracksDiv.style.overflowY = 'auto';
        albumTracksDiv.style.maxHeight = '400px';
        albumTracksDiv.style.position = 'absolute';
        albumTracksDiv.style.right = '10px';
    } catch (error) {
        console.error('Error fetching album tracks:', error);
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

