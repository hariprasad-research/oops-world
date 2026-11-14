// OOPS! WORLD - Isolated Developer Debug Mode Engine
window.OopsWorld = window.OopsWorld || {};

class DebugManager {
  constructor(game) {
    this.game = game;
    this.active = false;
    this.isDayMode = false;
    this.dayBlend = 0;
    this.moonClickCount = 0;
    this.activationAnimTimer = 0;
    this.activationOrigin = { x: 0, y: 0 };
    this.selectedTestChapterId = 'geophysical';
    this.returnStateFromPanel = 'menu';
    this.debugCompletionBanner = false;
    this.lastCinematicFromDebug = false;

    this.flags = {
      unlimitedHealth: true,
      unlockAllChapters: true,
      unlimitedCoins: true,
      disableObstacles: false,
      unlimitedPowerups: true
    };
  }

  isBuildEnabled() {
    try {
      if (
        typeof window !== 'undefined' &&
        window.AndroidBridge &&
        typeof window.AndroidBridge.isDebugBuild === 'function'
      ) {
        return Boolean(window.AndroidBridge.isDebugBuild());
      }
      if (typeof window !== 'undefined' && typeof window.__OOPS_DEV_BUILD__ === 'boolean') {
        return window.__OOPS_DEV_BUILD__;
      }
      if (typeof window !== 'undefined' && window.location) {
        const host = window.location.hostname;
        return host === 'localhost' || host === '127.0.0.1';
      }
    } catch (_) {}
    return false;
  }

  shouldShowDebugUI() {
    return this.isBuildEnabled() && this.active;
  }

  shouldPreventDamage() {
    return this.shouldShowDebugUI() && Boolean(this.flags.unlimitedHealth);
  }

  canBypassChapterLocks() {
    return this.shouldShowDebugUI() && Boolean(this.flags.unlockAllChapters);
  }

  hasUnlimitedCoins() {
    return this.shouldShowDebugUI() && Boolean(this.flags.unlimitedCoins);
  }

  shouldDisableObstacles() {
    return this.shouldShowDebugUI() && Boolean(this.flags.disableObstacles);
  }

  hasUnlimitedPowerups() {
    return this.shouldShowDebugUI() && Boolean(this.flags.unlimitedPowerups);
  }

  resetMoonClickCount() {
    this.moonClickCount = 0;
  }

  handleMoonClick(moonX, moonY) {
    if (!this.isBuildEnabled()) return false;

    this.isDayMode = !this.isDayMode;

    if (!this.active) {
      this.moonClickCount += 1;
      if (this.moonClickCount >= 10) {
        this.moonClickCount = 0;
        this.activate(moonX, moonY);
        return { activated: true, isDayMode: this.isDayMode, clickCount: 10 };
      }
    }

    return {
      activated: false,
      isDayMode: this.isDayMode,
      clickCount: this.moonClickCount
    };
  }

  activate(originX = null, originY = null) {
    if (!this.isBuildEnabled()) return false;

    this.active = true;
    this.moonClickCount = 0;
    this.activationAnimTimer = 1.2;
    this.activationOrigin = {
      x: originX !== null ? originX : this.game.width * 0.9,
      y: originY !== null ? originY : this.game.height * 0.165
    };

    this.game.storage?.enterDebugMode({
      unlockAllChapters: this.flags.unlockAllChapters,
      unlimitedCoins: this.flags.unlimitedCoins
    });

    this.game.audio?.playDebugActivate?.();
    if (this.game.particles) {
      this.game.particles.burst(this.activationOrigin.x, this.activationOrigin.y, 24, {
        color: '#FFD700',
        shape: 'star',
        minSpeed: 80,
        maxSpeed: 240,
        gravity: 160
      });
    }
    this.game.hudToast?.('🛠️ DEVELOPER DEBUG MODE ACTIVATED', '#10AC84', 2.8);
    return true;
  }

  deactivate() {
    const wasActive = this.active;
    this.active = false;
    this.moonClickCount = 0;
    this.activationAnimTimer = 0;
    this.debugCompletionBanner = false;
    this.lastCinematicFromDebug = false;

    this.game.audio?.stopMusic?.();
    this.game.storage?.exitDebugMode?.();

    if (this.game.chapters) {
      this.game.chapters.activeChapter = null;
      this.game.chapters.hazards = [];
    }
    this.game.activeChapter = null;

    this.game.player?.applyCharacterTraits?.(false);
    if (this.game.world) {
      this.game.world.reset();
    }

    if (
      [
        'dev_panel',
        'playing',
        'paused',
        'chapter_intro',
        'chapter_rescue',
        'gameover',
        'cinematic'
      ].includes(this.game.state)
    ) {
      this.game.state = 'menu';
    }

    if (wasActive) {
      this.game.hudToast?.('🔒 DEBUG MODE EXITED — NORMAL SAVE RESTORED', '#4EA1E0', 2.4);
    }
    return true;
  }

