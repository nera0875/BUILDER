---
name: research
description: Documentation and code examples research expert using Exa AI and Context7. Finds official docs, production code examples, technology comparisons, and best practices. Auto-activates when new libraries mentioned or user requests "docs", "examples", "best practices", or technology comparisons.
allowed-tools: WebSearch, WebFetch
---

# Research Skill

> **Documentation & Examples Research Expert**
>
> Inspiré de : Developer workflows GitHub/Stack Overflow, Exa AI capabilities, Context7 MCP

---

## Scope & Activation

**Invoqué par:** ORCHESTRATOR

**Quand invoquer:**

1. **Auto (silencieux)** si:
   - Nouvelle librairie jamais utilisée mentionnée par user
   - Stack technique inconnue détectée (framework, database, etc)
   - User demande comparaison technologies ("X ou Y?")

2. **Sur demande explicite** si:
   - "cherche docs pour X"
   - "trouve exemples Y"
   - "comment faire Z avec [lib]"
   - "best practices pour X"

---

## Tools Disponibles

### 1. Exa AI (mcp__exa__web_search_exa)

**Usage:** Recherche exemples code production + articles techniques

**Quand utiliser:**
- Exemples code réels (GitHub, blog posts, tutorials)
- Architecture patterns (comment X est implémenté dans projets réels)
- Comparaisons technologies (benchmarks, opinions experts)

**Parameters:**
```typescript
mcp__exa__web_search_exa({
  query: "Next.js app router data fetching patterns",
  numResults: 5,  // 5-10 optimal
  type: "auto"    // "auto" | "fast" | "deep"
})
```

**Output:**
- URLs + contenu pages
- Code snippets
- Contexte architecture

---

### 2. Context7 (mcp__exa__get_code_context_exa)

**Usage:** Documentation officielle à jour (SDKs, APIs, libraries)

**Quand utiliser:**
- Docs API officielles (React, FastAPI, Prisma, etc)
- SDK documentation
- Framework guides officiels
- Configuration syntax

**Parameters:**
```typescript
mcp__exa__get_code_context_exa({
  query: "FastAPI dependency injection patterns",
  tokensNum: 5000  // 1000-10000 selon besoin
})
```

**Output:**
- Documentation extraite
- API reference
- Configuration examples
- Best practices officiels

---

### 3. WebSearch (fallback)

**Usage:** Articles récents, comparaisons, opinions community

**Quand utiliser:**
- Comparaisons techno récentes (2024-2025)
- Blog posts techniques
- Reddit/HackerNews discussions
- Release notes

**Parameters:**
```typescript
WebSearch({
  query: "Next.js 14 vs Remix 2024 comparison"
})
```

---

## Workflow Research (3-Step Process)

### Step 1: Analyse Besoin

**Identifier type recherche:**

**Type A - Documentation pure:**
- "Comment utiliser X?"
- "Syntax Y dans Z?"
→ **Context7 uniquement** (docs officielles suffisent)

**Type B - Exemples code:**
- "Exemples implementation X?"
- "Architecture pattern Y?"
→ **Exa uniquement** (exemples réels GitHub)

**Type C - Comparaison techno:**
- "X ou Y pour Z?"
- "Avantages/inconvénients X?"
→ **Exa + WebSearch + Context7** (parallèle)

**Type D - Best practices:**
- "Meilleures pratiques X?"
- "Standards industry Y?"
→ **Exa + Context7** (parallèle)

---

### Step 2: Exécution Parallèle (TOUJOURS)

**RÈGLE:** Si >= 2 sources nécessaires → Paralléliser

```typescript
// ❌ INTERDIT - Séquentiel
const exa = await mcp__exa__web_search_exa({...});
const context7 = await mcp__exa__get_code_context_exa({...});
const web = await WebSearch({...});

// ✅ CORRECT - Parallèle (1 seul message avec 3 tool calls)
mcp__exa__web_search_exa({...})
mcp__exa__get_code_context_exa({...})
WebSearch({...})
// Claude exécute en parallèle automatiquement
```

**Optimisation queries:**

```typescript
// ✅ Queries spécifiques
Exa: "Next.js 14 server actions code examples GitHub"
Context7: "Next.js 14 server actions official documentation"
WebSearch: "Next.js 14 server actions best practices 2024"

// ❌ Query générique (résultats flous)
"Next.js server actions"
```

