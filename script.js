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
            displayTopAlbum(albumData);
        }

        const similarArtistsUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${encodeURIComponent(artist)}&api_key=${apiKey}&format=json`;
        const similarArtistsResponse = await fetch(similarArtistsUrl);
        const similarArtistsData = await similarArtistsResponse.json();
        displaySimilarArtists(similarArtistsData);
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

function displayTopAlbum(albumData) {
    const resultsDiv = document.getElementById('results');
    if (albumData.topalbums && albumData.topalbums.album.length > 0) {
        let currentIndex = 0; 
        const albums = albumData.topalbums.album; 
        const album = albums[currentIndex]; 
        const imageIndex = 3;
        const imageUrl = album.image[imageIndex]['#text'];
        const albumName = album.name;
        const artistName = album.artist.name;

        resultsDiv.innerHTML += `<div class="album" id="${albumName}">
                                    <img src="${imageUrl}" alt="${albumName}">
                                    <p>${albumName}</p>
                                    <div class="album-tracks" id="${albumName}-tracks"></div>
                                    <button id="prev-btn">&lt;</button>
                                    <button id="next-btn">&gt;</button>
                                </div>`;
        displayAlbumTracks(artistName, albumName);

        const prevButton = document.getElementById('prev-btn');
        const nextButton = document.getElementById('next-btn');

        prevButton.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateAlbum(currentIndex);
            }
        });

        nextButton.addEventListener('click', () => {
            if (currentIndex < albums.length - 1) {
                currentIndex++;
                updateAlbum(currentIndex);
            }
        });

        function updateAlbum(index) {
            const newAlbum = albums[index];
            const newImageUrl = newAlbum.image[imageIndex]['#text'];
            const newAlbumName = newAlbum.name;
            const newArtistName = newAlbum.artist.name;

            const albumDiv = document.getElementById(`${albumName}`);
            albumDiv.innerHTML = `<img src="${newImageUrl}" alt="${newAlbumName}">
                                    <p>${newAlbumName}</p>
                                    <div class="album-tracks" id="${newAlbumName}-tracks"></div>
                                    <button id="prev-btn">&lt;</button>
                                    <button id="next-btn">&gt;</button>`;

            displayAlbumTracks(newArtistName, newAlbumName);

            const newPrevButton = document.getElementById('prev-btn');
            const newNextButton = document.getElementById('next-btn');

            newPrevButton.addEventListener('click', () => {
                if (index > 0) {
                    updateAlbum(index - 1);
                }
            });

            newNextButton.addEventListener('click', () => {
                if (index < albums.length - 1) {
                    updateAlbum(index + 1);
                }
            });
        }
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
