// OOPS! WORLD - Surprise Disasters & Dynamic Events Engine
window.OopsWorld = window.OopsWorld || {};

const EVENT_TYPES = {
  METEOR_SHOWER: 'meteor_shower',
  GIANT_BOULDER: 'giant_boulder',
  SUDDEN_STORM: 'sudden_storm',
  LOW_GRAVITY: 'low_gravity',
  DARKNESS: 'darkness',
  COIN_FEVER: 'coin_fever'
};

class SurpriseEventManager {
  constructor(game) {
    this.game = game;
    this.currentEvent = null;
    this.state = 'idle';
    this.eventTimer = 0;
    this.warningDuration = 2.8;
    this.activeDuration = 11.0;
    this.nextEventDistance = 140;

    this.entities = [];
    this.spawnSubTimer = 0;
  }

  reset() {
    this.currentEvent = null;
    this.state = 'idle';
    this.eventTimer = 0;
    this.nextEventDistance = 120;
    this.entities = [];
  }

  get isDarkness() {
    return this.state === 'active' && this.currentEvent === EVENT_TYPES.DARKNESS;
  }

  update(dt, worldSpeed) {
    if (this.state === 'idle') {
      if (this.game.world.distance >= this.nextEventDistance) {
        this.startWarning();
      }
      return;
    }

    if (this.state === 'warning') {
      this.eventTimer -= dt;
      if (this.eventTimer <= 0) {
        this.startActiveEvent();
      }
      return;
    }

    if (this.state === 'active') {
      this.eventTimer -= dt;
      this.updateActiveEvent(dt, worldSpeed);

      if (this.eventTimer <= 0) {
        this.endEvent();
      }
    }
  }

  startWarning() {
    const Utils = window.OopsWorld.Utils;
    const pool = [
      EVENT_TYPES.METEOR_SHOWER,
      EVENT_TYPES.GIANT_BOULDER,
      EVENT_TYPES.SUDDEN_STORM,
      EVENT_TYPES.LOW_GRAVITY,
      EVENT_TYPES.DARKNESS,
      EVENT_TYPES.COIN_FEVER
    ];

    this.currentEvent = Utils.randChoice(pool);
    this.state = 'warning';
    this.eventTimer = this.warningDuration;
    this.game.audio.playWarning();
    this.game.camera.addTrauma(0.3);

    const eventNames = {
      [EVENT_TYPES.METEOR_SHOWER]: '🔥 METEOR SHOWER IMMINENT!',
      [EVENT_TYPES.GIANT_BOULDER]: '🪨 GIANT ROLLING HAZARD AHEAD!',
      [EVENT_TYPES.SUDDEN_STORM]: '⚡ SUDDEN VIOLENT STORM!',
      [EVENT_TYPES.LOW_GRAVITY]: '🌌 COSMIC LOW GRAVITY RIFT!',
      [EVENT_TYPES.DARKNESS]: '🌙 SPOOKY TEMPORARY DARKNESS!',
      [EVENT_TYPES.COIN_FEVER]: '🌈 GOLDEN COIN RUSH FEVER!'
    };

    this.game.hudToast(eventNames[this.currentEvent], '#FF4757', 2.8);
  }

  startActiveEvent() {
    this.state = 'active';
    this.eventTimer = this.activeDuration;
    this.entities = [];
    this.spawnSubTimer = 0;

    if (this.currentEvent === EVENT_TYPES.LOW_GRAVITY) {
      this.game.player.gravity = 650;
    } else if (this.currentEvent === EVENT_TYPES.SUDDEN_STORM) {
      this.game.world.weather = 'storm';
      this.game.camera.addTrauma(0.4);
    } else if (this.currentEvent === EVENT_TYPES.GIANT_BOULDER) {
      this.entities.push({
        type: 'boulder',
        x: this.game.width + 120,
        y: this.game.world.groundY,
        radius: 64,
        speed: 380,
        rotation: 0
      });
      this.game.audio.playSpeedBoost();
    }
  }

