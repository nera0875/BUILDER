---
name: database
description: PostgreSQL VPS database expert. Manages database creation, Prisma schemas, migrations, seeding. Auto-activates on keywords "database", "postgresql", "prisma", "db", "sql" or when backend with data storage needed.
allowed-tools: Bash, Read, Write, Edit
---

# Database Management Skill

> **PostgreSQL VPS + Prisma Expert**
>
> Inspiré de : Prisma Best Practices, PostgreSQL Standards, Database-per-Service Pattern

---

## Scope & Activation

**Chargé par:** EXECUTOR agent (backend avec database)

**Auto-activé si keywords:**
- `database`, `db`, `postgresql`, `postgres`, `sql`
- `prisma`, `schema`, `migration`, `model`
- Backend nécessite stockage données
- User mentionne "VPS", "database"

**Gère:**
- Connexion PostgreSQL VPS
- Création databases
- Génération Prisma schemas
- Migrations
- Seeding données test
- Backup/restore

---

## Credentials PostgreSQL VPS (HARDCODÉS)

**Instance PostgreSQL Production:**

```bash
# VPS IP
HOST="89.116.27.88"

# Port (instance pentester)
PORT="5433"

# User
USER="pentester"

# Password
PASSWORD="Voiture789"

# Database par défaut (pour créer nouvelles DB)
DEFAULT_DB="postgres"
```

**⚠️ RÈGLE ABSOLUE:** Ces credentials sont pour **instance port 5433** uniquement.

---

## Architecture Database (STRICT)

### Règle #1: 1 Projet = 1 Database Dédiée

**❌ INTERDIT:**
```
postgres
├── schema: project1
├── schema: project2  ← JAMAIS mélanger projets
└── schema: project3
```

**✅ CORRECT:**
```
Database: project1_db
├── schema: public (défaut PostgreSQL)
│   ├── table: users
│   ├── table: tasks
│   └── table: sessions

Database: project2_db
├── schema: public
│   ├── table: products
│   └── table: orders
```

**Principe:** Isolation complète. Chaque projet a sa propre database.

---

### Règle #2: Naming Convention Databases

**Format:** `[nom_projet]_db`

**Exemples:**
- Projet "time-master" → Database `time_master_db`
- Projet "task-manager" → Database `task_manager_db`
- Projet "dashboard-admin" → Database `dashboard_admin_db`

**Caractères autorisés:** `[a-z0-9_]` (lowercase, chiffres, underscore uniquement)

---

## Workflow Création Database

### Phase 1: Check Database Existe

**AVANT créer, TOUJOURS vérifier si existe déjà:**

```bash
# Liste toutes les databases
PGPASSWORD="Voiture789" psql -h 89.116.27.88 -p 5433 -U pentester -d postgres -c "\l" | grep -i "nom_projet"

# Si existe déjà
# → Demander user: "Database existe, utiliser existante ou recréer?"
```

---

### Phase 2: Créer Database

**Commande EXACTE (testée et fonctionnelle):**

```bash
# Créer nouvelle database
PGPASSWORD="Voiture789" psql \
  -h 89.116.27.88 \
  -p 5433 \
  -U pentester \
  -d postgres \
  -c "CREATE DATABASE nom_projet_db ENCODING 'UTF8';"

# Vérifier création
PGPASSWORD="Voiture789" psql \
  -h 89.116.27.88 \
  -p 5433 \
  -U pentester \
  -d postgres \
  -c "\l" | grep nom_projet_db

# Si succès
echo "✅ Database nom_projet_db créée"
```

**En cas d'erreur "database exists":**
```bash
# Option 1: Utiliser existante (recommandé)
echo "Database existe déjà, réutilisation"

# Option 2: Drop et recréer (DANGER - demander confirmation user)
PGPASSWORD="Voiture789" psql \
  -h 89.116.27.88 \
  -p 5433 \
  -U pentester \
  -d postgres \
  -c "DROP DATABASE nom_projet_db;"

# Puis recréer
PGPASSWORD="Voiture789" psql \
  -h 89.116.27.88 \
  -p 5433 \
  -U pentester \
  -d postgres \
  -c "CREATE DATABASE nom_projet_db ENCODING 'UTF8';"
```

---

## Prisma Setup (Workflow Complet)

### Phase 1: DATABASE_URL Configuration

**Créer fichier `.env` avec DATABASE_URL:**

```bash
# Format DATABASE_URL
DATABASE_URL="postgresql://pentester:Voiture789@89.116.27.88:5433/nom_projet_db?schema=public"
```

