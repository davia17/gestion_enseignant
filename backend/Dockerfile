FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# 1. Génération du client Prisma pour le conteneur Linux
RUN npx prisma generate

EXPOSE 5000

# 2. Synchronisation du schéma BDD puis lancement du serveur Express
CMD npx prisma db push && node server.js