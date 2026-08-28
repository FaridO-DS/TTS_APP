# Serveur de production Node.js
FROM node:22-alpine
WORKDIR /app

# 🔴 AJOUT : Met à jour les paquets système d'Alpine pour éliminer les failles connues
RUN apk update && apk upgrade --no-cache

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des modules de production
RUN npm ci --only=production

# Copie du reste du code source
COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]
