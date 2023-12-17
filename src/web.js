const express = require('express');
const qrcode = require('qrcode');
const fs = require('fs');

const querystring = require('querystring');
require('dotenv').config();

const app = express();

const address = process.env.SERVER_ADDRESS || 'http://localhost';
const port = process.env.SERVER_PORT || 6969;
const clientId = process.env.SPOTIFY_CLIENT_ID;

const basePath = `${address}:${port}`;

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

app.listen(port, () => {
    console.log(`Server listening at ${basePath}`);
});