**Breakdown:**
- `postgresql://` - Protocol
- `pentester` - User
- `Voiture789` - Password
- `89.116.27.88` - VPS IP
- `5433` - Port
- `nom_projet_db` - Database name (créée précédemment)
- `?schema=public` - PostgreSQL schema (défaut)

**Fichier .env complet:**
```env
# Database
DATABASE_URL="postgresql://pentester:Voiture789@89.116.27.88:5433/time_master_db?schema=public"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-genere"
```

---

### Phase 2: Prisma Schema Generation

**Créer `prisma/schema.prisma` selon features projet:**

**Exemple: Dashboard Time Tracking + Tasks**

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Models selon features demandées

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String   // Hashed
  role      Role     @default(USER)

  tasks     Task[]
  timeEntries TimeEntry[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
}

model Task {
  id          String   @id @default(cuid())
  title       String
  description String?
  status      TaskStatus @default(TODO)
  priority    Priority   @default(MEDIUM)

  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  timeEntries TimeEntry[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}

model TimeEntry {
  id        String   @id @default(cuid())
  startTime DateTime
  endTime   DateTime?
  duration  Int?     // Seconds

  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@index([taskId])
  @@index([userId])
}
```

**Adapter models selon features demandées:**
- Auth → Model User + Session
- Tasks → Model Task
- Time tracking → Model TimeEntry
- Categories → Model Category
- Tags → Model Tag
- Analytics → Pas de model (calculé depuis données existantes)

---

### Phase 3: Prisma Client Generation

```bash
# Install Prisma
npm install prisma @prisma/client

# Generate Prisma Client
npx prisma generate

echo "✅ Prisma Client généré"
```

---

### Phase 4: Database Push (Development)

**Pour développement (recommandé pour prototypes/MVP):**

```bash
# Push schema vers database (sans migrations)
npx prisma db push

# Résultat:
# - Crée tables dans PostgreSQL
# - Applique schema.prisma
# - Pas de fichiers migration

echo "✅ Schema pushed to database"
```

**OU Migrations (Production - plus strict):**

```bash
# Créer migration
npx prisma migrate dev --name init

# Résultat:
# - Crée prisma/migrations/
# - Applique migration
# - Historique migrations tracé

echo "✅ Migration init applied"
```

**Différence:**
- `db push` → Rapide, développement, pas d'historique
- `migrate dev` → Production-ready, historique, rollback possible

**Utiliser:** `db push` par défaut (sauf si user demande migrations explicitement)

---

### Phase 5: Prisma Client Singleton

**Créer `lib/prisma.ts` (évite multiple instances):**

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Usage dans API routes:**

```typescript
// app/api/tasks/route.ts
import { prisma } from '@/lib/prisma'

export async function GET() {
  const tasks = await prisma.task.findMany({
    include: { user: true }
  })
  return Response.json(tasks)
}
```

---

## Seeding Data (Données Test)

### Créer Script Seed

**`prisma/seed.ts`:**

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Delete existing data
  await prisma.timeEntry.deleteMany()
  await prisma.task.deleteMany()
  await prisma.user.deleteMany()

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // Create test user
  const userPassword = await bcrypt.hash('user123', 10)
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'Test User',
      password: userPassword,
      role: 'USER',
    },
  })

  // Create sample tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Setup project',
        description: 'Initialize Next.js + Prisma',
        status: 'DONE',
        priority: 'HIGH',
        userId: admin.id,
      },
      {
        title: 'Build dashboard',
        description: 'Create admin dashboard UI',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        userId: admin.id,
      },
      {
        title: 'Write documentation',
        description: 'Document API endpoints',
        status: 'TODO',
        priority: 'MEDIUM',
        userId: user.id,
      },
    ],
  })

  console.log('✅ Database seeded!')
  console.log('📧 Admin: admin@example.com / admin123')
  console.log('📧 User: user@example.com / user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

**Ajouter script dans `package.json`:**

```json
{
  "scripts": {
    "prisma:seed": "tsx prisma/seed.ts"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

**Exécuter seed:**

```bash
# Install tsx (TypeScript executor)
npm install -D tsx

# Run seed
npm run prisma:seed

# Ou après migrate
npx prisma migrate reset --skip-seed
npx prisma db seed
```

---

## Prisma Studio (Database GUI)

**Lancer interface graphique Prisma:**

```bash
npx prisma studio

# Ouvre navigateur: http://localhost:5555
# Interface pour voir/éditer données directement
```

**Utile pour:**
- Vérifier données créées
- Debug relations
- Éditer manuellement
- Tester queries

---

## Troubleshooting Database

### Erreur: "Can't reach database server"

**Check:**
1. PostgreSQL VPS accessible?
   ```bash
   ping 89.116.27.88
   ```

2. Port 5433 ouvert?
   ```bash
   nc -zv 89.116.27.88 5433
   ```

3. Credentials corrects dans .env?
   ```bash
   cat .env | grep DATABASE_URL
   ```

---

### Erreur: "Database does not exist"

**Solution:**
```bash
# Créer database
PGPASSWORD="Voiture789" psql \
  -h 89.116.27.88 \
  -p 5433 \
  -U pentester \
  -d postgres \
  -c "CREATE DATABASE nom_projet_db;"

# Puis retry prisma db push
npx prisma db push
```

---

### Erreur: "Prisma schema mismatch"

**Solution:**
```bash
# Regenerate Prisma Client
npx prisma generate

# Reset database (DANGER - perte données)
npx prisma migrate reset

# Ou push nouveau schema
npx prisma db push --force-reset
```

---

## Backup & Restore Database

### Backup Database

```bash
# Dump database to SQL file
PGPASSWORD="Voiture789" pg_dump \
  -h 89.116.27.88 \
  -p 5433 \
  -U pentester \
  -d nom_projet_db \
  -F c \
  -f backup_$(date +%Y%m%d_%H%M%S).dump

echo "✅ Backup créé: backup_YYYYMMDD_HHMMSS.dump"
```

### Restore Database

```bash
# Restore from dump
PGPASSWORD="Voiture789" pg_restore \
  -h 89.116.27.88 \
  -p 5433 \
  -U pentester \
  -d nom_projet_db \
  -c \
  backup_20250111_143000.dump

echo "✅ Database restored"
```

---

## Best Practices

### 1. Naming Conventions

**Tables:** PascalCase singular
- ✅ `User`, `Task`, `TimeEntry`
- ❌ `users`, `Tasks`, `time_entries`

**Columns:** camelCase
- ✅ `createdAt`, `userId`, `startTime`
- ❌ `created_at`, `user_id`, `start_time`

**Enums:** UPPER_CASE
- ✅ `enum TaskStatus { TODO, IN_PROGRESS, DONE }`
- ❌ `enum TaskStatus { todo, inProgress, done }`

---

### 2. Relations & Indexes

**TOUJOURS:**
- `@@index` sur foreign keys
- `onDelete: Cascade` pour cleanup auto
- `@unique` sur emails/usernames

```prisma
model Task {
  userId String
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])  // ✅ Performance query
}
```

---

### 3. Timestamps

**TOUJOURS ajouter:**
```prisma
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```

---

### 4. IDs

**Préférer CUID sur UUID:**
```prisma
id String @id @default(cuid())  // ✅ Plus court, URL-friendly
```

---

## Workflow Complet Exemple

**User demande:** "Dashboard time tracking + tasks avec auth"

**EXECUTOR + skill database:**

```bash
# 1. Créer database
PGPASSWORD="Voiture789" psql -h 89.116.27.88 -p 5433 -U pentester -d postgres \
  -c "CREATE DATABASE time_tracker_db;"

# 2. Créer .env
cat > .env <<EOF
DATABASE_URL="postgresql://pentester:Voiture789@89.116.27.88:5433/time_tracker_db?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
EOF

# 3. Créer prisma/schema.prisma (User, Task, TimeEntry models)

# 4. Install Prisma
npm install prisma @prisma/client

# 5. Generate client
npx prisma generate

# 6. Push schema
npx prisma db push

# 7. Créer lib/prisma.ts (singleton)

# 8. Seed données test
npm run prisma:seed

# Résultat:
# ✅ Database time_tracker_db créée
# ✅ Tables: User, Task, TimeEntry
# ✅ Données test (admin + user + 3 tasks)
# ✅ Ready pour API routes
```

---

## Conventions Non-Negotiables

1. **1 projet = 1 database** (isolation complète)
2. **Naming:** `[nom_projet]_db` (lowercase + underscore)
3. **Credentials VPS hardcodés** (89.116.27.88:5433)
4. **Prisma Client singleton** (lib/prisma.ts obligatoire)
5. **db push pour dev** (migrate dev si demandé explicitement)
6. **Indexes sur FK** (performance queries)
7. **Timestamps** (createdAt + updatedAt)
8. **Seeding données test** (facilite développement)

---

**Inspiré de:**
- Prisma Best Practices (prisma.io/docs)
- PostgreSQL Documentation (postgresql.org)
- Database-per-Service Pattern (microservices)
- Twelve-Factor App (database as resource)

---

**Version**: 1.0.0
**Last updated**: 2025-01-11
**Maintained by**: EXECUTOR agent
