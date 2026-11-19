# Tetris en JavaScript

Un Tetris complet en HTML/CSS/JavaScript pur, sans aucune dépendance : un seul fichier [`index.html`](index.html).

![Capture d'écran du jeu](screenshot.svg)

## Jouer

Ouvre simplement `index.html` dans un navigateur (double-clic sur le fichier, aucune installation requise).

## Intégration WordPress

Ne colle **pas** le contenu de `index.html` dans une page WordPress : le filtre de contenu de WP découpe le HTML (`<p>`/`<br>` insérés dans le `<script>`) et le jeu ne démarre pas.

Deux méthodes propres :

**1. Plugin (recommandé)** — le dossier [`wordpress/tetris/`](wordpress/tetris/) contient un mini-plugin (`tetris.php`, `tetris.css`, `tetris.js`) :

1. Copie le dossier `tetris` dans `wp-content/plugins/` (FTP/SFTP ou un plugin de gestion de fichiers) ;
2. Active « Tetris » dans l'admin WordPress (*Extensions*) ;
3. Crée une page et mets-y le shortcode `[tetris]`.

**3. Plugin de JS personnalisé (type cjtoolbox)** — si tu utilises un plugin qui ne prend que du JS (`wp-admin/admin.php?page=cjtoolbox`), ne colle **jamais** le fichier HTML entier : colle séparément :

- dans la page `/tetris/` (éditeur bloc → bloc « HTML personnalisé ») : le contenu de [`wordpress/cjtoolbox/page-markup.html`](wordpress/cjtoolbox/page-markup.html) (balisage + `<style>` scopé, **sans** `<script>`) — remplace tout l'ancien contenu mutilé ;
- dans le champ JS du plugin : le contenu de [`wordpress/cjtoolbox/game.js`](wordpress/cjtoolbox/game.js) (JS pur, sans balises `<script>`, enveloppé dans `DOMContentLoaded`).

**2. Fichier statique + iframe** — upload `index.html` tel quel à la racine du site (ex. `/tetris-game/index.html` via FTP), puis dans la page WordPress (bloc HTML personnalisé) :

```html
<iframe src="/tetris-game/index.html" width="500" height="700" style="border:0"></iframe>
```


## Contrôles

| Touche | Action |
| --- | --- |
| ← → | Déplacer la pièce |
| ↓ | Descente rapide |
| ↑ ou X | Tourner (horaire) |
| Z | Tourner (anti-horaire) |
| Espace | Chute instantanée |
| C | Garder la pièce (hold) |
| P | Pause |
| Entrée | Rejouer après une partie terminée |

Sur mobile / écran tactile, des boutons tactiles apparaissent sous le plateau.

## Fonctionnalités

- Grille 10 × 20 et les 7 té trominos, avec distribution aléatoire « 7-bag »
- Rotations avec wall kicks et aperçu de la position d'atterrissage (pièce fantôme)
- Score, lignes et niveaux : la vitesse augmente tous les 10 lignes
- Aperçu de la pièce suivante et pièce gardée
- Pause, game over et redémarrage
- Interface adaptée aux petits écrans et aux écrans tactiles