---

### Step 3: Synthèse Résultats

**Format output (retour à Orchestrator):**

```markdown
## Research Results: [Topic]

### Official Documentation (Context7)
- **Key concepts**: [Liste concepts]
- **Syntax**: [Exemples syntax]
- **Gotchas**: [Warnings/limitations]
- **Links**: [Liens docs officielles]

### Production Examples (Exa)
- **Pattern 1**: [Description + lien]
- **Pattern 2**: [Description + lien]
- **Real-world usage**: [Exemples projets réels]

### Community Insights (WebSearch)
- **Opinions**: [Consensus community]
- **Comparisons**: [X vs Y]
- **Recent changes**: [Updates 2024-2025]

### Recommendation
**Suggested approach**: [Quelle méthode utiliser]
**Reasoning**: [Pourquoi cette approche]
**Alternatives**: [Options alternatives + trade-offs]
```

**Principe:** Structured synthesis, actionable recommendations.
(Information architecture, Decision support)

---

## Exemples Workflows

### Exemple 1: Nouvelle librairie (Auto-invoked)

**Trigger:** User mentionne "on utilise Zustand"

**Detection Orchestrator:** Zustand jamais utilisé → Invoke Research

**Workflow:**

```typescript
// Parallèle
mcp__exa__web_search_exa({
  query: "Zustand React state management examples GitHub",
  numResults: 5,
  type: "auto"
})

mcp__exa__get_code_context_exa({
  query: "Zustand store setup patterns",
  tokensNum: 3000
})
```

**Synthèse retournée à Orchestrator:**

```markdown
## Zustand Research

### Documentation
- Minimalist state management (< 1kb)
- No boilerplate (no providers, no reducers)
- Hook-based API

### Patterns trouvés
1. Simple store: `create((set) => ({ ... }))`
2. Async actions: `set` in async functions
3. Middleware: persist, devtools

### Recommendation
Zustand optimal pour:
- Small/medium apps
- Avoid Redux boilerplate
- Fast prototyping

Setup:
```ts
import { create } from 'zustand'

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 }))
}))
```
```

**Orchestrator utilise info** → Décide utiliser Zustand → Crée ADR

---

### Exemple 2: Comparaison techno (User demande)

**User:** "PostgreSQL ou MongoDB pour app e-commerce?"

**Workflow:**

```typescript
// Parallèle 3 sources
mcp__exa__web_search_exa({
  query: "PostgreSQL vs MongoDB e-commerce use cases",
  numResults: 8,
  type: "deep"
})

mcp__exa__get_code_context_exa({
  query: "PostgreSQL data modeling e-commerce",
  tokensNum: 5000
})

WebSearch({
  query: "PostgreSQL vs MongoDB 2024 e-commerce comparison"
})
```

**Synthèse:**

```markdown
## PostgreSQL vs MongoDB for E-commerce

### PostgreSQL
**Pros:**
- ACID transactions (orders, payments critical)
- Complex queries (reports, analytics)
- Relations (users, products, orders)
- JSON support (flexibility si besoin)

**Cons:**
- Vertical scaling limits
- Schema migrations overhead

**E-commerce fit**: ⭐⭐⭐⭐⭐
- Stripe uses PostgreSQL
- Shopify uses PostgreSQL
- Transactions garantees essential

### MongoDB
**Pros:**
- Flexible schema (rapid iteration)
- Horizontal scaling (sharding)
- Fast reads (denormalized)

**Cons:**
- No ACID multi-document (orders + inventory = problème)
- Complex aggregations verbose
- Data consistency challenges

**E-commerce fit**: ⭐⭐⭐
- Better for: catalogs, CMS
- Risky for: payments, inventory

### Recommendation
**PostgreSQL** pour e-commerce

**Reasoning:**
1. Transactions ACID = critical (orders, payments, inventory)
2. Relations naturelles (users, products, orders)
3. Complex queries (analytics, reports)
4. Industry standard (Stripe, Shopify, Amazon)

**Alternative:** PostgreSQL + Redis (cache)
```

**Orchestrator propose recommandation** → User valide → Crée ADR

---

### Exemple 3: Best practices (User demande)

**User:** "Best practices authentification Next.js 14?"

**Workflow:**

