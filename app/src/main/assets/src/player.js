// OOPS! WORLD - Player Character (Bobo & Friends) Engine
window.OopsWorld = window.OopsWorld || {};

const PLAYER_STATES = {
  RUNNING: 'running',
  JUMPING: 'jumping',
  DOUBLE_JUMPING: 'double_jumping',
  SLIDING: 'sliding',
  FALLING: 'falling',
  HIT: 'hit',
  DEAD: 'dead'
};

class Player {
  constructor(game) {
    this.game = game;
    this.reset();
  }

  reset() {
    this.x = 120;
    this.y = 300;
    this.vx = 0;
    this.vy = 0;

    this.baseWidth = 42;
    this.baseHeight = 48;
    this.slideHeight = 26;
    this.slideWidth = 52;

    this.width = this.baseWidth;
    this.height = this.baseHeight;

    // Physics parameters
    this.gravity = 1400;
    this.jumpStrength = -580;
    this.doubleJumpStrength = -520;
    this.maxFallSpeed = 900;

    // Movement states
    this.state = PLAYER_STATES.RUNNING;
    this.isGrounded = false;
    this.canDoubleJump = true;
    this.hasDoubleJumped = false;

    // Timers
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.slideTimer = 0;
    this.maxSlideDuration = 0.55;
    this.invincibleTimer = 0;
    this.invincibleDuration = 1.6;

    // Health
    this.maxHealth = 3;
    this.health = 3;

    // Squash & Stretch
    this.scaleX = 1;
    this.scaleY = 1;
    this.rotation = 0;
    this.spinRotation = 0;
    this.runCycle = 0;

    // Active powerups
    const s = this.game.storage;
    this.powerups = {
      shield: false,
      shieldTimer: 0,
      shieldMax: s?.getPowerupDuration('shield') || 8,
      magnetTimer: 0,
      magnetMax: s?.getPowerupDuration('magnet') || 11,
      magnetRadius: 240,
      speedTimer: 0,
      speedMax: s?.getPowerupDuration('speed') || 6.5,
      doubleCoinsTimer: 0,
      doubleCoinsMax: s?.getPowerupDuration('double_coins') || 12,
      slowMoTimer: 0,
      slowMoMax: s?.getPowerupDuration('slow_mo') || 7
    };

    // Facial expressions
    const Utils = window.OopsWorld.Utils;
    this.blinkTimer = Utils.randFloat(2, 4);
    this.isBlinking = false;
    this.sweatTimer = 0;

    this.applyCharacterTraits(true);
  }

  applyCharacterTraits(isRunStart = false) {
    const charId = this.game.storage?.data?.selectedCharacter || 'bobo';
    this.characterId = charId;

    this.maxSlideDuration = 0.55;
    this.jumpStrength = -580;
    this.powerups.magnetRadius = 240;
    this.powerupDurationMultiplier = 1.0;

    if (charId === 'pip') {
      this.maxSlideDuration = 0.72;
    } else if (charId === 'kato') {
      this.jumpStrength = -640;
    } else if (charId === 'gloop') {
      this.powerups.magnetRadius = 320;
    } else if (charId === 'robo' && isRunStart) {
      const miniDur = Math.max(5, (this.game.storage?.getPowerupDuration('shield') || 8) * 0.65);
      this.powerups.shield = true;
      this.powerups.shieldTimer = miniDur;
      this.powerups.shieldMax = miniDur;
    } else if (charId === 'starlight') {
      this.powerupDurationMultiplier = 1.25;
    }
  }

  get hitbox() {
    if (this.state === PLAYER_STATES.SLIDING) {
      return {
        x: this.x - this.slideWidth * 0.45,
        y: this.y - this.slideHeight,
        width: this.slideWidth * 0.9,
        height: this.slideHeight
      };
    }
    return {
      x: this.x - this.width * 0.4,
      y: this.y - this.height,
      width: this.width * 0.8,
      height: this.height * 0.92
    };
  }

