# 🗄️ Guide d'Initialisation de la Base de Données

Ce guide explique comment initialiser votre base de données PostgreSQL distante avec les schémas de données de l'application TappPlus.

## 📋 Prérequis

- Node.js 18+ installé
- Accès à une base de données PostgreSQL distante
- Variable d'environnement `DATABASE_URL` configurée

## 🔧 Configuration

### 1. Configurer la variable DATABASE_URL

La variable `DATABASE_URL` doit être au format suivant :

```env
DATABASE_URL=postgresql://username:password@host:port/database?schema=public
```

**Exemple :**
```env
DATABASE_URL=postgresql://tappplus_user:secure_password@37.60.242.242:5432/tappgo?schema=public
```

### 2. Vérifier la connexion

Vous pouvez tester la connexion avec :

```bash
npx prisma db pull
```

## 🚀 Initialisation de la Base de Données

### Méthode 1 : Script automatique (Recommandé)

#### Sur Linux/Mac :
```bash
chmod +x scripts/init-db.sh
./scripts/init-db.sh
```

#### Sur Windows (PowerShell) :
```powershell
.\scripts\init-db.ps1
```

### Méthode 2 : Commandes manuelles

#### Étape 1 : Générer le client Prisma
```bash
npm run db:generate
```

#### Étape 2 : Appliquer les migrations
```bash
npm run db:migrate:deploy
```

Cette commande applique toutes les migrations en attente sur la base de données distante.

#### Étape 3 (Optionnel) : Initialiser avec des données de test
```bash
npm run db:seed
```

Cela créera :
- 1 organisation par défaut
- 1 utilisateur admin (email: `admin@meditache.com`, password: `admin123`)
- 1 médecin
- 3 patients d'exemple
- 2 consultations passées
- 3 interventions programmées
- Règles de rappel automatiques

### Méthode 3 : Script npm tout-en-un

```bash
npm run db:init
```

Cette commande exécute automatiquement :
1. `prisma migrate deploy` - Applique les migrations
2. `prisma generate` - Génère le client Prisma
3. `npm run db:seed` - Initialise avec des données de test

## 📊 Vérification

### Vérifier le statut des migrations

```bash
npm run db:migrate:status
```

### Ouvrir Prisma Studio (Interface graphique)

```bash
npm run db:studio
```

Cela ouvrira une interface web sur `http://localhost:5550` pour visualiser et gérer vos données.

## 🔄 Commandes Utiles

| Commande | Description |
|----------|-------------|
| `npm run db:generate` | Génère le client Prisma |
| `npm run db:migrate:deploy` | Applique les migrations sur la base distante |
| `npm run db:migrate:status` | Affiche le statut des migrations |
| `npm run db:seed` | Initialise la base avec des données de test |
| `npm run db:init` | Initialise complètement la base (migrations + seed) |
| `npm run db:studio` | Ouvre l'interface graphique Prisma Studio |

## ⚠️ Important

- **En production** : N'utilisez PAS `npm run db:seed` car cela ajoute des données de test
- **Migrations** : Les migrations sont versionnées dans `prisma/migrations/`
- **Sauvegarde** : Toujours faire une sauvegarde avant d'appliquer des migrations en production

## 🐛 Dépannage

### Erreur : "Migration failed"

Si une migration échoue, vous pouvez :

1. Vérifier les logs d'erreur
2. Vérifier le statut : `npm run db:migrate:status`
3. Résoudre manuellement les problèmes dans la base de données
4. Marquer la migration comme appliquée : `npx prisma migrate resolve --applied <migration_name>`

### Erreur : "Connection refused"

Vérifiez :
- Que la base de données est accessible depuis votre machine
- Que le firewall autorise la connexion
- Que les identifiants dans `DATABASE_URL` sont corrects

### Réinitialiser complètement la base

⚠️ **ATTENTION** : Cela supprimera toutes les données !

```bash
# Supprimer toutes les tables
npx prisma migrate reset

# Réappliquer les migrations
npm run db:migrate:deploy

# Réinitialiser avec des données de test
npm run db:seed
```

## 📝 Structure de la Base de Données

La base de données contient les tables suivantes :

- `organizations` - Organisations
- `users` - Utilisateurs de l'application
- `doctors` - Médecins
- `people` - Patients/Personnes
- `person_organizations` - Relation personnes-organisations
- `consultations` - Consultations médicales
- `interventions` - Interventions programmées
- `reminder_rules` - Règles de rappel
- `reminders` - Rappels à envoyer
- `notification_logs` - Logs des notifications
- `audit_logs` - Logs d'audit

Pour plus de détails, consultez `prisma/schema.prisma`.

