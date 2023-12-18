const fetch = require('cross-fetch');
const fs = require('fs');

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

const address = process.env.SERVER_ADDRESS || 'http://localhost';
const port = process.env.SERVER_PORT || 6969;
const basePath = `${address}:${port}`;


let accessToken = null;
let refreshToken = null;
let tokenExpirationTime = 0;

async function getAccessToken() {
    if (accessToken && Date.now() < tokenExpirationTime) {
        return accessToken;
    }

    let authorizationCode;
    try {
        authorizationCode = fs.readFileSync('spotify-user-code.txt', 'utf8');
    } catch (err) {
        console.error('Error reading Spotify user code:', err);
        throw new Error('Authorization code not found');
    }

    const params = new URLSearchParams();
    params.append('code', authorizationCode);
    params.append('grant_type', 'authorization_code');
    const redirectUri = `${basePath}/callback`;

    params.append('redirect_uri', redirectUri);

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
        },
        body: params.toString(),
    });

    const data = await response.json();

    accessToken = data.access_token;
    refreshToken = data.refresh_token;
    tokenExpirationTime = Date.now() + data.expires_in * 1000;

    return data.access_token;
}

async function refreshAccessToken(){
    if(!refreshToken){
        console.error('No refresh token');
        await getAccessToken();
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
        },
        body: params.toString(),
    });

    const data = await response.json();
    if (!response.ok) {
        console.error('Error refreshing Spotify token:', data);
        throw new Error('Failed to refresh Spotify token');
    }

    accessToken = data.access_token;
    tokenExpirationTime = Date.now() + data.expires_in * 1000;
    return data.access_token;
}


async function addSongToPlaylist(playlistId, trackUri) {
    const token = await getAccessToken();
    try {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ uris: [trackUri] })
        });

        const responseData = await response.json(); // Always parse the response

        if (!response.ok) {
            if (response.status === 401) { // Token expired
                console.log('Token expired, refreshing token and trying again');
                await refreshAccessToken();
                return addSongToPlaylist(playlistId, trackUri);
            } else {
                console.error(`Failed to add song to playlist. Status: ${response.status}, Response:`, responseData);
                throw new Error(`Failed to add song to playlist. Status: ${response.status}`);
            }
        }

        console.log('Song added successfully');
        return response.status;
    } catch (error) {
        console.error(`Error in addSongToPlaylist: ${error.message}`);
        throw error;
    }
}


const extractSpotifyTrackIds = (text) => {
    const trackIdPattern = /open\.spotify\.com\/track\/([a-zA-Z0-9]{22})/g;
    let match;
    const trackIds = [];

    while ((match = trackIdPattern.exec(text)) !== null) {
        trackIds.push(match[1]);
    }

    return trackIds;
}

const addTracksToPlaylist = async (trackIds, playlistId) => {
    const accessToken = await getAccessToken();
    console.log('access token', accessToken);
    for (const trackId of trackIds) {
        try {
            await addSongToPlaylist(playlistId, `spotify:track:${trackId}`);
            console.log(`Added track with ID ${trackId} to playlist`);
        } catch (error) {
            console.error(`Error adding track with ID ${trackId}: ${error.message}`);
        }
    }
}

const processTracksFromString = async (str, playlistId)  => {
    const trackIds = extractSpotifyTrackIds(str);
    if (trackIds.length > 0) {
        console.log('Found Spotify track IDs', trackIds);
        await addTracksToPlaylist(trackIds, playlistId);
    }else{
        console.log('No Spotify track matched.');
    }
} 


exports.extractSpotifyTrackIds = extractSpotifyTrackIds;
exports.addTracksToPlaylist = addTracksToPlaylist;
exports.processTracksFromString = processTracksFromString;