  jump() {
    this.jumpBufferTimer = 0.15;
  }

  executeJump() {
    if (this.isGrounded || this.coyoteTimer > 0) {
      this.vy = this.jumpStrength;
      this.isGrounded = false;
      this.coyoteTimer = 0;
      this.canDoubleJump = true;
      this.hasDoubleJumped = false;
      this.state = PLAYER_STATES.JUMPING;

      this.scaleX = 0.75;
      this.scaleY = 1.35;

      this.game.particles.dustPuff(this.x, this.y, 6);
      this.game.audio.playJump();
      return true;
    } else if (this.canDoubleJump && !this.hasDoubleJumped) {
      this.vy = this.doubleJumpStrength;
      this.canDoubleJump = false;
      this.hasDoubleJumped = true;
      this.state = PLAYER_STATES.DOUBLE_JUMPING;
      this.spinRotation = 0;

      this.game.particles.burst(this.x, this.y - 20, 10, {
        color: '#00F0FF',
        shape: 'star',
        minSpeed: 40,
        maxSpeed: 100,
        gravity: 60
      });
      this.game.audio.playDoubleJump();
      return true;
    }
    return false;
  }

  slide() {
    if (this.state === PLAYER_STATES.SLIDING) return;

    if (this.isGrounded) {
      this.state = PLAYER_STATES.SLIDING;
      this.slideTimer = this.maxSlideDuration;
      this.scaleX = 1.4;
      this.scaleY = 0.6;
      this.game.particles.dustPuff(this.x, this.y, 8);
      this.game.audio.playSlide();
    } else {
      this.vy = Math.max(this.vy, 450);
      this.slideTimer = this.maxSlideDuration;
    }
  }

  cancelSlide() {
    if (this.state === PLAYER_STATES.SLIDING) {
      this.state = this.isGrounded ? PLAYER_STATES.RUNNING : PLAYER_STATES.FALLING;
      this.slideTimer = 0;
      this.scaleX = 1;
      this.scaleY = 1;
    }
  }

  takeDamage(amount = 1) {
    if (this.game.debug?.shouldPreventDamage()) return false;
    if (this.invincibleTimer > 0) return false;

    if (this.powerups.speedTimer > 0) {
      return false;
    }

    if (this.powerups.shield) {
      this.powerups.shield = false;
      this.powerups.shieldTimer = 0;
      this.invincibleTimer = 1.0;
      this.game.camera.addTrauma(0.4);
      this.game.particles.burst(this.x, this.y - 25, 14, {
        color: '#00FFFF',
        shape: 'ring',
        minSpeed: 50,
        maxSpeed: 160
      });
      this.game.audio.playShieldBreak();
      this.triggerHaptic(80);
      return false;
    }

    this.health -= amount;
    this.invincibleTimer = this.invincibleDuration;
    this.sweatTimer = 1.2;

    this.scaleX = 1.3;
    this.scaleY = 0.7;
    this.vy = -280;

    this.game.camera.addTrauma(0.65);
    this.game.particles.burst(this.x, this.y - 25, 16, {
      color: '#FF3333',
      shape: 'circle',
      minSpeed: 60,
      maxSpeed: 200,
      gravity: 300
    });
    this.game.audio.playDamage();
    this.triggerHaptic(180);

    if (this.health <= 0) {
      this.health = 0;
      this.state = PLAYER_STATES.DEAD;
      this.game.onPlayerDied();
    }

    return true;
  }

  heal(amount = 1) {
    if (this.health < this.maxHealth) {
      this.health = Math.min(this.maxHealth, this.health + amount);
      this.game.particles.healHearts(this.x, this.y - 20);
      this.game.audio.playHeal();
      return true;
    }
    return false;
  }

