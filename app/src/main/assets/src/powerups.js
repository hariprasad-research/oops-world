// OOPS! WORLD - Collectibles & Power-ups Engine
window.OopsWorld = window.OopsWorld || {};

const ITEM_TYPES = {
  COIN: 'coin',
  GEM: 'gem',
  SHIELD: 'shield',
  MAGNET: 'magnet',
  SPEED: 'speed',
  DOUBLE_COINS: 'double_coins',
  HEALTH: 'health',
  SLOW_MO: 'slow_mo'
};

class Collectible {
  constructor(game, type, x, y) {
    this.game = game;
    this.type = type;
    this.x = x;
    this.y = y;
    this.active = true;
    this.animTime = Math.random() * 10;
    this.radius = 14;

    if (this.type === ITEM_TYPES.COIN) {
      this.radius = 11;
    } else if (this.type === ITEM_TYPES.GEM) {
      this.radius = 13;
    } else {
      this.radius = 16;
    }
  }

  get hitbox() {
    return {
      x: this.x,
      y: this.y,
      radius: this.radius
    };
  }

  update(dt, worldSpeed) {
    const Utils = window.OopsWorld.Utils;
    this.animTime += dt;

    const player = this.game.player;
    if (player.powerups.magnetTimer > 0 && (this.type === ITEM_TYPES.COIN || this.type === ITEM_TYPES.GEM)) {
      const d = Utils.dist(this.x, this.y, player.x, player.y - 20);
      if (d < player.powerups.magnetRadius) {
        const pullSpeed = 560 * (1 - d / player.powerups.magnetRadius) + 240;
        const angle = Math.atan2(player.y - 20 - this.y, player.x - this.x);
        this.x += Math.cos(angle) * pullSpeed * dt;
        this.y += Math.sin(angle) * pullSpeed * dt;
      } else {
        this.x -= worldSpeed * dt;
      }
    } else {
      this.x -= worldSpeed * dt;
    }

    this.checkCollision(player);

    if (this.x < -60) {
      this.active = false;
    }
  }

  checkCollision(player) {
    if (!this.active) return;
    const Utils = window.OopsWorld.Utils;

    if (Utils.circleRectIntersect(this.hitbox, player.hitbox)) {
      this.collect(player);
    }
  }

  collect(player) {
    this.active = false;

    switch (this.type) {
      case ITEM_TYPES.COIN: {
        const multiplier = player.powerups.doubleCoinsTimer > 0 ? 2 : 1;
        this.game.coinsCollected += 1 * multiplier;
        this.game.score += 25 * multiplier;
        this.game.particles.coinSparkle(this.x, this.y);
        this.game.audio.playCoin();
        break;
      }
      case ITEM_TYPES.GEM: {
        const multiplier = player.powerups.doubleCoinsTimer > 0 ? 2 : 1;
        this.game.coinsCollected += 5 * multiplier;
        this.game.score += 150 * multiplier;
        this.game.particles.burst(this.x, this.y, 14, {
          color: '#FF3366',
          shape: 'star',
          minSpeed: 60,
          maxSpeed: 160
        });
        this.game.audio.playGem();
        break;
      }
      case ITEM_TYPES.SHIELD:
        player.powerups.shield = true;
        this.game.particles.burst(this.x, this.y, 16, {
          color: '#00F0FF',
          shape: 'ring',
          minSpeed: 40,
          maxSpeed: 160
        });
        this.game.audio.playPowerup();
        this.game.hudToast('SHIELD ACTIVATED! 🛡️', '#00F0FF');
        break;
      case ITEM_TYPES.MAGNET:
        player.powerups.magnetTimer = 11;
        this.game.particles.burst(this.x, this.y, 14, {
          color: '#FFD700',
          shape: 'circle',
          minSpeed: 50,
          maxSpeed: 140
        });
        this.game.audio.playPowerup();
        this.game.hudToast('COIN MAGNET! 🧲', '#FFD700');
        break;
      case ITEM_TYPES.SPEED:
        player.powerups.speedTimer = 6.5;
        this.game.particles.burst(this.x, this.y, 20, {
          color: '#FF4757',
          shape: 'star',
          minSpeed: 80,
          maxSpeed: 240
        });
        this.game.audio.playSpeedBoost();
        this.game.hudToast('HYPER SPEED BOOST! ⚡', '#FF4757');
        break;
      case ITEM_TYPES.DOUBLE_COINS:
        player.powerups.doubleCoinsTimer = 12;
        this.game.particles.burst(this.x, this.y, 14, {
          color: '#FFA502',
          shape: 'star',
          minSpeed: 50,
          maxSpeed: 150
        });
        this.game.audio.playPowerup();
        this.game.hudToast('DOUBLE COINS (2X)! 🪙', '#FFA502');
        break;
      case ITEM_TYPES.HEALTH:
        if (player.heal(1)) {
          this.game.hudToast('+1 HEALTH RESTORED! ❤️', '#FF4757');
        } else {
          this.game.score += 200;
          this.game.hudToast('MAX HEALTH BONUS! ⭐', '#FFD700');
        }
        break;
      case ITEM_TYPES.SLOW_MO:
        player.powerups.slowMoTimer = 7;
        this.game.particles.burst(this.x, this.y, 14, {
          color: '#70A1FF',
          shape: 'circle',
          minSpeed: 40,
          maxSpeed: 130
        });
        this.game.audio.playPowerup();
        this.game.hudToast('SLOW MOTION! ⏱️', '#70A1FF');
        break;
    }
  }

