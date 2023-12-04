# Define default action when "make" is called without arguments
all: build run

# Build the Docker image
build:
    docker build -t banger-bot .

# Run the container with environment variables from .env file
run:
    docker run -d --restart always --env-file .env --name banger-bot-container banger-bot

# Run the container interactively with a terminal and environment variables from .env file
run-interactive:
    docker run -it --restart always --env-file .env --name banger-bot-container banger-bot

# Stop the container
stop:
    docker stop banger-bot-container

# Remove the container (stops it first)
remove: stop
    docker rm banger-bot-container

# Remove the Docker image
remove-image:
    docker rmi banger-bot

# Start a stopped container
start:
    docker start banger-bot-container

# Restart the container
restart:
    docker restart banger-bot-container

# View container logs
logs:
    docker logs -f banger-bot-container