```typescript
// Parallèle
mcp__exa__web_search_exa({
  query: "Next.js 14 authentication patterns examples",
  numResults: 6,
  type: "auto"
})

mcp__exa__get_code_context_exa({
  query: "Next.js 14 server actions authentication",
  tokensNum: 4000
})
```

**Synthèse:**

```markdown
## Next.js 14 Authentication Best Practices

### Pattern #1: NextAuth.js (Recommended)
**Pros:**
- Built for Next.js
- Support OAuth + credentials
- Session management

**Setup:**
```ts
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"

export const { handlers, auth } = NextAuth({
  providers: [GithubProvider],
})
```

**Protect routes:**
```ts
// middleware.ts
export { auth as middleware } from "@/auth"
```

### Pattern #2: Custom JWT + Server Actions
**Pros:**
- Full control
- Lightweight

**Cons:**
- Boilerplate
- Security risk si mal implémenté

### Recommendation
**NextAuth.js** pour production

**Reasoning:**
- Security audited
- Active maintenance
- Vercel recommended
- Easy OAuth integration

**Setup steps:**
1. `npm install next-auth`
2. Create `auth.ts` config
3. Add middleware.ts
4. Protect Server Actions avec `auth()`
```

---

## Queries Optimization

### ✅ Good Queries (Specific)

```typescript
// ✅ Framework + version + concept précis
"Next.js 14 server actions data mutations"

// ✅ Use case + techno
"FastAPI async database connection pooling"

// ✅ Comparaison contextualisée
"Prisma vs Drizzle ORM TypeScript performance 2024"

// ✅ Pattern + contexte
"React Server Components data fetching patterns"
```

---

### ❌ Bad Queries (Too Generic)

```typescript
// ❌ Trop vague
"authentication"
"database"
"API"

// ❌ Pas de contexte
"best practices"
"how to use React"

// ❌ Outdated (pas de date)
"Next.js tutorial"  // Quelle version? 12? 13? 14?
```

---

## Interdictions

❌ **Recherche séquentielle** (paralléliser si >= 2 sources)
❌ **Queries vagues** (toujours spécifier framework + version)
❌ **Retour brut au user** (synthétiser pour Orchestrator)
❌ **Ignorer dates** (toujours privilégier contenu récent 2024-2025)
❌ **Sur-rechercher** (si docs officielles suffisent, pas besoin Exa)

---

## Output Format (Strict)

**TOUJOURS retourner à Orchestrator (pas au user):**

```markdown
## Research: [TOPIC]

### Summary
[1-2 phrases résumé]

### Key Findings
- Finding 1
- Finding 2
- Finding 3

### Recommended Approach
[Quelle méthode/techno utiliser]

### Reasoning
1. Reason 1
2. Reason 2
3. Reason 3

### Alternatives Considered
- Alternative A: [Trade-offs]
- Alternative B: [Trade-offs]

### Code Example (si applicable)
```[lang]
// Exemple minimal
```

### References
- [Link 1] (official docs)
- [Link 2] (GitHub example)
- [Link 3] (blog post 2024)
```

**Orchestrator utilise ce format** → Prend décision → Informe user

---

## Checklist Research

**Avant recherche:**
- [ ] Type recherche identifié? (docs, exemples, comparaison, best practices)
- [ ] Tools appropriés sélectionnés? (Context7, Exa, Web)
- [ ] Queries optimisées? (spécifiques, version, contexte)

**Pendant recherche:**
- [ ] Exécution parallèle? (si >= 2 sources)
- [ ] Résultats pertinents? (filtrer noise)

**Après recherche:**
- [ ] Synthèse structurée? (format standard)
- [ ] Recommendation claire? (quelle approche)
- [ ] Reasoning expliqué? (pourquoi cette approche)
- [ ] Alternatives listées? (trade-offs)
- [ ] References incluses? (liens sources)

---

## Principes

1. **Parallelize Everything** - Si >= 2 sources → 1 message multiple tools
2. **Specific Queries** - Framework + version + concept précis
3. **Structured Synthesis** - Format standard pour Orchestrator
4. **Actionable Recommendations** - Toujours proposer LA solution
5. **Document Sources** - Links références pour traçabilité

**Inspiré de:**
- Developer workflows (GitHub search, Stack Overflow)
- Research methodology (primary sources, synthesis)
- Decision support systems (structured recommendations)

---

**Version**: 1.0.0
**Last updated**: 2025-01-10
**Maintained by**: Research agent (invoked by Orchestrator)
