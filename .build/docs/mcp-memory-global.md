# MCP Memory Server - Global VPS

**Location:** `/home/pilote/.mcp-servers/memory/`
**Database:** PostgreSQL + pgvector (port 5434)
**Scope:** Global - Disponible pour TOUS les projets du VPS

---

## Problème Résolu

Chrome DevTools MCP avait l'erreur: `--browserUrl` vs `--browser-url=URL`

Avant, je devais rechercher sur internet à chaque fois. **Maintenant je sauvegarde:**

```python
memory_save(
    key="chrome-mcp-fix",
    content="Chrome DevTools MCP requires --browser-url=http://localhost:9222 not --browserUrl (kebab-case with =)",
    metadata={"category": "mcp", "tool": "chrome-devtools"}
)
```

**Et je récupère avec RAG sémantique:**

```python
memory_get("How to fix Chrome MCP connection?")
# → Retourne automatiquement la solution avec score similarité
```

---

## Tools Disponibles

### `memory_save(key, content, metadata)`

Sauvegarde une information avec recherche sémantique.

**Exemples:**

```python
# Configuration MCP
memory_save(
    key="mcp-config-global",
    content="MCP servers go in ~/.claude/.mcp.json NOT in settings.json",
    metadata={"type": "config", "tool": "mcp"}
)

# Fix technique
memory_save(
    key="pgvector-install",
    content="pgvector needs --browser-url (kebab-case) not --browserUrl (camelCase)",
    metadata={"type": "fix", "database": "postgresql"}
)

# Credentials
memory_save(
    key="postgres-memory-creds",
    content="postgresql://postgres:memory_secure_pass@localhost:5434/memory",
    metadata={"type": "credentials", "service": "postgresql"}
)
```

### `memory_get(query, limit=5)`

Recherche sémantique (RAG) avec pgvector.

**Exemples:**

```python
memory_get("How to configure MCP servers globally?")
memory_get("PostgreSQL connection string for memory")
memory_get("Fix Chrome DevTools MCP")
```

### `memory_list(limit=20)`

Liste toutes les mémoires (récentes d'abord).

### `memory_delete(key)`

Supprime une mémoire par clé.

---

## Architecture

```
PostgreSQL (Docker pgvector/pgvector:pg16)
├── Port: 5434
├── Database: memory
├── Table: memories
│   ├── id (SERIAL)
│   ├── key (TEXT UNIQUE)
│   ├── content (TEXT)
│   ├── embedding (vector(384))  ← Semantic search
│   ├── metadata (JSONB)
│   ├── created_at (TIMESTAMP)
│   └── updated_at (TIMESTAMP)
└── Index: IVFFlat (vector_cosine_ops)

Embeddings: sentence-transformers (all-MiniLM-L6-v2)
├── Model: Local (pas d'API key nécessaire)
├── Dimensions: 384
└── Similarité: Cosine distance
```

---

## Configuration

**Config globale:** `~/.claude/.mcp.json`

```json
{
  "mcpServers": {
    "memory": {
      "command": "python3",
      "args": ["/home/pilote/.mcp-servers/memory/server.py"],
      "env": {
        "DATABASE_URL": "postgresql://postgres:memory_secure_pass@localhost:5434/memory"
      }
    }
  }
}
```

**Redémarrer Claude Code** pour charger le MCP.

---

## Cas d'Usage

### 1. Sauvegarder Fixes Techniques

```python
memory_save(
    key="next-partial-prerendering",
    content="Next.js 15 experimental.ppr must be enabled in next.config.js for partial prerendering",
    metadata={"framework": "nextjs", "version": "15"}
)
```

### 2. Credentials & Configs

```python
memory_save(
    key="blv-db-creds",
    content="postgresql://pentester:Voiture789@localhost:5433/blv",
    metadata={"project": "BLV", "type": "database"}
)
```

### 3. Décisions Architecture (ADR)

```python
memory_save(
    key="adr-001-mcp-global",
    content="Decision: Use ~/.claude/.mcp.json for global MCP servers. Reason: Available across all projects. Alternative rejected: Per-project .mcp.json (duplication)",
    metadata={"type": "adr", "date": "2025-11-12"}
)
```

### 4. RAG Recherche

```python
# Question naturelle
memory_get("Comment installer pgvector dans PostgreSQL Docker?")

# Retourne:
# {
#   "results": [
#     {
#       "key": "pgvector-docker-install",
#       "content": "Use pgvector/pgvector:pg16 image directly instead of compiling...",
#       "similarity": 0.892
#     }
#   ]
# }
```

---

## Troubleshooting

**MCP not loading:**
- Redémarrer Claude Code complètement
- Vérifier `/mcp` dans Claude Code
- Check logs: `python3 /home/pilote/.mcp-servers/memory/server.py`

**Model loading slow:**
- Première fois: ~30s (download model)
- Après: Cached dans `~/.cache/huggingface/`

**PostgreSQL connection error:**
- Container running: `docker ps | grep mcp-memory-postgres`
- Port 5434 libre: `lsof -i :5434`

---

## Maintenance

**Backup DB:**
```bash
docker exec mcp-memory-postgres pg_dump -U postgres memory > memory_backup.sql
```

**Restore:**
```bash
cat memory_backup.sql | docker exec -i mcp-memory-postgres psql -U postgres -d memory
```

**Stats:**
```sql
SELECT COUNT(*) FROM memories;
SELECT key, similarity FROM memories ORDER BY updated_at DESC LIMIT 10;
```

---

**Created:** 2025-11-12
**Version:** 1.0
**Status:** ✅ Production Ready
