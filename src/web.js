const express = require('express');
const qrcode = require('qrcode');
const fs = require('fs');
const bodyParser = require('body-parser');
const querystring = require('querystring');


require('dotenv').config();
const { extractSpotifyTrackIds, addTracksToPlaylist } = require('./spotify.js');

const app = express();

const address = process.env.SERVER_ADDRESS || 'http://localhost';
const port = process.env.SERVER_PORT || 6969;
const clientId = process.env.SPOTIFY_CLIENT_ID;

const basePath = `${address}:${port}`;

app.use(bodyParser.text({ type: 'text/plain' }));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/qr-code', (req, res) => {
    fs.readFile('whatsapp-QR.txt', 'utf8', (err, qr) => {
        if (err) {
            res.status(404).send('QR code not available');
        } else {
            qrcode.toFileStream(res, qr, { type: 'png' });
        }
    });
});

app.get('/login', (req, res) => {
    const redirectUri = `${basePath}/callback`;
    const scope = 'playlist-modify-public playlist-modify-private';

    const queryParams = querystring.stringify({
        response_type: 'code',
        client_id: clientId,
        scope: scope,
        redirect_uri: redirectUri,
    });

    res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

app.get('/callback', (req, res) => {
    const authorizationCode = req.query.code;

    if (authorizationCode) {
        fs.writeFileSync('spotify-user-code.txt', authorizationCode);
        res.send('Authorization code received and saved.');
    } else {
        res.send('No authorization code provided.');
    }
});

app.post('/add/:playlistId', async (req, res) => {
    const playlistId = req.params.playlistId;
    const chatArchive = req.body;

    console.log('chatArchive', chatArchive);

    try {
        const trackIds = await extractSpotifyTrackIds(chatArchive);
        if (trackIds.length === 0) {
            return res.status(400).send('No Spotify links found in the chat archive.');
        }

        await addTracksToPlaylist(trackIds, playlistId);
        res.send('Tracks added to playlist successfully.');
    } catch (error) {
        console.error('Error processing chat archive:', error);
        res.status(500).send('Failed to process chat archive.');
    }
});


app.listen(port, () => {
    console.log(`Server listening at ${basePath}`);
});


