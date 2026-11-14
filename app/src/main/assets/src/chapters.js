// OOPS! WORLD - Disaster Chapters, Card Previews, Hazards & Friend Rescue Engine
window.OopsWorld = window.OopsWorld || {};

const CHAPTER_CARDS = [
  {
    id: 'geophysical',
    number: 1,
    title: 'GEOPHYSICAL DISASTERS',
    shortName: 'CH. 1 — GEOPHYSICAL',
    subtitle: 'Earthquakes, Volcanoes & Landslides',
    description: 'Survive violent tremors, lava cracks, falling rocks & crumbling ruins.',
    targetDistance: 350,
    rewardCoins: 150,
    friendId: 'pip',
    friendName: 'Pip the Bunny',
    icon: '🌋',
    color: '#FF6B35',
    bgTop: '#240B08',
    bgMid: '#6E1E12',
    bgBot: '#C04819',
    groundColor: '#4B3621',
    groundUnder: '#2C1B12',
    playableInPhase1: true,
    introLine: '“Bobo! The volcano erupted and falling ruins blocked my burrow—hurry!”',
    rescueLine: '“You leaped right through the earthquake for me! Let’s find the others!”'
  },
  {
    id: 'hydrological',
    number: 2,
    title: 'HYDROLOGICAL DISASTERS',
    shortName: 'CH. 2 — HYDROLOGICAL',
    subtitle: 'Rising Waters, Flash Floods & Waves',
    description: 'Leap over rushing waves, flooded pathways & surging water obstacles.',
    targetDistance: 420,
    rewardCoins: 200,
    friendId: 'kato',
    friendName: 'Kato the Ninja',
    icon: '🌊',
    color: '#00A8FF',
    bgTop: '#08182B',
    bgMid: '#133C5E',
    bgBot: '#296E96',
    groundColor: '#1E6B7B',
    groundUnder: '#0F3D4C',
    playableInPhase1: true,
    introLine: '“Flash floods swept away the bridge! Hold high ground and reach the shrine!”',
    rescueLine: '“What reflexes, Bobo! My ninja leap is yours whenever you need me!”'
  },
  {
    id: 'meteorological',
    number: 3,
    title: 'METEOROLOGICAL DISASTERS',
    shortName: 'CH. 3 — METEOROLOGICAL',
    subtitle: 'Cyclones, Lightning & Fierce Winds',
    description: 'Dodge spinning tornadoes, thunderbolts & windborne flying debris.',
    targetDistance: 480,
    rewardCoins: 250,
    friendId: 'gloop',
    friendName: 'Gloop the Alien',
    icon: '🌪️',
    color: '#A29BFE',
    bgTop: '#0F0B1F',
    bgMid: '#2D2159',
    bgBot: '#574194',
    groundColor: '#3D4856',
    groundUnder: '#222A35',
    playableInPhase1: true,
    introLine: '“Whoa!! A massive cyclone spun me across the valley—watch the sky!”',
    rescueLine: '“Woohoo! You beat the supercell storm! Ready to pull coins like a magnet!”'
  },
  {
    id: 'climatological',
    number: 4,
    title: 'CLIMATOLOGICAL DISASTERS',
    shortName: 'CH. 4 — CLIMATOLOGICAL',
    subtitle: 'Droughts, Wildfires & Sudden Freezes',
    description: 'Adapt fast as scorching heat & wildfires flash-freeze into blizzards.',
    targetDistance: 550,
    rewardCoins: 350,
    friendId: 'robo',
    friendName: 'Robo-9',
    icon: '❄️',
    color: '#00D2D3',
    bgTop: '#5E1904',
    bgMid: '#C04810',
    bgBot: '#F39C12',
    groundColor: '#8D4925',
    groundUnder: '#4A2311',
    playableInPhase1: true,
    introLine: '“ALERT: Wildfires and sub-zero freezes colliding! Circuits failing—need rescue!”',
    rescueLine: '“SYSTEMS RESTORED. Shield protocols transferred to Bobo. Stay frosty!”'
  },
  {
    id: 'biological',
    number: 5,
    title: 'BIOLOGICAL DISASTERS',
    shortName: 'CH. 5 — BIOLOGICAL',
    subtitle: 'Toxic Spores & Mutated Swarms',
    description: 'Navigate overgrown fungal spores and mutated swarms. (Phase 2)',
    targetDistance: 600,
    rewardCoins: 450,
    friendId: null,
    friendName: 'Botanist Sprite',
    icon: '☣️',
    color: '#2ED573',
    bgTop: '#0D1F18',
    bgMid: '#1B4332',
    bgBot: '#2D6A4F',
    groundColor: '#2ED573',
    groundUnder: '#145A32',
    playableInPhase1: false,
    introLine: 'Phase 2 Adventure',
    rescueLine: ''
  },
  {
    id: 'extraterrestrial',
    number: 6,
    title: 'EXTRATERRESTRIAL / SPACE DISASTERS',
    shortName: 'CH. 6 — SPACE DISASTERS',
    subtitle: 'Meteors, Asteroids & Cosmic Impacts',
    description: 'Brace for asteroid impacts and cosmic atmosphere hazards. (Phase 2)',
    targetDistance: 700,
    rewardCoins: 600,
    friendId: null,
    friendName: 'Starlight Hero',
    icon: '☄️',
    color: '#FF4757',
    bgTop: '#090418',
    bgMid: '#1B0738',
    bgBot: '#4A154B',
    groundColor: '#5F27CD',
    groundUnder: '#2C0E5E',
    playableInPhase1: false,
    introLine: 'Phase 2 Adventure',
    rescueLine: ''
  }
];