  triggerHaptic(ms) {
    try {
      if (window.AndroidBridge && window.AndroidBridge.vibrate) {
        window.AndroidBridge.vibrate(ms);
      } else if (navigator.vibrate) {
        navigator.vibrate(ms);
      }
    } catch (e) {}
  }

  update(dt) {
    if (this.state === PLAYER_STATES.DEAD) return;

    const Utils = window.OopsWorld.Utils;

    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= dt;
    }
    if (this.sweatTimer > 0) {
      this.sweatTimer -= dt;
    }

    if (this.powerups.shield && this.powerups.shieldTimer > 0) {
      this.powerups.shieldTimer -= dt;
      if (this.powerups.shieldTimer <= 0) {
        this.powerups.shield = false;
        this.powerups.shieldTimer = 0;
      }
    }
    if (this.powerups.magnetTimer > 0) {
      this.powerups.magnetTimer -= dt;
      if (Math.random() < 0.25) {
        this.game.particles.spawn(this.x + Utils.randFloat(-20, 20), this.y - Utils.randFloat(10, 40), {
          color: '#FFD700',
          shape: 'circle',
          radius: 2,
          life: 0.3
        });
      }
    }
    if (this.powerups.speedTimer > 0) {
      this.powerups.speedTimer -= dt;
      this.game.particles.speedStreaks(this.x, this.y - 20);
    }
    if (this.powerups.doubleCoinsTimer > 0) {
      this.powerups.doubleCoinsTimer -= dt;
    }
    if (this.powerups.slowMoTimer > 0) {
      this.powerups.slowMoTimer -= dt;
    }

    if (this.game.debug?.shouldPreventDamage()) {
      this.health = this.maxHealth;
    }

    if (this.game.debug?.hasUnlimitedPowerups()) {
      this.powerups.shield = true;
      this.powerups.shieldTimer = Math.max(this.powerups.shieldTimer, this.powerups.shieldMax || 10);
      if (this.powerups.magnetTimer > 0) {
        this.powerups.magnetTimer = Math.max(this.powerups.magnetTimer, this.powerups.magnetMax || 12);
      }
      if (this.powerups.speedTimer > 0) {
        this.powerups.speedTimer = Math.max(this.powerups.speedTimer, this.powerups.speedMax || 8);
      }
      if (this.powerups.doubleCoinsTimer > 0) {
        this.powerups.doubleCoinsTimer = Math.max(this.powerups.doubleCoinsTimer, this.powerups.doubleCoinsMax || 12);
      }
      if (this.powerups.slowMoTimer > 0) {
        this.powerups.slowMoTimer = Math.max(this.powerups.slowMoTimer, this.powerups.slowMoMax || 8);
      }
    }

