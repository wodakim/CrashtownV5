# CrashTown — Sprint 4: Obstacle system + Spawn director v2 (Phase 2)

## Statut sprint
- **État:** En cours
- **Objectif:** ajouter les obstacles de voie et améliorer la logique de spawn bots pour réduire les situations injustes.

---

## 1) Objectifs sprint

1. Implémenter un système d'obstacles dynamique par voie.
2. Ajouter un spawn director v2 (choix de voie intelligent) pour les bots.
3. Conserver une difficulté élevée sans "mur" injuste.

---

## 2) Avancement itération 1

- [x] Obstacles de voie ajoutés (spawn, update, collision, expiration).
- [x] Obstacle visuel migré vers asset SVG `Obstacles_decor_base_v01.svg` (même empreinte visuelle que prototype).
- [x] Hitbox obstacle alignée sur les arêtes du sprite rendu (collision via `getBoundingClientRect`).
- [x] Spawn director v2 ajouté (`pickSpawnLaneV2`) en tenant compte trafic + obstacles + lane joueur.
- [x] Intégration gameplay dans boucle principale (`updateObstacles`, spawn clock dédiée).
- [x] Tracking télémétrie obstacle (`obstacle_spawn`, `obstacle_hit`).
- [x] Bots détruits en collision obstacle (`obstacle_bot_hit`) pour cohérence gameplay.
- [ ] Validation gameplay manuelle approfondie (fairness/ressenti) sur appareils réels.
- [ ] Asset obstacle présent dans le bundle Android (`public/Assets/Road/obstacles/Obstacles_decor_base_v01.svg`).

---

## 3) DoD Sprint 4

- [ ] Obstacles cohérents visuellement et lisibles.
- [ ] Pas de spikes de morts injustes évidents liés au nouveau système.
- [ ] Spawn bots plus stable en phase dense.
- [ ] Aucun bug P0/P1 introduit.


## 4) Incident identifié

- **Cause probable du rectangle orange:** asset obstacle absent du repo/bundle actuel.
- **Mitigation code:** fallback multi-chemins + event telemetry `obstacle_asset_missing`.
- **Action MANUELLE (toi):** ajouter le SVG au chemin cible dans le repo pour supprimer le fallback.
