FROM node:alpine

# Set the working directory in the container
WORKDIR /usr/src/app

RUN apk add --no-cache \
    msttcorefonts-installer font-noto fontconfig \
    freetype ttf-dejavu ttf-droid ttf-freefont ttf-liberation \
    chromium \
  && rm -rf /var/cache/apk/* /tmp/*

RUN update-ms-fonts \
    && fc-cache -f

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

RUN npm init -y &&  \
    npm i puppeteer express

RUN addgroup pptruser \
    && adduser pptruser -D -G pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app

USER pptruser

# Copy the current directory contents into the container at /usr/src/app
COPY package.json .
COPY ./src .
COPY ./public ./public

# Install any needed packages specified in package.json
RUN npm install


# Run npm start when the container launches
CMD ["npm", "start"]
