# CrashTown — Roadmap Professionnelle v2 (Feature-first + Store-ready)

> Cette version corrige explicitement le point clé: **"features" = vraies fonctionnalités de jeu à ajouter** (pas seulement polish/packaging).

## 1) Objectif produit (clair)

Construire une version **professionnelle** de CrashTown avec:
1. Un gameplay lane-racer fun et riche en mécaniques.
2. Une progression méta engageante (sur plusieurs jours/semaines).
3. Une base technique stable pour publication Google Play.

---

## 2) Vérité opérationnelle (ce que je peux / ne peux pas faire)

### ✅ Je peux faire
- Coder les features gameplay, progression, UI, économie, balancing, telemetry, QA technique.
- Refactor l'architecture pour soutenir l'ajout rapide de nouvelles fonctions.
- Préparer toute la chaîne technique release Android (scripts, checks, qualité).

### ⚠️ Tu dois faire manuellement
- Play Console, formulaires légaux (Data Safety/rating/policy), publication finale.
- Tests sur appareils Android physiques réels.
- Décisions business finales (pricing, offers, pays, branding légal).

---

## 3) Vision feature set V1 (priorité absolue)

## V1 MUST-HAVE (features gameplay)
1. **Near-miss system** (frôlements récompensés)
2. **Combo chain** (overtake + near-miss + takedown)
3. **Vehicle abilities** (ex: shield court, nitro soft, grip bonus) avec cooldown.
4. **Run events** (trafic dense, chantier, pluie légère, nuit) avec variations gameplay.
5. **Obstacle system** (zones fermées, debris, cônes, voitures stoppées).
6. **Mission system** (daily + weekly) avec objectifs concrets.
7. **Progression joueur** (XP, levels, unlock tiers).
8. **Vehicle progression** (upgrade per-car: vitesse, maniabilité, résistance).
9. **Economy complete loop** (earn/spend/sinks équilibrés).
10. **Save robustness** (anti-corruption local data + migration versionnée).

## V1 SHOULD-HAVE (features de rétention)
1. **Streak rewards** (jour 2,3,4...).
2. **Mini-achievements** (badges gameplay).
3. **Season pass light** (gratuit au départ).
4. **Difficulty profiles adaptatifs** selon performance joueur.
5. **Ghost best run** (silhouette score progression).
6. **Assist mode conduite** (option accessibilité: aide légère au recentrage de voie).
7. **Replay seed debug** (rejouer un run déterministe pour QA/balancing).

## V1 COULD-HAVE
1. Classement online (si backend prêt).
2. Événements temporaires week-end.
3. Personnalisation esthétique avancée (stickers, trails, plaques).

---

## 4) Feature backlog détaillé (par domaine)

## A) Gameplay Core
- Lane-switch avec inertie + anti-spam.
- Hitbox tuning et fenêtres de sécurité (fairness).
- IA trafic: comportements par archétype (prudent, agressif, erratique).
- Système de collisions différenciées (frontale, latérale, chain crash).
- Système météo simple impactant visuellement + légèrement gameplay.
- Spawn director piloté par niveau de stress du joueur.

### KPI gameplay
- Mort injuste signalée < 5% des runs test.
- Retry rate > 45% après game over.

## B) Game Feel / Juice
- Camera shake contextuel paramétrable.
- Slow-mo très court sur takedown.
- VFX impact, sparks, flash lane warning.
- Audio layers dynamiques (intensité selon vitesse/danger).
- HUD dynamique (combo pulse, warning states).

### KPI feel
- Note interne "sensation" >= 8/10.

## C) Progression / Meta
- XP de compte + niveau.
- Unlock véhicules par milestones/missions.
- Upgrade slots par véhicule.
- Perks passifs (ex: +coins run, +window near-miss).
- Mission board quotidien/hebdo.

### KPI meta
- Au moins 3 objectifs moyen terme visibles en permanence.

## D) Economy
- Sources: runs, missions, streaks, events.
- Sinks: upgrades, unlocks, cosmetics.
- Anti inflation: scaling coûts + plafonds gains spécifiques.
- Tuning table data-driven (fichier balance dédié).

