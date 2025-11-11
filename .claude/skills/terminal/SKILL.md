# Terminal Display Skill

> **Display beautiful formatted output in terminal using ANSI codes & box drawing**
>
> Terminal: xterm-256color (full ANSI support)

---

## Quand utiliser ce skill?

✅ **Afficher plans/architecture après AskUserQuestion**
✅ **Tables de projets (list-projects)**
✅ **Progress bars (build/deploy)**
✅ **Diff coloré (git changes)**
✅ **Syntax highlighting (code preview)**

❌ **PAS pour questions user** (utiliser AskUserQuestion tool à la place)

---

## Capacités Terminal (xterm-256color)

### 1. ANSI Escape Codes (Couleurs & Styles)

**Format:** `\033[CODEm`

**Couleurs de base:**
```bash
\033[30m  # Noir
\033[31m  # Rouge
\033[32m  # Vert
\033[33m  # Jaune
\033[34m  # Bleu
\033[35m  # Magenta
\033[36m  # Cyan
\033[37m  # Blanc
\033[0m   # Reset (TOUJOURS finir avec ça!)
```

**Styles:**
```bash
\033[1m   # Bold (gras)
\033[2m   # Dim (atténué)
\033[4m   # Underline (souligné)
\033[7m   # Inverse (background ↔ foreground)
\033[0m   # Reset ALL styles
```

**256 couleurs (advanced):**
```bash
\033[38;5;NUMm  # Foreground color NUM (0-255)
\033[48;5;NUMm  # Background color NUM (0-255)

# Exemples:
\033[38;5;208m  # Orange
\033[38;5;201m  # Pink
\033[48;5;235m  # Dark grey background
```

**RGB True Color (16M colors):**
```bash
\033[38;2;R;G;Bm  # Foreground RGB
\033[48;2;R;G;Bm  # Background RGB

# Exemple:
\033[38;2;255;100;50m  # Custom orange
```

---

### 2. Box Drawing Characters (Unicode)

**Double line (╔═╗):**
```
╔ ╗  # Top corners
╚ ╝  # Bottom corners
║    # Vertical
═    # Horizontal
╠ ╣  # T-junctions (left/right)
╦ ╩  # T-junctions (top/bottom)
╬    # Cross
```

**Single line (┌─┐):**
```
┌ ┐  # Top corners
└ ┘  # Bottom corners
│    # Vertical
─    # Horizontal
├ ┤  # T-junctions
┬ ┴  # T-junctions
┼    # Cross
```

**Heavy line (┏━┓):**
```
┏ ┓  # Top corners
┗ ┛  # Bottom corners
┃    # Vertical
━    # Horizontal
```

**Hybrid:**
```
╒═╕  # Double horizontal, single vertical
╞═╡
╘═╛
```

---

### 3. Emoji Support

✅ **Tous les emoji fonctionnent:**
```
📋 📦 🎯 ⚙️ 🗂️ 🗄️ 💾 🚀
✅ ❌ ⚠️ 💡 🔧 🔥 ⭐ 🎨
```

**Usage:** Titres de sections, status, bullets

---

## Scripts Helper Disponibles

### 1. `display-plan` (Affichage plan projet)

**Location:** `/home/pilote/projet/primaire/BUILDER/bin/display-plan`

**Usage:**
```bash
display-plan "project-name" "Stack1+Stack2+Stack3" "route1" "route2" "route3"
```

**Exemple:**
```bash
display-plan "simple-blog" \
  "Next.js 16+Prisma ORM+PostgreSQL" \
  "/blog - Liste articles" \
  "/blog/[slug] - Détail article" \
  "/new - Créer article"
```

**Output:**
```
╔═══════════════════════════════════════════════════════════╗
║  📋 PLAN CRÉATION: simple-blog                            ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  🎯 STACK TECHNIQUE                                       ║
║     • Next.js 16                                          ║
║     • Prisma ORM                                          ║
║     • PostgreSQL                                          ║
║                                                           ║
║  🗂️  ROUTES PRINCIPALES                                   ║
║     • /blog - Liste articles                              ║
║     • /blog/[slug] - Détail article                       ║
║     • /new - Créer article                                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

Valide pour continuer? [y/n]:
```

