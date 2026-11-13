// OOPS! WORLD - Core Game Engine
window.OopsWorld = window.OopsWorld || {};

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.width = 960;
    this.height = 620;

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
      UIManager,
      NarrationManager
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
    this.narration = new NarrationManager(this);

    // First launch cinematic check
    if (!this.storage.data.story || !this.storage.data.story.openingCinematicWatched) {
      this.state = 'cinematic';
      this.narration.startOpeningCinematic(true);
    } else {
      this.state = 'menu';
    }
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
    this.setupGeometricControls();
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

      // Use complete available screen dimensions in landscape mode with 160px ground depth
      this.height = 620;
      const aspect = isPortrait ? 1.7778 : Math.max(1.33, Math.min(2.4, containerW / containerH));
      this.width = Math.round(this.height * aspect);

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

  setupGeometricControls() {
    const slideBtn = document.getElementById('ctrl-slide');
    const jumpBtn = document.getElementById('ctrl-jump');
    if (!slideBtn || !jumpBtn) return;

    const triggerHaptic = (ms = 22) => {
      try {
        if (window.AndroidBridge && window.AndroidBridge.vibrate) {
          window.AndroidBridge.vibrate(ms);
        } else if (navigator.vibrate) {
          navigator.vibrate(ms);
        }
      } catch (err) {}
    };

    // --- LEFT CONTROL: SLIDE ---
    // Activates while pressed, cancels on release
    const handleSlideStart = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (this.state !== 'playing') return;
      slideBtn.classList.add('pressed');
      this.ui.touchButtons.slide.pressed = true;
      this.player.slide();
      triggerHaptic(20);
    };

    const handleSlideEnd = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      slideBtn.classList.remove('pressed');
      this.ui.touchButtons.slide.pressed = false;
      if (this.state === 'playing') {
        this.player.cancelSlide();
      }
    };

    // --- RIGHT CONTROL: JUMP ---
    // Activates on touch/press
    const handleJumpStart = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (this.state !== 'playing') return;
      jumpBtn.classList.add('pressed');
      this.ui.touchButtons.jump.pressed = true;
      this.player.jump();
      triggerHaptic(30);
    };

    const handleJumpEnd = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      jumpBtn.classList.remove('pressed');
      this.ui.touchButtons.jump.pressed = false;
    };

    // Independent multi-touch listeners
    slideBtn.addEventListener('touchstart', handleSlideStart, { passive: false });
    slideBtn.addEventListener('touchend', handleSlideEnd, { passive: false });
    slideBtn.addEventListener('touchcancel', handleSlideEnd, { passive: false });

    jumpBtn.addEventListener('touchstart', handleJumpStart, { passive: false });
    jumpBtn.addEventListener('touchend', handleJumpEnd, { passive: false });
    jumpBtn.addEventListener('touchcancel', handleJumpEnd, { passive: false });

    // Pointer/Mouse support for desktop and mouse input
    slideBtn.addEventListener('mousedown', handleSlideStart);
    slideBtn.addEventListener('mouseleave', () => {
      if (slideBtn.classList.contains('pressed')) handleSlideEnd();
    });

    jumpBtn.addEventListener('mousedown', handleJumpStart);
    jumpBtn.addEventListener('mouseleave', () => {
      if (jumpBtn.classList.contains('pressed')) handleJumpEnd();
    });

    // Safety release to prevent stuck touch inputs
    const resetAllControls = () => {
      handleSlideEnd();
      handleJumpEnd();
    };

    window.addEventListener('blur', resetAllControls);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) resetAllControls();
    });
    window.addEventListener('orientationchange', resetAllControls);
    window.addEventListener('touchcancel', resetAllControls);
    window.addEventListener('touchend', (e) => {
      // If no active touches remain on screen, reset any lingering pressed state
      if (!e.touches || e.touches.length === 0) {
        resetAllControls();
      }
    });

    window.addEventListener('mouseup', () => {
      if (slideBtn.classList.contains('pressed')) handleSlideEnd();
      if (jumpBtn.classList.contains('pressed')) handleJumpEnd();
    });
  }

  handleKeyDown(code) {
    if (this.state === 'cinematic') {
      if (code === 'Space' || code === 'Enter' || code === 'ArrowRight') {
        this.narration.nextScene();
      } else if (code === 'Escape') {
        this.narration.skipCinematic();
      }
      return;
    }

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

    if (this.state === 'cinematic') {
      this.narration.nextScene();
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

    // Update geophysical distance progress
    this.storage.updateDisasterProgress('geophysical', Math.floor(this.world.distance), true);

    const res = this.storage.recordRun({
      score: this.score,
      distance: this.world.distance,
      coins: this.coinsCollected,
      enemiesStomped: this.enemiesStomped,
      disastersSurvived: this.disastersSurvived
    });

    this.isNewHigh = res.isNewHigh;

    // When all 6 disasters are completed, automatically trigger Part 1 Conclusion
    if (this.storage.allDisastersCompleted() && !this.storage.data.story?.part1ConclusionWatched) {
      setTimeout(() => {
        if (this.state === 'gameover') {
          this.narration.startPart1Conclusion();
        }
      }, 1600);
    }
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

    this.updateMobileControlsVisibility();

    if (this.state === 'cinematic') {
      this.narration.update(dt);
      this.ui.update(dt);
      return;
    }

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
    } else if (this.state === 'gameover' || this.state === 'menu' || this.state === 'disasters') {
      this.particles.update(dt);
    }
  }

  updateMobileControlsVisibility() {
    const controls = document.getElementById('mobile-controls');
    if (!controls) return;
    const shouldShow = this.state === 'playing' && !this.isOrientationBlocked;
    if (controls.classList.contains('visible') !== shouldShow) {
      controls.classList.toggle('visible', shouldShow);
      controls.setAttribute('aria-hidden', (!shouldShow).toString());
    }
  }

  render() {
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.state === 'cinematic') {
      this.ctx.restore();
      this.ui.draw(this.ctx);
      return;
    }

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
