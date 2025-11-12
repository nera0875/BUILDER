---
name: testing
description: Chrome DevTools E2E testing expert. Ultra-fast testing with optimized workflow (navigate → snapshot → batch interactions → verify). Auto-invokes after frontend features or on keywords "test", "E2E", "browser", "chrome", "UI testing".
allowed-tools: Bash
---

# E2E Testing Skill - OPTIMIZED

> **Chrome DevTools E2E Testing Expert - Ultra-Fast Mode**
>
> Optimized for speed: 5-10s per test vs 30s+ traditional

---

## Core Principles (Speed Optimized)

1. ✅ **Minimal snapshots** - Only BEFORE and AFTER interactions
2. ✅ **Batch interactions** - Use fill_form(), parallel clicks
3. ✅ **Smart debugging** - Only if wait_for() fails
4. ✅ **Fast path default** - Full debug only on errors

---

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
- Sans ça → Erreur "browser already running"
- Avec ça → Marche toujours (reconnecte auto)

---

## Fast Path Workflow (5 Steps)

### Step 1: CONNECT + NAVIGATE
```typescript
// Parallel: list_pages + navigate
mcp__chrome-devtools__list_pages()
mcp__chrome-devtools__navigate_page({
  type: "url",
  url: "http://localhost:3000/path"
})
```

### Step 2: INITIAL SNAPSHOT
```typescript
mcp__chrome-devtools__take_snapshot()
```

### Step 3: BATCH INTERACTIONS + DEBUG (PARALLEL)
```typescript
// TOUJOURS utiliser fill_form() pour formulaires
mcp__chrome-devtools__fill_form({
  elements: [
    { uid: "1_2", value: "test@example.com" },
    { uid: "1_3", value: "password123" },
    { uid: "1_4", value: "John Doe" }
  ]
})

// Click + Debug EN PARALLÈLE (1 message, 3 tool calls)
mcp__chrome-devtools__click({ uid: "1_5" })
mcp__chrome-devtools__list_console_messages()
mcp__chrome-devtools__list_network_requests({ resourceTypes: ["fetch", "xhr"] })

// ⚡ Ces 3 calls s'exécutent EN MÊME TEMPS (parallel)
// Gain: ~2s au lieu de ~6s séquentiel
```

### Step 4: WAIT FOR RESULT (optionnel)
```typescript
// Attendre élément/texte attendu SI besoin
mcp__chrome-devtools__wait_for({
  text: "Success",
  timeout: 5000
})
```

### Step 5: FINAL SNAPSHOT
```typescript
// Snapshot final pour vérifier état UI
mcp__chrome-devtools__take_snapshot()

// Analyse automatique:
// - Console errors? → Bug JavaScript/React
// - Network 500? → Bug API backend
// - UI incorrecte? → Bug logique frontend
```

---

## Full Debug Workflow (Only on Errors)

**Quand utiliser:**
- wait_for() timeout
- Snapshot final montre erreur
- User demande debug explicite

**Steps supplémentaires:**
```typescript
// Après error/timeout
mcp__chrome-devtools__list_console_messages({
  types: ["error", "warn"]
})

mcp__chrome-devtools__list_network_requests({
  resourceTypes: ["fetch", "xhr"]
})
```

---

## Optimization Techniques

### 1. Batch Form Fills (TOUJOURS)
```typescript
// ❌ LENT (3 calls)
fill({ uid: "1_2", value: "email" })
fill({ uid: "1_3", value: "password" })
fill({ uid: "1_4", value: "name" })

// ✅ RAPIDE (1 call)
fill_form({
  elements: [
    { uid: "1_2", value: "email" },
    { uid: "1_3", value: "password" },
    { uid: "1_4", value: "name" }
  ]
})
```

### 2. Skip Intermediate Snapshots
```typescript
// ❌ LENT
snapshot() → click() → snapshot() → fill() → snapshot() → click() → snapshot()

// ✅ RAPIDE
snapshot() → fill_form() + click() → wait_for() → snapshot()
```

### 3. Smart Debugging
```typescript
// ❌ LENT (debug après chaque action)
click() → list_console() + list_network()
click() → list_console() + list_network()

// ✅ RAPIDE (debug uniquement si problème)
click() + click() + click() → wait_for("Done")
// Si timeout → ALORS debug
// Sinon → assume success
```

