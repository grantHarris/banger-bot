# banger-bot


## Introduction
This project is a WhatsApp Bot that listens for Spotify track URLs in WhatsApp messages and adds them to a specified Spotify playlist. The bot is designed to run in a Docker container.

## Prerequisites
Before you begin, ensure you have the following:
- Docker installed on your system.
- A Spotify Developer account, and a registered Spotify application to obtain your client ID and client secret.
- A WhatsApp account for setting up the bot.

## Setup

### 1. Environment Variables
First, you need to set up your environment variables. Create a `.env` file in the root directory of your project and add the following variables:


```makefile
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_PLAYLIST_ID=your_spotify_playlist_id
```

Replace your_spotify_client_id, your_spotify_client_secret, and your_spotify_playlist_id with your actual Spotify application details and the playlist ID you want to use.

### 2. Building the Docker Container
To build the Docker container for the bot, run the following command in the root directory of your project:

```sh
make build
```

This command will execute the build target in the Makefile, which builds the Docker image for the bot.

3. Running the Bot
To run the bot, execute the following command:

```sh
make run
```
This will start the bot in a Docker container with the environment variables loaded from the .env file.

### 4. Interacting with the Bot
Once the bot is running, it will generate a QR code in the terminal. Scan this QR code with your WhatsApp account to authenticate and start the bot.

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

Troubleshooting
If you encounter any issues, refer to the container logs for more information. Ensure that your .env file is correctly set up with valid Spotify credentials.

Contributing
Feel free to fork this repository and submit pull requests for improvements.

License
`MIT`
