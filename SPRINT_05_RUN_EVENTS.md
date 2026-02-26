# CrashTown — Sprint 5: Run events (trafic dense + nuit)

## Statut sprint
- **État:** En cours
- **Objectif:** introduire deux variations de run qui modifient légèrement le gameplay sans casser la fairness.

---

## 1) Objectifs sprint

1. Ajouter l'event `dense_traffic` (trafic plus dense).
2. Ajouter l'event `night` (visuel nuit + tuning vitesse prudent).
3. Instrumenter le cycle event (`start`/`end`) en télémétrie.

---

## 2) Avancement itération 1

- [x] Configuration data-driven des run events dans `src/data/gameplay.js`.
- [x] Lifecycle runtime dans `play.js` (planning, activation, expiration).
- [x] Event `dense_traffic` branché sur le spawn director (intervalle réduit, cap bots augmenté).
- [x] Event `night` branché sur le runtime vitesse (cruise/speed cap) + classe visuelle dédiée.
- [x] Tracking télémétrie `run_event_start` et `run_event_end`.
- [ ] Validation gameplay manuelle approfondie sur appareils réels (fairness/ressenti).

---

## 3) DoD Sprint 5

- [ ] Variantes de run perceptibles par le joueur en moins de 2 sessions.
- [ ] Pas de spike injuste de collisions pendant `dense_traffic`.
- [ ] Event `night` lisible visuellement sans perte majeure d'info gameplay.
- [ ] Aucun bug P0/P1 introduit.
