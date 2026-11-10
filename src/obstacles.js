// OOPS! WORLD - Obstacles & Traps Engine
window.OopsWorld = window.OopsWorld || {};

const OBSTACLE_TYPES = {
  ROCK: 'rock',
  SPIKES: 'spikes',
  LOW_BARRIER: 'low_barrier',
  ROLLING_LOG: 'rolling_log',
  FALLING_ROCK: 'falling_rock',
  BOUNCING_MINE: 'bouncing_mine',
  SPRING_PAD: 'spring_pad'
};

class Obstacle {
  constructor(game, type, x, y, config = {}) {
    this.game = game;
    this.type = type;
    this.x = x;
    this.y = y;
    this.config = config;
    this.active = true;

    this.width = 32;
    this.height = 32;
    this.rotation = 0;
    this.state = 'idle';

    this.initType();
  }

  initType() {
    const Utils = window.OopsWorld.Utils;

    switch (this.type) {
      case OBSTACLE_TYPES.ROCK:
        this.width = 36;
        this.height = 28;
        break;
      case OBSTACLE_TYPES.SPIKES:
        this.width = 44;
        this.height = 24;
        break;
      case OBSTACLE_TYPES.LOW_BARRIER:
        this.width = 46;
        this.height = 70;
        this.clearanceY = 32;
        break;
      case OBSTACLE_TYPES.ROLLING_LOG:
        this.width = 34;
        this.height = 34;
        this.radius = 17;
        this.rollSpeed = Utils.randFloat(80, 140);
        break;
      case OBSTACLE_TYPES.FALLING_ROCK:
        this.width = 32;
        this.height = 32;
        this.targetY = this.y;
        this.y = this.y - 200;
        this.vy = 0;
        this.fallTriggerDist = 280;
        this.isTriggered = false;
        break;
      case OBSTACLE_TYPES.BOUNCING_MINE:
        this.width = 28;
        this.height = 28;
        this.radius = 14;
        this.baseY = this.y - 45;
        this.bobTime = Math.random() * Math.PI * 2;
        break;
      case OBSTACLE_TYPES.SPRING_PAD:
        this.width = 38;
        this.height = 14;
        this.isCompressed = false;
        break;
    }
  }

