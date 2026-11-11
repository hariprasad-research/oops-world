// OOPS! WORLD - Procedural Endless World, Parallax & Weather Engine
window.OopsWorld = window.OopsWorld || {};

class World {
  constructor(game) {
    this.game = game;
    this.speed = 340;
    this.distance = 0;
    this.worldTime = 0;

    this.weather = 'clear';
    this.weatherTimer = 0;
    this.lightningAlpha = 0;

    this.cloudOffset = 0;
    this.bgMountainsOffset = 0;
    this.bgHillsOffset = 0;

    const Utils = window.OopsWorld.Utils;

    this.clouds = [];
    for (let i = 0; i < 7; i++) {
      this.clouds.push({
        x: Utils.randFloat(0, 1000),
        y: Utils.randFloat(30, 160),
        scale: Utils.randFloat(0.7, 1.4),
        speed: Utils.randFloat(15, 35)
      });
    }

    this.weatherParticles = [];
    for (let i = 0; i < 60; i++) {
      this.weatherParticles.push({
        x: Math.random() * 1000,
        y: Math.random() * 600,
        vy: Utils.randFloat(120, 300),
        vx: Utils.randFloat(-40, -10),
        length: Utils.randFloat(8, 16),
        size: Utils.randFloat(2, 4)
      });
    }

    this.props = [];
    this.groundY = 420;
    this.chunks = [];
    this.chunkWidth = 220;

    this.reset();
  }

  reset() {
    const THEMES = window.OopsWorld.THEMES;
    const Utils = window.OopsWorld.Utils;

    this.distance = 0;
    this.worldTime = 0;
    this.speed = 340;
    this.weather = 'clear';
    this.weatherTimer = Utils.randFloat(20, 35);
    this.lightningAlpha = 0;
    this.chunks = [];
    this.props = [];

    const themeId = this.game.storage?.data?.selectedTheme || 'forest';
    this.theme = (THEMES && THEMES.find((t) => t.id === themeId)) || (THEMES ? THEMES[0] : {
      id: 'forest',
      name: 'Green Haven',
      skyTop: '#4FACFE',
      skyBottom: '#00F2FE',
      groundColor: '#43A047',
      groundUnder: '#2E7D32'
    });

    let curX = 0;
    for (let i = 0; i < 6; i++) {
      this.chunks.push({
        x: curX,
        width: this.chunkWidth,
        y: this.groundY,
        isGap: false,
        platformY: null
      });
      curX += this.chunkWidth;
    }
  }

  getGroundAt(x) {
    for (let i = 0; i < this.chunks.length; i++) {
      const c = this.chunks[i];
      if (x >= c.x && x <= c.x + c.width) {
        if (c.platform && x >= c.platform.x && x <= c.platform.x + c.platform.width) {
          if (this.game.player && this.game.player.y <= c.platform.y + 12 && this.game.player.vy >= 0) {
            return { y: c.platform.y, isGap: false, isPlatform: true };
          }
        }
        return { y: c.y, isGap: c.isGap, isPlatform: false };
      }
    }
    return { y: this.groundY, isGap: false };
  }

  update(dt) {
    const Utils = window.OopsWorld.Utils;
    const speedMultiplier = this.game.player.powerups.slowMoTimer > 0 ? 0.55 : 1;
    const boostMultiplier = this.game.player.powerups.speedTimer > 0 ? 1.6 : 1;
    const currentSpeed = (this.speed + Math.min(220, this.distance * 0.28)) * speedMultiplier * boostMultiplier;

    this.currentSpeed = currentSpeed;
    const moveDist = currentSpeed * dt;

    this.distance += moveDist / 60;
    this.worldTime += dt * 0.05;

    this.cloudOffset += moveDist * 0.15;
    this.bgMountainsOffset += moveDist * 0.25;
    this.bgHillsOffset += moveDist * 0.55;

    for (let i = 0; i < this.clouds.length; i++) {
      const c = this.clouds[i];
      c.x -= (c.speed + moveDist * 0.08) * dt;
      if (c.x < -140) {
        c.x = this.game.width + Utils.randFloat(20, 100);
        c.y = Utils.randFloat(30, 170);
        c.scale = Utils.randFloat(0.7, 1.4);
      }
    }

    this.weatherTimer -= dt;
    if (this.weatherTimer <= 0) {
      const weathers = ['clear', 'rain', 'snow', 'storm'];
      this.weather = Utils.randChoice(weathers);
      this.weatherTimer = Utils.randFloat(25, 45);
    }

    if (this.weather === 'storm') {
      if (Math.random() < 0.008) {
        this.lightningAlpha = 0.85;
        this.game.camera.addTrauma(0.3);
      }
    }
    if (this.lightningAlpha > 0) {
      this.lightningAlpha = Math.max(0, this.lightningAlpha - dt * 2.5);
    }

    if (this.weather !== 'clear') {
      for (let i = 0; i < this.weatherParticles.length; i++) {
        const p = this.weatherParticles[i];
        p.y += p.vy * dt;
        p.x += p.vx * dt - moveDist * 0.35 * dt;

        if (p.y > this.game.height) {
          p.y = -10;
          p.x = Math.random() * (this.game.width + 100);
          if (this.weather === 'rain' || this.weather === 'storm') {
            p.vy = Utils.randFloat(550, 850);
            p.vx = -120;
          } else if (this.weather === 'snow') {
            p.vy = Utils.randFloat(80, 140);
            p.vx = Utils.randFloat(-30, 30);
          }
        }
      }
    }

    for (let i = 0; i < this.chunks.length; i++) {
      this.chunks[i].x -= moveDist;
      if (this.chunks[i].platform) {
        this.chunks[i].platform.x -= moveDist;
      }
    }

    for (let i = this.props.length - 1; i >= 0; i--) {
      this.props[i].x -= moveDist;
      if (this.props[i].x < -60) {
        this.props.splice(i, 1);
      }
    }

    while (this.chunks.length > 0 && this.chunks[0].x + this.chunks[0].width < -50) {
      this.chunks.shift();
    }

    const lastChunk = this.chunks[this.chunks.length - 1];
    if (lastChunk && lastChunk.x + lastChunk.width < this.game.width + 500) {
      this.generateNextChunk(lastChunk);
    }
  }