### 4. Parallel Tool Calls
```typescript
// ✅ 1 message avec multiple calls
mcp__chrome-devtools__list_console_messages()
mcp__chrome-devtools__list_network_requests()

// Exécuté en parallèle (gain: 2x speed)
```

---

## Example Optimisé: Test Login Flow

**Traditional workflow: ~30s**
**Optimized workflow: ~5s**

```typescript
// Step 1: Connect + Navigate (parallel)
mcp__chrome-devtools__list_pages()
mcp__chrome-devtools__navigate_page({
  type: "url",
  url: "http://localhost:3000/login"
})

// Step 2: Initial snapshot
mcp__chrome-devtools__take_snapshot()

// Résultat:
// uid=1_5 textbox "Email"
// uid=1_7 textbox "Password"
// uid=1_9 button "Login"

// Step 3: Batch fill + submit
mcp__chrome-devtools__fill_form({
  elements: [
    { uid: "1_5", value: "test@example.com" },
    { uid: "1_7", value: "password123" }
  ]
})

mcp__chrome-devtools__click({ uid: "1_9" })

// Step 4: Wait redirect
mcp__chrome-devtools__wait_for({
  text: "Dashboard",
  timeout: 5000
})

// Step 5: Final snapshot
mcp__chrome-devtools__take_snapshot()

// ✅ Login success (5s total)
// Debug skipped (wait_for() success = assume no errors)
```

---

## Example Optimisé: Test CRUD Task

**Traditional: 10 snapshots, ~60s**
**Optimized: 3 snapshots, ~15s**

```typescript
// 1. Connect + Navigate
mcp__chrome-devtools__list_pages()
mcp__chrome-devtools__navigate_page({
  type: "url",
  url: "http://localhost:3000/tasks"
})

// 2. Initial snapshot
mcp__chrome-devtools__take_snapshot()

// uid=3_227 button "Add Task"

// 3. Open modal + fill form + submit (batch)
mcp__chrome-devtools__click({ uid: "3_227" })

// Wait modal open
mcp__chrome-devtools__wait_for({ text: "Add Task", timeout: 2000 })

// Snapshot modal
mcp__chrome-devtools__take_snapshot()

// uid=4_7 textbox "Title"
// uid=4_9 textbox "Description"
// uid=4_11 button "Add Task"

// Batch fill
mcp__chrome-devtools__fill_form({
  elements: [
    { uid: "4_7", value: "Test Task" },
    { uid: "4_9", value: "Description test" }
  ]
})

// Submit
mcp__chrome-devtools__click({ uid: "4_11" })

// 4. Wait task created
mcp__chrome-devtools__wait_for({
  text: "Test Task",
  timeout: 3000
})

// 5. Final snapshot
mcp__chrome-devtools__take_snapshot()

// ✅ Task created (15s total)
// Console: "Test Task" visible in list
```

---

## When to Use Full Debug

**Trigger full debug if:**
1. wait_for() timeout
2. Final snapshot shows error state
3. User explicitly asks for debug
4. Testing error handling flow

**Full debug example:**
```typescript
// After wait_for() timeout
mcp__chrome-devtools__list_console_messages()
mcp__chrome-devtools__list_network_requests()

// Analyze
// - Console errors?
// - Network request failed?
// - Element not found in snapshot?
```

---

## Interdictions (Same as before)

### ❌ JAMAIS evaluate_script pour interactions
```typescript
// ❌ INTERDIT
evaluate_script({ function: `(el) => el.click()`, args: [{uid: "1_1"}] })

// ✅ CORRECT
click({ uid: "1_1" })
```

### ❌ JAMAIS setTimeout/Promise manuel
```typescript
// ❌ INTERDIT
evaluate_script({ function: `async () => await new Promise(r => setTimeout(r, 1000))` })

// ✅ CORRECT
wait_for({ text: "result", timeout: 1000 })
```

### ❌ JAMAIS screenshot sauf demande explicite
```typescript
// ❌ Par défaut
take_screenshot()

// ✅ Uniquement si user demande
// User: "prends screenshot du bouton"
take_screenshot({ uid: "1_1" })
```

