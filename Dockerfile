# Étape 1 : Builder
FROM node:18-alpine AS builder

# Crée le dossier app
WORKDIR /app

# Copie les fichiers de dépendances
COPY package*.json ./

# Installe les dépendances (y compris dev pour le build)
RUN npm install

# Copie le code source
COPY . .

# Build de l'app NestJS
RUN npm run build


# Étape 2 : Runner
FROM node:18-alpine AS runner

WORKDIR /app

# Copie uniquement les fichiers nécessaires pour exécuter
COPY package*.json ./
RUN npm install --only=production

# Copie le build depuis l'étape précédente
COPY --from=builder /app/dist ./dist

# Expose le port (par défaut Nest utilise 3000)
EXPOSE 3000

# Commande de lancement
CMD ["node", "dist/main.js"]
