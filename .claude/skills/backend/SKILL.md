---
name: backend
description: Universal Python/Node.js backend expert. Handles API routes, database operations, business logic, configuration management, anti-duplication checks. Auto-activates on keywords "backend", "API", "database", "server", "endpoint", "Python", "FastAPI" or paths api/**, services/**, models/**.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Backend Development Skill

> **Universal Python Backend Expert**
>
> Inspiré de : Google Python Style Guide, FastAPI Best Practices, Django Patterns, 12-Factor App

---

## Scope & Activation

**Chargé par:** EXECUTOR agent

**Auto-activé si keywords:**
- `backend`, `API`, `database`, `server`, `endpoint`
- `Python`, `FastAPI`, `Flask`, `Django`
- `Prisma`, `SQLAlchemy`, `PostgreSQL`, `MongoDB`
- Paths: `api/**`, `services/**`, `models/**`, `*.py`

**Frameworks supportés:**
- Python 3.10+ (FastAPI, Flask, Django)
- Node.js 18+ (Express, NestJS) - conventions adaptées
- Prisma ORM
- PostgreSQL / MongoDB

---

## Architecture Stricte Python (12-Factor App)

### Structure par fonctionnalité

```
project/
├── config.py              # Configuration centralisée (UNIQUE)
│
├── models/                # Data models (Pydantic, SQLAlchemy)
│   ├── __init__.py
│   ├── user.py
│   ├── task.py
│   └── base.py           # Base classes
│
├── services/              # Business logic (singleton pattern)
│   ├── __init__.py
│   ├── user_service.py
│   ├── task_service.py
│   └── db_client.py      # Database singleton
│
├── api/                   # API routes/controllers
│   ├── __init__.py
│   ├── routes/
│   │   ├── users.py
│   │   └── tasks.py
│   └── middleware/
│       ├── auth.py
│       └── error_handler.py
│
├── utils/                 # Fonctions utilitaires partagées
│   ├── __init__.py
│   ├── validators.py
│   ├── parsers.py
│   └── helpers.py
│
├── tests/                 # Tests unitaires/intégration
│   ├── __init__.py
│   ├── test_users.py
│   └── test_tasks.py
│
├── .env                   # Variables environnement (GIT IGNORED)
├── .env.example           # Template .env (committed)
├── requirements.txt       # Dependencies Python
└── main.py                # Entry point application
```

**Principe:** Domain-Driven Design (DDD), separation of concerns, single responsibility.
(Clean Architecture - Uncle Bob, FastAPI structure, Django apps pattern)

---

## Configuration Centralisée (RÈGLE #1)

### 1 SEUL fichier config.py

**OBLIGATOIRE:** Toute configuration dans `config.py` (jamais éparpillée)

```python
# config.py
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    """Configuration centralisée - Single source of truth"""

    # App
    app_name: str = "MyApp"
    debug: bool = False
    environment: str = "production"

    # Database
    database_url: str
    db_pool_size: int = 10
    db_max_overflow: int = 20

    # API
    api_prefix: str = "/api/v1"
    cors_origins: list[str] = ["*"]

    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # External APIs
    stripe_api_key: str | None = None
    sendgrid_api_key: str | None = None

    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    """Singleton pattern - Une seule instance config"""
    return Settings()

# Usage partout dans le projet
settings = get_settings()
```

**Usage dans autres fichiers:**

```python
from config import settings

# ✅ Correct
db_url = settings.database_url

# ❌ INTERDIT - Pas de config éparpillée
DB_URL = "postgresql://..."  # Hardcodé
```

---

### .env structure (jamais commité)

```bash
# .env (dans .gitignore)

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256

# APIs
STRIPE_API_KEY=sk_test_...
SENDGRID_API_KEY=SG...

# App
DEBUG=true
ENVIRONMENT=development
```

**TOUJOURS créer `.env.example`** (template commité) :

```bash
# .env.example (commité Git)

DATABASE_URL=postgresql://user:pass@localhost:5432/db
SECRET_KEY=changeme
STRIPE_API_KEY=
SENDGRID_API_KEY=
DEBUG=false
ENVIRONMENT=production
```

**Principe:** 12-Factor App - Config via environment variables.
(Heroku methodology, Docker best practices)

---

## Services Pattern (Singleton)

### Business logic dans `/services`

**RÈGLE:** Pas de logique métier dans routes (controllers thin, services fat)

```python
# services/task_service.py

from typing import List, Optional
from models.task import Task, TaskCreate, TaskUpdate
from services.db_client import DatabaseClient

class TaskService:
    """Service singleton pour gestion tasks"""

    _instance = None

    def __new__(cls):
        """Singleton pattern"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self.db = DatabaseClient()
        self._initialized = True

    def get_all_tasks(self, user_id: str) -> List[Task]:
        """Récupère toutes les tasks d'un user"""
        query = "SELECT * FROM tasks WHERE user_id = %s"
        results = self.db.execute(query, (user_id,), fetch=True)
        return [Task(**row) for row in results]

    def create_task(self, user_id: str, task_data: TaskCreate) -> Task:
        """Crée nouvelle task avec validation"""
        # Validation business logic
        if not task_data.title.strip():
            raise ValueError("Task title cannot be empty")

        # Insert DB
        query = """
            INSERT INTO tasks (user_id, title, description, status)
            VALUES (%s, %s, %s, %s)
            RETURNING *
        """
        result = self.db.execute(
            query,
            (user_id, task_data.title, task_data.description, "pending"),
            fetch=True
        )
        return Task(**result[0])

    def delete_task(self, task_id: str, user_id: str) -> bool:
        """Supprime task avec vérification ownership"""
        # Business logic: vérifier ownership
        task = self.get_task_by_id(task_id)
        if not task or task.user_id != user_id:
            raise PermissionError("Task not found or access denied")

        # Delete
        query = "DELETE FROM tasks WHERE id = %s"
        self.db.execute(query, (task_id,))
        return True

# Singleton instance globale
task_service = TaskService()
```

**Usage dans routes:**

```python
# api/routes/tasks.py
from fastapi import APIRouter, Depends
from services.task_service import task_service

router = APIRouter()

@router.get("/tasks")
async def get_tasks(user_id: str):
    """Controller thin - délègue au service"""
    return task_service.get_all_tasks(user_id)

@router.post("/tasks")
async def create_task(user_id: str, task: TaskCreate):
    """Validation + error handling only"""
    try:
        return task_service.create_task(user_id, task)
    except ValueError as e:
        raise HTTPException(400, str(e))
```

**Principe:** Separation of concerns, testability, reusability.
(Service Layer Pattern - Fowler, Clean Architecture)

---

## Models Pattern (Pydantic + SQLAlchemy)

### Pydantic pour validation API

```python
# models/task.py
from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional

class TaskBase(BaseModel):
    """Base model réutilisable"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    status: str = Field(default="pending")

    @validator("status")
    def validate_status(cls, v):
        """Validation custom"""
        allowed = ["pending", "in_progress", "completed"]
        if v not in allowed:
            raise ValueError(f"Status must be one of {allowed}")
        return v

class TaskCreate(TaskBase):
    """Model pour création (pas d'ID)"""
    pass

class TaskUpdate(BaseModel):
    """Model pour update (tous champs optionnels)"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[str] = None

class Task(TaskBase):
    """Model complet avec metadata DB"""
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Permet conversion depuis ORM
```

**Principe:** Validation stricte input, separation create/update/read models.
(DTO Pattern, CQRS light)

---

## Anti-Duplication (RÈGLE ABSOLUE)

### AVANT créer fonction/classe

**Checklist obligatoire:**

1. ✅ **Check `utils/` existe déjà?**

```python
# ❌ INTERDIT - Dupliquer fonction existante
def format_date(date):
    return date.strftime("%Y-%m-%d")

# ✅ CORRECT - Utiliser utils existant
from utils.helpers import format_date
```

2. ✅ **Check service existe déjà?**

```python
# ❌ INTERDIT - Logique métier dans route
@router.post("/tasks")
def create_task(task: TaskCreate):
    # Logique ici = MAUVAIS
    db.execute("INSERT...")

# ✅ CORRECT - Déléguer au service
@router.post("/tasks")
def create_task(task: TaskCreate):
    return task_service.create_task(task)
```

3. ✅ **Check config existe déjà?**

```python
# ❌ INTERDIT - Config éparpillée
DB_URL = "postgresql://..."
SECRET_KEY = "abc123"

# ✅ CORRECT - Config centralisée
from config import settings
db_url = settings.database_url
```

---

### Principe DRY (Don't Repeat Yourself)

**Si code répété 2+ fois → Extraire fonction/classe**

❌ **Duplication:**

```python
# File 1
result = db.execute("SELECT * FROM users WHERE id = %s", (user_id,))
if not result:
    raise HTTPException(404, "User not found")

# File 2
result = db.execute("SELECT * FROM tasks WHERE id = %s", (task_id,))
if not result:
    raise HTTPException(404, "Task not found")
```

✅ **Fonction réutilisable:**

```python
# utils/db_helpers.py
def get_or_404(table: str, id: str, name: str = "Resource"):
    """Récupère entité ou 404"""
    result = db.execute(f"SELECT * FROM {table} WHERE id = %s", (id,))
    if not result:
        raise HTTPException(404, f"{name} not found")
    return result[0]

# Usage
user = get_or_404("users", user_id, "User")
task = get_or_404("tasks", task_id, "Task")
```

---

## Conventions Nommage Python (PEP 8)

### snake_case pour fonctions/variables

```python
# ✅ Correct
def calculate_total_price(items: list) -> float:
    user_id = get_current_user()
    tax_rate = 0.20
```

❌ **CamelCase interdit pour fonctions:**

```python
def CalculateTotalPrice(items):  # ❌ INTERDIT
    userId = getCurrentUser()     # ❌ INTERDIT
```

---

### PascalCase pour classes

```python
# ✅ Correct
class TaskService:
    pass

class UserModel:
    pass
```

---

### SCREAMING_SNAKE_CASE pour constantes

```python
# ✅ Correct
MAX_RETRIES = 3
DEFAULT_TIMEOUT = 30
API_BASE_URL = "https://api.example.com"
```

---

### Préfixe `_` pour méthodes privées

```python
class UserService:
    def get_user(self, user_id: str):
        """Méthode publique"""
        return self._fetch_from_db(user_id)

    def _fetch_from_db(self, user_id: str):
        """Méthode privée (interne uniquement)"""
        return db.query(user_id)
```

---

## Error Handling (Strict)

### Try/Except obligatoire services

```python
# services/user_service.py
from utils.errors import ServiceError, NotFoundError, ValidationError

class UserService:
    def create_user(self, user_data: UserCreate) -> User:
        """Crée user avec error handling strict"""
        try:
            # Validation
            if self._user_exists(user_data.email):
                raise ValidationError("Email already exists")

            # Business logic
            hashed_password = self._hash_password(user_data.password)

            # DB operation
            query = "INSERT INTO users (email, password) VALUES (%s, %s) RETURNING *"
            result = self.db.execute(query, (user_data.email, hashed_password), fetch=True)

            return User(**result[0])

        except ValidationError:
            raise  # Re-raise validation errors
        except Exception as e:
            # Log + wrap dans ServiceError
            logger.error(f"Failed to create user: {e}")
            raise ServiceError("Failed to create user") from e
```

**Custom exceptions:**

```python
# utils/errors.py
class ServiceError(Exception):
    """Base service error"""
    pass

class NotFoundError(ServiceError):
    """Resource not found"""
    pass

class ValidationError(ServiceError):
    """Validation failed"""
    pass

class PermissionError(ServiceError):
    """Permission denied"""
    pass
```

**Error handling dans routes (FastAPI):**

```python
# api/routes/users.py
from fastapi import HTTPException
from utils.errors import NotFoundError, ValidationError

@router.post("/users")
async def create_user(user: UserCreate):
    try:
        return user_service.create_user(user)
    except ValidationError as e:
        raise HTTPException(400, str(e))
    except ServiceError as e:
        raise HTTPException(500, str(e))
```

**Principe:** Fail fast, explicit errors, logging.
(Railway Oriented Programming, Result types pattern)

---

## Database Client Singleton

### services/db_client.py

```python
# services/db_client.py
import psycopg2
from psycopg2.extras import RealDictCursor
from config import settings
from typing import Optional, List, Dict, Any

class DatabaseClient:
    """Singleton database client"""

    _instance = None
    _connection = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._connect()
        self._initialized = True

    def _connect(self):
        """Établit connexion DB"""
        self._connection = psycopg2.connect(
            settings.database_url,
            cursor_factory=RealDictCursor
        )

    def execute(
        self,
        query: str,
        params: Optional[tuple] = None,
        fetch: bool = False
    ) -> Optional[List[Dict[str, Any]]]:
        """Execute query avec gestion erreurs"""
        try:
            with self._connection.cursor() as cursor:
                cursor.execute(query, params)

                if fetch:
                    return cursor.fetchall()

                self._connection.commit()
                return None

        except Exception as e:
            self._connection.rollback()
            raise DatabaseError(f"Query failed: {e}") from e

    def close(self):
        """Ferme connexion"""
        if self._connection:
            self._connection.close()

# Singleton global
db = DatabaseClient()
```

**Usage:**

```python
from services.db_client import db

# Select
users = db.execute("SELECT * FROM users WHERE active = %s", (True,), fetch=True)

# Insert
db.execute("INSERT INTO users (email) VALUES (%s)", ("test@example.com",))
```

---

## API Routes Structure (FastAPI)

### api/routes/tasks.py

```python
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from models.task import Task, TaskCreate, TaskUpdate
from services.task_service import task_service
from api.middleware.auth import get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("/", response_model=List[Task])
async def list_tasks(user_id: str = Depends(get_current_user)):
    """Liste toutes les tasks du user"""
    return task_service.get_all_tasks(user_id)

@router.post("/", response_model=Task, status_code=201)
async def create_task(
    task: TaskCreate,
    user_id: str = Depends(get_current_user)
):
    """Crée nouvelle task"""
    try:
        return task_service.create_task(user_id, task)
    except ValidationError as e:
        raise HTTPException(400, str(e))
    except ServiceError as e:
        raise HTTPException(500, str(e))

@router.get("/{task_id}", response_model=Task)
async def get_task(
    task_id: str,
    user_id: str = Depends(get_current_user)
):
    """Récupère task par ID"""
    task = task_service.get_task_by_id(task_id)
    if not task or task.user_id != user_id:
        raise HTTPException(404, "Task not found")
    return task

@router.patch("/{task_id}", response_model=Task)
async def update_task(
    task_id: str,
    task_update: TaskUpdate,
    user_id: str = Depends(get_current_user)
):
    """Met à jour task"""
    try:
        return task_service.update_task(task_id, user_id, task_update)
    except NotFoundError:
        raise HTTPException(404, "Task not found")
    except PermissionError:
        raise HTTPException(403, "Access denied")

@router.delete("/{task_id}", status_code=204)
async def delete_task(
    task_id: str,
    user_id: str = Depends(get_current_user)
):
    """Supprime task"""
    try:
        task_service.delete_task(task_id, user_id)
    except NotFoundError:
        raise HTTPException(404, "Task not found")
    except PermissionError:
        raise HTTPException(403, "Access denied")
```

**Main app registration:**

```python
# main.py
from fastapi import FastAPI
from api.routes import tasks, users
from config import settings

app = FastAPI(title=settings.app_name)

# Register routers
app.include_router(tasks.router, prefix=settings.api_prefix)
app.include_router(users.router, prefix=settings.api_prefix)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

---

## Middleware Pattern

### api/middleware/auth.py

```python
from fastapi import Depends, HTTPException, Header
from typing import Optional
from services.auth_service import auth_service

async def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    """Middleware auth - vérifie token JWT"""
    if not authorization:
        raise HTTPException(401, "Missing authorization header")

    try:
        token = authorization.replace("Bearer ", "")
        user_id = auth_service.verify_token(token)
        return user_id
    except Exception:
        raise HTTPException(401, "Invalid token")
```

**Usage dans routes:**

```python
@router.get("/tasks")
async def list_tasks(user_id: str = Depends(get_current_user)):
    # user_id déjà vérifié par middleware
    return task_service.get_all_tasks(user_id)
```

---

## Logging (Structured)

```python
# utils/logger.py
import logging
import sys
from config import settings

def setup_logger(name: str) -> logging.Logger:
    """Configure structured logger"""
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG if settings.debug else logging.INFO)

    # Console handler
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(
        "[%(asctime)s] %(levelname)s [%(name)s:%(lineno)d] %(message)s"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)

    return logger

# Usage
logger = setup_logger(__name__)
logger.info("User created", extra={"user_id": user.id})
logger.error("Database connection failed", exc_info=True)
```

---

## Testing Pattern

```python
# tests/test_task_service.py
import pytest
from services.task_service import TaskService
from models.task import TaskCreate

@pytest.fixture
def task_service():
    """Fixture service"""
    return TaskService()

@pytest.fixture
def mock_db(monkeypatch):
    """Mock database"""
    def mock_execute(*args, **kwargs):
        return [{"id": "123", "title": "Test", "status": "pending"}]

    monkeypatch.setattr("services.db_client.db.execute", mock_execute)

def test_create_task(task_service, mock_db):
    """Test création task"""
    task_data = TaskCreate(title="Test Task", description="Test")
    result = task_service.create_task("user_123", task_data)

    assert result.title == "Test Task"
    assert result.status == "pending"

def test_create_task_empty_title(task_service):
    """Test validation titre vide"""
    task_data = TaskCreate(title="", description="Test")

    with pytest.raises(ValueError, match="cannot be empty"):
        task_service.create_task("user_123", task_data)
```

---

## Interdictions Formelles

❌ **Logique métier dans routes** (controllers doivent être thin)
❌ **Config éparpillée** (1 seul config.py)
❌ **Hardcoded values** (use settings)
❌ **SQL injection** (toujours parameterized queries)
❌ **Passwords en clair** (toujours hasher)
❌ **Secrets dans Git** (.env dans .gitignore)
❌ **Fonctions globales dupliquées** (use utils/)

---

## Stack Minimal Python

```txt
# requirements.txt

# Core
fastapi==0.110.0
uvicorn[standard]==0.27.0
pydantic==2.6.0
pydantic-settings==2.1.0

# Database
psycopg2-binary==2.9.9
# OU
pymongo==4.6.0

# Security
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4

# Utils
python-dotenv==1.0.0
python-multipart==0.0.9

# Dev/Test
pytest==8.0.0
pytest-asyncio==0.23.0
black==24.0.0
ruff==0.2.0
```

---

## Conventions Non-Negotiables

1. **1 seul config.py** (configuration centralisée)
2. **Services singleton** (business logic isolée)
3. **snake_case fonctions/variables** (PEP 8)
4. **PascalCase classes** (PEP 8)
5. **Utils pour code partagé** (DRY principle)
6. **Error handling strict** (try/except + custom exceptions)
7. **Validation Pydantic** (input validation automatique)
8. **DB client singleton** (connexion unique réutilisable)
9. **Secrets dans .env** (jamais hardcodés)
10. **Logging structured** (debugging + monitoring)
11. **JAMAIS créer fichiers .md** (interdiction absolue)

**Cette architecture = OBLIGATOIRE. Toute déviation = tech debt garanti.**

---

## ❌ INTERDICTIONS DOCUMENTATION

**EXECUTOR (backend skill) ne doit JAMAIS:**

1. ❌ Créer fichiers .md (API_ROUTES.md, BACKEND_SETUP.md, etc)
2. ❌ Créer documentation (même dans .build/)
3. ❌ Expliquer son travail dans fichiers

**✅ À LA PLACE:**

**Return info structurée à ORCHESTRATOR après feature complétée:**

```json
{
  "routes_created": [
    "POST /api/tasks",
    "GET /api/tasks",
    "DELETE /api/tasks/:id"
  ],
  "models": [
    {
      "name": "Task",
      "fields": ["id", "title", "status", "createdAt"]
    },
    {
      "name": "TimeEntry",
      "fields": ["id", "taskId", "startTime", "endTime", "duration"]
    }
  ],
  "services": [
    "task.service.ts",
    "time-entry.service.ts"
  ],
  "database": {
    "name": "task_timer_db",
    "host": "89.116.27.88:5433"
  },
  "summary": "API CRUD tâches + time tracking avec Prisma"
}
```

**ORCHESTRATOR utilise return pour:**
- Update `.build/context.md` (section Routes API + Models)
- Append `.build/timeline.md` (historique feature)

**Principe:** 1 seul responsable documentation = ORCHESTRATOR
**Avantage:** Syntaxe uniforme, pas de duplication, info centralisée

---

**Inspiré de:**
- Google Python Style Guide (PEP 8 compliance)
- FastAPI Best Practices (Pydantic validation, dependency injection)
- Django Patterns (Service layer, managers)
- 12-Factor App (Config, dependencies, disposability)
- Clean Architecture (Uncle Bob - separation of concerns)

---

**Version**: 1.1.0
**Last updated**: 2025-01-11
**Maintained by**: EXECUTOR agent
**Changelog**:
- v1.1.0: Ajout interdiction création .md (return info structurée à orchestrator)
