# ADR 000: Use Architecture Decision Records

**Date**: 2025-01-10

**Status**: Accepted

**Deciders**: Builder System

---

## Context and Problem Statement

Dans tout projet logiciel, des décisions architecturales importantes sont prises régulièrement.
Sans documentation, ces décisions et leur contexte sont perdus avec le temps.

Questions à résoudre:
- Comment documenter les décisions importantes?
- Comment comprendre pourquoi une décision a été prise dans 6 mois?
- Comment éviter de refaire les mêmes erreurs?

---

## Decision Drivers

* **Traçabilité**: Comprendre l'évolution du projet
* **Onboarding**: Nouveaux devs (ou soi-même dans le futur) comprennent les choix
* **Éviter régression**: Ne pas réintroduire des solutions déjà testées et rejetées
* **Standard industry**: Pattern utilisé par grandes entreprises tech

---

## Considered Options

### Option 1: Architecture Decision Records (ADR)
**Pros:**
- ✅ Format standardisé (Michael Nygard 2011)
- ✅ Utilisé par GitHub, Shopify, Spotify, ThoughtWorks
- ✅ Markdown simple (versionnable Git)
- ✅ Contexte + décision + conséquences documentés
- ✅ Historique des changements de décision

**Cons:**
- ❌ Overhead documentation (mineur)

---

### Option 2: Inline code comments
**Pros:**
- ✅ Proche du code

**Cons:**
- ❌ Fragmenté (pas de vue d'ensemble)
- ❌ Perdu lors refactoring
- ❌ Pas de contexte business

---

### Option 3: External wiki (Notion, Confluence)
**Pros:**
- ✅ Rich formatting

**Cons:**
- ❌ Séparé du code (devient obsolète)
- ❌ Pas versionné avec Git
- ❌ Overhead outil externe

---

## Decision Outcome

**Chosen option**: "Architecture Decision Records (ADR)"

**Justification:**
- Standard industry éprouvé
- Markdown versionné avec code (single source of truth)
- Format simple et efficace
- Traçabilité complète des décisions

**Implementation:**
- Dossier `.build/decisions/`
- Numérotation: `000-titre.md`, `001-titre.md`, etc
- Template standardisé (`.build/templates/adr-template.md`)
- Auto-créés par Orchestrator lors décisions architecture

---

## Consequences

### Positive
- ✅ Décisions architecturales documentées automatiquement
- ✅ Contexte préservé pour le futur
- ✅ Onboarding rapide nouveaux devs
- ✅ Évite de refaire erreurs passées

### Negative
- ❌ Léger overhead documentation (accepté, automatis é par Orchestrator)

### Neutral
- ℹ️ Nécessite discipline pour maintenir à jour (géré par Orchestrator)

---

## Follow-up Actions

- [x] Créer `.build/decisions/` dossier
- [x] Créer template ADR (`.build/templates/adr-template.md`)
- [x] Documenter cette décision (ce fichier)
- [ ] Orchestrator auto-crée ADR pour décisions architecture futures

---

## Links

* **Reference**: [Michael Nygard's ADR article (2011)](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
* **Examples**:
  - [GitHub ADR examples](https://adr.github.io/)
  - [Spotify Engineering ADRs](https://engineering.atspotify.com/)
* **Template inspired by**: [MADR (Markdown ADR)](https://adr.github.io/madr/)

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2025-01-10 | Orchestrator | Initial creation - ADR system established |
