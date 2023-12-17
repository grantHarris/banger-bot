# banger-bot

## Introduction
This project is a WhatsApp Bot that listens for Spotify track URLs in WhatsApp messages and adds them to specified Spotify playlists. The bot can handle multiple chat-to-playlist mappings and is designed to run in a Docker container.

## Prerequisites
Before you begin, ensure you have the following:
- Docker installed on your system.
- A Spotify Developer account and a registered Spotify application to obtain your client ID and client secret.
- A WhatsApp account for setting up the bot.

## Setup

### 1. Environment Variables
Set up your environment variables by creating a `.env` file in the root directory of your project with the following variables:

```makefile
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SERVER_ADDRESS=http://localhost
SERVER_PORT=your_server_port
CHAT_PLAYLIST_MAP='{"ChatName1":"PlaylistID1","ChatName2":"PlaylistID2"}'
```

Replace your_spotify_client_id, your_spotify_client_secret, your_server_port, ChatName1, PlaylistID1, ChatName2, and PlaylistID2 with your actual Spotify application details, server port, chat names, and corresponding Spotify playlist IDs.

### 2. Building the Docker Container
To build the Docker container for the bot, run the following command in the root directory of your project:

```sh
make build
```

This command will execute the build target in the Makefile, which builds the Docker image for the bot.

### 3. Running the Bot
To run the bot, execute the following command:

```sh
make run
```
This will start the bot in a Docker container with the environment variables loaded from the .env file.

### 4. Authorize Your Accounts Via Web Interface

1. **Open the Web Interface:**
   - Navigate to `http://localhost:your_server_port` in your web browser. Replace `your_server_port` with the port number you set in your `.env` file.
   - This will open the web interface for the Banger-Bot.

2. **Scanning the WhatsApp QR Code:**
   - Upon opening the web interface, you will see a QR code displayed on the screen.
   - Open WhatsApp on your phone and go to 'WhatsApp Web' in the settings menu.
   - Use your phone to scan the QR code displayed on the web interface.
   - Once scanned, the bot will be authenticated and connected to your WhatsApp account.

3. **Authorizing Spotify Access:**
   - Below the WhatsApp QR code, you'll find a link labeled "Login to Spotify".
   - Click on this link to be redirected to the Spotify authorization page.
   - Log in to your Spotify account and authorize the bot to access your Spotify data as required.
   - After successful authorization, you will be redirected back to the bot's web interface, and the bot will have the necessary permissions to add tracks to your Spotify playlists.

### 4. Using the Bot
Send spotify track URLs to your WhatsApp chats. The bot will automatically add the tracks to the corresponding Spotify playlists based on your chat-to-playlist mappings.

### 5. Additional Commands
To run the container interactively with a terminal: `make run-interactive`
To stop the container: `make stop`
To remove the container: `make remove`
To remove the Docker image: `make remove-image`
To start a stopped container: `make start`
To restart the container: `make restart`
To view container logs: `make logs`

## Usage
Send a WhatsApp message containing a Spotify track URL to the bot. The bot will automatically add the track to the specified Spotify playlist.

## Troubleshooting
If you encounter any issues, refer to the container logs for more information. Ensure that your .env file is correctly set up with valid Spotify credentials.

Contributing
Feel free to fork this repository and submit pull requests for improvements.

License
`MIT`
