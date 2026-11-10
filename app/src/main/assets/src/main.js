// OOPS! WORLD - Main Entry Point
window.OopsWorld = window.OopsWorld || {};

function bootGame() {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) {
    console.error('Canvas element #gameCanvas not found!');
    return;
  }
  if (window.oopsGame) return;

  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  document.addEventListener(
    'touchmove',
    (e) => {
      if (e.target === canvas) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  const Game = window.OopsWorld.Game;
  if (!Game) {
    console.error('OopsWorld.Game class not found!');
    return;
  }

  const game = new Game(canvas);
  window.oopsGame = game;
  game.start();

  console.log('✨ OOPS! WORLD initialized successfully. Ready to run!');
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootGame);
} else {
  bootGame();
}