class ChapterDirector {
  constructor(game) {
    this.game = game;
    this.activeChapter = null;
    this.time = 0;

    // Active dynamic hazards rendered & colliding inside the active chapter
    this.hazards = [];
    this.hazardTimer = 3.5;

    // Environmental state
    this.climateMode = 'heat'; // 'heat' or 'freeze' for Ch. 4
    this.climateMix = 0; // 0 = heat, 1 = freeze
    this.climateSwitchDist = 115;
    this.climateWipeProgress = 0;

    this.waterRiseLevel = 0; // Ch. 2 rising water px above groundY
    this.waterRiseTimer = 10;
    this.waterRisingActive = false;

    this.windForce = 0; // Ch. 3 horizontal wind (-1 headwind, +1 tailwind)
    this.windTimer = 8;

    this.quakeTimer = 9; // Ch. 1 periodic earthquake shake
    this.quakeActive = 0;

    // Rescue flow
    this.rescueTriggered = false;
    this.rescueOutcome = null;
    this.rescueAnimTimer = 0;
    this.introTimer = 0;
  }

  getCardMeta(chapterId) {
    return CHAPTER_CARDS.find((c) => c.id === chapterId) || CHAPTER_CARDS[0];
  }

  reset(chapterId) {
    this.activeChapter = this.getCardMeta(chapterId);
    this.time = 0;
    this.hazards = [];
    this.hazardTimer = 2.8;

    this.climateMode = 'heat';
    this.climateMix = 0;
    this.climateSwitchDist = 110;
    this.climateWipeProgress = 0;

    this.waterRiseLevel = 0;
    this.waterRiseTimer = 9.0;
    this.waterRisingActive = false;

    this.windForce = 0;
    this.windTimer = 7.0;

    this.quakeTimer = 8.0;
    this.quakeActive = 0;

    this.rescueTriggered = false;
    this.rescueOutcome = null;
    this.rescueAnimTimer = 0;
    this.introTimer = 0;
  }

  startIntro(chapterId) {
    this.reset(chapterId);
    this.game.activeChapter = this.activeChapter;
    this.game.state = 'chapter_intro';
    this.game.storage?.setLastChapter(chapterId);
  }

  completeRescue() {
    if (this.rescueTriggered || !this.activeChapter) return;
    this.rescueTriggered = true;
    this.rescueAnimTimer = 0;
    this.hazards = [];
    this.windForce = 0;
    this.waterRiseLevel = 0;
    this.game.player.invincibleTimer = 0;

    const chapterId = this.activeChapter.id;
    const outcome = this.game.storage.completeChapter(chapterId);
    // Also record distance/run coins earned so far!
    this.game.storage.recordRun({
      score: this.game.score,
      distance: this.game.world.distance,
      coins: this.game.coinsCollected,
      enemiesStomped: this.game.enemiesStomped,
      disastersSurvived: this.game.disastersSurvived + 1,
      chapterId
    });
    this.rescueOutcome = outcome;
    this.game.state = 'chapter_rescue';
    this.game.audio.stopMusic();
    this.game.audio.playPowerup();
  }

  update(dt, worldSpeed) {
    this.time += dt;
    if (!this.activeChapter) return;

    if (this.game.state === 'chapter_intro') {
      this.introTimer += dt;
      return;
    }

    if (this.game.state === 'chapter_rescue') {
      this.rescueAnimTimer += dt;
      if (this.rescueAnimTimer < 0.8 && Math.random() < 0.45) {
        this.game.particles.coinSparkle(this.game.width * 0.55 + (Math.random() - 0.5) * 180, this.game.world.groundY - 70);
      }
      return;
    }

    if (this.game.state !== 'playing') return;

    const chId = this.activeChapter.id;
    const dist = this.game.world.distance;

    // Live distance goal check (Friend Rescue Objective!)
    if (!this.rescueTriggered && dist >= this.activeChapter.targetDistance) {
      this.completeRescue();
      return;
    }

    // Difficulty scalar 0..1 across chapter distance
    const diff = Math.min(1, dist / this.activeChapter.targetDistance);

    // Environmental effects per chapter
    if (chId === 'geophysical') {
      this.updateGeophysicalEnvironment(dt, diff);
    } else if (chId === 'hydrological') {
      this.updateHydrologicalEnvironment(dt, diff);
    } else if (chId === 'meteorological') {
      this.updateMeteorologicalEnvironment(dt, diff);
    } else if (chId === 'climatological') {
      this.updateClimatologicalEnvironment(dt, dist, diff);
    }

    // Spawn dynamic chapter hazards (pause spawning near rescue finish line so landing is clear)
    if (dist < this.activeChapter.targetDistance - 24) {
      this.hazardTimer -= dt;
      if (this.hazardTimer <= 0) {
        this.spawnChapterHazard(chId, diff);
        this.hazardTimer = Math.max(1.5, 3.6 - diff * 1.8) + Math.random() * 1.4;
      }
    }

    this.updateHazards(dt, worldSpeed);
  }

  updateGeophysicalEnvironment(dt, diff) {
    this.quakeTimer -= dt;
    if (this.quakeTimer <= 0) {
      this.quakeActive = 2.4;
      this.quakeTimer = 9.0 - diff * 3.0;
      this.game.camera.addTrauma(0.55);
      this.game.audio.playWarning();
      this.game.hudToast('🌋 EARTHQUAKE TREMOR!', '#FF6B35', 2.0);
    }
    if (this.quakeActive > 0) {
      this.quakeActive -= dt;
      this.game.camera.addTrauma(0.18 * dt * 10);
      if (Math.random() < 0.35) {
        this.game.particles.dustPuff(Math.random() * this.game.width, this.game.world.groundY, 1, '#D35400');
      }
    }
  }

