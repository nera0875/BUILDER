# Template Pre-Build System

**Optimization pour démarrage instantané des projets**

## Problème Résolu

**Avant:**
- Clone .stack/ → Build Next.js (20s) → Start
- Chaque nouveau projet rebuild 57 composants shadcn
- Temps total: ~25-30s par projet

**Après:**
- Clone template pré-built → Start (2-3s)
- Build fait une seule fois
- Temps total: ~5-10s par projet

## Architecture

```
BUILDER/
├── .stack/                    # Source template (éditable)
└── bin/
    ├── build-stack-template   # Build .stack/ → /opt/builder/template-ready
    ├── rebuild-stack          # Wrapper avec confirmation
    └── check-template         # Status template actuel

/opt/builder/template-ready/   # Template pré-built (prêt à cloner)
├── .next/                     # Next.js build output
├── node_modules/              # Dependencies installées
├── components/ui/             # 57 shadcn components
└── .built-at                  # Metadata (date, versions)
```

## Usage

### First-Time Setup

```bash
# Build template for first time
rebuild-stack

# Output:
# [1/6] Cleaning old template...
# [2/6] Copying .stack/ files...
# [3/6] Installing dependencies...
# [4/6] Building Next.js production...
# [5/6] Cleaning dev artifacts...
# [6/6] Creating metadata...
# ✓ Template built successfully!
```

### Check Status

```bash
check-template

# Output:
# ✓ Pre-built template exists
# Built at: 2025-01-11 19:30:00 UTC
# Size: 450MB
# Status: Ready for instant project creation
```

### Rebuild After Changes

**Quand rebuilder:**
- Modifié .stack/package.json (nouvelles deps)
- Ajouté composants shadcn
- Changé configuration Next.js
- Updated Tailwind config

```bash
rebuild-stack

# Confirms:
# This will rebuild the template from .stack/
# All projects created after will use the new template
# Continue? [y/N] y
```

## Integration with create-project-stream

Le script `create-project-stream` utilise automatiquement le template pré-built:

```bash
# Ligne 43-47:
send_event "clone" "Cloning optimized template..." "progress"
mkdir -p "$PROJECT_PATH"
cp -r /opt/builder/template-ready/* "$PROJECT_PATH"/
cp -r /opt/builder/template-ready/.next "$PROJECT_PATH"/
send_event "clone" "Template cloned (0.5s)" "success"
```

**Fallback automatique:**
Si `/opt/builder/template-ready` n'existe pas:
- Script affiche warning
- Clone .stack/ (mode standard)
- Build nécessaire (20s supplémentaires)

## Performance Gains

### Nouveau Projet (avec template pré-built)

```
Timeline:
0s    → Clone template-ready (0.5s)
0.5s  → Init .build/ (0.2s)
0.7s  → Check deps (0.1s - déjà installées)
0.8s  → Deploy PM2 (0.5s)
1.3s  → Health check (2s max)
3.3s  → ✓ Project ready

Total: ~5-10s
```

### Nouveau Projet (sans template, build from scratch)

```
Timeline:
0s    → Clone .stack/ (0.5s)
0.5s  → Init .build/ (0.2s)
0.7s  → npm install (15s)
15.7s → npm run build (20s)
35.7s → Deploy PM2 (0.5s)
36.2s → Health check (2s max)
38.2s → ✓ Project ready

Total: ~35-40s
```

**Gain: 7-8x plus rapide**

## Maintenance

### Auto-Rebuild on .stack/ Changes

Pas encore implémenté, mais possible:

```bash
# Watch .stack/ for changes
watch-stack-changes() {
  inotifywait -m .stack/ -e modify,create,delete |
  while read path action file; do
    echo "Change detected: $file"
    echo "Recommend: rebuild-stack"
  done
}
```

### Disk Space

Template pré-built: ~450-500MB
- .next/: ~200MB
- node_modules/: ~250MB

**Trade-off:** 500MB disk space → Économie 20s par projet

Si 100 projets créés/mois:
- Temps économisé: 100 × 20s = 2000s (~33 minutes/mois)
- Espace utilisé: 500MB (permanent)

## Troubleshooting

### Template Corrupted

```bash
# Symptom: Projects fail to start
# Solution: Rebuild
rebuild-stack
```

### Build Errors

```bash
# Check .stack/ is valid
cd /home/pilote/projet/primaire/BUILDER/.stack
npm install
npm run build

# If works, rebuild template
rebuild-stack
```

### Missing Template

```bash
# Symptom: check-template shows "not found"
# Solution: Build for first time
rebuild-stack
```

## Future Optimizations

1. **Incremental builds**: Detect what changed, rebuild only affected parts
2. **Multiple templates**: Frontend-only, Full-stack, API-only
3. **Auto-rebuild**: On .stack/ push to main
4. **Template versioning**: Keep 3 last versions for rollback

---

**Version**: 1.0.0
**Created**: 2025-01-11
**Maintained**: Orchestrator
