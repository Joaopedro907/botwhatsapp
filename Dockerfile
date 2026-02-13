FROM node:20-slim

# Instalar Chromium e dependências
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libnss3 \
    libxss1 \
    libasound2 \
    libxshmfence1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

EXPOSE 8080

CMD ["npm", "start"]
