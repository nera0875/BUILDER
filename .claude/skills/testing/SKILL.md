---
name: testing
description: Chrome DevTools E2E testing expert. Tests UI features via browser automation with strict workflow (navigate → snapshot → interact → debug). Auto-invokes after frontend features or on keywords "test", "E2E", "browser", "chrome", "UI testing".
allowed-tools: Bash
---

# E2E Testing Skill

> **Chrome DevTools E2E Testing Expert**
>
> Inspiré de : Google Test Automation, Facebook E2E Testing, Vercel Testing Practices

---

## Scope & Activation

**Invoqué par:** ORCHESTRATOR

**Quand invoquer:**

1. **Auto (OBLIGATOIRE)** après chaque feature frontend
2. **Auto** après bugfix UI
3. **Sur demande** si user demande tests explicites ("teste la feature X")

**Tools disponibles:**
- `mcp__chrome-devtools__*` (tous MCP Chrome DevTools)
- `Bash` (check app running)

---

## Rôle

Expert testing UI via Chrome DevTools MCP.
Workflow strict : navigation → snapshot → interaction → debugging → validation.

## RÈGLE #1 (CRITIQUE)

**TOUJOURS appeler `list_pages()` en premier:**

```typescript
// Step 0: OBLIGATOIRE - Établit connexion Chrome
mcp__chrome-devtools__list_pages()

// Comportement automatique:
// - Chrome fermé → L'ouvre + connecte
// - Chrome ouvert → Se connecte à session existante
```

**Pourquoi obligatoire?**
- `list_pages()` = initialise session MCP Chrome
- Sans ça → Erreur "browser already running" si Chrome déjà ouvert
- Avec ça → Marche toujours (ouvre ou reconnecte automatiquement)

**Erreur si oublié:**
```
❌ navigate_page() sans list_pages() avant
→ Error: browser already running

✅ list_pages() puis navigate_page()
→ Success (reconnecte automatiquement)
```

---

## Workflow Obligatoire (6 Steps)

### Step 0: LIST PAGES (OBLIGATOIRE)
```typescript
mcp__chrome-devtools__list_pages()
// Ouvre Chrome si fermé, reconnecte si ouvert
```

### Step 1: NAVIGATE
```typescript
mcp__chrome-devtools__navigate_page({
  type: "url",
  url: "http://localhost:3000/path"
})
```

**Options:**
- `type: "url"` → Navigate vers URL
- `type: "reload"` → Reload page
- `type: "back"` → Historique back
- `type: "forward"` → Historique forward

---

### Step 2: SNAPSHOT (Pas screenshot!)
```typescript
// Snapshot basique (a11y tree)
mcp__chrome-devtools__take_snapshot({
  verbose: false
})

// Snapshot détaillé (si élément invisible)
mcp__chrome-devtools__take_snapshot({
  verbose: true
})
```

**Retour snapshot:**
```
uid=1_0 RootWebArea "Page Title"
  uid=1_1 button "Click Me"
  uid=1_2 textbox "Email"
  uid=1_3 dialog "Modal Title"
    uid=1_4 button "Close"
```

**UID = identifiant unique pour interactions**

---

### Step 3: INTERACT (Tools natifs uniquement)

**Click:**
```typescript
mcp__chrome-devtools__click({
  uid: "1_1"
})
```

**Fill input:**
```typescript
mcp__chrome-devtools__fill({
  uid: "1_2",
  value: "test@example.com"
})
```

**Fill form complet:**
```typescript
mcp__chrome-devtools__fill_form({
  elements: [
    { uid: "1_2", value: "test@example.com" },
    { uid: "1_3", value: "password123" }
  ]
})
```

**Hover:**
```typescript
mcp__chrome-devtools__hover({
  uid: "1_1"
})
```

**Press key:**
```typescript
mcp__chrome-devtools__press_key({
  key: "Enter"
})

// Combinaisons
mcp__chrome-devtools__press_key({
  key: "Control+A"
})
```

