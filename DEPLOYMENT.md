# Guide de Déploiement - TappPlus API

Ce guide couvre le déploiement de l'API TappPlus dans différents environnements.

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Configuration Initiale](#configuration-initiale)
3. [Déploiement Local avec Docker](#déploiement-local-avec-docker)
4. [Déploiement Production](#déploiement-production)
5. [Déploiement avec Dockploy](#déploiement-avec-dockploy)
6. [Configuration Nginx](#configuration-nginx)
7. [Migration de Base de Données](#migration-de-base-de-données)
8. [Monitoring et Logs](#monitoring-et-logs)
9. [Troubleshooting](#troubleshooting)

## 🔧 Prérequis

### Environnement de Production

- **Docker** : 20.10+
- **Docker Compose** : 2.0+
- **PostgreSQL** : 15+ (ou via Docker)
- **Redis** : 7+ (ou via Docker)
- **Nginx** : 1.24+ (optionnel, pour reverse proxy)

### Services Externes (Optionnel)

- **SendGrid** : Pour notifications email
- **Twilio** : Pour notifications SMS
- **Firebase** : Pour notifications push

## ⚙️ Configuration Initiale

### 1. Cloner le Projet

```bash
git clone https://github.com/your-org/tappplus-api.git
cd tappplus-api
```

### 2. Configurer les Variables d'Environnement

```bash
cp .env.example .env
```

Éditer `.env` avec vos valeurs :

```env
# OBLIGATOIRE
DATABASE_URL=postgresql://user:password@host:5432/tappplus
REDIS_URL=redis://host:6379
JWT_SECRET=your-super-secret-key-min-32-characters-CHANGE-THIS
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-characters-CHANGE-THIS

# RECOMMANDÉ
NODE_ENV=production
API_PORT=5550
TZ=Africa/Douala

# OPTIONNEL (Notifications)
SENDGRID_API_KEY=your-sendgrid-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

### 3. Générer des Secrets Sécurisés

```bash
# JWT Secret (min 32 caractères)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# JWT Refresh Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🐳 Déploiement Local avec Docker

### Option 1 : Docker Compose (Recommandé)

```bash
# Build et démarrer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f api

# Vérifier le statut
docker-compose ps

# Accéder à l'API
curl http://localhost:5550/health
curl http://localhost:5550/api/docs
```

### Option 2 : Docker Manuel

```bash
# 1. Démarrer PostgreSQL
docker run -d --name tappplus-postgres \
  -e POSTGRES_USER=tappplus \
  -e POSTGRES_PASSWORD=secure_password \
  -e POSTGRES_DB=tappplus \
  -p 5432:5432 \
  postgres:15-alpine

# 2. Démarrer Redis
docker run -d --name tappplus-redis \
  -p 6379:6379 \
  redis:7-alpine

# 3. Build l'image API
docker build -t tappplus-api:latest .

# 4. Démarrer l'API
docker run -d --name tappplus-api \
  -p 5550:5550 \
  -e DATABASE_URL=postgresql://tappplus:secure_password@host.docker.internal:5432/tappplus \
  -e REDIS_URL=redis://host.docker.internal:6379 \
  -e JWT_SECRET=your-secret \
  -e JWT_REFRESH_SECRET=your-refresh-secret \
  tappplus-api:latest

# 5. Démarrer le Worker
docker run -d --name tappplus-worker \
  -e DATABASE_URL=postgresql://tappplus:secure_password@host.docker.internal:5432/tappplus \
  -e REDIS_URL=redis://host.docker.internal:6379 \
  --entrypoint node \
  tappplus-api:latest dist/worker.js
```

## 🚀 Déploiement Production

### Avec Services Managés (Recommandé)

#### 1. Base de Données PostgreSQL

Utiliser un service managé :
- **AWS RDS**
- **Google Cloud SQL**
- **DigitalOcean Managed Database**
- **Supabase**

#### 2. Redis

Utiliser un service managé :
- **AWS ElastiCache**
- **Redis Cloud**
- **Upstash**

#### 3. Déployer l'API

```bash
# Build l'image de production
docker build -t tappplus-api:v1.0.0 .

# Tag pour registry
docker tag tappplus-api:v1.0.0 registry.example.com/tappplus-api:v1.0.0

# Push vers registry
docker push registry.example.com/tappplus-api:v1.0.0

# Déployer
docker run -d \
  --name tappplus-api \
  --restart unless-stopped \
  -p 5550:5550 \
  -e DATABASE_URL=$DATABASE_URL \
  -e REDIS_URL=$REDIS_URL \
  -e JWT_SECRET=$JWT_SECRET \
  -e JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET \
  -e NODE_ENV=production \
  registry.example.com/tappplus-api:v1.0.0
```

### Variables d'Environnement Production

```env
NODE_ENV=production
API_PORT=5550

# Database (Service managé)
DATABASE_URL=postgresql://user:pass@db.example.com:5432/tappplus

# Redis (Service managé)
REDIS_URL=redis://redis.example.com:6379

# JWT (Secrets forts!)
JWT_SECRET=<généré avec crypto.randomBytes(32)>
JWT_REFRESH_SECRET=<généré avec crypto.randomBytes(32)>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Timezone
TZ=Africa/Douala

# CORS (domaines frontend autorisés)
CORS_ORIGIN=https://app.tappplus.com,https://tappplus.com

# Notifications
SENDGRID_API_KEY=SG.xxx
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
FIREBASE_PROJECT_ID=tappplus-xxx
```

## 🌐 Déploiement avec Dockploy

### 1. Créer un Projet Dockploy

```bash
# Via CLI Dockploy
dockploy project create tappplus-api \
  --type docker \
  --repository https://github.com/your-org/tappplus-api \
  --branch main
```

### 2. Configuration Dockploy

Créer `dockploy.json` à la racine :

```json
{
  "name": "tappplus-api",
  "source": {
    "type": "github",
    "repository": "https://github.com/your-org/tappplus-api",
    "branch": "main",
    "autoDeploy": true
  },
  "build": {
    "type": "dockerfile",
    "dockerfile": "Dockerfile",
    "target": "production"
  },
  "deployment": {
    "replicas": 2,
    "strategy": "rolling",
    "ports": [
      {
        "containerPort": 5550,
        "hostPort": 5550,
        "protocol": "tcp",
        "public": true
      }
    ],
    "env": {
      "NODE_ENV": "production",
      "API_PORT": "5550",
      "DATABASE_URL": {
        "required": true,
        "secret": true
      },
      "REDIS_URL": {
        "required": true,
        "secret": true
      },
      "JWT_SECRET": {
        "required": true,
        "secret": true
      },
      "JWT_REFRESH_SECRET": {
        "required": true,
        "secret": true
      }
    },
    "healthCheck": {
      "path": "/health",
      "interval": 30,
      "timeout": 10,
      "retries": 3
    }
  }
}
```

### 3. Déployer

```bash
# Déployer via CLI
dockploy deploy tappplus-api

# Ou via Git push (si autoDeploy activé)
git push origin main
```

## 🔧 Configuration Nginx

### Reverse Proxy pour API Seule

```nginx
# /etc/nginx/sites-available/tappplus-api

upstream api_backend {
    server 127.0.0.1:5550;
    keepalive 32;
}

server {
    listen 80;
    server_name api.tappplus.com;

    # Redirection HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.tappplus.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.tappplus.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.tappplus.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Health check
    location /health {
        proxy_pass http://api_backend/health;
        access_log off;
    }

    # API routes
    location /api/v1/ {
        proxy_pass http://api_backend/api/v1/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;
}
```

### Reverse Proxy API + Frontend

```nginx
# /etc/nginx/sites-available/tappplus

upstream api_backend {
    server tappplus-api:5550;
    keepalive 32;
}

upstream web_frontend {
    server tappplus-web:5500;
    keepalive 32;
}

server {
    listen 80;
    server_name tappplus.com;

    # Health check
    location /health {
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # API routes
    location /api/v1/ {
        proxy_pass http://api_backend/api/v1/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend routes
    location / {
        proxy_pass http://web_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://web_frontend;
        add_header Cache-Control "public, max-age=3600, immutable";
    }
}
```

## 🗄️ Migration de Base de Données

### Première Installation

```bash
# 1. Générer Prisma Client
docker exec tappplus-api npx prisma generate

# 2. Exécuter les migrations
docker exec tappplus-api npx prisma migrate deploy

# 3. (Optionnel) Seed les données
docker exec tappplus-api npm run db:seed
```

### Créer une Nouvelle Migration

```bash
# En développement
docker exec -it tappplus-api npx prisma migrate dev --name add_new_field

# En production
docker exec tappplus-api npx prisma migrate deploy
```

### Rollback de Migration

```bash
# Prisma ne supporte pas le rollback automatique
# Solution : Créer une migration inverse

# 1. Créer migration inverse
docker exec -it tappplus-api npx prisma migrate dev --name revert_previous_change

# 2. Appliquer
docker exec tappplus-api npx prisma migrate deploy
```

## 📊 Monitoring et Logs

### Logs Docker

```bash
# Logs API
docker-compose logs -f api

# Logs Worker
docker-compose logs -f worker

# Logs avec timestamps
docker-compose logs -f --timestamps api

# Dernières 100 lignes
docker-compose logs --tail=100 api
```

### Health Checks

```bash
# Health endpoint
curl http://localhost:5550/health

# Swagger docs
curl http://localhost:5550/api/docs

# Check database connection
docker exec tappplus-api npx prisma db execute --stdin <<< "SELECT 1"
```

### Monitoring Production

#### Option 1 : PM2 Monitoring (si PM2 utilisé)

```bash
pm2 monit
pm2 status
pm2 logs tappplus-api
```

#### Option 2 : Docker Stats

```bash
docker stats tappplus-api tappplus-worker
```

#### Option 3 : Services Externes

- **Sentry** : Error tracking
- **DataDog** : APM et monitoring
- **New Relic** : Performance monitoring
- **LogDNA** : Log aggregation

## 🔍 Troubleshooting

### L'API ne démarre pas

```bash
# Vérifier les logs
docker-compose logs api

# Vérifier les variables d'env
docker exec tappplus-api env | grep -E "DATABASE|REDIS|JWT"

# Tester la connexion DB
docker exec tappplus-api npx prisma db execute --stdin <<< "SELECT 1"

# Tester Redis
docker exec tappplus-redis redis-cli ping
```

### Erreur Prisma Client

```bash
# Regénérer le client
docker exec tappplus-api npx prisma generate

# Reconstruire l'image
docker-compose build --no-cache api
docker-compose up -d
```

### Worker ne traite pas les rappels

```bash
# Vérifier les logs du worker
docker-compose logs -f worker

# Vérifier Redis
docker exec tappplus-redis redis-cli KEYS "bull:*"

# Redémarrer le worker
docker-compose restart worker
```

### Problèmes de Performance

```bash
# Vérifier la mémoire/CPU
docker stats

# Augmenter les ressources (docker-compose.yml)
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Erreurs CORS

```bash
# Vérifier CORS_ORIGIN dans .env
echo $CORS_ORIGIN

# Ajouter le domaine frontend
CORS_ORIGIN=https://app.tappplus.com,https://tappplus.com
```

## 🔐 Sécurité Production

### Checklist Sécurité

- [ ] JWT secrets générés avec `crypto.randomBytes(32)`
- [ ] HTTPS activé (SSL/TLS)
- [ ] CORS configuré avec domaines spécifiques
- [ ] Rate limiting activé (Nginx ou NestJS Throttler)
- [ ] Database avec credentials forts
- [ ] Utilisateur non-root dans container
- [ ] Secrets dans variables d'environnement (pas dans le code)
- [ ] Logs sans données sensibles
- [ ] Backup automatique de la DB
- [ ] Monitoring actif

### Rotation des Secrets

```bash
# 1. Générer nouveaux secrets
NEW_JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# 2. Mettre à jour .env
sed -i "s/JWT_SECRET=.*/JWT_SECRET=$NEW_JWT_SECRET/" .env

# 3. Redémarrer
docker-compose restart api
```

## 📦 Backup et Restore

### Backup PostgreSQL

```bash
# Backup
docker exec tappplus-postgres pg_dump -U tappplus tappplus > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup avec compression
docker exec tappplus-postgres pg_dump -U tappplus tappplus | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Restore PostgreSQL

```bash
# Restore
docker exec -i tappplus-postgres psql -U tappplus tappplus < backup.sql

# Restore avec compression
gunzip < backup.sql.gz | docker exec -i tappplus-postgres psql -U tappplus tappplus
```

### Backup Automatique (Cron)

```bash
# Ajouter au crontab
crontab -e

# Backup quotidien à 2h du matin
0 2 * * * docker exec tappplus-postgres pg_dump -U tappplus tappplus | gzip > /backups/tappplus_$(date +\%Y\%m\%d).sql.gz
```

## 🚀 Mise à Jour

### Rolling Update

```bash
# 1. Pull nouvelle version
git pull origin main

# 2. Build nouvelle image
docker-compose build api

# 3. Redémarrer avec zero downtime
docker-compose up -d --no-deps --build api
```

### Blue-Green Deployment

```bash
# 1. Démarrer nouvelle version (port 5551)
docker run -d --name tappplus-api-green -p 5551:5550 ...

# 2. Tester
curl http://localhost:5551/health

# 3. Basculer Nginx vers 5551

# 4. Arrêter ancienne version
docker stop tappplus-api
```

## 📞 Support

Pour toute question ou problème :
- Documentation : [README.md](./README.md)
- Issues : https://github.com/your-org/tappplus-api/issues
- Email : support@tappplus.com