### KPI économie
- Première upgrade <= 20 min de jeu.
- Progression sans blocage paywall en F2P soft.

## E) UX/UI produit
- Onboarding interactif (pas juste texte).
- Menu profil plus utile (stats run, record, progression mission).
- Garage: comparaison stats entre voitures.
- Game over enrichi (raison crash + conseils + CTA retry).
- Options accessibilité (intensité effets, vibration, contraste).

## F) Tech & fiabilité
- Module storage versionné (migrations).
- Télémetry event bus (gameplay/perf/crash points).
- Feature flags (activer/désactiver mécaniques rapidement).
- Smoke tests flows critiques.
- Performance budgets (FPS, frame spikes, memory).

## G) Store readiness (en parallèle)
- Build reproducible Android.
- Conformité policy et data safety.
- Internal testing track puis closed testing.

---

## 5) Phases de delivery (réorientées features)

## Phase 0 — Product Lock (1 semaine)
- Figer scope V1 MUST/SHOULD/COULD.
- Définir KPI finaux et devices cibles.
- Valider style guide gameplay (vitesse, difficulté, récompenses).

## Phase 1 — Foundation technique (2 semaines)
- Refactor modules partagés (`storage`, `audio`, `navigation`, `telemetry`).
- Mettre feature flags et architecture data-driven.
- Sécuriser lifecycle mobile (pause/resume/background).

## Phase 2 — Gameplay features pack #1 (3 semaines)
- Near-miss, combo chain, run events, obstacle system.
- Spawn director + fairness V2.
- Écrans feedback gameplay enrichis.

## Phase 3 — Meta features pack #2 (3 semaines)
- Missions daily/weekly.
- XP/levels compte.
- Upgrades véhicules + perks basiques.
- Economy tuning V1.

## Phase 4 — Juice & polish pro (2 semaines)
- VFX/SFX dynamiques.
- Onboarding interactif.
- HUD et game over avancés.

## Phase 5 — QA intensive + perf hardening (2 semaines)
- Device matrix + test plan complet.
- Optimisations perfs critiques.
- Correction bugs P0/P1.

## Phase 6 — Store prep + soft launch (2 à 4 semaines)
- Préparation Play Console.
- Internal/closed test.
- Itération data sur KPI rétention/perf.

---

## 6) Sprints exécutable (12 semaines type)

## Sprint 1
- Product lock + backlog final + KPI + règles DoD.

## Sprint 2
- Refactor storage/navigation/audio + feature flags.

## Sprint 3
- Near-miss + combo MVP.

## Sprint 4
- Obstacle system + spawn director v2.

## Sprint 5
- Run events (2 variants: trafic dense + nuit).

## Sprint 6
- Missions daily/weekly + UI mission board.

## Sprint 7
- XP/level + rewards loop.

## Sprint 8
- Upgrade véhicules + balancing initial.

## Sprint 9
- HUD dynamique + onboarding interactif.

## Sprint 10
- VFX/SFX polishing + accessibilité options.

## Sprint 11
- QA/perf/bugfix.

## Sprint 12
- Soft launch prep + release candidate.

---

## 7) Definition of Done (DoD) par feature

Une feature est considérée "done" seulement si:
1. Fonctionnelle en jeu + test manuel validé.
2. Impact KPI défini (ex: retry rate, session length) mesurable.
3. Aucun bug P0/P1 ouvert lié à la feature.
4. Sauvegarde/reload robustes.
5. Performance ne régresse pas au-delà du budget fixé.

---

## 8) KPI dashboard minimal (à suivre chaque sprint)

## Techniques
- FPS moyen, max frame time, mémoire.
- Temps chargement play.
- Crash rate / blocages.

## Produit
- Session length.
- Nombre runs/session.
- Retry rate.
- D1 retention (soft launch).

## Design
- Taux d'usage des nouvelles features (near-miss, missions, upgrades).
- Progression moyenne au jour 1/3/7.