  generateNextChunk(lastChunk) {
    const Utils = window.OopsWorld.Utils;
    const nextX = lastChunk.x + lastChunk.width;
    const canSpawnGap = this.distance > 80 && !lastChunk.isGap && this.chunks.filter((c) => c.isGap).length === 0;

    const isGap = canSpawnGap && Math.random() < 0.16;

    let targetY = this.groundY;
    if (!isGap) {
      const dy = Utils.randChoice([-30, -15, 0, 15, 30]);
      targetY = Utils.clamp(lastChunk.y + dy, 360, 440);
    }

    const newChunk = {
      x: nextX,
      width: isGap ? Utils.randFloat(130, 180) : this.chunkWidth,
      y: targetY,
      isGap: isGap,
      platform: null
    };

    if (!isGap && Math.random() < 0.35 && this.distance > 40) {
      newChunk.platform = {
        x: nextX + 20,
        y: targetY - Utils.randFloat(75, 110),
        width: Utils.randFloat(90, 140),
        height: 16
      };
    }

    if (!isGap && Math.random() < 0.6) {
      this.props.push({
        x: nextX + Utils.randFloat(20, this.chunkWidth - 40),
        y: targetY,
        type: Utils.randChoice(['bush', 'flower', 'pebble', 'mushroom'])
      });
    }

    this.chunks.push(newChunk);
  }

  draw(ctx) {
    this.drawSky(ctx);
    this.drawCelestials(ctx);
    this.drawClouds(ctx);
    this.drawParallaxBackdrop(ctx);
    this.drawTerrain(ctx);
    this.drawProps(ctx);
    this.drawWeather(ctx);
  }