  updateActiveEvent(dt, worldSpeed) {
    const Utils = window.OopsWorld.Utils;
    const ITEM_TYPES = window.OopsWorld.ITEM_TYPES;
    const Collectible = window.OopsWorld.Collectible;

    if (this.currentEvent === EVENT_TYPES.METEOR_SHOWER) {
      this.spawnSubTimer -= dt;
      if (this.spawnSubTimer <= 0) {
        this.entities.push({
          type: 'meteor',
          x: Utils.randFloat(100, this.game.width + 200),
          y: -60,
          vx: -Utils.randFloat(240, 360),
          vy: Utils.randFloat(480, 680),
          radius: Utils.randFloat(18, 28)
        });
        this.spawnSubTimer = Utils.randFloat(0.7, 1.3);
      }
    } else if (this.currentEvent === EVENT_TYPES.COIN_FEVER) {
      this.spawnSubTimer -= dt;
      if (this.spawnSubTimer <= 0) {
        const rx = Utils.randFloat(50, this.game.width);
        const itemType = Math.random() < 0.35 ? ITEM_TYPES.GEM : ITEM_TYPES.COIN;
        this.game.powerups.items.push(new Collectible(this.game, itemType, rx, -10));
        this.spawnSubTimer = 0.22;
      }
    }

    for (let i = this.entities.length - 1; i >= 0; i--) {
      const ent = this.entities[i];

      if (ent.type === 'meteor') {
        ent.x += ent.vx * dt;
        ent.y += ent.vy * dt;

        this.game.particles.spawn(ent.x, ent.y, {
          color: Utils.randChoice(['#FF4757', '#FFA502', '#FFD700']),
          shape: 'circle',
          radius: Utils.randFloat(4, 9),
          life: 0.35
        });

        const ground = this.game.world.getGroundAt(ent.x);
        if (ent.y >= ground.y - 10) {
          this.game.particles.explosion(ent.x, ground.y);
          this.game.camera.addTrauma(0.5);
          this.game.audio.playDamage();
          this.entities.splice(i, 1);
          continue;
        }

        const hitDist = ent.radius + 18;
        if (Utils.dist(ent.x, ent.y, this.game.player.x, this.game.player.y - 20) < hitDist) {
          this.game.player.takeDamage(1);
          this.game.particles.explosion(ent.x, ent.y);
          this.entities.splice(i, 1);
          continue;
        }
      } else if (ent.type === 'boulder') {
        ent.x -= (worldSpeed + ent.speed) * dt;
        ent.rotation -= 5 * dt;

        if (Math.random() < 0.3) {
          this.game.particles.dustPuff(ent.x, ent.y, 3);
          this.game.camera.addTrauma(0.12);
        }

        if (Utils.dist(ent.x, ent.y - ent.radius, this.game.player.x, this.game.player.y - 20) < ent.radius + 18) {
          this.game.player.takeDamage(1);
        }

        if (ent.x < -140) {
          this.entities.splice(i, 1);
        }
      }
    }
  }

  endEvent() {
    this.state = 'idle';
    this.game.player.gravity = 1400;

    this.game.disastersSurvived += 1;
    this.game.score += 350;
    this.game.hudToast('🎉 DISASTER SURVIVED! +350 PTS', '#2ED573', 2.5);
    this.game.audio.playPowerup();

    const Utils = window.OopsWorld.Utils;
    this.nextEventDistance = this.game.world.distance + Utils.randFloat(160, 240);
    this.entities = [];
  }

  draw(ctx) {
    if (this.state === 'idle') return;

    for (let i = 0; i < this.entities.length; i++) {
      const ent = this.entities[i];
      if (ent.type === 'meteor') {
        ctx.save();
        ctx.translate(ent.x, ent.y);

        ctx.fillStyle = '#FF4757';
        ctx.strokeStyle = '#FFA502';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, ent.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFEAA7';
        ctx.beginPath();
        ctx.arc(0, 0, ent.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else if (ent.type === 'boulder') {
        ctx.save();
        ctx.translate(ent.x, ent.y - ent.radius);
        ctx.rotate(ent.rotation);

        ctx.fillStyle = '#57606F';
        ctx.strokeStyle = '#2F3542';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, ent.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#747D8C';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-20, -20);
        ctx.lineTo(20, 20);
        ctx.moveTo(10, -30);
        ctx.lineTo(-10, 10);
        ctx.stroke();

        ctx.restore();
      }
    }

    if (this.isDarkness) {
      const player = this.game.player;
      const spotX = player.x;
      const spotY = player.y - 25;
      const spotRadius = 135;

      ctx.save();
      ctx.fillStyle = 'rgba(10, 10, 18, 0.93)';

      ctx.beginPath();
      ctx.rect(0, 0, this.game.width, this.game.height);
      ctx.arc(spotX, spotY, spotRadius, 0, Math.PI * 2, true);
      ctx.fill();

      const lightGrad = ctx.createRadialGradient(spotX, spotY, spotRadius * 0.4, spotX, spotY, spotRadius);
      lightGrad.addColorStop(0, 'rgba(255, 230, 150, 0)');
      lightGrad.addColorStop(1, 'rgba(10, 10, 18, 0.93)');
      ctx.fillStyle = lightGrad;
      ctx.beginPath();
      ctx.arc(spotX, spotY, spotRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }
}

window.OopsWorld.EVENT_TYPES = EVENT_TYPES;
window.OopsWorld.SurpriseEventManager = SurpriseEventManager;