**Features:**
- ✅ Couleurs (cyan boxes, yellow sections, green bullets)
- ✅ Box drawing automatique
- ✅ Emoji dans titres
- ✅ Prompt validation (y/n)
- ✅ Exit code: 0 si validé, 1 si annulé

**Code source complet dans:** `/home/pilote/projet/primaire/BUILDER/bin/display-plan`

---

## Comment créer nouveau script display?

### Template de base:

```bash
#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
BOLD='\033[1m'
RESET='\033[0m'

# Box drawing
TOP_LEFT="╔"
TOP_RIGHT="╗"
BOTTOM_LEFT="╚"
BOTTOM_RIGHT="╝"
HORIZONTAL="═"
VERTICAL="║"

# Functions
print_header() {
    echo -e "${CYAN}${TOP_LEFT}═══════════════${TOP_RIGHT}${RESET}"
    echo -e "${CYAN}${VERTICAL}${RESET} ${BOLD}$1${RESET} ${CYAN}${VERTICAL}${RESET}"
    echo -e "${CYAN}${BOTTOM_LEFT}═══════════════${BOTTOM_RIGHT}${RESET}"
}

print_success() {
    echo -e "${GREEN}✅ $1${RESET}"
}

print_error() {
    echo -e "${RED}❌ $1${RESET}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${RESET}"
}

# Main
print_header "Mon Titre"
print_info "Information..."
print_success "Succès!"
```

---

## Exemples Avancés

### Progress Bar

```bash
#!/bin/bash

show_progress() {
    local current=$1
    local total=$2
    local width=40
    local percent=$((current * 100 / total))
    local filled=$((current * width / total))
    local empty=$((width - filled))

    printf "\r["
    printf "%${filled}s" | tr ' ' '█'
    printf "%${empty}s" | tr ' ' '░'
    printf "] %d%%" $percent
}

# Usage:
for i in $(seq 1 100); do
    show_progress $i 100
    sleep 0.05
done
echo ""
```

**Output:**
```
[████████████████████░░░░░░░░] 80%
```

---

### Table Formatée

```bash
#!/bin/bash

print_table() {
    # Header
    echo "┌─────────────┬──────────┬────────────────────────┐"
    printf "│ %-11s │ %-8s │ %-22s │\n" "Project" "Status" "URL"
    echo "├─────────────┼──────────┼────────────────────────┤"

    # Rows
    printf "│ %-11s │ %-8s │ %-22s │\n" \
        "simple-blog" "✅ Online" "http://89.116.27.88:..."

    printf "│ %-11s │ %-8s │ %-22s │\n" \
        "task-timer" "❌ Stopped" "N/A"

    # Footer
    echo "└─────────────┴──────────┴────────────────────────┘"
}

print_table
```

**Output:**
```
┌─────────────┬──────────┬────────────────────────┐
│ Project     │ Status   │ URL                    │
├─────────────┼──────────┼────────────────────────┤
│ simple-blog │ ✅ Online│ http://89.116.27.88:...│
│ task-timer  │ ❌ Stopped│ N/A                   │
└─────────────┴──────────┴────────────────────────┘
```

---

### Spinner Animé

```bash
#!/bin/bash

spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'

    while ps -p $pid > /dev/null 2>&1; do
        local temp=${spinstr#?}
        printf " [%c] %s" "$spinstr" "$2"
        spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\r"
    done
    printf "    \r"
}

# Usage:
npm install &
spinner $! "Installing dependencies..."
echo "✅ Done!"
```

**Output (animé):**
```
 [⠋] Installing dependencies...
 [⠙] Installing dependencies...
 [⠹] Installing dependencies...
✅ Done!
```

---

### Diff Coloré

```bash
#!/bin/bash

print_diff() {
    echo -e "${RED}- ancienne ligne supprimée${RESET}"
    echo -e "${GREEN}+ nouvelle ligne ajoutée${RESET}"
    echo "  ligne inchangée"
}

# Ou utiliser git diff avec colors:
git diff --color=always
```

---

## Intégration avec Orchestrator (CLAUDE.md)

### Workflow recommandé:

**Phase 1: Questions (AskUserQuestion tool)**
```typescript
AskUserQuestion({
  questions: [
    {question: "Features?", header: "Features", multiSelect: true, ...},
    {question: "Auth?", header: "Auth", multiSelect: false, ...}
  ]
})
```

