// OOPS! WORLD - Utility Functions & Particle / Effects Engine
window.OopsWorld = window.OopsWorld || {};

const Utils = {
  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  },

  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  randFloat(min, max) {
    return min + Math.random() * (max - min);
  },

  randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  randChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  dist(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },

  rectIntersect(r1, r2) {
    return !(
      r2.x > r1.x + r1.width ||
      r2.x + r2.width < r1.x ||
      r2.y > r1.y + r1.height ||
      r2.y + r2.height < r1.y
    );
  },

  circleIntersect(c1, c2) {
    const d = Utils.dist(c1.x, c1.y, c2.x, c2.y);
    return d < c1.radius + c2.radius;
  },

  circleRectIntersect(circle, rect) {
    const closestX = Utils.clamp(circle.x, rect.x, rect.x + rect.width);
    const closestY = Utils.clamp(circle.y, rect.y, rect.y + rect.height);
    const distanceX = circle.x - closestX;
    const distanceY = circle.y - closestY;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;
    return distanceSquared < circle.radius * circle.radius;
  },

  easeOutQuad(t) {
    return t * (2 - t);
  },

  easeOutBack(t, s = 1.70158) {
    const t1 = t - 1;
    return t1 * t1 * ((s + 1) * t1 + s) + 1;
  },

  easeInQuad(t) {
    return t * t;
  },

  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },

  hexToRgb(hex) {
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
  },

  hexToRgba(hex, alpha = 1) {
    const rgb = Utils.hexToRgb(hex);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }
};

// Screen Shake with Trauma decay
class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.trauma = 0;
    this.maxOffset = 18;
    this.maxAngle = 0.04;
    this.decay = 1.4;
  }

  addTrauma(amount) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  update(dt) {
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - this.decay * dt);
      const shake = this.trauma * this.trauma;
      this.x = (Math.random() * 2 - 1) * this.maxOffset * shake;
      this.y = (Math.random() * 2 - 1) * this.maxOffset * shake;
      this.angle = (Math.random() * 2 - 1) * this.maxAngle * shake;
    } else {
      this.x = 0;
      this.y = 0;
      this.angle = 0;
    }
  }

  apply(ctx) {
    if (this.trauma > 0) {
      ctx.translate(this.x, this.y);
      if (this.angle) {
        ctx.rotate(this.angle);
      }
    }
  }
}

// Particle Class
class Particle {
  constructor() {
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.gravity = 0;
    this.radius = 4;
    this.color = '#fff';
    this.alpha = 1;
    this.life = 1;
    this.maxLife = 1;
    this.shape = 'circle';
    this.rotation = 0;
    this.vRot = 0;
    this.shrink = true;
    this.drag = 1;
  }

  init(x, y, config = {}) {
    this.active = true;
    this.x = x;
    this.y = y;
    this.vx = config.vx ?? Utils.randFloat(-60, 60);
    this.vy = config.vy ?? Utils.randFloat(-60, 60);
    this.gravity = config.gravity ?? 0;
    this.radius = config.radius ?? Utils.randFloat(3, 7);
    this.baseRadius = this.radius;
    this.color = config.color ?? '#FFD700';
    this.alpha = config.alpha ?? 1;
    this.maxLife = config.life ?? 0.6;
    this.life = this.maxLife;
    this.shape = config.shape ?? 'circle';
    this.rotation = config.rotation ?? Utils.randFloat(0, Math.PI * 2);
    this.vRot = config.vRot ?? Utils.randFloat(-4, 4);
    this.shrink = config.shrink ?? true;
    this.drag = config.drag ?? 1;
  }

  update(dt) {
    if (!this.active) return;
    this.life -= dt;
    if (this.life <= 0) {
      this.active = false;
      return;
    }

    this.vx *= Math.pow(this.drag, dt * 60);
    this.vy *= Math.pow(this.drag, dt * 60);
    this.vy += this.gravity * dt;

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += this.vRot * dt;

    const progress = 1 - this.life / this.maxLife;
    this.alpha = Math.max(0, 1 - progress);
    if (this.shrink) {
      this.radius = this.baseRadius * (1 - progress * 0.7);
    }
  }

  draw(ctx) {
    if (!this.active || this.alpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;

    if (this.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(1, this.radius), 0, Math.PI * 2);
      ctx.fill();
    } else if (this.shape === 'star') {
      const r = Math.max(2, this.radius);
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a1 = (i * Math.PI * 2) / 5;
        const a2 = a1 + Math.PI / 5;
        ctx.lineTo(Math.cos(a1) * r, Math.sin(a1) * r);
        ctx.lineTo(Math.cos(a2) * (r * 0.45), Math.sin(a2) * (r * 0.45));
      }
      ctx.closePath();
      ctx.fill();
    } else if (this.shape === 'ring') {
      ctx.lineWidth = Math.max(1, this.radius * 0.25);
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(1, this.radius), 0, Math.PI * 2);
      ctx.stroke();
    } else if (this.shape === 'heart') {
      const s = Math.max(1, this.radius * 0.35);
      ctx.beginPath();
      ctx.moveTo(0, s);
      ctx.bezierCurveTo(-s * 2, -s, -s * 2, -s * 3, 0, -s * 4);
      ctx.bezierCurveTo(s * 2, -s * 3, s * 2, -s, 0, s);
      ctx.fill();
    } else if (this.shape === 'square') {
      const s = Math.max(1, this.radius);
      ctx.fillRect(-s / 2, -s / 2, s, s);
    }

    ctx.restore();
  }
}

