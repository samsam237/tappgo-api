# ===========================================
# TAPPPLUS API - MULTI-STAGE DOCKERFILE
# ===========================================

# Stage 1: Base
FROM node:18-slim AS base

# Installer les dépendances système nécessaires pour Prisma
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Stage 2: Dependencies
FROM base AS dependencies

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances (incluant devDependencies pour le build)
RUN npm ci

# Stage 3: Build
FROM dependencies AS build

# Copier le code source
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Construire l'application NestJS
RUN npm run build

# Vérifier que le build a réussi
RUN ls -la dist/ && echo "Build réussi, fichiers dans dist:" && find dist/ -name "*.js" -type f | head -20

# Stage 4: Production
FROM base AS production

# Copier uniquement les dépendances de production
COPY package*.json ./
RUN npm ci --omit=dev

# Copier le code compilé depuis le stage build
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/prisma ./prisma

# Créer un utilisateur non-root pour la sécurité
RUN useradd -m -u 1001 nestuser && chown -R nestuser:nestuser /app
USER nestuser

# Exposer le port de l'API
EXPOSE 5550

# Variables d'environnement par défaut
ENV NODE_ENV=production \
    API_PORT=5550

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5550/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Commande par défaut: démarrer l'API
CMD ["node", "dist/main.js"]
