// OOPS! WORLD - Core Game Engine
window.OopsWorld = window.OopsWorld || {};

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.width = 960;
    this.height = 540;

    const {
      StorageManager,
      SoundEngine,
      Camera,
      ParticleSystem,
      World,
      Player,
      ObstacleManager,
      EnemyManager,
      PowerupManager,
      SurpriseEventManager,
      UIManager
    } = window.OopsWorld;

    this.storage = new StorageManager();
    this.audio = new SoundEngine(this.storage);
    this.camera = new Camera();
    this.particles = new ParticleSystem(400);

    this.world = new World(this);
    this.player = new Player(this);
    this.obstacles = new ObstacleManager(this);
    this.enemies = new EnemyManager(this);
    this.powerups = new PowerupManager(this);
    this.events = new SurpriseEventManager(this);
    this.ui = new UIManager(this);

    this.state = 'menu';
    this.score = 0;
    this.coinsCollected = 0;
    this.enemiesStomped = 0;
    this.disastersSurvived = 0;
    this.isNewHigh = false;

    this.lastTime = 0;
    this.running = false;
    this.keys = {};

    this.isOrientationBlocked = false;
    this.initCanvas();
    this.setupInputs();
  }

  async requestLandscapeAndFullscreen() {
    // 1. Native Android Bridge orientation lock
    if (window.AndroidBridge && window.AndroidBridge.lockLandscape) {
      window.AndroidBridge.lockLandscape();
    }

    // 2. HTML5 Fullscreen API
    try {
      const docEl = document.documentElement;
      const reqFs =
        docEl.requestFullscreen ||
        docEl.webkitRequestFullscreen ||
        docEl.mozRequestFullScreen ||
        docEl.msRequestFullscreen;

      if (reqFs && !document.fullscreenElement && !document.webkitFullscreenElement) {
        await reqFs.call(docEl);
      }
    } catch (_) {}

    // 3. Screen Orientation API Lock to Landscape
    try {
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock('landscape');
      } else if (screen.lockOrientation) {
        screen.lockOrientation('landscape');
      } else if (screen.mozLockOrientation) {
        screen.mozLockOrientation('landscape');
      } else if (screen.msLockOrientation) {
        screen.msLockOrientation('landscape');
      }
    } catch (_) {}

    if (this.resize) {
      this.resize();
    }
  }

  initCanvas() {
    this.resize = () => {
      const containerW = Math.max(300, window.innerWidth || document.documentElement.clientWidth || window.screen.width || 960);
      const containerH = Math.max(200, window.innerHeight || document.documentElement.clientHeight || window.screen.height || 540);

      const isMobile =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches;

      const isPortrait = containerH > containerW;

      const overlay = document.getElementById('rotate-device-overlay');
      if (overlay) {
        if (isMobile && isPortrait) {
          overlay.classList.add('visible');
          this.isOrientationBlocked = true;
        } else {
          overlay.classList.remove('visible');
          this.isOrientationBlocked = false;
        }
      }

      // Use complete available screen dimensions in landscape mode without squeezing
      this.height = 540;
      const aspect = isPortrait ? 1.7778 : Math.max(1.33, Math.min(2.4, containerW / containerH));
      this.width = Math.round(540 * aspect);

      this.canvas.style.width = '100vw';
      this.canvas.style.height = '100vh';

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      this.canvas.width = Math.floor(this.width * dpr);
      this.canvas.height = Math.floor(this.height * dpr);

      this.ctx.resetTransform();
      this.ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', this.resize);
    window.addEventListener('orientationchange', () => {
      setTimeout(this.resize, 100);
      setTimeout(this.resize, 350);
    });

    if (screen.orientation) {
      screen.orientation.addEventListener('change', () => {
        setTimeout(this.resize, 100);
        setTimeout(this.resize, 350);
      });
    }

    document.addEventListener('fullscreenchange', () => {
      setTimeout(this.resize, 100);
      setTimeout(this.resize, 300);
    });

    this.resize();
    setTimeout(this.resize, 100);
    setTimeout(this.resize, 350);
  }

  setupInputs() {
    window.addEventListener('keydown', (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyS'].includes(e.code)) {
        e.preventDefault();
      }

      if (this.keys[e.code]) return;
      this.keys[e.code] = true;

      this.handleKeyDown(e.code);
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      this.handleKeyUp(e.code);
    });

    const getCanvasPos = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.width / rect.width;
      const scaleY = this.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    };

    this.canvas.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          const pos = getCanvasPos(t.clientX, t.clientY);
          this.handlePointerDown(pos.x, pos.y, t.identifier);
        }
      },
      { passive: false }
    );

    this.canvas.addEventListener(
      'touchend',
      (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          this.handlePointerUp(t.identifier);
        }
      },
      { passive: false }
    );

    this.canvas.addEventListener(
      'touchcancel',
      (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          this.handlePointerUp(t.identifier);
        }
      },
      { passive: false }
    );

    this.canvas.addEventListener('mousedown', (e) => {
      const pos = getCanvasPos(e.clientX, e.clientY);
      this.handlePointerDown(pos.x, pos.y, 'mouse');
    });

    window.addEventListener('mouseup', () => {
      this.handlePointerUp('mouse');
    });
  }

  handleKeyDown(code) {
    if (code === 'Escape' || code === 'KeyP') {
      if (this.state === 'playing' || this.state === 'paused') {
        this.togglePause();
      }
      return;
    }

    if (this.state === 'playing') {
      if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') {
        this.player.jump();
      } else if (code === 'ArrowDown' || code === 'KeyS') {
        this.player.slide();
      }
    } else if (this.state === 'gameover') {
      if (code === 'Space' || code === 'Enter') {
        this.startPlaying();
      }
    } else if (this.state === 'menu') {
      if (code === 'Space' || code === 'Enter') {
        this.startPlaying();
      }
    }
  }

  handleKeyUp(code) {
    if (this.state === 'playing') {
      if (code === 'ArrowDown' || code === 'KeyS') {
        this.player.cancelSlide();
      }
    }
  }

  handlePointerDown(x, y, id) {
    if (this.ui.handleClick(x, y)) {
      return;
    }

    if (this.state === 'playing') {
      const jBtn = this.ui.touchButtons.jump;
      const sBtn = this.ui.touchButtons.slide;

      const dJump = Math.hypot(x - jBtn.x, y - jBtn.y);
      const dSlide = Math.hypot(x - sBtn.x, y - sBtn.y);

      if (dJump <= jBtn.radius + 15) {
        jBtn.pressed = true;
        this.player.jump();
        return;
      }

      if (dSlide <= sBtn.radius + 15) {
        sBtn.pressed = true;
        this.player.slide();
        return;
      }

      if (x < this.width * 0.45) {
        sBtn.pressed = true;
        this.player.slide();
      } else {
        jBtn.pressed = true;
        this.player.jump();
      }
    } else if (this.state === 'gameover') {
      this.startPlaying();
    }
  }

  handlePointerUp(id) {
    this.ui.touchButtons.jump.pressed = false;
    this.ui.touchButtons.slide.pressed = false;
    if (this.state === 'playing') {
      this.player.cancelSlide();
    }
  }

  hudToast(text, color, duration) {
    this.ui.showToast(text, color, duration);
  }

  startPlaying() {
    this.requestLandscapeAndFullscreen();

    this.state = 'playing';
    this.score = 0;
    this.coinsCollected = 0;
    this.enemiesStomped = 0;
    this.disastersSurvived = 0;
    this.isNewHigh = false;

    this.particles.clear();
    this.world.reset();
    this.player.reset();
    this.obstacles.reset();
    this.enemies.reset();
    this.powerups.reset();
    this.events.reset();

    this.audio.playPowerup();
    if (this.storage.data.settings.musicEnabled) {
      this.audio.startMusic();
    }
  }

  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
    } else if (this.state === 'paused') {
      this.state = 'playing';
    }
  }

  onPlayerDied() {
    this.state = 'gameover';
    this.audio.playGameOver();

    const res = this.storage.recordRun({
      score: this.score,
      distance: this.world.distance,
      coins: this.coinsCollected,
      enemiesStomped: this.enemiesStomped,
      disastersSurvived: this.disastersSurvived
    });

    this.isNewHigh = res.isNewHigh;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  loop(currentTime) {
    if (!this.running) return;

    const dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    if (this.isOrientationBlocked) return;

    this.camera.update(dt);
    this.ui.update(dt);

    if (this.state === 'playing') {
      this.score += Math.floor(dt * 12);
      const worldSpeed = this.world.currentSpeed || this.world.speed;

      this.world.update(dt);
      this.player.update(dt);
      this.obstacles.update(dt, worldSpeed);
      this.enemies.update(dt, worldSpeed);
      this.powerups.update(dt, worldSpeed);
      this.events.update(dt, worldSpeed);
      this.particles.update(dt);
    } else if (this.state === 'gameover' || this.state === 'menu') {
      this.particles.update(dt);
    }
  }

  render() {
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.camera.apply(this.ctx);

    if (this.state === 'playing' || this.state === 'paused' || this.state === 'gameover') {
      this.world.draw(this.ctx);
      this.obstacles.draw(this.ctx);
      this.powerups.draw(this.ctx);
      this.enemies.draw(this.ctx);
      this.player.draw(this.ctx);
      this.events.draw(this.ctx);
      this.particles.draw(this.ctx);
    } else {
      this.world.draw(this.ctx);
      this.particles.draw(this.ctx);
    }

    this.ctx.restore();

    this.ui.draw(this.ctx);
  }
}

window.OopsWorld.Game = Game;