  draw(ctx) {
    if (!this.active) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    switch (this.type) {
      case ITEM_TYPES.COIN:
        this.drawCoin(ctx);
        break;
      case ITEM_TYPES.GEM:
        this.drawGem(ctx);
        break;
      case ITEM_TYPES.SHIELD:
        this.drawShield(ctx);
        break;
      case ITEM_TYPES.MAGNET:
        this.drawMagnet(ctx);
        break;
      case ITEM_TYPES.SPEED:
        this.drawSpeed(ctx);
        break;
      case ITEM_TYPES.DOUBLE_COINS:
        this.drawDoubleCoins(ctx);
        break;
      case ITEM_TYPES.HEALTH:
        this.drawHealth(ctx);
        break;
      case ITEM_TYPES.SLOW_MO:
        this.drawSlowMo(ctx);
        break;
    }

    ctx.restore();
  }

  drawCoin(ctx) {
    const spin = Math.sin(this.animTime * 6);
    const w = Math.max(2, Math.abs(spin) * 11);

    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 1.8;

    ctx.beginPath();
    ctx.ellipse(0, 0, w, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (w > 5) {
      ctx.strokeStyle = '#FFF380';
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.6, 6.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  drawGem(ctx) {
    const floatY = Math.sin(this.animTime * 4) * 3;
    ctx.translate(0, floatY);

    ctx.fillStyle = '#FF3838';
    ctx.strokeStyle = '#C23616';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(12, -3);
    ctx.lineTo(0, 12);
    ctx.lineTo(-12, -3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(6, -3);
    ctx.lineTo(0, 4);
    ctx.lineTo(-6, -3);
    ctx.closePath();
    ctx.fill();
  }

  drawShield(ctx) {
    const pulse = Math.sin(this.animTime * 4) * 2;
    ctx.fillStyle = 'rgba(0, 210, 255, 0.3)';
    ctx.strokeStyle = '#00D2FF';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.arc(0, 0, 16 + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(-6, -8);
    ctx.lineTo(6, -8);
    ctx.lineTo(6, 0);
    ctx.quadraticCurveTo(0, 9, 0, 9);
    ctx.quadraticCurveTo(-6, 0, -6, 0);
    ctx.closePath();
    ctx.fill();
  }

  drawMagnet(ctx) {
    const floatY = Math.sin(this.animTime * 4) * 3;
    ctx.translate(0, floatY);

    ctx.lineWidth = 6;
    ctx.strokeStyle = '#E74C3C';
    ctx.beginPath();
    ctx.arc(0, -2, 10, 0, Math.PI);
    ctx.lineTo(-10, -10);
    ctx.moveTo(10, -2);
    ctx.lineTo(10, -10);
    ctx.stroke();

    ctx.strokeStyle = '#BDC3C7';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-10, -10);
    ctx.lineTo(-10, -15);
    ctx.moveTo(10, -10);
    ctx.lineTo(10, -15);
    ctx.stroke();
  }

  drawSpeed(ctx) {
    const floatY = Math.sin(this.animTime * 5) * 3;
    ctx.translate(0, floatY);

    ctx.fillStyle = '#FFA502';
    ctx.strokeStyle = '#FF4757';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(3, -13);
    ctx.lineTo(-8, 0);
    ctx.lineTo(-1, 0);
    ctx.lineTo(-4, 13);
    ctx.lineTo(8, -1);
    ctx.lineTo(1, -1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  drawDoubleCoins(ctx) {
    const floatY = Math.sin(this.animTime * 4) * 3;
    ctx.translate(0, floatY);

    ctx.fillStyle = '#FF9F1A';
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('2X', 0, 1);
  }

  drawHealth(ctx) {
    const beat = 1 + Math.sin(this.animTime * 6) * 0.15;
    ctx.scale(beat, beat);

    ctx.fillStyle = '#FF4757';
    ctx.strokeStyle = '#C23616';
    ctx.lineWidth = 2;

    const s = 4;
    ctx.beginPath();
    ctx.moveTo(0, s);
    ctx.bezierCurveTo(-s * 2.5, -s, -s * 2.5, -s * 3.5, 0, -s * 4.5);
    ctx.bezierCurveTo(s * 2.5, -s * 3.5, s * 2.5, -s, 0, s);
    ctx.fill();
    ctx.stroke();
  }

  drawSlowMo(ctx) {
    const floatY = Math.sin(this.animTime * 4) * 3;
    ctx.translate(0, floatY);

    ctx.fillStyle = '#70A1FF';
    ctx.strokeStyle = '#2F3542';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -7);
    ctx.moveTo(0, 0);
    ctx.lineTo(5, 2);
    ctx.stroke();
  }
}

class PowerupManager {
  constructor(game) {
    this.game = game;
    this.items = [];
    this.coinSpawnTimer = 0.8;
    this.powerupSpawnTimer = 14;
  }

  reset() {
    this.items = [];
    this.coinSpawnTimer = 0.8;
    this.powerupSpawnTimer = 12;
  }

  update(dt, worldSpeed) {
    const Utils = window.OopsWorld.Utils;

    this.coinSpawnTimer -= dt;
    if (this.coinSpawnTimer <= 0) {
      this.spawnCoinPattern();
      this.coinSpawnTimer = Utils.randFloat(1.2, 2.5);
    }

    this.powerupSpawnTimer -= dt;
    if (this.powerupSpawnTimer <= 0) {
      this.spawnRandomPowerup();
      this.powerupSpawnTimer = Utils.randFloat(16, 26);
    }

    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      item.update(dt, worldSpeed);
      if (!item.active) {
        this.items.splice(i, 1);
      }
    }
  }

  spawnCoinPattern() {
    const Utils = window.OopsWorld.Utils;
    const startX = this.game.width + Utils.randFloat(30, 80);
    const ground = this.game.world.getGroundAt(startX);
    if (ground.isGap) return;

    const patternType = Utils.randChoice(['line', 'arc', 'gem']);

    if (patternType === 'line') {
      const count = Utils.randInt(4, 6);
      for (let i = 0; i < count; i++) {
        this.items.push(new Collectible(this.game, ITEM_TYPES.COIN, startX + i * 28, ground.y - 25));
      }
    } else if (patternType === 'arc') {
      const count = 5;
      for (let i = 0; i < count; i++) {
        const t = (i / (count - 1)) * 2 - 1;
        const arcY = ground.y - 25 - (1 - t * t) * 75;
        this.items.push(new Collectible(this.game, ITEM_TYPES.COIN, startX + i * 30, arcY));
      }
    } else if (patternType === 'gem') {
      this.items.push(new Collectible(this.game, ITEM_TYPES.GEM, startX, ground.y - 35));
    }
  }

  spawnRandomPowerup() {
    const Utils = window.OopsWorld.Utils;
    const startX = this.game.width + 60;
    const ground = this.game.world.getGroundAt(startX);
    if (ground.isGap) return;

    const pool = [
      ITEM_TYPES.SHIELD,
      ITEM_TYPES.MAGNET,
      ITEM_TYPES.SPEED,
      ITEM_TYPES.DOUBLE_COINS,
      ITEM_TYPES.SLOW_MO
    ];

    if (this.game.player.health < this.game.player.maxHealth) {
      pool.push(ITEM_TYPES.HEALTH, ITEM_TYPES.HEALTH);
    }

    const type = Utils.randChoice(pool);
    this.items.push(new Collectible(this.game, type, startX, ground.y - 45));
  }

  draw(ctx) {
    for (let i = 0; i < this.items.length; i++) {
      this.items[i].draw(ctx);
    }
  }
}

window.OopsWorld.ITEM_TYPES = ITEM_TYPES;
window.OopsWorld.Collectible = Collectible;
window.OopsWorld.PowerupManager = PowerupManager;
