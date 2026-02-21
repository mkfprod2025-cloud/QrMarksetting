# QrMarksetting

Application web (front-end) pour générer un QR code brandé avec un style proche de la référence fournie :
- rendu visuel personnalisable (couleurs, motif, coins, badge central),
- logo central remplaçable,
- textes multilingues (`JOIN US`, `REJOINS NOUS`, `UNISCITI A ME`),
- export local en PNG/JPEG,
- URL de redirection configurable.

## Lancer en local

```bash
python -m http.server 4173
```
Puis ouvrir `http://localhost:4173`.

## Assets changeables sans modifier le code QR

Depuis le panneau de gauche de l'application :
- **Logo central**,
- **Motif décoratif**,
- **Icône coin**.

Vous pouvez remplacer ces assets à tout moment : le QR encode toujours uniquement l'URL choisie.

## Note sur l'ouverture « directe »

Le comportement au scan dépend de l'appareil et de l'application de scan QR. Cette application génère un QR standard HTTPS (meilleure compatibilité), mais ne peut pas forcer 100% des apps tierces à ouvrir le lien automatiquement sans confirmation utilisateur.