// Particle System with Object Pooling
class ParticleSystem {
  constructor(capacity = 350) {
    this.pool = [];
    for (let i = 0; i < capacity; i++) {
      this.pool.push(new Particle());
    }
  }

  getFreeParticle() {
    for (let i = 0; i < this.pool.length; i++) {
      if (!this.pool[i].active) return this.pool[i];
    }
    const p = new Particle();
    this.pool.push(p);
    return p;
  }

  spawn(x, y, config) {
    const p = this.getFreeParticle();
    p.init(x, y, config);
    return p;
  }

  burst(x, y, count = 12, config = {}) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Utils.randFloat(-0.3, 0.3);
      const speed = Utils.randFloat(config.minSpeed ?? 60, config.maxSpeed ?? 180);
      this.spawn(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: config.gravity ?? 250,
        radius: config.radius ?? Utils.randFloat(3, 7),
        color: config.color ?? '#FFD700',
        shape: config.shape ?? 'circle',
        life: config.life ?? Utils.randFloat(0.4, 0.8),
        drag: 0.94
      });
    }
  }

  dustPuff(x, y, count = 5, color = '#E0D0B0') {
    for (let i = 0; i < count; i++) {
      this.spawn(x + Utils.randFloat(-8, 8), y + Utils.randFloat(-2, 2), {
        vx: Utils.randFloat(-40, -10),
        vy: Utils.randFloat(-30, -5),
        radius: Utils.randFloat(4, 8),
        color: color,
        life: Utils.randFloat(0.3, 0.5),
        shape: 'circle',
        drag: 0.88
      });
    }
  }

  coinSparkle(x, y) {
    for (let i = 0; i < 7; i++) {
      const angle = Utils.randFloat(0, Math.PI * 2);
      const speed = Utils.randFloat(40, 120);
      this.spawn(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        gravity: 80,
        radius: Utils.randFloat(4, 7),
        color: Utils.randChoice(['#FFE066', '#FFF', '#FFAA00']),
        shape: 'star',
        life: Utils.randFloat(0.4, 0.7)
      });
    }
  }

  explosion(x, y) {
    this.spawn(x, y, {
      vx: 0,
      vy: 0,
      radius: 4,
      baseRadius: 40,
      color: '#FFA500',
      shape: 'ring',
      life: 0.35,
      shrink: false
    });

    this.burst(x, y, 22, {
      minSpeed: 80,
      maxSpeed: 260,
      gravity: 300,
      color: Utils.randChoice(['#FF4500', '#FF8C00', '#FFD700', '#FF3333']),
      shape: 'circle',
      life: 0.65
    });
  }

  healHearts(x, y) {
    for (let i = 0; i < 6; i++) {
      this.spawn(x + Utils.randFloat(-15, 15), y + Utils.randFloat(-10, 10), {
        vx: Utils.randFloat(-25, 25),
        vy: Utils.randFloat(-90, -40),
        gravity: -20,
        radius: Utils.randFloat(6, 10),
        color: '#FF3366',
        shape: 'heart',
        life: Utils.randFloat(0.6, 1.0)
      });
    }
  }

  speedStreaks(x, y) {
    for (let i = 0; i < 3; i++) {
      this.spawn(x + Utils.randFloat(-20, 0), y + Utils.randFloat(-20, 20), {
        vx: Utils.randFloat(-320, -180),
        vy: Utils.randFloat(-5, 5),
        radius: Utils.randFloat(2, 4),
        color: Utils.randChoice(['#00F0FF', '#FFFFFF', '#70E0FF']),
        shape: 'circle',
        life: Utils.randFloat(0.2, 0.4)
      });
    }
  }

  update(dt) {
    for (let i = 0; i < this.pool.length; i++) {
      if (this.pool[i].active) {
        this.pool[i].update(dt);
      }
    }
  }

  draw(ctx) {
    for (let i = 0; i < this.pool.length; i++) {
      if (this.pool[i].active) {
        this.pool[i].draw(ctx);
      }
    }
  }

  clear() {
    for (let i = 0; i < this.pool.length; i++) {
      this.pool[i].active = false;
    }
  }
}

window.OopsWorld.Utils = Utils;
window.OopsWorld.Camera = Camera;
window.OopsWorld.Particle = Particle;
window.OopsWorld.ParticleSystem = ParticleSystem;
