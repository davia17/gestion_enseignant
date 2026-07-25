# --- ÉTAPE 1 : Build de l'application React ---
FROM node:20-alpine AS build

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY . .

# Construire l'application Vite
RUN npx vite build

# --- ÉTAPE 2 : Serveur web Nginx ---
FROM nginx:alpine

# Copier les fichiers générés
COPY --from=build /app/dist /usr/share/nginx/html

# Exposer le port HTTP
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]