// OOPS! WORLD - User Interface & HUD Engine
window.OopsWorld = window.OopsWorld || {};

class UIManager {
  constructor(game) {
    this.game = game;
    this.activeToast = null;
    this.toastTimer = 0;

    this.touchButtons = {
      jump: { x: 0, y: 0, radius: 46, pressed: false },
      slide: { x: 0, y: 0, radius: 46, pressed: false },
      pause: { x: 0, y: 0, width: 44, height: 44, pressed: false }
    };

    this.buttons = [];
  }

  showToast(text, color = '#FF4757', duration = 2.5) {
    this.activeToast = { text, color, duration, maxDuration: duration };
    this.toastTimer = duration;
  }

  update(dt) {
    if (this.toastTimer > 0) {
      this.toastTimer -= dt;
      if (this.toastTimer <= 0) {
        this.activeToast = null;
      }
    }

    const w = this.game.width;
    const h = this.game.height;

    this.touchButtons.jump.x = w - 75;
    this.touchButtons.jump.y = h - 70;

    this.touchButtons.slide.x = 75;
    this.touchButtons.slide.y = h - 70;

    this.touchButtons.pause.x = w - 60;
    this.touchButtons.pause.y = 18;
  }

  registerButton(id, x, y, width, height, onClick) {
    this.buttons.push({ id, x, y, width, height, onClick });
  }

  clearButtons() {
    this.buttons = [];
  }

  handleClick(x, y) {
    if (this.game.state === 'playing') {
      const p = this.touchButtons.pause;
      if (x >= p.x && x <= p.x + p.width && y >= p.y && y <= p.y + p.height) {
        this.game.togglePause();
        return true;
      }
    }

    for (let i = 0; i < this.buttons.length; i++) {
      const b = this.buttons[i];
      if (x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height) {
        this.game.audio.playClick();
        b.onClick();
        return true;
      }
    }
    return false;
  }

  draw(ctx) {
    this.clearButtons();

    switch (this.game.state) {
      case 'menu':
        this.drawMainMenu(ctx);
        break;
      case 'playing':
        this.drawHUD(ctx);
        this.drawTouchControls(ctx);
        break;
      case 'paused':
        this.drawHUD(ctx);
        this.drawPauseMenu(ctx);
        break;
      case 'gameover':
        this.drawGameOver(ctx);
        break;
      case 'shop_chars':
        this.drawCharacterShop(ctx);
        break;
      case 'shop_themes':
        this.drawThemeShop(ctx);
        break;
      case 'settings':
        this.drawSettings(ctx);
        break;
      case 'howto':
        this.drawHowToPlay(ctx);
        break;
    }

    this.drawToast(ctx);
  }