**Phase 2: Afficher plan (display-plan script)**
```bash
Bash("display-plan 'project-name' 'stack' 'route1' 'route2'")
```

**Phase 3: Si validé (exit 0) → Créer projet**
```bash
if [ $? -eq 0 ]; then
  # User a validé, continuer
  Task(executor, "Créer projet...")
fi
```

---

## Best Practices

### ✅ DO

1. **Toujours reset colors:**
   ```bash
   echo -e "${GREEN}Success${RESET}"  # ✅
   ```

2. **Utiliser emoji pour clarity:**
   ```bash
   ✅ Success
   ❌ Error
   ⚠️  Warning
   ℹ️  Info
   ```

3. **Box drawing pour sections importantes:**
   ```bash
   ╔════════════════╗
   ║  Important!    ║
   ╚════════════════╝
   ```

4. **Tables pour data structurée:**
   ```bash
   ┌────┬────┐
   │ A  │ B  │
   └────┴────┘
   ```

### ❌ DON'T

1. **Pas de colors sans reset:**
   ```bash
   echo -e "${RED}Error"  # ❌ Tout sera rouge après!
   ```

2. **Pas de box drawing pour texte simple:**
   ```bash
   # ❌ Overkill:
   ╔════════╗
   ║ Hello  ║
   ╚════════╝

   # ✅ Simple:
   echo "Hello"
   ```

3. **Pas mélanger AskUserQuestion + bash prompt:**
   ```bash
   # ❌ Confusing:
   AskUserQuestion(...)
   read -p "Valide? [y/n]: "  # User déjà répondu!
   ```

---

## Scripts à créer (TODO)

### 1. `display-table` (Liste projets)
```bash
display-table "Project|Status|URL" \
  "simple-blog|✅ Online|http://..." \
  "task-timer|❌ Stopped|N/A"
```

### 2. `display-progress` (Build/Deploy)
```bash
display-progress "Building..." 50 100
# Output: [████████████░░░░] 50% Building...
```

### 3. `display-diff` (Git changes)
```bash
display-diff file1.txt file2.txt
# Output: Colored diff with +/- lines
```

### 4. `display-code` (Syntax highlighting)
```bash
display-code snippet.js
# Output: Colored syntax (keywords, strings, etc)
```

---

## Références

**ANSI Escape Codes:**
- https://en.wikipedia.org/wiki/ANSI_escape_code
- https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797

**Box Drawing:**
- https://en.wikipedia.org/wiki/Box-drawing_character

**Emoji:**
- https://emojipedia.org/

**Terminal Capabilities:**
- `man terminfo`
- `tput colors` (check available colors)
- `echo $TERM` (check terminal type)

---

## Testing

```bash
# Check terminal supports colors
tput colors
# Output: 256 ✅

# Check TERM variable
echo $TERM
# Output: xterm-256color ✅

# Test ANSI codes
echo -e "\033[31mRed\033[0m \033[32mGreen\033[0m"
# Output: Red (rouge) Green (vert) ✅

# Test box drawing
echo "╔═══╗"
echo "║ A ║"
echo "╚═══╝"
# Output: Box ✅

# Test emoji
echo "📋 🎯 ✅"
# Output: Emoji ✅
```

---

## Troubleshooting

**Problème:** Caractères bizarres au lieu de box drawing
```bash
# Solution: Check encoding UTF-8
locale
# LANG=en_US.UTF-8 ✅

# Fix:
export LANG=en_US.UTF-8
```

**Problème:** Pas de couleurs
```bash
# Check:
tput colors
# Si 0 → Terminal ne supporte pas colors

# Force colors:
export TERM=xterm-256color
```

**Problème:** Emoji cassés
```bash
# Install fonts emoji:
sudo apt install fonts-noto-color-emoji

# Restart terminal
```

---

## Conclusion

**Terminal Display Skill = Beautify output sans dependencies externes**

- ✅ ANSI codes (colors, styles)
- ✅ Box drawing (tables, boxes)
- ✅ Emoji (clarity)
- ✅ Scripts helper (display-plan, etc)
- ✅ No npm packages needed (pure bash)

**Principe:** CLI can be beautiful. Use it.
(Inspiration: Vercel CLI, Stripe CLI, GitHub CLI)
