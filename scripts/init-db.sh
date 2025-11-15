#!/bin/bash

# Script d'initialisation de la base de données distante
# Usage: ./scripts/init-db.sh

set -e

echo "🚀 Initialisation de la base de données distante..."

# Vérifier que DATABASE_URL est définie
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Erreur: La variable d'environnement DATABASE_URL n'est pas définie"
    echo "   Veuillez définir DATABASE_URL dans votre fichier .env ou dans votre environnement"
    exit 1
fi

echo "📊 Connexion à la base de données: $(echo $DATABASE_URL | sed 's/:[^:]*@/:***@/')"

# Générer le client Prisma
echo "🔧 Génération du client Prisma..."
npx prisma generate

# Appliquer les migrations
echo "📦 Application des migrations..."
npx prisma migrate deploy

# Optionnel: Seed la base de données
read -p "Voulez-vous initialiser la base avec des données de test? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding de la base de données..."
    npm run db:seed
    echo "✅ Données de test ajoutées avec succès!"
fi

echo "✅ Initialisation terminée avec succès!"
echo ""
echo "📝 Prochaines étapes:"
echo "   - Vérifiez votre base de données avec: npm run db:studio"
echo "   - Démarrez l'API avec: npm run start:dev"