**Wait for element:**
```typescript
mcp__chrome-devtools__wait_for({
  text: "Success",
  timeout: 5000
})
```

---

### Step 4: DEBUG (Console + Network)

**Console messages (OBLIGATOIRE après chaque action):**
```typescript
mcp__chrome-devtools__list_console_messages({
  includePreservedMessages: true,
  types: ["error", "warn"] // Optionnel
})
```

**Network requests:**
```typescript
mcp__chrome-devtools__list_network_requests({
  resourceTypes: ["fetch", "xhr"] // Filter API calls
})
```

**Get specific network request:**
```typescript
mcp__chrome-devtools__get_network_request({
  reqid: 42
})
```

---

### Step 5: VERIFY

**Check dialog/modal (si attendu):**
```typescript
mcp__chrome-devtools__evaluate_script({
  function: `() => {
    const dialog = document.querySelector('[role="dialog"]');
    return {
      exists: !!dialog,
      visible: dialog ? window.getComputedStyle(dialog).display !== 'none' : false
    };
  }`
})
```

**Handle browser dialog:**
```typescript
mcp__chrome-devtools__handle_dialog({
  action: "accept", // ou "dismiss"
  promptText: "Optional text" // Si prompt()
})
```

---

## Interdictions Strictes

### ❌ JAMAIS evaluate_script pour interactions
```typescript
// ❌ INTERDIT
mcp__chrome-devtools__evaluate_script({
  function: `(el) => el.click()`,
  args: [{ uid: "1_1" }]
})

// ✅ CORRECT
mcp__chrome-devtools__click({ uid: "1_1" })
```

### ❌ JAMAIS setTimeout/Promise manuel
```typescript
// ❌ INTERDIT
mcp__chrome-devtools__evaluate_script({
  function: `async () => {
    await new Promise(r => setTimeout(r, 1000));
    return document.querySelector('.result');
  }`
})

// ✅ CORRECT
mcp__chrome-devtools__wait_for({
  text: "result",
  timeout: 1000
})
```

### ❌ JAMAIS screenshot sauf demande explicite
```typescript
// ❌ Par défaut
mcp__chrome-devtools__take_screenshot()

// ✅ Uniquement si user demande
// User: "prends screenshot du bouton"
mcp__chrome-devtools__take_screenshot({
  uid: "1_1"
})
```

### ❌ JAMAIS conclusions sans vérifications
```typescript
// ❌ INTERDIT
"Le bouton a été cliqué avec succès"

// ✅ CORRECT
mcp__chrome-devtools__click({ uid: "1_1" })
mcp__chrome-devtools__list_console_messages()
mcp__chrome-devtools__list_network_requests()

// Puis analyse résultats:
"Click success. Console: aucune erreur. Network: POST /api/task [201]"
```

---

## Parallel Tool Calls (Optimisation)

**Si actions indépendantes → Paralléliser:**

```typescript
// ✅ Parallel calls après click
mcp__chrome-devtools__click({ uid: "1_1" })
mcp__chrome-devtools__list_console_messages()
mcp__chrome-devtools__list_network_requests()

// Exécuté en parallèle (1 seul message avec 3 tool calls)
```

**Si dépendance → Séquentiel:**

```typescript
// Step 1: Navigate
mcp__chrome-devtools__navigate_page({ type: "url", url: "..." })

// Step 2: ATTENDRE navigation complete, PUIS snapshot
mcp__chrome-devtools__take_snapshot()

// Step 3: ATTENDRE snapshot, PUIS click
mcp__chrome-devtools__click({ uid: "1_1" })
```

---

## Stale Snapshot Detection

**Erreur "stale snapshot":**
```
This uid is coming from a stale snapshot. Call take_snapshot to get a fresh snapshot.
```

**Solution:**
```typescript
// 1. Nouveau snapshot
mcp__chrome-devtools__take_snapshot()

// 2. Utilise nouveau uid (ex: uid=7_9 au lieu de uid=6_9)
mcp__chrome-devtools__fill({ uid: "7_9", value: "..." })
```

---

