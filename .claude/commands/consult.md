---
description: Analyze complex feature with EXECUTOR before implementation
argument-hint: [feature description]
---

# Consultation EXECUTOR (CHECK -1 Enforcement)

Analyzing feature: **$ARGUMENTS**

I will now invoke EXECUTOR in MODE: CONSULT to:
- Analyze architecture impacts
- Detect conflicts with existing code
- List all files needed
- Provide execution plan with vagues

Task(executor, sonnet, "MODE: CONSULT

User Request: $ARGUMENTS

Context Projet:
Read .build/context.md and .build/inventory.md

Instructions:
1. Charge skills appropriés
2. Analyse demande dans contexte existant
3. Détecte conflits types/imports/architecture
4. Propose stratégie optimale
5. Liste fichiers et vagues si >= 5 fichiers

Return plan détaillé avec:
- Analyse impacts
- Conflits détectés
- Stratégie fusion/adaptation
- Liste fichiers par vague
- Estimations temps")

After CONSULT completes, I will show you the plan for validation before executing.