    this.blinkTimer -= dt;
    if (this.blinkTimer <= 0) {
      this.isBlinking = !this.isBlinking;
      this.blinkTimer = this.isBlinking ? 0.12 : Utils.randFloat(2.5, 5);
    }

    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= dt;
      if (this.executeJump()) {
        this.jumpBufferTimer = 0;
      }
    }

    if (!this.isGrounded && this.coyoteTimer > 0) {
      this.coyoteTimer -= dt;
    }

    if (this.state === PLAYER_STATES.SLIDING) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        this.cancelSlide();
      } else {
        if (this.isGrounded && Math.random() < 0.4) {
          this.game.particles.dustPuff(this.x - 12, this.y, 1);
        }
      }
    }

    this.vy = Math.min(this.maxFallSpeed, this.vy + this.gravity * dt);
    this.y += this.vy * dt;

    const groundInfo = this.game.world.getGroundAt(this.x);
    const groundY = groundInfo.y;
    const isGap = groundInfo.isGap;

    if (!isGap && this.y >= groundY) {
      if (!this.isGrounded && this.vy > 0) {
        const impact = Math.min(1.0, this.vy / 600);
        this.scaleX = 1 + impact * 0.35;
        this.scaleY = 1 - impact * 0.35;
        this.game.particles.dustPuff(this.x, groundY, Math.floor(4 + impact * 4));
      }

      this.y = groundY;
      this.vy = 0;
      this.isGrounded = true;
      this.canDoubleJump = true;
      this.hasDoubleJumped = false;

      if (this.state !== PLAYER_STATES.SLIDING) {
        this.state = PLAYER_STATES.RUNNING;
      }
    } else {
      if (this.isGrounded) {
        this.coyoteTimer = 0.12;
      }
      this.isGrounded = false;

      if (this.state === PLAYER_STATES.DOUBLE_JUMPING) {
        this.spinRotation += Math.PI * 4 * dt;
      } else if (this.state !== PLAYER_STATES.SLIDING) {
        this.state = this.vy < 0 ? PLAYER_STATES.JUMPING : PLAYER_STATES.FALLING;
      }
    }

    if (this.y > this.game.height + 60) {
      if (this.game.debug?.shouldPreventDamage()) {
        const safeGround = this.game.world.getGroundAt(this.x);
        const safeY = (!safeGround.isGap && safeGround.y) ? safeGround.y : this.game.world.groundY;
        this.y = Math.min(safeY, 320) - 90;
        this.vy = -420;
        this.isGrounded = false;
        this.canDoubleJump = true;
        this.hasDoubleJumped = false;
        this.invincibleTimer = Math.max(this.invincibleTimer, 1.2);
        this.state = PLAYER_STATES.JUMPING;
      } else {
        this.takeDamage(this.health);
      }
    }

    this.scaleX = Utils.lerp(this.scaleX, 1, 10 * dt);
    this.scaleY = Utils.lerp(this.scaleY, 1, 10 * dt);

    if (this.isGrounded && this.state === PLAYER_STATES.RUNNING) {
      this.runCycle += dt * 14;
    }
  }

  draw(ctx) {
    if (this.state === PLAYER_STATES.DEAD) return;

    if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer * 18) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(this.x, this.y);

    ctx.scale(this.scaleX, this.scaleY);
    if (this.state === PLAYER_STATES.DOUBLE_JUMPING) {
      ctx.rotate(this.spinRotation);
    }

    if (this.powerups.speedTimer > 0) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#00FFFF';
      ctx.beginPath();
      ctx.arc(-16, -22, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    this.drawCharacterBody(ctx);
    this.drawPowerupOverlays(ctx);

    ctx.restore();
  }

  drawCharacterBody(ctx) {
    const isSliding = this.state === PLAYER_STATES.SLIDING;
    const isJumping = this.state === PLAYER_STATES.JUMPING || this.state === PLAYER_STATES.DOUBLE_JUMPING;
    const isFalling = this.state === PLAYER_STATES.FALLING;

    const charId = this.characterId || 'bobo';

    if (charId === 'pip') {
      this.drawPip(ctx, isSliding, isJumping, isFalling);
    } else if (charId === 'kato') {
      this.drawKato(ctx, isSliding, isJumping, isFalling);
    } else if (charId === 'gloop') {
      this.drawGloop(ctx, isSliding, isJumping, isFalling);
    } else if (charId === 'robo') {
      this.drawRobo(ctx, isSliding, isJumping, isFalling);
    } else if (charId === 'starlight') {
      this.drawStarlight(ctx, isSliding, isJumping, isFalling);
    } else {
      this.drawBobo(ctx, isSliding, isJumping, isFalling);
    }
  }

  drawBobo(ctx, isSliding, isJumping, isFalling) {
    const bobY = isSliding ? 0 : Math.sin(this.runCycle) * 3;

    if (!isSliding) {
      ctx.fillStyle = '#0984E3';
      const legOffset1 = Math.sin(this.runCycle) * 8;
      const legOffset2 = -legOffset1;
      ctx.beginPath();
      ctx.ellipse(-8 + legOffset2, -3, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(8 + legOffset1, -3, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const bodyRadius = isSliding ? 17 : 22;
    const bodyCenterY = isSliding ? -14 : -24 + bobY;
    const bodyScaleX = isSliding ? 1.45 : 1;
    const bodyScaleY = isSliding ? 0.65 : 1;

    ctx.save();
    ctx.translate(0, bodyCenterY);
    ctx.scale(bodyScaleX, bodyScaleY);

    const grad = ctx.createRadialGradient(-5, -6, 4, 0, 0, bodyRadius);
    grad.addColorStop(0, '#55EFC4');
    grad.addColorStop(0.4, '#00CEC9');
    grad.addColorStop(1, '#0984E3');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, bodyRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#00587A';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    if (!isSliding) {
      ctx.save();
      ctx.rotate(Math.sin(this.runCycle * 1.5) * 0.15);
      ctx.beginPath();
      ctx.moveTo(0, -bodyRadius);
      ctx.quadraticCurveTo(6, -bodyRadius - 8, 4, -bodyRadius - 13);
      ctx.strokeStyle = '#00587A';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#FFEAA7';
      ctx.beginPath();
      ctx.arc(4, -bodyRadius - 13, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.fillStyle = 'rgba(255, 118, 117, 0.55)';
    ctx.beginPath();
    ctx.arc(-11, 4, 4.5, 0, Math.PI * 2);
    ctx.arc(11, 4, 4.5, 0, Math.PI * 2);
    ctx.fill();

    this.drawEyes(ctx, isSliding, isJumping, isFalling);

    ctx.fillStyle = '#2D3436';
    ctx.strokeStyle = '#2D3436';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (this.sweatTimer > 0 || isFalling) {
      ctx.ellipse(0, 8, 4, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FF7675';
      ctx.beginPath();
      ctx.ellipse(0, 10, 2.5, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (isSliding) {
      ctx.moveTo(-6, 7);
      ctx.quadraticCurveTo(0, 12, 6, 7);
      ctx.stroke();
    } else {
      ctx.arc(0, 5, 5, 0.15, Math.PI - 0.15);
      ctx.stroke();
    }

    ctx.restore();

    if (this.sweatTimer > 0) {
      ctx.fillStyle = '#74B9FF';
      ctx.beginPath();
      ctx.moveTo(18, -38);
      ctx.quadraticCurveTo(22, -32, 19, -28);
      ctx.arc(17, -28, 2.5, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
    }
  }

  drawPip(ctx, isSliding, isJumping, isFalling) {
    const bobY = isSliding ? 0 : Math.sin(this.runCycle) * 3;
    const bodyCenterY = isSliding ? -14 : -22 + bobY;

    ctx.save();
    ctx.translate(0, bodyCenterY);

    ctx.fillStyle = '#FF75A0';
    ctx.strokeStyle = '#D63031';
    ctx.lineWidth = 2;

    const earSway = Math.sin(this.runCycle) * 0.2;
    ctx.save();
    ctx.rotate(-0.25 + earSway);
    ctx.beginPath();
    ctx.ellipse(-8, -26, 5, 14, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FFD1DC';
    ctx.beginPath();
    ctx.ellipse(-8, -26, 2.5, 9, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.rotate(0.25 - earSway);
    ctx.fillStyle = '#FF75A0';
    ctx.beginPath();
    ctx.ellipse(8, -26, 5, 14, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FFD1DC';
    ctx.beginPath();
    ctx.ellipse(8, -26, 2.5, 9, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#FFAEC0';
    ctx.strokeStyle = '#D63031';
    ctx.beginPath();
    ctx.ellipse(0, 0, isSliding ? 25 : 19, isSliding ? 12 : 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    this.drawEyes(ctx, isSliding, isJumping, isFalling);

    ctx.fillStyle = '#E84393';
    ctx.beginPath();
    ctx.ellipse(0, 3, 2.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawKato(ctx, isSliding, isJumping, isFalling) {
    const bobY = isSliding ? 0 : Math.sin(this.runCycle) * 3;
    const bodyCenterY = isSliding ? -14 : -22 + bobY;

    ctx.save();
    ctx.translate(0, bodyCenterY);

    ctx.fillStyle = '#E67E22';
    ctx.strokeStyle = '#A04000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-16, -10);
    ctx.lineTo(-12, -26);
    ctx.lineTo(-4, -15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(16, -10);
    ctx.lineTo(12, -26);
    ctx.lineTo(4, -15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(-18, -14, 36, 6);

    ctx.beginPath();
    ctx.moveTo(-18, -12);
    ctx.lineTo(-28 + Math.sin(this.runCycle * 2) * 4, -14);
    ctx.lineTo(-18, -8);
    ctx.fill();

    ctx.fillStyle = '#F39C12';
    ctx.beginPath();
    ctx.ellipse(0, 0, isSliding ? 24 : 19, isSliding ? 12 : 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    this.drawEyes(ctx, isSliding, isJumping, isFalling);
    ctx.restore();
  }

  drawGloop(ctx, isSliding, isJumping, isFalling) {
    const wobble = Math.sin(this.runCycle * 1.5) * 4;
    const bodyCenterY = isSliding ? -14 : -22;

    ctx.save();
    ctx.translate(0, bodyCenterY);

    ctx.fillStyle = 'rgba(46, 213, 115, 0.88)';
    ctx.strokeStyle = '#10AC84';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.ellipse(0, 0, (isSliding ? 25 : 19) + wobble * 0.3, (isSliding ? 12 : 20) - wobble * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFF';
    [-8, 0, 8].forEach((xOff, idx) => {
      ctx.beginPath();
      ctx.arc(xOff, idx === 1 ? -4 : 0, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2F3542';
      ctx.beginPath();
      ctx.arc(xOff + 1, idx === 1 ? -4 : 0, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFF';
    });

    ctx.restore();
  }

  drawRobo(ctx, isSliding, isJumping, isFalling) {
    const bobY = isSliding ? 0 : Math.sin(this.runCycle) * 3;
    const bodyCenterY = isSliding ? -14 : -22 + bobY;

    ctx.save();
    ctx.translate(0, bodyCenterY);

    ctx.strokeStyle = '#747D8C';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(0, -28);
    ctx.stroke();
    ctx.fillStyle = Math.floor(Date.now() / 250) % 2 === 0 ? '#FF4757' : '#FFA502';
    ctx.beginPath();
    ctx.arc(0, -29, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#70A1FF';
    ctx.strokeStyle = '#2F3542';
    ctx.lineWidth = 2.5;
    ctx.fillRect(-17, -16, 34, isSliding ? 20 : 32);
    ctx.strokeRect(-17, -16, 34, isSliding ? 20 : 32);

    ctx.fillStyle = '#2ED573';
    ctx.fillRect(-12, -10, 24, 7);

    ctx.restore();
  }

  drawStarlight(ctx, isSliding, isJumping, isFalling) {
    const bobY = isSliding ? 0 : Math.sin(this.runCycle) * 3;
    const bodyCenterY = isSliding ? -14 : -22 + bobY;
    const capeWave = Math.sin(this.runCycle * 1.6) * 4;

    ctx.save();
    ctx.translate(0, bodyCenterY);

    // Flowing cosmic starlight cape
    ctx.fillStyle = '#FFEAA7';
    ctx.strokeStyle = '#E1B12C';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-10, -8);
    ctx.quadraticCurveTo(-24, -4 + capeWave, -28, 12 + capeWave * 0.6);
    ctx.lineTo(-10, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cosmic aura body
    const grad = ctx.createRadialGradient(-5, -6, 3, 0, 0, 21);
    grad.addColorStop(0, '#D980FA');
    grad.addColorStop(0.55, '#A55EEA');
    grad.addColorStop(1, '#5F27CD');
    ctx.fillStyle = grad;
    ctx.strokeStyle = '#2C0E5E';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, isSliding ? 25 : 19, isSliding ? 12 : 19, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Golden 4-point star crest on top
    if (!isSliding) {
      ctx.fillStyle = '#FFD700';
      ctx.strokeStyle = '#B8860B';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, -31);
      ctx.lineTo(3.5, -23);
      ctx.lineTo(10, -21);
      ctx.lineTo(3.5, -18.5);
      ctx.lineTo(0, -12);
      ctx.lineTo(-3.5, -18.5);
      ctx.lineTo(-10, -21);
      ctx.lineTo(-3.5, -23);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Chest starlight emblem
    ctx.fillStyle = '#FFEAA7';
    ctx.beginPath();
    ctx.arc(0, 10, 4, 0, Math.PI * 2);
    ctx.fill();

    this.drawEyes(ctx, isSliding, isJumping, isFalling);

    ctx.restore();
  }

  drawEyes(ctx, isSliding, isJumping, isFalling) {
    if (this.isBlinking) {
      ctx.strokeStyle = '#2D3436';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-11, -3);
      ctx.lineTo(-3, -3);
      ctx.moveTo(3, -3);
      ctx.lineTo(11, -3);
      ctx.stroke();
      return;
    }

    if (this.sweatTimer > 0) {
      ctx.strokeStyle = '#2D3436';
      ctx.lineWidth = 2;
      [-7, 7].forEach((x) => {
        ctx.beginPath();
        ctx.arc(x, -2, 5, 0, Math.PI * 1.6);
        ctx.stroke();
      });
      return;
    }

    const eyeSize = isFalling ? 6.5 : isSliding ? 4.5 : 5.5;
    const pupilLookY = isFalling ? 2 : isJumping ? -1.5 : 0;
    const pupilLookX = 1.2;

    [-7, 7].forEach((x) => {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x, -3, eyeSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2D3436';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#2D3436';
      ctx.beginPath();
      ctx.arc(x + pupilLookX, -3 + pupilLookY, eyeSize * 0.58, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x + pupilLookX - 1.2, -3 + pupilLookY - 1.2, eyeSize * 0.25, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  drawPowerupOverlays(ctx) {
    if (this.powerups.shield) {
      const shieldPulse = Math.sin(Date.now() / 140) * 2;
      const shieldRadius = 32 + shieldPulse;

      ctx.save();
      ctx.translate(0, -22);

      const grad = ctx.createRadialGradient(0, 0, shieldRadius * 0.5, 0, 0, shieldRadius);
      grad.addColorStop(0, 'rgba(0, 242, 254, 0.05)');
      grad.addColorStop(0.8, 'rgba(79, 172, 254, 0.35)');
      grad.addColorStop(1, 'rgba(0, 242, 254, 0.85)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#00F2FE';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
      ctx.stroke();

      const orbitA = (Date.now() / 350) % (Math.PI * 2);
      const sparkX = Math.cos(orbitA) * (shieldRadius - 3);
      const sparkY = Math.sin(orbitA) * (shieldRadius - 3);
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(sparkX, sparkY, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    if (this.powerups.magnetTimer > 0) {
      ctx.save();
      ctx.translate(0, -22);
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
      ctx.lineWidth = 2;
      const wave = (Date.now() / 200) % 20;
      ctx.beginPath();
      ctx.arc(0, 0, 28 + wave, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (this.powerups.doubleCoinsTimer > 0) {
      ctx.save();
      ctx.translate(14, -46 + Math.sin(Date.now() / 150) * 3);
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#B8860B';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#8B4513';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('2X', 0, 1);
      ctx.restore();
    }
  }
}

window.OopsWorld.PLAYER_STATES = PLAYER_STATES;
window.OopsWorld.Player = Player;