## Debugging Checklist

### Si élément invisible dans snapshot
1. ✅ `take_snapshot({ verbose: true })` → Structure DOM complète
2. ✅ Check si élément existe via evaluate_script
3. ✅ Vérifier z-index / display CSS

### Si click ne fait rien
1. ✅ Console errors? → `list_console_messages()`
2. ✅ Modal/dialog ouvert? → Check snapshot pour `dialog` role
3. ✅ Network call déclenché? → `list_network_requests()`
4. ✅ Élément disabled? → Check snapshot pour `disableable disabled`

### Si form submit échoue
1. ✅ Validation errors console? → `list_console_messages()`
2. ✅ Network request status? → `get_network_request({ reqid: X })`
3. ✅ Tous champs remplis? → Re-snapshot après fills

---

## Examples Complets

### Example 1: Test CRUD Kanban

**Task:** "Navigate localhost:3000/kanban, crée task, supprime task"

**Exécution:**

```typescript
// Step 0: OBLIGATOIRE - Connexion Chrome
mcp__chrome-devtools__list_pages()

// Step 1: Navigate
mcp__chrome-devtools__navigate_page({
  type: "url",
  url: "http://localhost:3000/dashboard/apps/kanban"
})

// Step 2: Snapshot
mcp__chrome-devtools__take_snapshot({ verbose: false })

// Résultat: uid=3_227 = bouton "+" header colonne Backlog

// Step 3: Click bouton "+"
mcp__chrome-devtools__click({ uid: "3_227" })
// Parallel debug
mcp__chrome-devtools__list_console_messages()

// Step 4: Nouveau snapshot (modal ouverte)
mcp__chrome-devtools__take_snapshot()

// Résultat:
// uid=4_7 textbox "Title"
// uid=4_9 textbox "Description"
// uid=4_11 button "Add Task"

// Step 5: Fill form
mcp__chrome-devtools__fill({ uid: "4_7", value: "Test Task" })
// Nouveau snapshot (uid stale après fill)
mcp__chrome-devtools__take_snapshot()
mcp__chrome-devtools__fill({ uid: "5_9", value: "Description test" })

// Step 6: Submit
mcp__chrome-devtools__click({ uid: "5_11" })
// Parallel debug
mcp__chrome-devtools__list_console_messages()
mcp__chrome-devtools__list_network_requests({ resourceTypes: ["fetch", "xhr"] })

// Résultat:
// Console: aucune erreur
// Network: POST /api/tasks [201]

// Step 7: Snapshot final (task ajoutée)
mcp__chrome-devtools__take_snapshot()

// Résultat: Task "Test Task" visible dans Backlog

// Step 8: Delete task (click menu task)
mcp__chrome-devtools__click({ uid: "6_67" })

// Step 9: Confirm delete
mcp__chrome-devtools__wait_for({ text: "Delete Task?" })
mcp__chrome-devtools__take_snapshot()
mcp__chrome-devtools__click({ uid: "7_8" }) // Bouton "Delete"

// Step 10: Final verification
mcp__chrome-devtools__list_network_requests({ resourceTypes: ["fetch", "xhr"] })
mcp__chrome-devtools__take_snapshot()

// Résultat:
// Network: DELETE /api/tasks/uuid [200]
// Snapshot: Task retirée de Backlog
```

---

### Example 2: Test Login Flow

```typescript
// Step 0: Connexion
mcp__chrome-devtools__list_pages()

// Navigate
mcp__chrome-devtools__navigate_page({
  type: "url",
  url: "http://localhost:3000/login"
})

// Snapshot
mcp__chrome-devtools__take_snapshot()

// Fill credentials
mcp__chrome-devtools__fill_form({
  elements: [
    { uid: "1_5", value: "test@example.com" },
    { uid: "1_7", value: "password123" }
  ]
})

// Submit
mcp__chrome-devtools__click({ uid: "1_9" })

// Debug
mcp__chrome-devtools__list_console_messages()
mcp__chrome-devtools__list_network_requests()

// Wait redirect
mcp__chrome-devtools__wait_for({ text: "Dashboard", timeout: 5000 })

// Verify
mcp__chrome-devtools__take_snapshot()

// Résultat attendu:
// - Console: no errors
// - Network: POST /api/auth/login [200]
// - Snapshot: URL = /dashboard
```

