const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');
const fs = require('fs');

const { processTracksFromString } = require('./spotify.js');

const qrCodeImagePath = path.join(__dirname, 'public', 'qrCode.png');
const chatPlaylistMap = JSON.parse(process.env.CHAT_PLAYLIST_MAP || '{}');

const client = new Client({
    puppeteer: {
        args: ['--no-sandbox', '--disable-gpu'],
    },
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    fs.writeFileSync('whatsapp-QR.txt', qr);
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async message => {

    const contact = await message.getContact();
    console.log(`${contact.name}: ${message.body}`);

    const chat = await message.getChat();
    if (chat.isGroup) {
        console.log(`Message from group: ${chat.name}`);

        // Use the chat name to get the corresponding playlist ID
        const playlistId = chatPlaylistMap[chat.name];

        if(playlistId) {
            console.log(`Matched message containing Spotify song from group chat ${chat.name} with playlist ID ${playlistId}`);
            await processTracksFromString(message.body, playlistId);
        } else {
            console.log('Chat not mapped to a playlist.');
        }
    }
});

client.initialize();
