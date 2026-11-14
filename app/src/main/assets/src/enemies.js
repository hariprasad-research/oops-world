// OOPS! WORLD - Original Cartoon Enemies Engine
window.OopsWorld = window.OopsWorld || {};

const ENEMY_TYPES = {
  SHROOM: 'shroom',
  BATTY: 'batty',
  GOLEM: 'golem',
  PUFFER: 'puffer'
};

class Enemy {
  constructor(game, type, x, y) {
    this.game = game;
    this.type = type;
    this.x = x;
    this.y = y;
    this.active = true;
    this.animTime = Math.random() * 10;
    this.isSquashed = false;
    this.squashTimer = 0;

    this.initType();
  }

  initType() {
    const Utils = window.OopsWorld.Utils;

    switch (this.type) {
      case ENEMY_TYPES.SHROOM:
        this.width = 34;
        this.height = 36;
        this.vx = -Utils.randFloat(70, 110);
        this.vy = 0;
        break;
      case ENEMY_TYPES.BATTY:
        this.width = 38;
        this.height = 28;
        this.vx = -Utils.randFloat(130, 190);
        this.baseY = this.y - Utils.randFloat(70, 120);
        this.y = this.baseY;
        this.waveFreq = Utils.randFloat(3, 5);
        this.waveAmp = Utils.randFloat(30, 50);
        break;
      case ENEMY_TYPES.GOLEM:
        this.width = 44;
        this.height = 42;
        this.vx = -Utils.randFloat(120, 170);
        this.vy = 0;
        break;
      case ENEMY_TYPES.PUFFER:
        this.width = 36;
        this.height = 36;
        this.radius = 18;
        this.vx = -Utils.randFloat(50, 90);
        this.baseY = this.y - 65;
        this.y = this.baseY;
        break;
    }
  }