---

### Example 3: Test API Error Handling

```typescript
// Step 0: Connexion
mcp__chrome-devtools__list_pages()

// Navigate
mcp__chrome-devtools__navigate_page({
  type: "url",
  url: "http://localhost:3000/tasks"
})

// Snapshot
mcp__chrome-devtools__take_snapshot()

// Click delete task (forced error backend)
mcp__chrome-devtools__click({ uid: "2_45" })

// Debug console (expect error)
mcp__chrome-devtools__list_console_messages()

// Check network (expect 500)
mcp__chrome-devtools__list_network_requests()
mcp__chrome-devtools__get_network_request({ reqid: 12 })

// Résultat:
// - Console: [error] "Failed to delete task"
// - Network: DELETE /api/tasks/123 [500]
// - Error modal visible dans snapshot
```

---

## Performance Testing (Advanced)

### Start trace recording
```typescript
mcp__chrome-devtools__performance_start_trace({
  reload: true,
  autoStop: true
})
```

### Analyze insights
```typescript
mcp__chrome-devtools__performance_analyze_insight({
  insightSetId: "trace-1",
  insightName: "LCPBreakdown"
})
```

---

## Multi-Page Management

### List pages
```typescript
mcp__chrome-devtools__list_pages()
```

### New page
```typescript
mcp__chrome-devtools__new_page({
  url: "http://localhost:3000/settings"
})
```

### Select page
```typescript
mcp__chrome-devtools__select_page({
  pageIdx: 1
})
```

### Close page
```typescript
mcp__chrome-devtools__close_page({
  pageIdx: 1
})
```

---

## Emulation (Testing Responsive)

```typescript
mcp__chrome-devtools__resize_page({
  width: 375,
  height: 667
})

mcp__chrome-devtools__emulate({
  networkConditions: "Slow 3G",
  cpuThrottlingRate: 4
})
```

---

## Checklist Pre-Test

**Avant chaque test:**

1. ✅ **App running?** → `lsof -ti:3000` (Bash)
2. ✅ **Browser session?** → `list_pages()` (auto-reconnect si existe)
3. ✅ **Navigate URL** → `navigate_page()`
4. ✅ **Snapshot avant action** → `take_snapshot()`
5. ✅ **Interact via tools natifs** → `click()` / `fill()`
6. ✅ **Debug après action** → `console + network`
7. ✅ **Snapshot après action** → Verify résultat

---

## Output Format

**Diagnostic factuel uniquement:**

```
✅ Task créée avec succès

Résultat:
- Task "Test Task" ajoutée dans Backlog
- Counter Backlog: 4 → 5
- Console: aucune erreur
- Network: POST /api/tasks [201], GET /api/tasks [200]

✅ Task supprimée avec succès

Résultat:
- Task retirée de Backlog
- Counter Backlog: 5 → 4
- Network: DELETE /api/tasks/uuid [200]
```

**Jamais de suppositions - toujours vérifier console + network.**

---

## Integration avec BLV Testing

**Si test découvre API call intéressante:**

```typescript
// 1. Get network request details
mcp__chrome-devtools__get_network_request({ reqid: 42 })

// 2. Extract HTTP request
const raw_http = `${method} ${url} HTTP/1.1
Host: ${host}
${headers}

${body}`;

// 3. Capture via BLV tools
mcp__blv-tools__capture_request({ raw_http })

// Mode silencieux - auto-storage PostgreSQL
```

---

**Ce skill garantit:**
- ✅ Testing UI sans bugs (workflow strict)
- ✅ Debugging systématique (console + network)
- ✅ Tools natifs uniquement (pas evaluate_script)
- ✅ Snapshots à jour (stale detection)
- ✅ Parallel calls optimisés