  drawHUD(ctx) {
    const player = this.game.player;
    ctx.save();

    const heartSpacing = 30;
    for (let i = 0; i < player.maxHealth; i++) {
      const hx = 28 + i * heartSpacing;
      const hy = 32;
      const filled = i < player.health;

      const beat = (player.health === 1 && filled) ? (1 + Math.sin(Date.now() / 120) * 0.18) : 1;

      ctx.save();
      ctx.translate(hx, hy);
      ctx.scale(beat, beat);

      ctx.fillStyle = filled ? '#FF4757' : '#57606F';
      ctx.strokeStyle = filled ? '#C23616' : '#2F3542';
      ctx.lineWidth = 2;

      const s = 3.6;
      ctx.beginPath();
      ctx.moveTo(0, s);
      ctx.bezierCurveTo(-s * 2.5, -s, -s * 2.5, -s * 3.5, 0, -s * 4.5);
      ctx.bezierCurveTo(s * 2.5, -s * 3.5, s * 2.5, -s, 0, s);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    const distText = `${Math.floor(this.game.world.distance)}m`;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    this.roundRect(ctx, 130, 18, 90, 30, 8);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🏃 ${distText}`, 138, 38);

    const coinText = `${this.game.coinsCollected}`;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    this.roundRect(ctx, 230, 18, 85, 30, 8);
    ctx.fill();

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(`🪙 ${coinText}`, 238, 38);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    this.roundRect(ctx, 325, 18, 110, 30, 8);
    ctx.fill();

    ctx.fillStyle = '#2ED573';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(`⭐ ${this.game.score}`, 334, 38);

    this.drawPowerupTimers(ctx);

    const p = this.touchButtons.pause;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.roundRect(ctx, p.x, p.y, p.width, p.height, 8);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.8;
    this.roundRect(ctx, p.x, p.y, p.width, p.height, 8);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(p.x + 13, p.y + 11, 6, 22);
    ctx.fillRect(p.x + 25, p.y + 11, 6, 22);

    ctx.restore();
  }

  drawPowerupTimers(ctx) {
    const p = this.game.player.powerups;
    const active = [];

    if (p.shield) active.push({ name: 'SHIELD', icon: '🛡️', color: '#00F0FF', progress: 1 });
    if (p.magnetTimer > 0) active.push({ name: 'MAGNET', icon: '🧲', color: '#FFD700', progress: p.magnetTimer / 11 });
    if (p.speedTimer > 0) active.push({ name: 'SPEED', icon: '⚡', color: '#FF4757', progress: p.speedTimer / 6.5 });
    if (p.doubleCoinsTimer > 0) active.push({ name: '2X COINS', icon: '🪙', color: '#FFA502', progress: p.doubleCoinsTimer / 12 });
    if (p.slowMoTimer > 0) active.push({ name: 'SLOW-MO', icon: '⏱️', color: '#70A1FF', progress: p.slowMoTimer / 7 });

    const startX = 28;
    const startY = 66;

    active.forEach((item, idx) => {
      const bx = startX + idx * 72;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      this.roundRect(ctx, bx, startY, 66, 24, 6);
      ctx.fill();

      ctx.strokeStyle = item.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx + 6, startY + 22);
      ctx.lineTo(bx + 6 + 54 * item.progress, startY + 22);
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${item.icon} ${item.name}`, bx + 6, startY + 14);
    });
  }

  drawTouchControls(ctx) {
    // Replaced by futuristic geometric DOM control panels (#ctrl-slide and #ctrl-jump)
  }

  drawMainMenu(ctx) {
    const w = this.game.width;
    const h = this.game.height;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(0, 0, w, h);

    const titleBob = Math.sin(Date.now() / 200) * 8;
    ctx.save();
    ctx.translate(w / 2, 85 + titleBob);

    ctx.font = '900 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FF4757';
    ctx.fillText('OOPS!', 0, 0);

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.strokeText('OOPS!', 0, 0);

    ctx.font = '900 24px sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.fillText('★ ENDLESS SURVIVAL WORLD ★', 0, 36);

    ctx.restore();

    ctx.save();
    ctx.translate(w / 2, 195 + Math.sin(Date.now() / 180) * 6);
    this.game.player.drawBobo(ctx, false, false, false);
    ctx.restore();

    const storage = this.game.storage.data;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    this.roundRect(ctx, w / 2 - 180, 245, 360, 38, 12);
    ctx.fill();

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🏆 BEST: ${storage.highScore} pts  |  🪙 COINS: ${storage.totalCoins}`, w / 2, 270);

    this.drawButton(ctx, 'play_btn', w / 2 - 110, 305, 220, 52, '▶ PLAY GAME', '#2ED573', '#FFFFFF', () => {
      this.game.startPlaying();
    });

    const btnW = 105;
    const btnH = 40;
    const btnY = 375;

    this.drawButton(ctx, 'chars_btn', w / 2 - 225, btnY, btnW, btnH, '👥 HEROES', '#70A1FF', '#FFFFFF', () => {
      this.game.state = 'shop_chars';
    });

    this.drawButton(ctx, 'themes_btn', w / 2 - 110, btnY, btnW, btnH, '🌄 THEMES', '#FFA502', '#FFFFFF', () => {
      this.game.state = 'shop_themes';
    });

    this.drawButton(ctx, 'settings_btn', w / 2 + 5, btnY, btnW, btnH, '⚙ SETTINGS', '#747D8C', '#FFFFFF', () => {
      this.game.state = 'settings';
    });

    this.drawButton(ctx, 'howto_btn', w / 2 + 120, btnY, btnW, btnH, '❓ GUIDE', '#9B59B6', '#FFFFFF', () => {
      this.game.state = 'howto';
    });
  }

  drawGameOver(ctx) {
    const w = this.game.width;
    const h = this.game.height;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(w / 2, 70);
    ctx.font = '900 52px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FF4757';
    ctx.fillText('OOPS!', 0, 0);

    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#FFA502';
    ctx.fillText('BOBO WIPED OUT!', 0, 32);
    ctx.restore();

    const cardW = 320;
    const cardH = 175;
    const cardX = w / 2 - cardW / 2;
    const cardY = 125;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    this.roundRect(ctx, cardX, cardY, cardW, cardH, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, cardX, cardY, cardW, cardH, 16);
    ctx.stroke();

    const statRows = [
      { label: 'Distance Survived:', val: `${Math.floor(this.game.world.distance)} meters` },
      { label: 'Coins Collected:', val: `+${this.game.coinsCollected} 🪙` },
      { label: 'Enemies Stomped:', val: `${this.game.enemiesStomped} 💥` },
      { label: 'Disasters Survived:', val: `${this.game.disastersSurvived} ⚠️` },
      { label: 'Final Score:', val: `${this.game.score} ⭐`, highlight: true }
    ];

    statRows.forEach((row, i) => {
      const ry = cardY + 30 + i * 28;
      ctx.fillStyle = row.highlight ? '#FFD700' : '#E2E8F0';
      ctx.font = row.highlight ? 'bold 17px sans-serif' : '15px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(row.label, cardX + 20, ry);
      ctx.textAlign = 'right';
      ctx.fillText(row.val, cardX + cardW - 20, ry);
    });

    if (this.game.isNewHigh) {
      ctx.fillStyle = '#2ED573';
      ctx.font = '900 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎉 NEW HIGH SCORE! 🎉', w / 2, cardY + cardH + 28);
    }

    this.drawButton(ctx, 'retry_btn', w / 2 - 120, 345, 240, 50, '🔄 PLAY AGAIN (Space)', '#2ED573', '#FFFFFF', () => {
      this.game.startPlaying();
    });

    this.drawButton(ctx, 'menu_btn', w / 2 - 120, 405, 240, 42, '🏠 MAIN MENU', '#485460', '#FFFFFF', () => {
      this.game.state = 'menu';
    });
  }

  drawPauseMenu(ctx) {
    const w = this.game.width;
    const h = this.game.height;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, 0, w, h);

    ctx.font = '900 42px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', w / 2, 130);

    this.drawButton(ctx, 'resume_btn', w / 2 - 110, 180, 220, 48, '▶ RESUME', '#2ED573', '#FFFFFF', () => {
      this.game.togglePause();
    });

    this.drawButton(ctx, 'restart_btn', w / 2 - 110, 240, 220, 48, '🔄 RESTART', '#FFA502', '#FFFFFF', () => {
      this.game.startPlaying();
    });

    const isMuted = this.game.audio.isMuted;
    this.drawButton(ctx, 'sound_btn', w / 2 - 110, 300, 220, 48, isMuted ? '🔇 SOUND: OFF' : '🔊 SOUND: ON', '#70A1FF', '#FFFFFF', () => {
      this.game.audio.setMuted(!isMuted);
    });

    this.drawButton(ctx, 'exit_btn', w / 2 - 110, 360, 220, 48, '🏠 QUIT TO MENU', '#FF4757', '#FFFFFF', () => {
      this.game.state = 'menu';
    });
  }

  drawCharacterShop(ctx) {
    const w = this.game.width;
    const h = this.game.height;
    const CHARACTERS = window.OopsWorld.CHARACTERS || [];

    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(0, 0, w, h);

    ctx.font = '900 30px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('CHARACTER SHOP', w / 2, 45);

    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`YOUR COINS: ${this.game.storage.data.totalCoins} 🪙`, w / 2, 75);

    const cardW = 120;
    const cardH = 220;
    const totalW = CHARACTERS.length * (cardW + 14) - 14;
    const startX = w / 2 - totalW / 2;

    CHARACTERS.forEach((char, idx) => {
      const cx = startX + idx * (cardW + 14);
      const cy = 95;
      const isSelected = this.game.storage.data.selectedCharacter === char.id;
      const isUnlocked = this.game.storage.data.unlockedCharacters.includes(char.id);

      ctx.fillStyle = isSelected ? 'rgba(46, 213, 115, 0.2)' : 'rgba(255, 255, 255, 0.08)';
      this.roundRect(ctx, cx, cy, cardW, cardH, 12);
      ctx.fill();

      ctx.strokeStyle = isSelected ? '#2ED573' : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = isSelected ? 2.5 : 1;
      this.roundRect(ctx, cx, cy, cardW, cardH, 12);
      ctx.stroke();

      ctx.save();
      ctx.translate(cx + cardW / 2, cy + 65);
      const tempId = this.game.player.characterId;
      this.game.player.characterId = char.id;
      this.game.player.drawCharacterBody(ctx);
      this.game.player.characterId = tempId;
      ctx.restore();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(char.name, cx + cardW / 2, cy + 115);

      ctx.fillStyle = '#FFA502';
      ctx.font = '11px sans-serif';
      ctx.fillText(char.trait, cx + cardW / 2, cy + 135);

      if (isSelected) {
        ctx.fillStyle = '#2ED573';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('SELECTED ✔', cx + cardW / 2, cy + 185);
      } else if (isUnlocked) {
        this.drawButton(ctx, `sel_${char.id}`, cx + 12, cy + 165, cardW - 24, 32, 'SELECT', '#70A1FF', '#FFF', () => {
          this.game.storage.selectCharacter(char.id);
          this.game.player.applyCharacterTraits();
        });
      } else {
        const canAfford = this.game.storage.data.totalCoins >= char.cost;
        const btnCol = canAfford ? '#FFD700' : '#57606F';
        this.drawButton(ctx, `buy_${char.id}`, cx + 8, cy + 165, cardW - 16, 32, `🪙 ${char.cost}`, btnCol, '#000', () => {
          if (this.game.storage.unlockCharacter(char.id)) {
            this.game.player.applyCharacterTraits();
            this.game.audio.playPowerup();
            this.showToast(`UNLOCKED ${char.name.toUpperCase()}! 🎉`, '#2ED573');
          } else {
            this.showToast('NOT ENOUGH COINS! 🪙', '#FF4757');
          }
        });
      }
    });

    this.drawButton(ctx, 'chars_back', w / 2 - 70, 390, 140, 42, '⬅ BACK', '#485460', '#FFF', () => {
      this.game.state = 'menu';
    });
  }

  drawThemeShop(ctx) {
    const w = this.game.width;
    const h = this.game.height;
    const THEMES = window.OopsWorld.THEMES || [];

    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(0, 0, w, h);

    ctx.font = '900 30px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('WORLD THEMES', w / 2, 45);

    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`YOUR COINS: ${this.game.storage.data.totalCoins} 🪙`, w / 2, 75);

    const cardW = 140;
    const cardH = 200;
    const totalW = THEMES.length * (cardW + 14) - 14;
    const startX = w / 2 - totalW / 2;

    THEMES.forEach((theme, idx) => {
      const cx = startX + idx * (cardW + 14);
      const cy = 105;
      const isSelected = this.game.storage.data.selectedTheme === theme.id;
      const isUnlocked = this.game.storage.data.unlockedThemes.includes(theme.id);

      ctx.fillStyle = isSelected ? 'rgba(46, 213, 115, 0.2)' : 'rgba(255, 255, 255, 0.08)';
      this.roundRect(ctx, cx, cy, cardW, cardH, 12);
      ctx.fill();

      ctx.fillStyle = theme.skyTop;
      this.roundRect(ctx, cx + 18, cy + 20, cardW - 36, 40, 8);
      ctx.fill();

      ctx.fillStyle = theme.groundColor;
      ctx.fillRect(cx + 18, cy + 45, cardW - 36, 15);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(theme.name, cx + cardW / 2, cy + 90);

      ctx.fillStyle = '#A4B0BE';
      ctx.font = '10px sans-serif';
      ctx.fillText(theme.desc, cx + cardW / 2, cy + 112);

      if (isSelected) {
        ctx.fillStyle = '#2ED573';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('ACTIVE ✔', cx + cardW / 2, cy + 160);
      } else if (isUnlocked) {
        this.drawButton(ctx, `sel_theme_${theme.id}`, cx + 18, cy + 145, cardW - 36, 32, 'APPLY', '#70A1FF', '#FFF', () => {
          this.game.storage.selectTheme(theme.id);
          this.game.world.theme = theme;
        });
      } else {
        const canAfford = this.game.storage.data.totalCoins >= theme.cost;
        const btnCol = canAfford ? '#FFD700' : '#57606F';
        this.drawButton(ctx, `buy_theme_${theme.id}`, cx + 14, cy + 145, cardW - 28, 32, `🪙 ${theme.cost}`, btnCol, '#000', () => {
          if (this.game.storage.unlockTheme(theme.id)) {
            this.game.world.theme = theme;
            this.game.audio.playPowerup();
            this.showToast(`UNLOCKED ${theme.name.toUpperCase()}! 🌄`, '#2ED573');
          } else {
            this.showToast('NOT ENOUGH COINS! 🪙', '#FF4757');
          }
        });
      }
    });

    this.drawButton(ctx, 'themes_back', w / 2 - 70, 380, 140, 42, '⬅ BACK', '#485460', '#FFF', () => {
      this.game.state = 'menu';
    });
  }

  drawSettings(ctx) {
    const w = this.game.width;
    const h = this.game.height;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(0, 0, w, h);

    ctx.font = '900 30px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('SETTINGS', w / 2, 60);

    const s = this.game.storage.data.settings;
    const boxW = 340;
    const boxX = w / 2 - boxW / 2;

    this.drawButton(ctx, 'toggle_sfx', boxX, 110, boxW, 46, s.soundEnabled ? '🔊 SOUND FX: ENABLED' : '🔇 SOUND FX: MUTED', s.soundEnabled ? '#2ED573' : '#57606F', '#FFF', () => {
      this.game.audio.setMuted(s.soundEnabled);
    });

    this.drawButton(ctx, 'toggle_music', boxX, 175, boxW, 46, s.musicEnabled ? '🎵 MUSIC: ENABLED' : '🎵 MUSIC: OFF', s.musicEnabled ? '#70A1FF' : '#57606F', '#FFF', () => {
      this.game.audio.setMusicEnabled(!s.musicEnabled);
    });

    this.drawButton(ctx, 'toggle_haptics', boxX, 240, boxW, 46, s.hapticsEnabled ? '📳 HAPTICS & SHAKE: ON' : '📳 HAPTICS & SHAKE: OFF', s.hapticsEnabled ? '#FFA502' : '#57606F', '#FFF', () => {
      this.game.storage.updateSettings({ hapticsEnabled: !s.hapticsEnabled });
    });

    this.drawButton(ctx, 'settings_back', w / 2 - 70, 370, 140, 42, '⬅ BACK', '#485460', '#FFF', () => {
      this.game.state = 'menu';
    });
  }

  drawHowToPlay(ctx) {
    const w = this.game.width;
    const h = this.game.height;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(0, 0, w, h);

    ctx.font = '900 30px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('HOW TO PLAY', w / 2, 50);

    const lines = [
      '⬆ SPACE / UP ARROW or [JUMP] button : Jump & Double Jump',
      '⬇ DOWN ARROW or [SLIDE] button : Slide under low hazards',
      '💥 STOMP ENEMIES : Land on enemy heads while falling to squash them!',
      '🛡️ POWER-UPS : Collect Shields, Magnets, 2X Coins, Speed Boosts & Slow-Mo',
      '⚠️ SURPRISE DISASTERS : Watch out for meteor showers & rolling boulders!'
    ];

    lines.forEach((line, i) => {
      ctx.fillStyle = i === 2 ? '#2ED573' : i === 4 ? '#FF4757' : '#E2E8F0';
      ctx.font = '15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(line, w / 2, 110 + i * 44);
    });

    this.drawButton(ctx, 'guide_back', w / 2 - 70, 375, 140, 42, '⬅ BACK', '#485460', '#FFF', () => {
      this.game.state = 'menu';
    });
  }

  drawToast(ctx) {
    if (!this.activeToast) return;

    const w = this.game.width;
    const toast = this.activeToast;
    const progress = toast.duration / toast.maxDuration;
    const alpha = Math.min(1.0, progress * 4);

    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.fillStyle = toast.color;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;

    const toastW = 340;
    const toastH = 40;
    const toastX = w / 2 - toastW / 2;
    const toastY = 56;

    this.roundRect(ctx, toastX, toastY, toastW, toastH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(toast.text, w / 2, toastY + toastH / 2);

    ctx.restore();
  }

  drawButton(ctx, id, x, y, width, height, text, bgCol, textCol, onClick) {
    this.registerButton(id, x, y, width, height, onClick);

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    this.roundRect(ctx, x, y + 3, width, height, 10);
    ctx.fill();

    ctx.fillStyle = bgCol;
    this.roundRect(ctx, x, y, width, height, 10);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, x, y, width, height, 10);
    ctx.stroke();

    ctx.fillStyle = textCol;
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + width / 2, y + height / 2);

    ctx.restore();
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}

window.OopsWorld.UIManager = UIManager;
