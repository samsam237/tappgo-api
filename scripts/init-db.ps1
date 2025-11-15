# Script d'initialisation de la base de données distante (PowerShell)
# Usage: .\scripts\init-db.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 Initialisation de la base de données distante..." -ForegroundColor Cyan

# Vérifier que DATABASE_URL est définie
if (-not $env:DATABASE_URL) {
    Write-Host "❌ Erreur: La variable d'environnement DATABASE_URL n'est pas définie" -ForegroundColor Red
    Write-Host "   Veuillez définir DATABASE_URL dans votre fichier .env ou dans votre environnement" -ForegroundColor Yellow
    exit 1
}

# Masquer le mot de passe dans l'URL pour l'affichage
$displayUrl = $env:DATABASE_URL -replace ':[^:]*@', ':***@'
Write-Host "📊 Connexion à la base de données: $displayUrl" -ForegroundColor Green

# Générer le client Prisma
Write-Host "🔧 Génération du client Prisma..." -ForegroundColor Cyan
npx prisma generate

# Appliquer les migrations
Write-Host "📦 Application des migrations..." -ForegroundColor Cyan
npx prisma migrate deploy

# Optionnel: Seed la base de données
$seed = Read-Host "Voulez-vous initialiser la base avec des données de test? (y/N)"
if ($seed -eq "y" -or $seed -eq "Y") {
    Write-Host "🌱 Seeding de la base de données..." -ForegroundColor Cyan
    npm run db:seed
    Write-Host "✅ Données de test ajoutées avec succès!" -ForegroundColor Green
}

Write-Host "✅ Initialisation terminée avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "   - Vérifiez votre base de données avec: npm run db:studio"
Write-Host "   - Démarrez l'API avec: npm run start:dev"