  get hitbox() {
    if (this.type === OBSTACLE_TYPES.LOW_BARRIER) {
      return {
        x: this.x - this.width / 2,
        y: this.y - this.height,
        width: this.width,
        height: this.height - this.clearanceY
      };
    } else if (this.type === OBSTACLE_TYPES.ROLLING_LOG || this.type === OBSTACLE_TYPES.BOUNCING_MINE) {
      return {
        x: this.x,
        y: this.y - this.radius,
        radius: this.radius
      };
    }
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height,
      width: this.width,
      height: this.height
    };
  }

  update(dt, worldSpeed) {
    this.x -= worldSpeed * dt;

    if (this.type === OBSTACLE_TYPES.ROLLING_LOG) {
      this.x -= this.rollSpeed * dt;
      this.rotation -= 6 * dt;
    } else if (this.type === OBSTACLE_TYPES.BOUNCING_MINE) {
      this.bobTime += dt * 3;
      this.y = this.baseY + Math.sin(this.bobTime) * 35;
    } else if (this.type === OBSTACLE_TYPES.FALLING_ROCK) {
      const distToPlayer = this.x - this.game.player.x;
      if (!this.isTriggered && distToPlayer < this.fallTriggerDist && distToPlayer > -20) {
        this.isTriggered = true;
        this.game.particles.dustPuff(this.x, this.targetY, 4);
      }
      if (this.isTriggered && this.y < this.targetY) {
        this.vy += 1200 * dt;
        this.y += this.vy * dt;
        if (this.y >= this.targetY) {
          this.y = this.targetY;
          this.game.camera.addTrauma(0.25);
          this.game.particles.burst(this.x, this.y, 8, {
            color: '#7F8C8D',
            shape: 'circle',
            minSpeed: 40,
            maxSpeed: 120
          });
        }
      }
    }

    if (this.x < -80) {
      this.active = false;
    }
  }

  checkCollision(player) {
    if (!this.active) return false;
    const Utils = window.OopsWorld.Utils;

    if (this.type === OBSTACLE_TYPES.SPRING_PAD) {
      const padBox = {
        x: this.x - this.width / 2,
        y: this.y - this.height,
        width: this.width,
        height: this.height + 6
      };
      if (Utils.rectIntersect(player.hitbox, padBox) && player.vy >= 0) {
        player.vy = -750;
        player.isGrounded = false;
        player.canDoubleJump = true;
        player.hasDoubleJumped = false;
        player.scaleX = 0.65;
        player.scaleY = 1.45;
        this.isCompressed = true;
        setTimeout(() => (this.isCompressed = false), 200);

        this.game.particles.burst(this.x, this.y - 10, 10, {
          color: '#2ECC71',
          shape: 'star',
          minSpeed: 50,
          maxSpeed: 140
        });
        this.game.audio.playJump();
        return false;
      }
      return false;
    }

    if (player.powerups.speedTimer > 0) {
      let isHit = false;
      if (this.radius) {
        isHit = Utils.circleRectIntersect(this.hitbox, player.hitbox);
      } else {
        isHit = Utils.rectIntersect(this.hitbox, player.hitbox);
      }

      if (isHit) {
        this.active = false;
        this.game.camera.addTrauma(0.3);
        this.game.particles.explosion(this.x, this.y - 15);
        this.game.audio.playStomp();
        return false;
      }
      return false;
    }

    let collided = false;
    if (this.radius) {
      collided = Utils.circleRectIntersect(this.hitbox, player.hitbox);
    } else {
      collided = Utils.rectIntersect(this.hitbox, player.hitbox);
    }

    if (collided) {
      player.takeDamage(1);
    }
    return collided;
  }

  draw(ctx) {
    if (!this.active) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    switch (this.type) {
      case OBSTACLE_TYPES.ROCK:
        this.drawRock(ctx);
        break;
      case OBSTACLE_TYPES.SPIKES:
        this.drawSpikes(ctx);
        break;
      case OBSTACLE_TYPES.LOW_BARRIER:
        this.drawLowBarrier(ctx);
        break;
      case OBSTACLE_TYPES.ROLLING_LOG:
        this.drawRollingLog(ctx);
        break;
      case OBSTACLE_TYPES.FALLING_ROCK:
        this.drawFallingRock(ctx);
        break;
      case OBSTACLE_TYPES.BOUNCING_MINE:
        this.drawBouncingMine(ctx);
        break;
      case OBSTACLE_TYPES.SPRING_PAD:
        this.drawSpringPad(ctx);
        break;
    }

    ctx.restore();
  }

  drawRock(ctx) {
    ctx.fillStyle = '#7F8C8D';
    ctx.strokeStyle = '#2C3E50';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(-14, -20);
    ctx.lineTo(-4, -28);
    ctx.lineTo(12, -24);
    ctx.lineTo(18, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#BDC3C7';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-6, -18);
    ctx.lineTo(2, -12);
    ctx.stroke();
  }

  drawSpikes(ctx) {
    ctx.fillStyle = '#E74C3C';
    ctx.strokeStyle = '#962D22';
    ctx.lineWidth = 2;

    const spikeWidth = 14;
    [-15, 0, 15].forEach((sx) => {
      ctx.beginPath();
      ctx.moveTo(sx - spikeWidth / 2, 0);
      ctx.lineTo(sx, -24);
      ctx.lineTo(sx + spikeWidth / 2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(sx, -22);
      ctx.lineTo(sx + 2, -12);
      ctx.lineTo(sx, -10);
      ctx.fill();
      ctx.fillStyle = '#E74C3C';
    });
  }

  drawLowBarrier(ctx) {
    ctx.strokeStyle = '#57606F';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -this.height);
    ctx.lineTo(0, -this.clearanceY - 14);
    ctx.stroke();

    const boxY = -this.height;
    const boxH = this.height - this.clearanceY;
    ctx.fillStyle = '#FF4757';
    ctx.fillRect(-this.width / 2, boxY, this.width, boxH);
    ctx.strokeStyle = '#1E272E';
    ctx.lineWidth = 2;
    ctx.strokeRect(-this.width / 2, boxY, this.width, boxH);

    ctx.fillStyle = '#FFA502';
    for (let i = -16; i < 16; i += 8) {
      ctx.beginPath();
      ctx.moveTo(i, boxY);
      ctx.lineTo(i + 5, boxY + boxH);
      ctx.lineTo(i + 8, boxY + boxH);
      ctx.lineTo(i + 3, boxY);
      ctx.fill();
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SLIDE ⬇', 0, -this.clearanceY / 2);
  }

  drawRollingLog(ctx) {
    ctx.save();
    ctx.rotate(this.rotation);

    ctx.fillStyle = '#8B5A2B';
    ctx.strokeStyle = '#4A2F13';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, -this.radius, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#613E1B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -this.radius, this.radius * 0.55, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -this.radius * 2);
    ctx.lineTo(0, 0);
    ctx.stroke();

    ctx.restore();
  }

  drawFallingRock(ctx) {
    if (this.y < this.targetY - 10) {
      const progress = Math.max(0, 1 - (this.targetY - this.y) / 200);
      ctx.save();
      ctx.fillStyle = `rgba(235, 77, 75, ${0.2 + progress * 0.6})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, 16 * progress + 4, 6 * progress + 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FF4757';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', 0, -14);
      ctx.restore();
    }

    ctx.save();
    ctx.translate(0, this.y - this.targetY);
    ctx.fillStyle = '#57606F';
    ctx.strokeStyle = '#2F3542';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -16, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  drawBouncingMine(ctx) {
    ctx.fillStyle = '#2C3E50';
    ctx.strokeStyle = '#E74C3C';
    ctx.lineWidth = 2.5;

    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 10, Math.sin(a) * 10);
      ctx.lineTo(Math.cos(a) * 19, Math.sin(a) * 19);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    const pulse = Math.floor(Date.now() / 200) % 2 === 0;
    ctx.fillStyle = pulse ? '#FF4757' : '#FFA502';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawSpringPad(ctx) {
    ctx.fillStyle = '#747D8C';
    ctx.fillRect(-this.width / 2, -4, this.width, 4);

    ctx.strokeStyle = '#FFA502';
    ctx.lineWidth = 3;
    const h = this.isCompressed ? 5 : 12;
    ctx.beginPath();
    ctx.moveTo(-10, -4);
    ctx.lineTo(10, -4 - h / 2);
    ctx.lineTo(-10, -4 - h);
    ctx.lineTo(10, -4 - h);
    ctx.stroke();

    ctx.fillStyle = '#2ED573';
    ctx.strokeStyle = '#10AC84';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, -4 - h, this.width / 2 - 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

class ObstacleManager {
  constructor(game) {
    this.game = game;
    this.obstacles = [];
    this.spawnTimer = 2.0;
    this.minSpacingDist = 260;
    this.lastSpawnX = 0;
  }

  reset() {
    this.obstacles = [];
    this.spawnTimer = 2.5;
    this.lastSpawnX = 0;
  }

  update(dt, worldSpeed) {
    const Utils = window.OopsWorld.Utils;
    this.spawnTimer -= dt;

    if (this.spawnTimer <= 0) {
      this.trySpawnObstacle();
      const dist = this.game.world.distance;
      const minInterval = Math.max(0.9, 2.2 - dist * 0.002);
      const maxInterval = Math.max(1.6, 3.4 - dist * 0.003);
      this.spawnTimer = Utils.randFloat(minInterval, maxInterval);
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.update(dt, worldSpeed);
      obs.checkCollision(this.game.player);

      if (!obs.active) {
        this.obstacles.splice(i, 1);
      }
    }
  }

  trySpawnObstacle() {
    const Utils = window.OopsWorld.Utils;
    const spawnX = this.game.width + Utils.randFloat(40, 100);
    const groundInfo = this.game.world.getGroundAt(spawnX);

    if (groundInfo.isGap) return;

    const dist = this.game.world.distance;
    const pool = [OBSTACLE_TYPES.ROCK, OBSTACLE_TYPES.SPIKES, OBSTACLE_TYPES.SPRING_PAD];

    if (dist > 30) pool.push(OBSTACLE_TYPES.LOW_BARRIER);
    if (dist > 60) pool.push(OBSTACLE_TYPES.ROLLING_LOG);
    if (dist > 100) pool.push(OBSTACLE_TYPES.FALLING_ROCK);
    if (dist > 140) pool.push(OBSTACLE_TYPES.BOUNCING_MINE);

    const type = Utils.randChoice(pool);
    const obs = new Obstacle(this.game, type, spawnX, groundInfo.y);
    this.obstacles.push(obs);
  }

  draw(ctx) {
    for (let i = 0; i < this.obstacles.length; i++) {
      this.obstacles[i].draw(ctx);
    }
  }
}

window.OopsWorld.OBSTACLE_TYPES = OBSTACLE_TYPES;
window.OopsWorld.Obstacle = Obstacle;
window.OopsWorld.ObstacleManager = ObstacleManager;