  get hitbox() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height,
      width: this.width,
      height: this.height
    };
  }

  update(dt, worldSpeed) {
    this.animTime += dt;

    if (this.isSquashed) {
      this.squashTimer -= dt;
      this.x -= worldSpeed * dt;
      if (this.squashTimer <= 0) {
        this.active = false;
      }
      return;
    }

    this.x += (this.vx - worldSpeed) * dt;

    if (this.type === ENEMY_TYPES.BATTY) {
      this.y = this.baseY + Math.sin(this.animTime * this.waveFreq) * this.waveAmp;
    } else if (this.type === ENEMY_TYPES.PUFFER) {
      this.y = this.baseY + Math.sin(this.animTime * 2.5) * 15;
    }

    if (this.x < -80) {
      this.active = false;
    }
  }

  checkCollision(player) {
    if (!this.active || this.isSquashed) return false;
    const Utils = window.OopsWorld.Utils;

    const box = this.hitbox;
    const pBox = player.hitbox;

    if (!Utils.rectIntersect(box, pBox)) return false;

    if (player.powerups.speedTimer > 0) {
      this.squash(true);
      return false;
    }

    const playerFeet = player.y;
    const enemyTop = this.y - this.height * 0.7;

    if (player.vy > 0 && playerFeet <= enemyTop + 24) {
      this.squash(false);
      player.vy = -540;
      player.canDoubleJump = true;
      player.hasDoubleJumped = false;
      player.scaleX = 0.75;
      player.scaleY = 1.35;

      this.game.score += 150;
      this.game.enemiesStomped += 1;
      this.game.particles.burst(this.x, this.y - this.height / 2, 14, {
        color: '#FFD700',
        shape: 'star',
        minSpeed: 60,
        maxSpeed: 180
      });
      this.game.audio.playStomp();
      return true;
    }

    player.takeDamage(1);
    return true;
  }

  squash(isBlast = false) {
    this.isSquashed = true;
    this.squashTimer = 0.4;
    if (isBlast) {
      this.game.particles.explosion(this.x, this.y - 15);
      this.game.audio.playDamage();
    }
  }

  draw(ctx) {
    if (!this.active) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.isSquashed) {
      ctx.scale(1.5, 0.2);
      ctx.fillStyle = '#E74C3C';
      ctx.beginPath();
      ctx.arc(0, -10, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    switch (this.type) {
      case ENEMY_TYPES.SHROOM:
        this.drawShroom(ctx);
        break;
      case ENEMY_TYPES.BATTY:
        this.drawBatty(ctx);
        break;
      case ENEMY_TYPES.GOLEM:
        this.drawGolem(ctx);
        break;
      case ENEMY_TYPES.PUFFER:
        this.drawPuffer(ctx);
        break;
    }

    ctx.restore();
  }

  drawShroom(ctx) {
    const walkBob = Math.sin(this.animTime * 12) * 3;

    ctx.fillStyle = '#6D214F';
    ctx.beginPath();
    ctx.ellipse(-7, -2 + walkBob, 5, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(7, -2 - walkBob, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F8EFBA';
    ctx.strokeStyle = '#2C3E50';
    ctx.lineWidth = 1.5;
    ctx.fillRect(-8, -20, 16, 18);
    ctx.strokeRect(-8, -20, 16, 18);

    ctx.fillStyle = '#B33771';
    ctx.beginPath();
    ctx.arc(0, -20, 18, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-7, -26, 3, 0, Math.PI * 2);
    ctx.arc(6, -28, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#2C3E50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-9, -15);
    ctx.lineTo(-3, -13);
    ctx.moveTo(9, -15);
    ctx.lineTo(3, -13);
    ctx.stroke();

    ctx.fillStyle = '#2C3E50';
    ctx.beginPath();
    ctx.arc(-6, -11, 2, 0, Math.PI * 2);
    ctx.arc(6, -11, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  drawBatty(ctx) {
    const wingFlap = Math.sin(this.animTime * 18);

    ctx.save();
    ctx.translate(0, -14);

    ctx.fillStyle = '#2C3E50';
    ctx.strokeStyle = '#1E272E';
    ctx.lineWidth = 1.5;

    ctx.save();
    ctx.rotate(wingFlap * 0.4);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-18, -12);
    ctx.lineTo(-14, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.rotate(-wingFlap * 0.4);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(18, -12);
    ctx.lineTo(14, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#575FCF';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-6, -10);
    ctx.lineTo(-9, -18);
    ctx.lineTo(-2, -12);
    ctx.moveTo(6, -10);
    ctx.lineTo(9, -18);
    ctx.lineTo(2, -12);
    ctx.fill();

    ctx.fillStyle = '#FFDD59';
    ctx.beginPath();
    ctx.arc(-4, -2, 2.5, 0, Math.PI * 2);
    ctx.arc(4, -2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(-3, 3);
    ctx.lineTo(-2, 7);
    ctx.lineTo(-1, 3);
    ctx.moveTo(1, 3);
    ctx.lineTo(2, 7);
    ctx.lineTo(3, 3);
    ctx.fill();

    ctx.restore();
  }

  drawGolem(ctx) {
    const rumble = Math.sin(this.animTime * 16) * 1.5;

    ctx.save();
    ctx.translate(0, -21 + rumble);

    ctx.fillStyle = '#485460';
    ctx.strokeStyle = '#1E272E';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FF3838';
    ctx.fillRect(-12, -4, 24, 7);

    ctx.fillStyle = '#34495E';
    ctx.beginPath();
    ctx.moveTo(-12, -16);
    ctx.lineTo(-14, -26);
    ctx.lineTo(-6, -18);
    ctx.moveTo(12, -16);
    ctx.lineTo(14, -26);
    ctx.lineTo(6, -18);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  drawPuffer(ctx) {
    const pulse = Math.sin(this.animTime * 4) * 4;
    const r = this.radius + pulse;

    ctx.save();
    ctx.translate(0, -18);

    ctx.strokeStyle = '#FF5E57';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + this.animTime;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (r * 0.7), Math.sin(a) * (r * 0.7));
      ctx.lineTo(Math.cos(a) * (r + 8), Math.sin(a) * (r + 8));
      ctx.stroke();
    }

    ctx.fillStyle = '#FF3838';
    ctx.strokeStyle = '#1E272E';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-5, -3, 4, 0, Math.PI * 2);
    ctx.arc(5, -3, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1E272E';
    ctx.beginPath();
    ctx.arc(-4, -3, 2, 0, Math.PI * 2);
    ctx.arc(4, -3, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

class EnemyManager {
  constructor(game) {
    this.game = game;
    this.enemies = [];
    this.spawnTimer = 4.0;
  }

  reset() {
    this.enemies = [];
    this.spawnTimer = 4.5;
  }

  update(dt, worldSpeed) {
    const Utils = window.OopsWorld.Utils;
    this.spawnTimer -= dt;

    if (this.spawnTimer <= 0) {
      this.trySpawnEnemy();
      const dist = this.game.world.distance;
      const minI = Math.max(1.8, 4.0 - dist * 0.003);
      const maxI = Math.max(3.2, 6.5 - dist * 0.004);
      this.spawnTimer = Utils.randFloat(minI, maxI);
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const en = this.enemies[i];
      en.update(dt, worldSpeed);
      en.checkCollision(this.game.player);

      if (!en.active) {
        this.enemies.splice(i, 1);
      }
    }
  }

  trySpawnEnemy() {
    const Utils = window.OopsWorld.Utils;
    const ch = this.game.activeChapter;
    const dist = this.game.world.distance;
    if (ch && dist >= ch.targetDistance - 18) return;

    const spawnX = this.game.width + Utils.randFloat(50, 120);
    const ground = this.game.world.getGroundAt(spawnX);
    if (ground.isGap) return;

    const pool = [ENEMY_TYPES.SHROOM];

    if (dist > 50) pool.push(ENEMY_TYPES.BATTY);
    if (dist > 110) pool.push(ENEMY_TYPES.GOLEM);
    if (dist > 170) pool.push(ENEMY_TYPES.PUFFER);

    const type = Utils.randChoice(pool);
    const enemy = new Enemy(this.game, type, spawnX, ground.y);
    this.enemies.push(enemy);
  }

  draw(ctx) {
    for (let i = 0; i < this.enemies.length; i++) {
      this.enemies[i].draw(ctx);
    }
  }
}

window.OopsWorld.ENEMY_TYPES = ENEMY_TYPES;
window.OopsWorld.Enemy = Enemy;
window.OopsWorld.EnemyManager = EnemyManager;