  updateHydrologicalEnvironment(dt, diff) {
    this.waterRiseTimer -= dt;
    if (this.waterRiseTimer <= 0) {
      this.waterRisingActive = !this.waterRisingActive;
      if (this.waterRisingActive) {
        this.waterRiseTimer = 6.5;
        this.game.audio.playWarning();
        this.game.hudToast('🌊 WATER LEVELS RISING! STAY HIGH!', '#00A8FF', 2.2);
      } else {
        this.waterRiseTimer = Math.max(5.5, 9.0 - diff * 2.5);
      }
    }

    const targetRise = this.waterRisingActive ? 42 + diff * 18 : 10;
    this.waterRiseLevel += (targetRise - this.waterRiseLevel) * Math.min(1, dt * 2.4);
  }

  updateMeteorologicalEnvironment(dt, diff) {
    this.windTimer -= dt;
    if (this.windTimer <= 0) {
      this.windForce = this.windForce === 0 ? (Math.random() < 0.55 ? -1 : 1) : 0;
      if (this.windForce !== 0) {
        this.windTimer = 5.5;
        const msg = this.windForce < 0 ? '💨 FIERCE HEADWIND GUST!' : '💨 POWERFUL TAILWIND GALE!';
        this.game.hudToast(msg, '#A29BFE', 2.0);
      } else {
        this.windTimer = Math.max(4.5, 8.0 - diff * 2.5);
      }
    }

    // Subtle airborne wind push without breaking manual Jump/Slide control
    if (this.windForce !== 0 && !this.game.player.isGrounded) {
      this.game.player.vy += (this.windForce < 0 ? 110 : -75) * dt;
    }
  }

  updateClimatologicalEnvironment(dt, dist, diff) {
    if (dist >= this.climateSwitchDist) {
      this.climateMode = this.climateMode === 'heat' ? 'freeze' : 'heat';
      this.climateSwitchDist = dist + Math.max(85, 115 - diff * 20);
      this.climateWipeProgress = 0.01;
      this.game.audio.playWarning();
      if (this.climateMode === 'freeze') {
        this.game.world.weather = 'snow';
        this.game.hudToast('❄️ SUDDEN ARCTIC FREEZE!', '#00D2D3', 2.4);
      } else {
        this.game.world.weather = 'clear';
        this.game.hudToast('🔥 EXTREME HEAT & WILDFIRE WAVE!', '#FF6B35', 2.4);
      }
    }

    const targetMix = this.climateMode === 'freeze' ? 1 : 0;
    this.climateMix += (targetMix - this.climateMix) * Math.min(1, dt * 2.2);
    if (this.climateWipeProgress > 0 && this.climateWipeProgress < 1) {
      this.climateWipeProgress = Math.min(1, this.climateWipeProgress + dt * 1.4);
      if (this.climateWipeProgress >= 1) this.climateWipeProgress = 0;
    }
  }

  spawnChapterHazard(chId, diff) {
    const w = this.game.width;
    const gInfo = this.game.world.getGroundAt(w + 60);
    const groundY = gInfo.y || this.game.world.groundY;

    if (chId === 'geophysical') {
      const r = Math.random();
      if (r < 0.36) {
        // Volcanic Lava Bomb arcing down onto target ring
        this.hazards.push({
          type: 'lava_bomb',
          x: this.game.player.x + 280 + Math.random() * 240,
          y: -40,
          targetY: groundY,
          vx: -110,
          vy: 380 + diff * 140,
          radius: 17,
          active: true
        });
      } else if (r < 0.7) {
        // Landslide Cascade: 2 staggered rolling boulders
        for (let b = 0; b < 2; b++) {
          this.hazards.push({
            type: 'landslide_rock',
            x: w + 70 + b * 115,
            y: groundY,
            radius: 19,
            speed: 145 + diff * 80,
            rot: 0,
            active: true
          });
        }
      } else {
        // Collapsing Temple Pillar (tilts downward into low/jump hazard)
        this.hazards.push({
          type: 'collapsing_pillar',
          x: w + 80,
          y: groundY,
          width: 34,
          height: 54,
          tilt: 0,
          active: true
        });
      }
    } else if (chId === 'hydrological') {
      const r = Math.random();
      if (r < 0.45) {
        // Flash Flood / Cresting Powerful Wave
        this.hazards.push({
          type: 'flood_wave',
          x: w + 90,
          y: groundY,
          width: 72,
          height: 50,
          speed: 170 + diff * 90,
          wavePhase: 0,
          active: true
        });
      } else {
        // Water Geyser Spout / Whirlpool Spout with brief telegraph
        this.hazards.push({
          type: 'water_spout',
          x: w + 60,
          y: groundY,
          width: 34,
          height: 62,
          timer: 0,
          active: true
        });
      }
    } else if (chId === 'meteorological') {
      const r = Math.random();
      if (r < 0.38) {
        // Swirling Tornado / Cyclone Funnel
        this.hazards.push({
          type: 'tornado',
          x: w + 90,
          y: groundY,
          width: 46,
          height: 112,
          speed: 95 + diff * 75,
          spin: 0,
          active: true
        });
      } else if (r < 0.72) {
        // Telegraphed Lightning Bolt Strike
        this.hazards.push({
          type: 'lightning_strike',
          x: Math.min(w - 90, this.game.player.x + 260 + Math.random() * 200),
          y: groundY,
          warnTimer: 1.05,
          strikeTimer: 0.35,
          struck: false,
          active: true
        });
      } else {
        // Flying Storm Debris (mid-air plank height -> SLIDE under!)
        this.hazards.push({
          type: 'flying_debris',
          x: w + 70,
          y: groundY - 46,
          width: 48,
          height: 20,
          speed: 220 + diff * 90,
          rot: 0,
          active: true
        });
      }
    } else if (chId === 'climatological') {
      if (this.climateMode === 'heat') {
        // Drought Thermal Vent / Wildfire Surge
        if (Math.random() < 0.5) {
          this.hazards.push({
            type: 'wildfire_wall',
            x: w + 60,
            y: groundY,
            width: 50,
            height: 44,
            flicker: 0,
            active: true
          });
        } else {
          this.hazards.push({
            type: 'thermal_vent',
            x: w + 70,
            y: groundY,
            width: 34,
            height: 68,
            timer: 0,
            active: true
          });
        }
      } else {
        // Freezing Icicle Barrier (slide under) or Jagged Ice Spike Wall (jump)
        if (Math.random() < 0.5) {
          this.hazards.push({
            type: 'icicle_barrier',
            x: w + 80,
            y: groundY,
            width: 52,
            height: 74,
            clearanceY: 32,
            active: true
          });
        } else {
          this.hazards.push({
            type: 'ice_spike',
            x: w + 70,
            y: groundY,
            width: 42,
            height: 46,
            active: true
          });
        }
      }
    }
  }

