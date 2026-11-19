<?php
/**
 * Plugin Name: Tetris
 * Description: Jeu Tetris intégrable dans une page via le shortcode [tetris].
 * Version: 1.0
 */

if (!defined('ABSPATH')) {
    exit;
}

function tetris_enqueue_assets() {
    wp_enqueue_style('tetris', plugin_dir_url(__FILE__) . 'tetris.css', array(), '1.0');
    wp_enqueue_script('tetris', plugin_dir_url(__FILE__) . 'tetris.js', array(), '1.0', true);
}

function tetris_shortcode() {
    tetris_enqueue_assets();
    ob_start();
    ?>
<div id="tetris-game">
  <div class="game">
    <div class="board-wrap">
      <canvas id="board" width="300" height="600"></canvas>
      <div class="overlay" id="overlay">
        <div id="overlay-title">PAUSE</div>
        <small id="overlay-sub">Appuie sur P pour reprendre</small>
      </div>
    </div>
    <div class="side">
      <div class="panel"><h2>Garde</h2><canvas id="hold" width="120" height="70"></canvas></div>
      <div class="panel"><h2>Suivant</h2><canvas id="next" width="120" height="70"></canvas></div>
      <div class="panel"><h2>Score</h2><div class="value" id="score">0</div></div>
      <div class="panel"><h2>Lignes</h2><div class="value" id="lines">0</div></div>
      <div class="panel"><h2>Niveau</h2><div class="value" id="level">1</div></div>
      <div class="panel hint">
        &#8592; &#8594; : d&eacute;placer<br>
        &#8595; : descente rapide<br>
        &#8593; / X : tourner<br>
        Z : tourner (inverse)<br>
        Espace : chute instantan&eacute;e<br>
        C : garder la pi&egrave;ce<br>
        P : pause &mdash; Entr&eacute;e : rejouer
      </div>
    </div>
  </div>
  <div class="touch">
    <button type="button" data-key="ArrowLeft" aria-label="Gauche">&#8592;</button>
    <button type="button" data-key="ArrowDown" aria-label="Descendre">&#8595;</button>
    <button type="button" data-key="ArrowUp" aria-label="Tourner">&#10227;</button>
    <button type="button" data-key="Space" aria-label="Chute">&#10515;</button>
    <button type="button" data-key="ArrowRight" aria-label="Droite">&#8594;</button>
  </div>
</div>
    <?php
    return ob_get_clean();
}
add_shortcode('tetris', 'tetris_shortcode');