  openPanel() {
    if (!this.shouldShowDebugUI()) return false;
    if (this.game.state !== 'dev_panel') {
      this.returnStateFromPanel = this.game.state === 'playing' ? 'paused' : this.game.state || 'menu';
    }
    this.game.state = 'dev_panel';
    return true;
  }

  closePanel() {
    if (this.game.state !== 'dev_panel') return false;
    const fallback = this.returnStateFromPanel || 'menu';
    this.game.state = fallback === 'dev_panel' ? 'menu' : fallback;
    return true;
  }

  toggleFlag(flagKey) {
    if (!this.shouldShowDebugUI()) return false;
    if (!Object.prototype.hasOwnProperty.call(this.flags, flagKey)) return false;

    this.flags[flagKey] = !this.flags[flagKey];

    if (flagKey === 'unlockAllChapters' || flagKey === 'unlimitedCoins') {
      this.game.storage?.setDebugOverrides({
        unlockAllChapters: this.flags.unlockAllChapters,
        unlimitedCoins: this.flags.unlimitedCoins
      });
    }

    if (flagKey === 'unlimitedHealth' && this.flags.unlimitedHealth && this.game.player) {
      this.game.player.health = this.game.player.maxHealth;
      if (this.game.player.state === 'dead') {
        this.game.player.state = 'running';
      }
    }

    if (flagKey === 'disableObstacles' && this.flags.disableObstacles) {
      this.clearRunHazards();
    }

    if (flagKey === 'unlimitedPowerups' && this.flags.unlimitedPowerups) {
      this.grantAllPowerups(false);
    }

    return this.flags[flagKey];
  }

  clearRunHazards() {
    if (this.game.obstacles) this.game.obstacles.obstacles = [];
    if (this.game.enemies) this.game.enemies.enemies = [];
    if (this.game.chapters) this.game.chapters.hazards = [];
    if (this.game.events) {
      this.game.events.entities = [];
      this.game.events.state = 'idle';
    }
  }

  grantAllPowerups(showMessage = true) {
    if (!this.shouldShowDebugUI() || !this.game.player) return false;
    const p = this.game.player;
    p.health = p.maxHealth;
    p.powerups.shield = true;
    p.powerups.shieldTimer = p.powerups.shieldMax || 10;
    p.powerups.magnetTimer = p.powerups.magnetMax || 12;
    p.powerups.speedTimer = p.powerups.speedMax || 8;
    p.powerups.doubleCoinsTimer = p.powerups.doubleCoinsMax || 12;
    p.powerups.slowMoTimer = p.powerups.slowMoMax || 8;
    if (showMessage) {
      this.game.hudToast?.('⚡ ALL POWER-UPS ACTIVE!', '#FFD700', 1.8);
    }
    return true;
  }

  selectTestChapter(chapterId) {
    const order = window.OopsWorld.CHAPTER_ORDER || [];
    if (!order.includes(chapterId)) return false;
    this.selectedTestChapterId = chapterId;
    return true;
  }

