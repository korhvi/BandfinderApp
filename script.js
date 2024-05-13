import { apiKey } from './config.js'; // Import API key from config.js

// Wait for the DOM content to be fully loaded before executing JavaScript
document.addEventListener('DOMContentLoaded', function () {
    // Define fetchArtistInfo globally
    window.fetchArtistInfo = fetchArtistInfo;

    // Get references to search button and input field
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');

    // Add event listeners for search button click and Enter key press
    searchButton.addEventListener('click', searchHandler);
    searchInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            searchHandler(); // Call searchHandler function when Enter key is pressed
        }
    });

    // Get reference to home button and add event listener to redirect to index.html
    const homeButton = document.getElementById('home-button');
    homeButton.addEventListener('click', function () {
        window.location.href = 'index.html'; // Redirect to index.html
    });
});

// Function to handle search action
async function searchHandler() {
    const artistName = document.getElementById('search-input').value.trim(); // Get artist name from input field
    if (artistName !== '') { // Check if artist name is not empty
        await fetchArtistInfo(artistName); // Call fetchArtistInfo function
    }
}

// Function to fetch artist information from Last.fm API
async function fetchArtistInfo(artist) {
    const artistInfoUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artist)}&api_key=${apiKey}&format=json`; // API URL

    try {
        const response = await fetch(artistInfoUrl); // Fetch artist information
        const data = await response.json(); // Convert response to JSON
        displayArtistInfo(data); // Display artist information

        if (data.artist) { // If artist information is available
            await fetchAndDisplayTopAlbums(artist, apiKey); // Fetch and display top albums
            await fetchAndDisplaySimilarArtists(artist, apiKey); // Fetch and display similar artists
        }
    } catch (error) {
        console.error('Error fetching artist info:', error); // Log error if fetching fails
    }
}

// Function to fetch and display top albums of an artist
async function fetchAndDisplayTopAlbums(artist, apiKey) {
    // Construct API URL for top albums
    const albumInfoUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=${encodeURIComponent(artist)}&api_key=${apiKey}&format=json`;
    const albumResponse = await fetch(albumInfoUrl); // Fetch top albums
    const albumData = await albumResponse.json(); // Convert response to JSON
    displayTopAlbum(albumData); // Display top albums
}

