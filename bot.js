const qrcode = require('qrcode-terminal');
const fetch = require('cross-fetch');
const { Client, LocalAuth } = require('whatsapp-web.js');

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const playlistId = process.env.SPOTIFY_PLAYLIST_ID;

let spotifyAccessToken = null;
let tokenExpirationTime = 0;

const client = new Client({
    puppeteer: {
        args: ['--no-sandbox', '--disable-gpu'],
    },
    authStrategy: new LocalAuth()
});

async function getAccessToken(clientId, clientSecret) {
    if (spotifyAccessToken && Date.now() < tokenExpirationTime) {
        return spotifyAccessToken;
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
        },
        body: 'grant_type=client_credentials'
    });
    const data = await response.json();
    spotifyAccessToken = data.access_token;
    tokenExpirationTime = Date.now() + data.expires_in * 1000; // Setting the expiration time
    return data.access_token;
}

async function addSongToPlaylist(accessToken, playlistId, trackUri) {
    try {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?uris=${encodeURIComponent(trackUri)}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to add song to playlist');
        }

        return response.status;
    } catch (error) {
        if (error.message === 'Failed to add song to playlist') {
            // Fetch a new token and retry
            const newAccessToken = await getAccessToken(clientId, clientSecret);
            return addSongToPlaylist(newAccessToken, playlistId, trackUri);
        } else {
            throw error; // For other types of errors
        }
    }
}

function extractSpotifyTrackIds(text) {
    const trackIdPattern = /open\.spotify\.com\/track\/([a-zA-Z0-9]{22})/g;
    let match;
    const trackIds = [];

    while ((match = trackIdPattern.exec(text)) !== null) {
        trackIds.push(match[1]);
    }

    return trackIds;
}

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async message => {

    console.log(`Got message: ${message.body}`);

    if (message.isGroupMsg) {
        console.log(`Message from Group: ${message.chat.name}`);
        console.log(`Group ID: ${message.chat.id}`);
    }

    const trackIds = extractSpotifyTrackIds(message.body);
    if (trackIds.length > 0) {
        const accessToken = await getAccessToken(clientId, clientSecret);
        for (const trackId of trackIds) {
            try {
                await addSongToPlaylist(accessToken, playlistId, `spotify:track:${trackId}`);
                console.log(`Added track with ID ${trackId} to playlist`);
            } catch (error) {
                console.error(`Error adding track with ID ${trackId}: ${error.message}`);
            }
        }
    }
});

client.initialize();

