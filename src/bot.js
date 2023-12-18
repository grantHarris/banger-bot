const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');

const { processTracksFromString } = require('./spotify.js');


const getPlaylistMap = () => {
    try {
        const rawChatPlaylistMap = JSON.parse(process.env.CHAT_PLAYLIST_MAP || '{}');
        return Object.keys(rawChatPlaylistMap).reduce((acc, key) => {
            acc[key.toLowerCase().trim()] = rawChatPlaylistMap[key];
            return acc;
        }, {});
    } catch (e) {
        console.error("Error parsing CHAT_PLAYLIST_MAP:", e);
        return {};
    }
};

console.log(getPlaylistMap());

const processMessage = async message => {
    const contact = await message.getContact();
    const chatPlaylistMap = getPlaylistMap();

    console.log(`${contact.name}: ${message.body}`);

    const chat = await message.getChat();

    if (chat.isGroup) {
        console.log(`Message from group: ${chat.name}`);
        const normalizedChatName = chat.name.toLowerCase().trim();

        // Use the chat name to get the corresponding playlist ID
        const playlistId = chatPlaylistMap[normalizedChatName];

        if(playlistId) {
            console.log(`Matched group chat ${chat.name} and evaluating for playlist ID ${playlistId}`);
            await processTracksFromString(message.body, playlistId);
        } else {
            console.log('Chat does not contain playlist.');
        }
    }
};

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


client.on('message_create', processMessage);

client.initialize();