---

## Stale Snapshot Detection

**Si "stale snapshot" error:**
```typescript
// 1. Nouveau snapshot
take_snapshot()

// 2. Utilise nouveau uid (ex: uid=7_9 au lieu de uid=6_9)
fill({ uid: "7_9", value: "..." })
```

**Quand arrive stale?**
- Après fill() → DOM change → uid invalide
- Après click() modal → Nouvelle structure DOM
- **Solution:** Re-snapshot uniquement si error

---

## Performance Comparison

### Traditional Workflow
```
Steps: 10+
Snapshots: 6+
Debug calls: 5+
Time: 30-60s
```

### Optimized Workflow
```
Steps: 5
Snapshots: 2-3
Debug calls: 0-2 (only if error)
Time: 5-15s

Speed gain: 4-6x faster
```

---

## Output Format (Concise)

**Format court:**
```
✅ Login success (5s)
- Redirected to /dashboard
- User "test@example.com" logged in

✅ Task created (8s)
- Task "Test Task" visible in list
- Counter: 4 → 5
```

**Debug only if error:**
```
❌ Login failed (timeout)

Debug:
- Console: [error] "Invalid credentials"
- Network: POST /api/auth/login [401]
- Snapshot: Error message "Invalid email or password" visible
```

---

## Checklist (Speed Optimized)

**Fast path (default):**
1. ✅ list_pages()
2. ✅ navigate_page()
3. ✅ take_snapshot() INITIAL
4. ✅ Batch interactions (fill_form + clicks)
5. ✅ wait_for() result
6. ✅ take_snapshot() FINAL
7. ✅ Report success

**Full debug (only if error):**
8. ✅ list_console_messages()
9. ✅ list_network_requests()
10. ✅ Analyze + report detailed error

---

## Sentry Integration (Production Error Correlation)

**QUAND utiliser Sentry + Chrome DevTools ensemble:**

### Cas 1: User Signale Bug
```typescript
// User: "Dashboard crash quand je clique X"

// STEP 1: Chrome DevTools (Reproduction LIVE)
mcp__chrome-devtools__list_pages()
mcp__chrome-devtools__navigate_page({url: "http://89.116.27.88:9000/dashboard"})
mcp__chrome-devtools__take_snapshot()
// → Trouve uid bouton X
mcp__chrome-devtools__click({uid: "X"})
mcp__chrome-devtools__list_console_messages({types: ["error"]})
// → Capture erreur console LOCALE

// STEP 2: Sentry (Historique PRODUCTION)
mcp__sentry__search_issues({
  organizationSlug: "neurodopa-i9",
  projectSlugOrId: "builder-dashboard",
  naturalLanguageQuery: "errors on dashboard button X last 7 days",
  regionUrl: "https://de.sentry.io"
})
// → Voir si erreur déjà en production

// STEP 3: Sentry Details (si issue trouvée)
mcp__sentry__get_issue_details({
  organizationSlug: "neurodopa-i9",
  issueId: "BUILDER-123",
  regionUrl: "https://de.sentry.io"
})
// → Stack trace complet + fréquence + users impactés

// STEP 4: AI Root Cause
mcp__sentry__analyze_issue_with_seer({
  organizationSlug: "neurodopa-i9",
  issueId: "BUILDER-123",
  regionUrl: "https://de.sentry.io"
})
// → Recommandation fix automatique

// RÉSULTAT:
// - Chrome DevTools = Reproduction locale + console errors
// - Sentry = Historique production + impact réel + root cause AI
```

### Cas 2: Debug Erreur Production
```typescript
// User: "Y'a un bug en production"

// STEP 1: Sentry FIRST (Production data)
mcp__sentry__search_issues({
  organizationSlug: "neurodopa-i9",
  naturalLanguageQuery: "unresolved errors last 24h",
  limit: 10
})

mcp__sentry__get_issue_details({issueUrl: "..."})
mcp__sentry__analyze_issue_with_seer({issueId: "..."})
// → Identification bug + root cause

// STEP 2: Chrome DevTools (Reproduction)
mcp__chrome-devtools__list_pages()
mcp__chrome-devtools__navigate_page({url: "..."})
// → Reproduis bug localement
// → Vérifie fix fonctionne
```