// Function to fetch and display similar artists of an artist
async function fetchAndDisplaySimilarArtists(artist, apiKey) {
    // Construct API URL for similar artists
    const similarArtistsUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${encodeURIComponent(artist)}&api_key=${apiKey}&format=json`;
    const similarArtistsResponse = await fetch(similarArtistsUrl); // Fetch similar artists
    const similarArtistsData = await similarArtistsResponse.json(); // Convert response to JSON
    displaySimilarArtists(similarArtistsData); // Display similar artists
}

// Function to display artist information on the web page
function displayArtistInfo(data) {
    const resultsDiv = document.getElementById('results'); // Get reference to results div
    if (data.artist) { // If artist information is available
        const artistName = data.artist.name; // Get artist name
        const artistSummary = data.artist.bio.summary; // Get artist summary
        // Update HTML content of results div with artist name and summary
        resultsDiv.innerHTML = `<h2>${artistName}</h2>
                                <p>${artistSummary}</p>`;
    } else {
        // If artist information is not available, display error message
        resultsDiv.innerHTML = `<p>Artist not found. Try another search.</p>`;
    }
}

// Function to display top albums of an artist on the web page
function displayTopAlbum(albumData) {
    const resultsDiv = document.getElementById('results'); // Get reference to results div
    if (albumData.topalbums && albumData.topalbums.album.length > 0) { // If top albums are available
        let currentIndex = 0; // Initialize index for current album
        const albums = albumData.topalbums.album; // Get array of albums
        let album = albums[currentIndex]; // Get current album
        const imageIndex = 3; // Index of album image in data
        // Find the first non-null album
        while (album.name === "(null)") {
            currentIndex++;
            album = albums[currentIndex];
        }
        // Extract album details
        const imageUrl = album.image[imageIndex]['#text']; // Album image URL
        const albumName = album.name; // Album name
        const artistName = album.artist.name; // Artist name

        // Create HTML elements to display album
        const albumDiv = document.createElement('div'); // Create album div
        albumDiv.classList.add('album'); // Add 'album' class
        albumDiv.id = albumName; // Set ID to album name

        // Create two image elements for album cover
        const img1 = document.createElement('img'); // Create first image element
        img1.src = imageUrl; // Set image source
        img1.alt = albumName; // Set alt text
        img1.classList.add('album-image-1'); // Add class for styling

        const img2 = document.createElement('img'); // Create second image element
        img2.src = imageUrl; // Set image source
        img2.alt = albumName; // Set alt text
        img2.classList.add('album-image-2'); // Add class for styling

        const p = document.createElement('p'); // Create paragraph element for album name
        p.textContent = albumName; // Set text content
        p.classList.add('album-name'); // Add class for styling

        const albumTracksDiv = document.createElement('div'); // Create div for album tracks
        albumTracksDiv.classList.add('album-tracks'); // Add class for styling
        albumTracksDiv.id = `${albumName}-tracks`; // Set ID for identifying album tracks

        // Create a button for navigating to the previous album
        const prevButton = document.createElement('button');
        prevButton.id = 'prev-btn'; // Set ID for styling
        prevButton.innerHTML = `
            <svg viewBox="0 0 24 24" width="60" height="60" fill="currentColor">
                <polygon points="14,6 8,12 14,18"/>
            </svg>
        `; // Set SVG as inner HTML for button content to look like a left-pointing triangle

        // Create a button for navigating to the next album
        const nextButton = document.createElement('button');
        nextButton.id = 'next-btn'; // Set ID for styling
        nextButton.innerHTML = `
            <svg viewBox="0 0 24 24" width="60" height="60" fill="currentColor">
                <polygon points="10,6 16,12 10,18"/>
            </svg>
        `; // Set SVG as inner HTML for button content to look like a right-pointing triangle

        // Append elements to album div
        albumDiv.appendChild(img1); // Append first image
        albumDiv.appendChild(img2); // Append second image
        albumDiv.appendChild(p); // Append album name
        albumDiv.appendChild(albumTracksDiv); // Append album tracks div
        albumDiv.appendChild(prevButton); // Append previous button
        albumDiv.appendChild(nextButton); // Append next button

        resultsDiv.appendChild(albumDiv); // Append album div to results

        displayAlbumTracks(artistName, albumName); // Display album tracks

        // Event listeners for navigation between albums
        prevButton.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateAlbum(currentIndex); // Update displayed album
            }
        });

        nextButton.addEventListener('click', () => {
            if (currentIndex < albums.length - 1) {
                currentIndex++;
                updateAlbum(currentIndex); // Update displayed album
            }
        });

        // Function to update displayed album based on index
        function updateAlbum(index) {
            let newAlbum = albums[index]; // Get new album based on index
            // Find the first non-null album
            while (newAlbum.name === "(null)") {
                index++;
                newAlbum = albums[index];
            }
            // Extract new album details
            const newImageUrl = newAlbum.image[imageIndex]['#text']; // New album image URL
            const newAlbumName = newAlbum.name; // New album name
            const newArtistName = newAlbum.artist.name; // New artist name

            // Update album elements with new details
            const albumDiv = document.getElementById(albumName); // Get album div
            const img1 = albumDiv.querySelector('.album-image-1'); // Get first image element
            img1.src = newImageUrl; // Update image source
            img1.alt = newAlbumName; // Update alt text

            const img2 = albumDiv.querySelector('.album-image-2'); // Get second image element
            img2.src = newImageUrl; // Update image source
            img2.alt = newAlbumName; // Update alt text

            const p = albumDiv.querySelector('.album-name'); // Get paragraph element for album name
            p.textContent = newAlbumName; // Update text content

            const albumTracksDiv = albumDiv.querySelector('.album-tracks'); // Get album tracks div
            albumTracksDiv.id = `${newAlbumName}-tracks`; // Update ID for identifying album tracks

            displayAlbumTracks(newArtistName, newAlbumName); // Display album tracks for new album
        }
    }
}

// Function to fetch and display album tracks
async function displayAlbumTracks(artist, albumName) {
    const artistEncoded = encodeURIComponent(artist); // Encode artist name
    const albumEncoded = encodeURIComponent(albumName); // Encode album name
    const tracksInfoUrl = `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&artist=${artistEncoded}&album=${albumEncoded}&api_key=${apiKey}&format=json`; // API URL for album tracks

    try {
        const albumTracksDiv = document.getElementById(`${albumName}-tracks`); // Get div for album tracks
        albumTracksDiv.classList.add('tracks'); // Add class for styling
        const tracksResponse = await fetch(tracksInfoUrl); // Fetch album tracks
        if (!tracksResponse.ok) {
            throw new Error('Failed to fetch album tracks'); // Throw error if fetching fails
        }
        
        const tracksData = await tracksResponse.json(); // Convert response to JSON
        // Generate HTML for album tracks
        const tracksHTML = tracksData.album.tracks.track.map((track, index) => `<p>${index + 1}. ${track.name}</p>`).join('');
        
        albumTracksDiv.innerHTML = tracksHTML; // Update HTML content with album tracks

        // Set styles for album tracks div
        albumTracksDiv.style.overflowY = 'auto'; // Add vertical scrollbar if necessary
        albumTracksDiv.style.maxHeight = '400px'; // Limit height to prevent excessive scrolling
        albumTracksDiv.style.position = 'absolute'; // Positioning for proper display
        albumTracksDiv.style.right = '10px'; // Positioning for proper display
    } catch (error) {
        console.error('Error fetching album tracks:', error); // Log error if fetching fails
    }
}

// Function to display similar artists on the web page
function displaySimilarArtists(similarArtistsData) {
    const resultsDiv = document.getElementById('results'); // Get reference to results div
    if (similarArtistsData.similarartists && similarArtistsData.similarartists.artist.length > 0) { // If similar artists are available
        let similarArtistsHTML = '<h3>Similar Artists:</h3><div class="similar-artist-container">'; // HTML for similar artists section
        // Loop through similar artists data and create HTML for each
        similarArtistsData.similarartists.artist.slice(0, 12).forEach(artist => {
            // Add onclick event to fetch more information about each artist
            similarArtistsHTML += `<div class="similar-artist" onclick="fetchArtistInfo('${artist.name}')">${artist.name}</div>`;
        });
        similarArtistsHTML += '</div>'; // Close similar artist container div
        resultsDiv.insertAdjacentHTML('beforeend', similarArtistsHTML); // Insert similar artists HTML into results div
    }
}