  updateHazards(dt, worldSpeed) {
    const Utils = window.OopsWorld.Utils;
    const player = this.game.player;

    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i];
      if (!h.active) {
        this.hazards.splice(i, 1);
        continue;
      }

      if (h.type === 'lava_bomb') {
        h.x += (h.vx - worldSpeed * 0.45) * dt;
        h.y += h.vy * dt;
        if (Math.random() < 0.4) {
          this.game.particles.spawn(h.x, h.y, { color: '#FF6B35', radius: 4, life: 0.3 });
        }
        const g = this.game.world.getGroundAt(h.x);
        if (h.y >= (g.y || h.targetY) - 6) {
          this.game.particles.explosion(h.x, g.y || h.targetY);
          this.game.camera.addTrauma(0.32);
          h.active = false;
          continue;
        }
        if (Utils.circleRectIntersect({ x: h.x, y: h.y, radius: h.radius }, player.hitbox)) {
          if (player.powerups.speedTimer > 0) {
            h.active = false;
            this.game.particles.explosion(h.x, h.y);
          } else {
            player.takeDamage(1);
            h.active = false;
          }
          continue;
        }
      } else if (h.type === 'landslide_rock') {
        h.x -= (worldSpeed + h.speed) * dt;
        h.rot -= 7 * dt;
        const g = this.game.world.getGroundAt(h.x);
        if (!g.isGap) h.y = g.y;
        const hitCircle = { x: h.x, y: h.y - h.radius, radius: h.radius };
        if (Utils.circleRectIntersect(hitCircle, player.hitbox)) {
          if (player.powerups.speedTimer > 0) {
            h.active = false;
            this.game.particles.explosion(h.x, h.y - 18);
          } else {
            player.takeDamage(1);
          }
        }
      } else if (h.type === 'collapsing_pillar') {
        h.x -= worldSpeed * dt;
        if (h.x < this.game.width * 0.72) {
          h.tilt = Math.min(0.45, h.tilt + dt * 1.4);
        }
        const box = { x: h.x - h.width / 2, y: h.y - h.height, width: h.width, height: h.height };
        if (Utils.rectIntersect(box, player.hitbox)) {
          if (player.powerups.speedTimer > 0) {
            h.active = false;
            this.game.particles.explosion(h.x, h.y - 25);
          } else {
            player.takeDamage(1);
          }
        }
      } else if (h.type === 'flood_wave') {
        h.x -= (worldSpeed + h.speed) * dt;
        h.wavePhase += dt * 10;
        const box = { x: h.x - h.width / 2, y: h.y - h.height, width: h.width, height: h.height };
        if (Utils.rectIntersect(box, player.hitbox)) {
          if (player.powerups.speedTimer > 0) {
            h.active = false;
          } else {
            player.takeDamage(1);
          }
        }
      } else if (h.type === 'water_spout' || h.type === 'thermal_vent') {
        h.x -= worldSpeed * dt;
        h.timer += dt;
        const activeH = Math.abs(Math.sin(h.timer * 3.5)) * h.height;
        if (activeH > 18) {
          const box = { x: h.x - h.width / 2, y: h.y - activeH, width: h.width, height: activeH };
          if (Utils.rectIntersect(box, player.hitbox)) {
            if (player.powerups.speedTimer > 0) {
              h.active = false;
            } else {
              player.takeDamage(1);
            }
          }
        }
      } else if (h.type === 'tornado') {
        h.x -= (worldSpeed + h.speed) * dt;
        h.spin += dt * 14;
        const box = { x: h.x - 20, y: h.y - h.height, width: 40, height: h.height };
        if (Utils.rectIntersect(box, player.hitbox)) {
          if (player.powerups.speedTimer > 0) {
            h.active = false;
            this.game.particles.explosion(h.x, h.y - 50);
          } else {
            player.takeDamage(1);
          }
        }
      } else if (h.type === 'lightning_strike') {
        h.x -= worldSpeed * 0.28 * dt;
        if (!h.struck) {
          h.warnTimer -= dt;
          if (h.warnTimer <= 0) {
            h.struck = true;
            this.game.camera.addTrauma(0.45);
            this.game.audio.playDamage();
            this.game.particles.burst(h.x, h.y - 12, 14, { color: '#A29BFE', shape: 'star', minSpeed: 70, maxSpeed: 200 });
            const strikeBox = { x: h.x - 22, y: 0, width: 44, height: h.y };
            if (Utils.rectIntersect(strikeBox, player.hitbox)) {
              player.takeDamage(1);
            }
          }
        } else {
          h.strikeTimer -= dt;
          if (h.strikeTimer <= 0) h.active = false;
        }
      } else if (h.type === 'flying_debris') {
        h.x -= (worldSpeed + h.speed) * dt;
        h.rot += dt * 9;
        const box = { x: h.x - h.width / 2, y: h.y - h.height / 2, width: h.width, height: h.height };
        if (Utils.rectIntersect(box, player.hitbox)) {
          if (player.powerups.speedTimer > 0) {
            h.active = false;
          } else {
            player.takeDamage(1);
          }
        }
      } else if (h.type === 'wildfire_wall' || h.type === 'ice_spike') {
        h.x -= worldSpeed * dt;
        h.flicker = (h.flicker || 0) + dt * 12;
        const box = { x: h.x - h.width / 2, y: h.y - h.height, width: h.width, height: h.height };
        if (Utils.rectIntersect(box, player.hitbox)) {
          if (player.powerups.speedTimer > 0) {
            h.active = false;
            this.game.particles.explosion(h.x, h.y - 20);
          } else {
            player.takeDamage(1);
          }
        }
      } else if (h.type === 'icicle_barrier') {
        h.x -= worldSpeed * dt;
        const box = { x: h.x - h.width / 2, y: h.y - h.height, width: h.width, height: h.height - h.clearanceY };
        if (Utils.rectIntersect(box, player.hitbox)) {
          if (player.powerups.speedTimer > 0) {
            h.active = false;
          } else {
            player.takeDamage(1);
          }
        }
      }

