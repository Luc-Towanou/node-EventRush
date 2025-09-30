# # Étape 1 : Builder
# FROM node:20-alpine AS builder

# # Crée le dossier app
# WORKDIR /app

# # Copie les fichiers de dépendances
# COPY package*.json ./

# # Installe les dépendances (y compris dev pour le build)
# RUN npm install

# # Copie le code source
# COPY . .

# # Build de l'app NestJS
# RUN npm run build


# # Étape 2 : Runner
# FROM node:20-alpine AS runner

# WORKDIR /app

# # Copie uniquement les fichiers nécessaires pour exécuter
# COPY package*.json ./

# # Copier le dossier prisma avant npm install pour que postinstall fonctionne
# COPY prisma ./prisma

# RUN npm install --only=production

# # <--- garde aussi ton schema si migrations/seed
# COPY --from=builder /app/prisma ./prisma   

# # Copie le build depuis l'étape précédente
# COPY --from=builder /app/dist ./dist


# # Expose le port (par défaut Nest utilise 3000)
# EXPOSE 3000

# # Commande de lancement
# CMD ["node", "dist/main.js"]


# Dockerfile simplifié pour Nest + Prisma
FROM node:20-alpine AS builder

WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Copier le dossier prisma avant npm install pour que postinstall fonctionne
COPY prisma ./prisma

# Installer les dépendances
RUN npm install

# Copier le reste du code
COPY . .

# Build Nest
RUN npm run build

# Étape finale pour l'image de prod
FROM node:20-alpine

WORKDIR /app

# Copier uniquement les fichiers nécessaires
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma

EXPOSE 10000
CMD ["node", "dist/main.js"]