### Cas 3: Testing Après Feature
```typescript
// Après feature complétée

// STEP 1: Chrome DevTools E2E Tests
// (Fast Path Workflow - voir sections précédentes)
mcp__chrome-devtools__list_pages()
// ... tests complets ...
mcp__chrome-devtools__list_console_messages()
// → 0 errors = Tests passent

// STEP 2: Sentry Check (optionnel)
mcp__sentry__search_issues({
  naturalLanguageQuery: "errors last 1 hour"
})
// → Si erreur Sentry = Fuite bug non détectée
```

---

## Sentry MCP Tools (Debugging Essentials)

**Config BUILDER:**
- Organization: `neurodopa-i9`
- Project: `builder-dashboard`
- Region: `https://de.sentry.io`

---

### 🐛 Core Debugging (4 outils essentiels)

#### 1. search_issues - Trouver bugs production
```typescript
mcp__sentry__search_issues({
  organizationSlug: "neurodopa-i9",
  projectSlugOrId: "builder-dashboard",
  naturalLanguageQuery: "unresolved errors last 24h",
  regionUrl: "https://de.sentry.io",
  limit: 10
})
// Retourne: Liste bugs avec fréquence + users impactés
// Quand: User dit "Y'a un bug" → Je cherche QUOI
```

#### 2. get_issue_details - Stack trace complet
```typescript
// Option A: Avec URL (recommandé)
mcp__sentry__get_issue_details({
  issueUrl: "https://neurodopa-i9.sentry.io/issues/BUILDER-123"
})

// Option B: Avec ID
mcp__sentry__get_issue_details({
  organizationSlug: "neurodopa-i9",
  issueId: "BUILDER-123",
  regionUrl: "https://de.sentry.io"
})
// Retourne: Stack trace + ligne exacte + metadata
// Quand: J'ai trouvé bug → Je vois OÙ exactement
```

#### 3. analyze_issue_with_seer - 🤖 AI Fix (PUISSANT)
```typescript
mcp__sentry__analyze_issue_with_seer({
  organizationSlug: "neurodopa-i9",
  issueId: "BUILDER-123",
  regionUrl: "https://de.sentry.io"
})
// Retourne: AI explique POURQUOI + recommande CODE FIX
// Quand: J'ai stack trace → AI me dit COMMENT fixer
// → LE PLUS UTILE pour résoudre bugs rapidement
```

#### 4. update_issue - Marquer résolu
```typescript
mcp__sentry__update_issue({
  organizationSlug: "neurodopa-i9",
  issueId: "BUILDER-123",
  status: "resolved",
  regionUrl: "https://de.sentry.io"
})
// Quand: Bug fixé → Je marque résolu dans Sentry
```

---

### Workflow Debug Complet (3 steps)

```typescript
// User: "Dashboard crash"

// STEP 1: Trouver le bug
mcp__sentry__search_issues({
  organizationSlug: "neurodopa-i9",
  naturalLanguageQuery: "dashboard crashes"
})
// → Issue BUILDER-456 trouvée (50 occurrences)

// STEP 2: AI analyse + fix recommandé
mcp__sentry__analyze_issue_with_seer({
  organizationSlug: "neurodopa-i9",
  issueId: "BUILDER-456"
})
// → "Null pointer ligne 42 file.ts, ajouter check"

// STEP 3: Je fixe le code
Edit("file.ts", ...)

// STEP 4: Marquer résolu
mcp__sentry__update_issue({
  issueId: "BUILDER-456",
  status: "resolved"
})

// ✅ Bug résolu en 2 min au lieu de 10 min
```

---

**Principe Complémentarité:**
- **Sentry** = Historique production (fréquence, users, stack traces)
- **Chrome DevTools** = Debugging live (reproduction, interactions, console temps réel)
- **Ensemble** = Debug 10x plus rapide (context complet)

---

**Ce skill garantit:**
- ✅ **4-6x plus rapide** que workflow traditionnel
- ✅ Batching automatique des interactions
- ✅ Debugging intelligent (only when needed)
- ✅ Minimal snapshots (2-3 vs 6+)
- ✅ Same reliability, better speed
- ✅ **Sentry correlation** pour context production complet