---

## 9) Actions manuelles (toi) au bon timing

## Dès maintenant
- Préparer accès Play Console + keystore.
- Préparer email support + URL privacy policy.

## Avant soft launch
- Remplir Data Safety/content rating.
- Uploader bundle en internal testing.
- Exécuter test appareils réels low/mid/high.

## Avant release élargie
- Vérifier conformité assets Store (screenshots/description).
- Valider legal/brand naming final.

---

## 10) Risques clés & réponses

1. **Trop de polish sans features fortes**
   - Réponse: priorité Gameplay/Meta avant cosmétique.
2. **Trop de features sans stabilité**
   - Réponse: gates QA/perf chaque sprint.
3. **Scope explosion**
   - Réponse: MUST/SHOULD/COULD verrouillé phase 0.
4. **Store reject tardif**
   - Réponse: conformité traitée en parallèle (pas en fin).

---

## 11) Plan d'exécution immédiat (prochain cycle)

1. Verrouiller le **scope V1 MUST-HAVE** ensemble.
2. Lancer Sprint 1 (product lock + KPI + backlog final).
3. Démarrer Sprint 2 (foundation technique) puis Sprint 3 (première vraie feature gameplay: near-miss + combo).

> Règle d'honnêteté: si une étape dépend de toi ou d'une action externe, elle sera explicitement marquée `MANUEL (toi)` dans le suivi sprint.


---

## 12) Suivi d'exécution (strict, ordre roadmap)

### État global
- **Phase active:** Phase 2 — Gameplay features pack #1
- **Sprint actif:** Sprint 4
- **Règle d'ordre:** Sprint 3 terminé; exécution en cours strictement sur Sprint 4.

### Sprint 1 — Checklist de validation
- [x] Scope V1 MUST/SHOULD/COULD figé (doc dédié Sprint 1).
- [x] KPI cibles chiffrés définis (tech/produit/design).
- [x] Règles DoD détaillées et mesurables.
- [x] Validation manuelle propriétaire (toi) du scope V1 final.

### Sprint 2 — Checklist de validation
- [x] Modules partagés `storage/audio/navigation/telemetry` intégrés.
- [x] Feature flags en place et branchés.
- [x] Paramètres gameplay data-driven (premier lot) ajoutés.
- [x] Migration progressive des clés storage historiques amorcée.

### Sprint 3 — Checklist de validation
- [x] Near-miss MVP implémenté.
- [x] Combo MVP implémenté.
- [x] Events telemetry Sprint 3 branchés.
- [x] Validation physique initiale reçue (smartphone).

### Journal des ajustements roadmap
- **Sprint 1 validé avec retours utilisateur**: scope/KPI/devices confirmés.
- **Ajout intéressant:** `Assist mode conduite` (accessibilité) dans SHOULD-HAVE.
- **Motif:** améliorer la rétention joueurs casual/mobile sans casser le skill ceiling.
- **Ajout intéressant (S2):** `Replay seed debug` en SHOULD-HAVE.
- **Motif:** accélérer QA/balancing en rejouant des scénarios déterministes.
- **Ajout intéressant (S3):** `Danger pulse lane indicator` (alerte visuelle brève avant congestion).
- **Motif:** réduire la frustration sans diminuer la difficulté globale.
- **Ajout intéressant (S3.1):** protocole de test physique standardisé low/mid/high.
- **Motif:** rendre la validation fairness/perf répétable avant Sprint 4.
- **Ajout intéressant (S4):** score de "danger lane" affichable en debug.
- **Motif:** accélérer l'itération du spawn director v2 sans tâtonnement aveugle.
- **Ajout intéressant (S4.1):** collisions obstacles basées sur bounding boxes DOM du sprite.
- **Motif:** coller visuellement aux arêtes de l'asset obstacle sur tous les écrans.
- **Ajout intéressant (S4.2):** fallback multi-chemins + telemetry `obstacle_asset_missing`.
- **Motif:** diagnostiquer rapidement les assets manquants sur APK/device.
