# TappPlus API

API Backend NestJS pour le système de gestion des rappels d'interventions médicales.

## 🚀 Technologies

- **NestJS** - Framework Node.js progressif
- **TypeScript** - Typage statique
- **Prisma** - ORM moderne pour PostgreSQL
- **PostgreSQL** - Base de données relationnelle
- **Redis** - Cache et message queue (Bull)
- **JWT** - Authentification
- **Swagger** - Documentation API automatique

## 📋 Prérequis

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- npm ou yarn

## 🛠️ Installation

### 1. Cloner le projet

```bash
git clone <votre-repo-url>
cd tappplus-api
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration

Copier le fichier `.env.example` vers `.env` :

```bash
cp .env.example .env
```

Éditer `.env` et configurer :

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tappplus

# Redis
REDIS_URL=redis://localhost:6379

# JWT (IMPORTANT: Changez ces valeurs en production!)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-characters
```

### 4. Base de données

```bash
# Générer le client Prisma
npm run db:generate

# Exécuter les migrations
npm run db:migrate

# (Optionnel) Seed la base de données
npm run db:seed
```

## 🏃 Démarrage

### Mode Développement

```bash
# Démarrer l'API
npm run start:dev

# Démarrer le worker (dans un autre terminal)
npm run worker:dev

# Ouvrir Prisma Studio (interface graphique DB)
npm run db:studio
```

L'API sera disponible sur `http://localhost:5550`

Documentation Swagger : `http://localhost:5550/api/docs`

### Mode Production

```bash
# Build
npm run build

# Démarrer
npm run start:prod
```

## 🐳 Docker

### Avec Docker Compose (Recommandé)

```bash
# Démarrer tous les services (PostgreSQL + Redis + API + Worker)
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v
```

### Build Docker manuel

```bash
# Build l'image
docker build -t tappplus-api:latest .

# Run
docker run -p 5550:5550 \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://... \
  -e JWT_SECRET=... \
  tappplus-api:latest
```

## 📚 Structure du Projet

```
tappplus-api/
├── src/
│   ├── main.ts                    # Point d'entrée API
│   ├── worker.ts                  # Worker rappels
│   ├── app.module.ts              # Module racine
│   │
│   ├── auth/                      # Authentification JWT
│   ├── common/                    # Guards, Decorators, Prisma
│   ├── interventions/             # CRUD Interventions
│   ├── reminders/                 # Gestion rappels
│   ├── notifications/             # Email, SMS, Push
│   ├── people/                    # Gestion patients
│   ├── consultations/             # Gestion consultations
│   └── organizations/             # Gestion organisations
│
├── prisma/
│   ├── schema.prisma              # Schéma de base de données
│   └── seed.ts                    # Données initiales
│
├── Dockerfile                     # Image Docker
├── docker-compose.yml             # Orchestration complète
└── package.json
```

## 🔧 Scripts NPM

| Script | Description |
|--------|-------------|
| `npm run build` | Build l'application |
| `npm run start:dev` | Mode développement avec watch |
| `npm run start:prod` | Mode production |
| `npm run worker:dev` | Worker en développement |
| `npm run worker:prod` | Worker en production |
| `npm run lint` | Linter le code |
| `npm run test` | Tests unitaires |
| `npm run test:e2e` | Tests end-to-end |
| `npm run db:generate` | Générer Prisma Client |
| `npm run db:push` | Push schéma vers DB |
| `npm run db:migrate` | Créer migration |
| `npm run db:studio` | Interface Prisma Studio |

## 🔐 Authentification

L'API utilise JWT pour l'authentification :

1. **Register** : `POST /api/v1/auth/register`
2. **Login** : `POST /api/v1/auth/login` → Retourne `access_token` + `refresh_token`
3. **Protected routes** : Header `Authorization: Bearer <access_token>`

## 📖 Documentation API

Swagger UI disponible sur : `http://localhost:5550/api/docs`

Endpoints principaux :

- `POST /api/v1/auth/register` - Créer un compte
- `POST /api/v1/auth/login` - Se connecter
- `GET /api/v1/interventions` - Liste interventions
- `POST /api/v1/interventions` - Créer intervention
- `GET /api/v1/reminders` - Liste rappels
- `GET /api/v1/reminders/stats` - Statistiques

## 🔔 Notifications

Le système supporte 3 canaux de notification :

### Email (SendGrid)

```env
SENDGRID_API_KEY=your-key
EMAIL_FROM=noreply@tappplus.com
```

### SMS (Twilio)

```env
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Push (Firebase)

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-key
FIREBASE_CLIENT_EMAIL=your-email
```

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests avec couverture
npm run test:cov

# Tests E2E
npm run test:e2e
```

## 🌍 Variables d'Environnement

Voir `.env.example` pour la liste complète.

Variables **obligatoires** :
- `DATABASE_URL` - Connexion PostgreSQL
- `REDIS_URL` - Connexion Redis
- `JWT_SECRET` - Secret JWT (min 32 caractères)
- `JWT_REFRESH_SECRET` - Secret refresh token

Variables **optionnelles** :
- `SENDGRID_API_KEY` - Notifications email
- `TWILIO_*` - Notifications SMS
- `FIREBASE_*` - Notifications push

## 🚢 Déploiement

### Avec Dockploy

1. Créer un nouveau projet sur Dockploy
2. Connecter le repository GitHub
3. Configurer les variables d'environnement
4. Déployer

### Avec Docker

```bash
# Build
docker build -t tappplus-api .

# Tag
docker tag tappplus-api your-registry/tappplus-api:latest

# Push
docker push your-registry/tappplus-api:latest
```

## 📊 Base de Données

### Modèles Prisma

- **User** - Utilisateurs et authentification
- **Doctor** - Profils médecins
- **Person** - Patients
- **Organization** - Organisations (cliniques)
- **Intervention** - Interventions médicales
- **ReminderRule** - Règles de rappels
- **Reminder** - Instances de rappels
- **NotificationLog** - Logs des notifications
- **AuditLog** - Logs d'audit RGPD

### Migrations

```bash
# Créer une migration
npm run db:migrate -- --name ma_migration

# Appliquer les migrations
npm run db:migrate
```

## 🔍 Troubleshooting

### Erreur Prisma Client

```bash
npm run db:generate
```

### Ports déjà utilisés

Modifier `API_PORT` dans `.env`

### Worker ne démarre pas

Vérifier `REDIS_URL` et `DATABASE_URL`

## 📝 Licence

MIT

## 👥 Auteurs

TappPlus Team

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/ma-feature`)
3. Commit (`git commit -m 'Ajout ma feature'`)
4. Push (`git push origin feature/ma-feature`)
5. Ouvrir une Pull Request