  drawSky(ctx) {
    const cycle = (Math.sin(this.worldTime) + 1) / 2;
    const grad = ctx.createLinearGradient(0, 0, 0, this.game.height);

    if (this.theme.id === 'cosmic') {
      grad.addColorStop(0, '#0F051D');
      grad.addColorStop(0.6, '#280A3C');
      grad.addColorStop(1, '#4A154B');
    } else {
      if (cycle < 0.4) {
        grad.addColorStop(0, this.theme.skyTop);
        grad.addColorStop(1, this.theme.skyBottom);
      } else if (cycle < 0.7) {
        grad.addColorStop(0, '#6C5CE7');
        grad.addColorStop(0.5, '#FD79A8');
        grad.addColorStop(1, '#FFEAA7');
      } else {
        grad.addColorStop(0, '#0C1021');
        grad.addColorStop(0.6, '#1B263B');
        grad.addColorStop(1, '#273C75');
      }
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.game.width, this.game.height);

    if (cycle >= 0.5 || this.theme.id === 'cosmic') {
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 35; i++) {
        const starX = (i * 97 + this.cloudOffset * 0.05) % this.game.width;
        const starY = (i * 47) % (this.game.height * 0.55);
        const starAlpha = 0.3 + 0.7 * Math.sin(this.worldTime * 4 + i);
        ctx.globalAlpha = Math.max(0, starAlpha);
        ctx.fillRect(starX, starY, (i % 3 === 0) ? 2.5 : 1.5, (i % 3 === 0) ? 2.5 : 1.5);
      }
      ctx.restore();
    }
  }

  drawCelestials(ctx) {
    const cycle = (Math.sin(this.worldTime) + 1) / 2;
    const sunX = this.game.width * 0.8;
    const sunY = 90;

    ctx.save();
    if (cycle < 0.6 && this.theme.id !== 'cosmic') {
      ctx.fillStyle = 'rgba(255, 230, 110, 0.25)';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 44, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFDD59';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 28, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 32, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#F8F9FA';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(200, 214, 229, 0.5)';
      ctx.beginPath();
      ctx.arc(sunX - 6, sunY - 4, 4, 0, Math.PI * 2);
      ctx.arc(sunX + 6, sunY + 6, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawClouds(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';

    for (let i = 0; i < this.clouds.length; i++) {
      const c = this.clouds[i];
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(c.scale, c.scale);

      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.arc(16, -6, 22, 0, Math.PI * 2);
      ctx.arc(36, 0, 16, 0, Math.PI * 2);
      ctx.arc(18, 8, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
    ctx.restore();
  }

  drawParallaxBackdrop(ctx) {
    const w = this.game.width;
    const h = this.game.height;

    ctx.save();
    ctx.fillStyle = this.theme.id === 'desert' ? '#E67E22' : this.theme.id === 'snow' ? '#74B9FF' : '#27AE60';
    ctx.globalAlpha = 0.35;

    ctx.beginPath();
    ctx.moveTo(0, h);
    const mStep = 180;
    const mOffset = -(this.bgMountainsOffset % mStep);
    for (let x = -mStep; x <= w + mStep * 2; x += mStep) {
      const peakY = h * 0.45 + Math.sin((x + this.bgMountainsOffset) * 0.005) * 50;
      ctx.lineTo(x + mOffset, peakY);
      ctx.lineTo(x + mStep * 0.5 + mOffset, h * 0.6);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = this.theme.id === 'desert' ? '#D35400' : this.theme.id === 'snow' ? '#0984E3' : '#1E824C';
    ctx.globalAlpha = 0.55;

    ctx.beginPath();
    ctx.moveTo(0, h);
    const hStep = 120;
    const hOffset = -(this.bgHillsOffset % hStep);
    for (let x = -hStep; x <= w + hStep * 2; x += hStep) {
      const hillY = h * 0.6 + Math.sin((x + this.bgHillsOffset) * 0.008) * 35;
      ctx.lineTo(x + hOffset, hillY);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawTerrain(ctx) {
    const bottomY = this.game.height + 40;

    for (let i = 0; i < this.chunks.length; i++) {
      const c = this.chunks[i];
      if (c.isGap) {
        ctx.fillStyle = '#111116';
        ctx.fillRect(c.x, c.y, c.width, bottomY - c.y);

        ctx.fillStyle = 'rgba(235, 77, 75, 0.4)';
        ctx.fillRect(c.x, bottomY - 30, c.width, 30);
        continue;
      }

      ctx.save();
      ctx.fillStyle = this.theme.groundUnder;
      ctx.fillRect(c.x, c.y, c.width, bottomY - c.y);

      ctx.fillStyle = this.theme.groundColor;
      ctx.fillRect(c.x, c.y, c.width, 16);

      ctx.fillStyle = this.theme.groundColor;
      for (let bx = c.x; bx < c.x + c.width; bx += 14) {
        ctx.beginPath();
        ctx.arc(bx + 7, c.y + 16, 5, 0, Math.PI);
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(c.x, c.y, c.width, 3.5);
      ctx.restore();

      if (c.platform) {
        const p = c.platform;
        ctx.save();
        ctx.fillStyle = this.theme.groundUnder;
        ctx.fillRect(p.x, p.y + 5, p.width, p.height - 5);

        ctx.fillStyle = this.theme.groundColor;
        ctx.fillRect(p.x, p.y, p.width, 7);

        ctx.strokeStyle = '#2C3E50';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(p.x, p.y, p.width, p.height);
        ctx.restore();
      }
    }
  }

  drawProps(ctx) {
    for (let i = 0; i < this.props.length; i++) {
      const p = this.props[i];
      ctx.save();
      ctx.translate(p.x, p.y);

      if (p.type === 'bush') {
        ctx.fillStyle = '#27AE60';
        ctx.beginPath();
        ctx.arc(0, -6, 9, 0, Math.PI * 2);
        ctx.arc(8, -8, 11, 0, Math.PI * 2);
        ctx.arc(16, -5, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'flower') {
        ctx.fillStyle = '#2ECC71';
        ctx.fillRect(-1, -12, 2, 12);
        ctx.fillStyle = '#FF7675';
        ctx.beginPath();
        ctx.arc(0, -12, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFEAA7';
        ctx.beginPath();
        ctx.arc(0, -12, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'mushroom') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-2, -6, 4, 6);
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.arc(0, -6, 7, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-2, -9, 1.5, 0, Math.PI * 2);
        ctx.arc(3, -8, 1.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'pebble') {
        ctx.fillStyle = '#95A5A6';
        ctx.beginPath();
        ctx.ellipse(0, -2, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  drawWeather(ctx) {
    if (this.lightningAlpha > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.lightningAlpha})`;
      ctx.fillRect(0, 0, this.game.width, this.game.height);
    }

    if (this.weather === 'clear') return;

    ctx.save();
    if (this.weather === 'rain' || this.weather === 'storm') {
      ctx.strokeStyle = 'rgba(116, 185, 255, 0.65)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i < this.weatherParticles.length; i++) {
        const p = this.weatherParticles[i];
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 4, p.y + p.length);
      }
      ctx.stroke();
    } else if (this.weather === 'snow') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      for (let i = 0; i < this.weatherParticles.length; i++) {
        const p = this.weatherParticles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
}

window.OopsWorld.World = World;