  jumpToChapterPhase(chapterId, phase) {
    if (!this.shouldShowDebugUI()) return false;
    const chapters = this.game.chapters;
    if (!chapters) return false;

    const targetId = chapterId || this.selectedTestChapterId || this.game.activeChapter?.id || 'geophysical';
    const meta = chapters.getCardMeta(targetId);
    if (!meta) return false;

    this.selectedTestChapterId = meta.id;
    this.debugCompletionBanner = phase === 'completion';
    this.game.activeChapter = meta;
    chapters.activeChapter = meta;

    if (phase === 'start' || phase === 'middle' || phase === 'end') {
      this.game.beginActiveChapterGameplay();
      this.clearRunHazards();

      if (phase === 'start') {
        this.game.world.distance = 0;
        this.game.hudToast?.(`⏮ CH.${meta.number} START (0m)`, meta.color, 2.0);
      } else if (phase === 'middle') {
        const midDist = Math.round(meta.targetDistance * 0.5);
        this.game.world.distance = midDist;
        if (meta.id === 'climatological') {
          chapters.climateMode = 'freeze';
          chapters.climateMix = 1;
          chapters.climateSwitchDist = midDist + 45;
          this.game.world.weather = 'snow';
        } else if (meta.id === 'hydrological') {
          chapters.waterRisingActive = true;
          chapters.waterRiseLevel = 46;
        } else if (meta.id === 'meteorological') {
          chapters.windForce = -1;
        } else if (meta.id === 'geophysical') {
          chapters.quakeActive = 1.6;
        }
        this.game.hudToast?.(`⏯ CH.${meta.number} MIDDLE (${midDist}m)`, meta.color, 2.0);
      } else if (phase === 'end') {
        const endDist = Math.max(0, meta.targetDistance - 15);
        this.game.world.distance = endDist;
        chapters.hazardTimer = 999; // Keep rescue lane clear
        this.game.hudToast?.(`⏭ CH.${meta.number} END (${endDist}m / ${meta.targetDistance}m)`, '#2ED573', 2.2);
      }

      if (this.flags.unlimitedPowerups) {
        this.grantAllPowerups(false);
      }
      return true;
    }

    if (phase === 'rescue' || phase === 'completion') {
      this.game.activeChapter = meta;
      chapters.reset(meta.id);
      this.game.world.reset();
      this.game.player.reset();
      this.clearRunHazards();
      this.game.world.distance = meta.targetDistance;
      chapters.completeRescue();
      chapters.rescueAnimTimer = phase === 'completion' ? 2.2 : 0;
      this.debugCompletionBanner = phase === 'completion';
      this.game.hudToast?.(
        phase === 'rescue'
          ? `🤝 RESCUE SEQUENCE — CH.${meta.number}`
          : `🏁 COMPLETION SEQUENCE — CH.${meta.number}`,
        '#2ED573',
        2.4
      );
      return true;
    }

    return false;
  }

  skipMissions() {
    if (!this.shouldShowDebugUI()) return false;
    this.game.storage?.markDebugMissionsCompleted(true);

    if (
      this.game.activeChapter &&
      ['playing', 'paused', 'chapter_intro'].includes(this.game.state)
    ) {
      this.game.world.distance = this.game.activeChapter.targetDistance;
      this.game.chapters.completeRescue();
    }
    this.game.hudToast?.('⏩ DEBUG MISSIONS SKIPPED (ALL UNLOCKED IN DEBUG SAVE)', '#FFA502', 2.4);
    return true;
  }

  startFinalTrialTest() {
    if (!this.shouldShowDebugUI()) return false;
    const trialMeta = this.game.chapters?.getFinalTrialMeta?.();
    if (!trialMeta) return false;

    this.debugCompletionBanner = false;
    this.game.activeChapter = trialMeta;
    this.game.beginActiveChapterGameplay();
    this.clearRunHazards();
    if (this.flags.unlimitedPowerups) {
      this.grantAllPowerups(false);
    }
    this.game.hudToast?.('⚔️ FINAL TRIAL DEBUG TEST STARTED!', '#FF4757', 2.4);
    return true;
  }

  startPart1EndingTest() {
    if (!this.shouldShowDebugUI() || !this.game.narration) return false;
    this.game.audio?.stopMusic?.();
    this.lastCinematicFromDebug = true;
    this.game.narration.startPart1Conclusion();
    this.game.hudToast?.('🎬 PART 1 ENDING TEST', '#A55EEA', 2.2);
    return true;
  }

  resetDebugProgress() {
    if (!this.shouldShowDebugUI()) return false;
    this.game.storage?.resetDebugProgress();
    this.game.storage?.setDebugOverrides({
      unlockAllChapters: this.flags.unlockAllChapters,
      unlimitedCoins: this.flags.unlimitedCoins
    });
    this.game.player?.applyCharacterTraits?.(true);
    this.game.hudToast?.('♻️ DEBUG PROGRESS RESET (NORMAL SAVE UNTOUCHED)', '#2ED573', 2.4);
    return true;
  }

  update(dt) {
    if (!this.isBuildEnabled()) {
      this.active = false;
      this.isDayMode = false;
      this.dayBlend = 0;
      this.moonClickCount = 0;
      this.activationAnimTimer = 0;
      return;
    }

    const targetBlend = this.isDayMode ? 1 : 0;
    this.dayBlend += (targetBlend - this.dayBlend) * Math.min(1, dt * 4.5);
    if (Math.abs(targetBlend - this.dayBlend) < 0.005) {
      this.dayBlend = targetBlend;
    }

    if (this.activationAnimTimer > 0) {
      this.activationAnimTimer = Math.max(0, this.activationAnimTimer - dt);
    }
  }
}

window.OopsWorld.DebugManager = DebugManager;