      if (h.x < -120) {
        h.active = false;
      }
    }
  }

  drawHazards(ctx) {
    if (!this.activeChapter) return;
    const chId = this.activeChapter.id;

    // Chapter 2: Draw rising flooded water sheen across lower gameplay area
    if (chId === 'hydrological' && this.waterRiseLevel > 2) {
      const surfaceY = this.game.world.groundY - this.waterRiseLevel + 16;
      ctx.save();
      ctx.fillStyle = 'rgba(0, 168, 255, 0.32)';
      ctx.beginPath();
      ctx.moveTo(0, this.game.height);
      for (let wx = 0; wx <= this.game.width + 30; wx += 28) {
        const wy = surfaceY + Math.sin(wx * 0.03 + this.time * 7) * 5;
        ctx.lineTo(wx, wy);
      }
      ctx.lineTo(this.game.width + 30, this.game.height);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(200, 245, 255, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let wx = 0; wx <= this.game.width + 30; wx += 28) {
        const wy = surfaceY + Math.sin(wx * 0.03 + this.time * 7) * 5;
        if (wx === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Chapter 3: Driving horizontal wind streaks when windForce != 0
    if (chId === 'meteorological' && this.windForce !== 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(220, 230, 255, 0.4)';
      ctx.lineWidth = 2;
      const dir = this.windForce < 0 ? -1 : 1;
      for (let i = 0; i < 10; i++) {
        const sx = ((i * 120 + this.time * 540 * dir) % this.game.width + this.game.width) % this.game.width;
        const sy = 90 + (i * 42) % 300;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + 60 * dir, sy + 4);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Chapter 4: Frost vignette / heat shimmer border
    if (chId === 'climatological') {
      ctx.save();
      if (this.climateMix > 0.25) {
        ctx.strokeStyle = `rgba(130, 235, 255, ${this.climateMix * 0.45})`;
        ctx.lineWidth = 14;
        ctx.strokeRect(0, 0, this.game.width, this.game.height);
      } else {
        ctx.fillStyle = 'rgba(255, 110, 20, 0.08)';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
      }
      ctx.restore();
    }

    // Draw stranded friend landmark ahead during final 18 meters of chapter!
    const dist = this.game.world.distance;
    const rem = this.activeChapter.targetDistance - dist;
    if (rem > 0 && rem <= 18 && this.game.state === 'playing') {
      const friendX = this.game.player.x + rem * 42;
      const groundY = this.game.world.groundY;
      this.drawStrandedFriendGoal(ctx, friendX, groundY, this.activeChapter);
    }

    // Draw individual chapter hazards
    for (let i = 0; i < this.hazards.length; i++) {
      const h = this.hazards[i];
      if (!h.active) continue;
      ctx.save();
      if (h.type === 'lava_bomb') {
        ctx.fillStyle = '#FF4757';
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Landing indicator on ground
        ctx.strokeStyle = 'rgba(255, 87, 34, 0.75)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(h.x, h.targetY - 2, 18, 6, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (h.type === 'landslide_rock') {
        ctx.translate(h.x, h.y - h.radius);
        ctx.rotate(h.rot);
        ctx.fillStyle = '#5D4037';
        ctx.strokeStyle = '#2C1B12';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, h.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = '#FF6B35';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-8, -8);
        ctx.lineTo(8, 8);
        ctx.stroke();
      } else if (h.type === 'collapsing_pillar') {
        ctx.translate(h.x, h.y);
        ctx.rotate(-h.tilt);
        ctx.fillStyle = '#636E72';
        ctx.strokeStyle = '#2D3436';
        ctx.lineWidth = 2.5;
        ctx.fillRect(-h.width / 2, -h.height, h.width, h.height);
        ctx.strokeRect(-h.width / 2, -h.height, h.width, h.height);
        ctx.strokeStyle = '#FF6B35';
        ctx.beginPath();
        ctx.moveTo(-10, -h.height + 10);
        ctx.lineTo(8, -h.height / 2);
        ctx.lineTo(-6, -12);
        ctx.stroke();
      } else if (h.type === 'flood_wave') {
        ctx.translate(h.x, h.y);
        ctx.fillStyle = '#0984E3';
        ctx.beginPath();
        ctx.moveTo(-h.width / 2, 0);
        ctx.quadraticCurveTo(-h.width * 0.2, -h.height - Math.sin(h.wavePhase) * 6, h.width * 0.15, -h.height);
        ctx.quadraticCurveTo(h.width * 0.4, -h.height * 0.4, h.width / 2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#DFF9FB';
        ctx.lineWidth = 3;
        ctx.stroke();
      } else if (h.type === 'water_spout' || h.type === 'thermal_vent') {
        const curH = Math.max(8, Math.abs(Math.sin(h.timer * 3.5)) * h.height);
        ctx.fillStyle = h.type === 'water_spout' ? 'rgba(0, 210, 255, 0.8)' : 'rgba(255, 87, 34, 0.85)';
        ctx.fillRect(h.x - h.width / 2, h.y - curH, h.width, curH);
        ctx.fillStyle = h.type === 'water_spout' ? '#FFFFFF' : '#FFD700';
        ctx.beginPath();
        ctx.ellipse(h.x, h.y - curH, h.width * 0.65, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (h.type === 'tornado') {
        for (let ring = 0; ring < 9; ring++) {
          const rRatio = ring / 9;
          const ry = h.y - rRatio * h.height;
          const rx = h.x + Math.sin(h.spin + ring) * 9;
          const rw = 10 + rRatio * 26;
          ctx.fillStyle = `rgba(162, 155, 254, ${0.75 - rRatio * 0.3})`;
          ctx.beginPath();
          ctx.ellipse(rx, ry, rw, 8, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (h.type === 'lightning_strike') {
        if (!h.struck) {
          ctx.fillStyle = `rgba(255, 234, 167, ${0.25 + Math.sin(this.time * 24) * 0.15})`;
          ctx.fillRect(h.x - 16, 0, 32, h.y);
          ctx.fillStyle = '#FFD700';
          ctx.font = 'bold 20px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('⚡', h.x, h.y - 45);
        } else {
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(h.x, 0);
          ctx.lineTo(h.x - 14, h.y * 0.35);
          ctx.lineTo(h.x + 16, h.y * 0.65);
          ctx.lineTo(h.x, h.y);
          ctx.stroke();
          ctx.strokeStyle = '#A29BFE';
          ctx.lineWidth = 12;
          ctx.globalAlpha = 0.45;
          ctx.stroke();
        }
      } else if (h.type === 'flying_debris') {
        ctx.translate(h.x, h.y);
        ctx.rotate(h.rot);
        ctx.fillStyle = '#8B5A2B';
        ctx.strokeStyle = '#2C3E50';
        ctx.lineWidth = 2;
        ctx.fillRect(-h.width / 2, -h.height / 2, h.width, h.height);
        ctx.strokeRect(-h.width / 2, -h.height / 2, h.width, h.height);
      } else if (h.type === 'wildfire_wall') {
        for (let fl = -1; fl <= 1; fl++) {
          const fx = h.x + fl * 14;
          const fh = h.height + Math.sin(h.flicker + fl) * 10;
          ctx.fillStyle = fl === 0 ? '#FFD700' : '#FF5722';
          ctx.beginPath();
          ctx.moveTo(fx - 12, h.y);
          ctx.quadraticCurveTo(fx, h.y - fh * 1.2, fx + 12, h.y);
          ctx.fill();
        }
      } else if (h.type === 'ice_spike') {
        ctx.fillStyle = '#74C0FC';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(h.x - 20, h.y);
        ctx.lineTo(h.x - 6, h.y - h.height);
        ctx.lineTo(h.x + 4, h.y - h.height * 0.6);
        ctx.lineTo(h.x + 12, h.y - h.height * 0.85);
        ctx.lineTo(h.x + 22, h.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (h.type === 'icicle_barrier') {
        const topY = h.y - h.height;
        const boxH = h.height - h.clearanceY;
        ctx.fillStyle = '#00D2D3';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.fillRect(h.x - h.width / 2, topY, h.width, boxH);
        ctx.strokeRect(h.x - h.width / 2, topY, h.width, boxH);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SLIDE ⬇', h.x, h.y - 16);
      }
      ctx.restore();
    }
  }

  drawStrandedFriendGoal(ctx, x, groundY, ch) {
    ctx.save();
    ctx.translate(x, groundY);
    // Rescue Beacon Beam
    ctx.fillStyle = 'rgba(46, 213, 115, 0.28)';
    ctx.fillRect(-26, -320, 52, 320);
    // Friend waiting!
    this.drawFriendSprite(ctx, ch.friendId, 0, 0, this.time, true);
    ctx.fillStyle = '#2ED573';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`RESCUE ${ch.friendName.toUpperCase()}!`, 0, -72);
    ctx.restore();
  }

  drawFriendSprite(ctx, friendId, x, y, t, distressed = false) {
    ctx.save();
    ctx.translate(x, y);
    const bounce = distressed ? Math.abs(Math.sin(t * 7)) * 6 : Math.abs(Math.sin(t * 5)) * 10;
    ctx.translate(0, -bounce);

    const player = this.game.player;
    if (player) {
      const prevId = player.characterId;
      const prevCycle = player.runCycle;
      player.characterId = friendId;
      player.runCycle = t * 8;
      player.drawCharacterBody(ctx);
      player.characterId = prevId;
      player.runCycle = prevCycle;
    }
    ctx.restore();
  }

  drawChapterIntro(ctx, w, h, ui) {
    const ch = this.activeChapter || CHAPTER_CARDS[0];
    ctx.save();
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, ch.bgTop);
    g.addColorStop(0.6, ch.bgMid);
    g.addColorStop(1, '#0B0F19');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Card visual preview backdrop
    this.drawCardPreview(ctx, ch.id, w * 0.08, 72, w * 0.84, 215, this.introTimer, false);

    // Friend on stage calling out
    ctx.save();
    ctx.translate(w * 0.72, 268);
    ctx.scale(1.45, 1.45);
    this.drawFriendSprite(ctx, ch.friendId, 0, 0, this.introTimer, true);
    ctx.restore();

    // Story Card Panel
    const cardW = Math.min(720, w - 64);
    const cardX = w / 2 - cardW / 2;
    const cardY = 305;
    ctx.fillStyle = 'rgba(10, 15, 29, 0.92)';
    ui.roundRect(ctx, cardX, cardY, cardW, 195, 16);
    ctx.fill();
    ctx.strokeStyle = ch.color;
    ctx.lineWidth = 2.5;
    ui.roundRect(ctx, cardX, cardY, cardW, 195, 16);
    ctx.stroke();

    ctx.fillStyle = ch.color;
    ctx.font = '900 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`CHAPTER ${ch.number}: ${ch.title}`, w / 2, cardY + 28);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`${ch.icon} RESCUE ${ch.friendName.toUpperCase()}`, w / 2, cardY + 58);

    ctx.fillStyle = '#FFEAA7';
    ctx.font = 'italic 15px sans-serif';
    ctx.fillText(ch.introLine, w / 2, cardY + 95);

    ctx.fillStyle = '#7BED9F';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`🎯 OBJECTIVE: Survive ${ch.targetDistance}m · Reward: +${ch.rewardCoins} 🪙 & Unlock ${ch.friendName}!`, w / 2, cardY + 132);

    ui.drawButton(ctx, 'intro_start_btn', w / 2 - 140, cardY + 150, 280, 44, '▶ START EXPEDITION', '#2ED573', '#FFFFFF', () => {
      this.game.beginActiveChapterGameplay();
    });

    ui.drawButton(ctx, 'intro_back_btn', 24, 24, 120, 40, '◀ BACK', '#485460', '#FFFFFF', () => {
      this.game.state = 'disasters';
    });

    ctx.restore();
  }

  drawRescueCutscene(ctx, w, h, ui) {
    const ch = this.activeChapter || CHAPTER_CARDS[0];
    const outcome = this.rescueOutcome || { coinsAwarded: ch.rewardCoins, firstCompletion: true, unlockedChapterId: null };

    ctx.save();
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#0F2027');
    g.addColorStop(0.55, '#203A43');
    g.addColorStop(1, '#2C5364');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Celebrating sunrise glow
    const sunGrad = ctx.createRadialGradient(w / 2, 220, 20, w / 2, 220, 260);
    sunGrad.addColorStop(0, 'rgba(46, 213, 115, 0.45)');
    sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, w, h);

    // Grass stage
    ctx.fillStyle = '#27AE60';
    ctx.fillRect(0, 265, w, 40);

    // Bobo and newly rescued friend side-by-side celebrating!
    ctx.save();
    ctx.translate(w / 2 - 58, 270 - Math.abs(Math.sin(this.rescueAnimTimer * 6)) * 12);
    ctx.scale(1.45, 1.45);
    const prevId = this.game.player.characterId;
    this.game.player.characterId = 'bobo';
    this.game.player.drawBobo(ctx, false, false, false);
    this.game.player.characterId = prevId;
    ctx.restore();

    ctx.save();
    ctx.translate(w / 2 + 58, 270);
    ctx.scale(1.45, 1.45);
    this.drawFriendSprite(ctx, ch.friendId, 0, 0, this.rescueAnimTimer, false);
    ctx.restore();

    // Header
    ctx.fillStyle = '#2ED573';
    ctx.font = '900 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🎉 FRIEND RESCUED: ${ch.friendName.toUpperCase()}! 🎉`, w / 2, 65);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`CHAPTER ${ch.number} (${ch.title}) COMPLETED!`, w / 2, 98);

    // Summary card
    const boxW = Math.min(640, w - 64);
    const boxX = w / 2 - boxW / 2;
    const boxY = 320;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ui.roundRect(ctx, boxX, boxY, boxW, 165, 16);
    ctx.fill();
    ctx.strokeStyle = '#2ED573';
    ctx.lineWidth = 2;
    ui.roundRect(ctx, boxX, boxY, boxW, 165, 16);
    ctx.stroke();

    ctx.fillStyle = '#FFFDF7';
    ctx.font = 'italic bold 15px sans-serif';
    ctx.fillText(ch.rescueLine, w / 2, boxY + 34);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText(`🪙 Reward Earned: +${outcome.coinsAwarded} Coins  |  👥 ${ch.friendName} Unlocked for Play!`, w / 2, boxY + 72);

    ctx.fillStyle = '#00F0FF';
    ctx.font = 'bold 14px sans-serif';
    if (ch.number < 4) {
      const nextMeta = this.getCardMeta(outcome.unlockedChapterId);
      ctx.fillText(`🔓 NEXT UNLOCKED: Chapter ${nextMeta.number} — ${nextMeta.title}`, w / 2, boxY + 106);
    } else {
      ctx.fillText('🏆 PHASE 1 COMPLETE! Chapters 1–4 Cleared & All 4 Friends Rescued! (Ch. 5–6 in Phase 2)', w / 2, boxY + 106);
    }

    const btnY = boxY + 185;
    if (ch.number < 4 && outcome.unlockedChapterId) {
      ui.drawButton(ctx, 'rescue_next_btn', w / 2 - 280, btnY, 180, 46, '▶ NEXT CHAPTER', '#2ED573', '#FFFFFF', () => {
        this.startIntro(outcome.unlockedChapterId);
      });
      ui.drawButton(ctx, 'rescue_worlds_btn', w / 2 - 85, btnY, 170, 46, '🌍 WORLDS', '#00D2FF', '#001A33', () => {
        this.game.state = 'disasters';
      });
      ui.drawButton(ctx, 'rescue_menu_btn', w / 2 + 100, btnY, 180, 46, '🏠 MAIN MENU', '#485460', '#FFFFFF', () => {
        this.game.state = 'menu';
      });
    } else {
      ui.drawButton(ctx, 'rescue_worlds_btn', w / 2 - 190, btnY, 180, 46, '🌍 WORLD SELECT', '#00D2FF', '#001A33', () => {
        this.game.state = 'disasters';
      });
      ui.drawButton(ctx, 'rescue_menu_btn', w / 2 + 10, btnY, 180, 46, '🏠 MAIN MENU', '#2ED573', '#FFFFFF', () => {
        this.game.state = 'menu';
      });
    }

    ctx.restore();
  }

  // Animated 2D preview rendered inside each disaster card on World Selection
  drawCardPreview(ctx, chapterId, x, y, w, h, t, isLocked) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    if (chapterId === 'geophysical') {
      const g = ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0, '#2B0905');
      g.addColorStop(1, '#9E3214');
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
      // Volcano silhouette + magma
      ctx.fillStyle = '#241512';
      ctx.beginPath();
      ctx.moveTo(x + w * 0.25, y + h);
      ctx.lineTo(x + w * 0.44, y + h * 0.28);
      ctx.lineTo(x + w * 0.56, y + h * 0.28);
      ctx.lineTo(x + w * 0.78, y + h);
      ctx.fill();
      ctx.fillStyle = '#FFA502';
      for (let i = 0; i < 4; i++) {
        const cyc = (t * 1.3 + i * 0.35) % 1;
        ctx.beginPath();
        ctx.arc(x + w * 0.5 + (i - 1.5) * 18 * cyc, y + h * 0.28 - 22 * Math.sin(cyc * Math.PI), 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = '#FF5722';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x + 15, y + h - 8);
      ctx.lineTo(x + w * 0.4, y + h - 16);
      ctx.lineTo(x + w * 0.75, y + h - 6);
      ctx.stroke();
    } else if (chapterId === 'hydrological') {
      const g = ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0, '#0D1B2A');
      g.addColorStop(1, '#1B4965');
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#00A8FF';
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      for (let px = 0; px <= w; px += 14) {
        ctx.lineTo(x + px, y + h * 0.52 + Math.sin(px * 0.08 - t * 6) * 8);
      }
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#E0FBFC';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (chapterId === 'meteorological') {
      const g = ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0, '#120C24');
      g.addColorStop(1, '#3D2C66');
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
      const tx = x + w * 0.62 + Math.sin(t * 2) * 18;
      for (let r = 0; r < 6; r++) {
        ctx.fillStyle = 'rgba(162, 155, 254, 0.55)';
        ctx.beginPath();
        ctx.ellipse(tx + Math.sin(t * 8 + r) * 3, y + 14 + r * 8, 22 - r * 2.5, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      if (Math.sin(t * 9) > 0.4) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.25, y);
        ctx.lineTo(x + w * 0.28, y + h * 0.55);
        ctx.lineTo(x + w * 0.23, y + h * 0.9);
        ctx.stroke();
      }
    } else if (chapterId === 'climatological') {
      // Split Wildfire Heat (left) vs Ice Blizzard (right)
      ctx.fillStyle = '#B83B0B';
      ctx.fillRect(x, y, w / 2, h);
      ctx.fillStyle = '#144272';
      ctx.fillRect(x + w / 2, y, w / 2, h);
      for (let f = 0; f < 4; f++) {
        const fx = x + 16 + f * (w * 0.11);
        const fh = 16 + Math.sin(t * 8 + f) * 5;
        ctx.fillStyle = '#FFC300';
        ctx.beginPath();
        ctx.moveTo(fx - 7, y + h);
        ctx.quadraticCurveTo(fx, y + h - fh, fx + 7, y + h);
        ctx.fill();
      }
      ctx.fillStyle = '#74C0FC';
      for (let ic = 0; ic < 4; ic++) {
        const ix = x + w * 0.56 + ic * (w * 0.11);
        ctx.beginPath();
        ctx.moveTo(ix - 6, y + h);
        ctx.lineTo(ix, y + h - 22);
        ctx.lineTo(ix + 6, y + h);
        ctx.fill();
      }
    } else if (chapterId === 'biological') {
      ctx.fillStyle = '#0D261A';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = 'rgba(46, 213, 115, 0.55)';
      for (let s = 0; s < 8; s++) {
        const sx = x + ((s * 43 + t * 22) % w);
        const sy = y + ((s * 27 + Math.sin(t * 3 + s) * 10) % h);
        ctx.beginPath();
        ctx.arc(sx, sy, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (chapterId === 'extraterrestrial') {
      ctx.fillStyle = '#090418';
      ctx.fillRect(x, y, w, h);
      for (let m = 0; m < 3; m++) {
        const cyc = (t * 0.8 + m * 0.33) % 1;
        const mx = x + w * (0.3 + m * 0.25) - cyc * 45;
        const my = y + cyc * h;
        ctx.strokeStyle = '#FF4757';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(mx + 14, my - 16);
        ctx.lineTo(mx, my);
        ctx.stroke();
      }
    }

    if (isLocked) {
      ctx.fillStyle = 'rgba(5, 8, 16, 0.58)';
      ctx.fillRect(x, y, w, h);
    }
    ctx.restore();
  }
}

window.OopsWorld.CHAPTER_CARDS = CHAPTER_CARDS;
window.OopsWorld.ChapterDirector = ChapterDirector;
