// OOPS! WORLD - User Interface & HUD Engine
window.OopsWorld = window.OopsWorld || {};

class UIManager {
  constructor(game) {
    this.game = game;
    this.activeToast = null;
    this.toastTimer = 0;
    this.uiTime = 0;
    this.menuFadeAlpha = 1;

    this.touchButtons = {
      jump: { x: 0, y: 0, radius: 46, pressed: false },
      slide: { x: 0, y: 0, radius: 46, pressed: false },
      pause: { x: 0, y: 0, width: 44, height: 44, pressed: false }
    };

    this.buttons = [];
  }

  triggerMenuFadeIn() {
    this.menuFadeAlpha = 0;
  }

  showToast(text, color = '#FF4757', duration = 2.5) {
    this.activeToast = { text, color, duration, maxDuration: duration };
    this.toastTimer = duration;
  }

  update(dt) {
    this.uiTime += dt;
    if (this.menuFadeAlpha < 1) {
      this.menuFadeAlpha = Math.min(1, this.menuFadeAlpha + dt * 2.4);
    }

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
        if (this.menuFadeAlpha < 1) {
          ctx.fillStyle = '#070B14';
          ctx.fillRect(0, 0, this.game.width, this.game.height);
          ctx.save();
          ctx.globalAlpha = this.menuFadeAlpha;
          this.drawMainMenu(ctx);
          ctx.restore();
        } else {
          this.drawMainMenu(ctx);
        }
        break;
      case 'cinematic':
        this.game.narration.draw(ctx);
        break;
      case 'disasters':
        this.drawDisasterExpeditions(ctx);
        break;
      case 'chapter_intro':
        this.game.chapters.drawChapterIntro(ctx, this.game.width, this.game.height, this);
        break;
      case 'chapter_rescue':
        this.game.chapters.drawRescueCutscene(ctx, this.game.width, this.game.height, this);
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
      case 'upgrades':
        this.drawUpgradesShop(ctx);
        break;
      case 'friends_collection':
        this.drawFriendsCollection(ctx);
        break;
      case 'settings':
        this.drawSettings(ctx);
        break;
      case 'howto':
        this.drawHowToPlay(ctx);
        break;
      case 'dev_panel':
        this.drawDeveloperPanel(ctx);
        break;
    }

    if (
      this.game.debug?.shouldShowDebugUI() &&
      this.game.state !== 'cinematic' &&
      this.game.state !== 'dev_panel'
    ) {
      this.drawDebugBadge(ctx);
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
    this.roundRect(ctx, 325, 18, 105, 30, 8);
    ctx.fill();

    ctx.fillStyle = '#2ED573';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(`⭐ ${this.game.score}`, 334, 38);

    // Active Chapter Goal Progress Pill (top-right, left of Pause button)
    const ch = this.game.activeChapter;
    if (ch) {
      const w = this.game.width;
      const distNow = Math.min(ch.targetDistance, Math.floor(this.game.world.distance));
      const ratio = Math.max(0, Math.min(1, this.game.world.distance / ch.targetDistance));
      const goalW = Math.min(275, Math.max(195, w - 525));
      const goalX = w - 72 - goalW;
      const goalY = 18;

      ctx.fillStyle = 'rgba(10, 15, 29, 0.78)';
      this.roundRect(ctx, goalX, goalY, goalW, 42, 8);
      ctx.fill();
      ctx.strokeStyle = ch.color;
      ctx.lineWidth = 1.5;
      this.roundRect(ctx, goalX, goalY, goalW, 42, 8);
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${ch.icon} CH.${ch.number}: ${distNow}m / ${ch.targetDistance}m`, goalX + 10, goalY + 15);

      ctx.fillStyle = '#7BED9F';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`Rescue ${ch.friendName.split(' ')[0]}`, goalX + goalW - 10, goalY + 15);

      // Bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
      this.roundRect(ctx, goalX + 10, goalY + 25, goalW - 20, 8, 4);
      ctx.fill();
      if (ratio > 0) {
        ctx.fillStyle = ratio > 0.85 ? '#2ED573' : ch.color;
        this.roundRect(ctx, goalX + 10, goalY + 25, Math.max(8, (goalW - 20) * ratio), 8, 4);
        ctx.fill();
      }

      // Dynamic condition indicator for Ch. 3 & Ch. 4
      const dir = this.game.chapters;
      if (ch.id === 'climatological' && dir) {
        const isFreeze = dir.climateMode === 'freeze';
        ctx.fillStyle = isFreeze ? 'rgba(0, 210, 211, 0.85)' : 'rgba(255, 107, 53, 0.85)';
        this.roundRect(ctx, goalX + goalW - 140, goalY + 48, 140, 22, 6);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(isFreeze ? '❄️ ARCTIC FREEZE' : '🔥 EXTREME HEAT', goalX + goalW - 70, goalY + 63);
      } else if (ch.id === 'meteorological' && dir && dir.windForce !== 0) {
        ctx.fillStyle = 'rgba(162, 155, 254, 0.85)';
        this.roundRect(ctx, goalX + goalW - 135, goalY + 48, 135, 22, 6);
        ctx.fill();
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(dir.windForce < 0 ? '💨 HEADWIND' : '💨 TAILWIND', goalX + goalW - 67, goalY + 63);
      }
    }

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

    // Direct in-game Hero & Theme quick-switch pills — shown only in Endless Mode
    if (!this.game.activeChapter) {
      const chars = window.OopsWorld.CHARACTERS || [];
      const themes = window.OopsWorld.THEMES || [];
      const curChar = chars.find((c) => c.id === (this.game.storage?.data?.selectedCharacter || 'bobo')) || { name: 'Bobo' };
      const curTheme = this.game.world?.theme || themes.find((t) => t.id === (this.game.storage?.data?.selectedTheme || 'forest')) || { name: 'Green Haven' };
      const curThemeObj = themes.find((t) => t.id === curTheme.id) || curTheme;
      const pillGap = 10;
      const heroPillW = 128;
      const themePillW = 148;
      const barW = heroPillW + pillGap + themePillW;
      const barX = this.game.width / 2 - barW / 2;
      const barY = this.game.height - 52;
      const heroLabel = curChar.name.split(' ')[0];
      const themeLabel = (curThemeObj.name || 'Theme').split(' ')[0];

      this.drawHudPill(ctx, 'hud_hero_btn', barX, barY, heroPillW, 44, `🦸 ${heroLabel} ↻`, '#00D2FF', () => {
        const unlockedCount = chars.filter((c) => this.game.storage?.isCharacterUnlocked(c.id)).length;
        if (unlockedCount <= 1) {
          this.showToast('UNLOCK WORLD 2+ FOR MORE HEROES!', '#FFA502', 1.8);
          return;
        }
        const next = this.game.cycleHero();
        if (next) this.showToast(`HERO: ${next.name.toUpperCase()}!`, '#00D2FF', 1.6);
      });

      this.drawHudPill(ctx, 'hud_theme_btn', barX + heroPillW + pillGap, barY, themePillW, 44, `🌄 ${themeLabel} ↻`, '#FFA502', () => {
        const next = this.game.cycleTheme();
        if (next) this.showToast(`THEME: ${next.name.toUpperCase()}!`, '#FFA502', 1.6);
      });
    } else if (this.game.debug?.shouldShowDebugUI() && this.game.activeChapter) {
      const chId = this.game.activeChapter.id;
      const jumps = [
        { key: 'start', label: 'START', color: '#4EA1E0' },
        { key: 'middle', label: 'MID', color: '#FFA502' },
        { key: 'end', label: 'END', color: '#2ED573' },
        { key: 'rescue', label: 'RESCUE', color: '#298967' },
        { key: 'completion', label: 'DONE', color: '#A55EEA' }
      ];
      const pillW = 58;
      const pillGap = 6;
      const totalBarW = jumps.length * pillW + (jumps.length - 1) * pillGap;
      const startX = this.game.width / 2 - totalBarW / 2;
      const barY = this.game.height - 48;

      jumps.forEach((j, idx) => {
        this.drawHudPill(
          ctx,
          `dbg_hud_${j.key}`,
          startX + idx * (pillW + pillGap),
          barY,
          pillW,
          44,
          j.label,
          j.color,
          () => {
            this.game.debug.jumpToChapterPhase(chId, j.key);
          }
        );
      });
    }

    ctx.restore();
  }

  drawHudPill(ctx, id, x, y, width, height, label, accentColor, onClick) {
    this.registerButton(id, x, y, width, height, onClick);
    ctx.save();
    ctx.fillStyle = 'rgba(11, 18, 34, 0.72)';
    this.roundRect(ctx, x, y + 6, width, height - 12, 10);
    ctx.fill();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.4;
    this.roundRect(ctx, x, y + 6, width, height - 12, 10);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + width / 2, y + height / 2);
    ctx.restore();
  }

  drawPowerupTimers(ctx) {
    const p = this.game.player.powerups;
    const active = [];

    if (p.shield) {
      const ratio = p.shieldTimer > 0 && p.shieldMax > 0 ? Math.min(1, p.shieldTimer / p.shieldMax) : 1;
      active.push({ name: 'SHIELD', icon: '🛡️', color: '#00F0FF', progress: ratio });
    }
    if (p.magnetTimer > 0) {
      active.push({ name: 'MAGNET', icon: '🧲', color: '#FFD700', progress: Math.min(1, p.magnetTimer / (p.magnetMax || 11)) });
    }
    if (p.speedTimer > 0) {
      active.push({ name: 'SPEED', icon: '⚡', color: '#FF4757', progress: Math.min(1, p.speedTimer / (p.speedMax || 6.5)) });
    }
    if (p.doubleCoinsTimer > 0) {
      active.push({ name: '2X COINS', icon: '🪙', color: '#FFA502', progress: Math.min(1, p.doubleCoinsTimer / (p.doubleCoinsMax || 12)) });
    }
    if (p.slowMoTimer > 0) {
      active.push({ name: 'SLOW-MO', icon: '⏱️', color: '#70A1FF', progress: Math.min(1, p.slowMoTimer / (p.slowMoMax || 7)) });
    }

    const startX = 28;
    const startY = 66;

    active.forEach((item, idx) => {
      const bx = startX + idx * 78;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      this.roundRect(ctx, bx, startY, 72, 24, 6);
      ctx.fill();

      ctx.strokeStyle = item.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx + 6, startY + 22);
      ctx.lineTo(bx + 6 + 60 * Math.max(0.05, item.progress), startY + 22);
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${item.icon} ${item.name}`, bx + 5, startY + 14);
    });
  }

  drawTouchControls(ctx) {
    // Replaced by futuristic geometric DOM control panels (#ctrl-slide and #ctrl-jump)
  }

  drawMainMenu(ctx) {
    const w = this.game.width;
    const h = this.game.height;
    const storageMgr = this.game.storage;
    const storage = storageMgr.data;

    // 1. Subdued 2D Platformer Night-Sky Scenery (Moon, Stars, Clouds, Mountains & Grass Platforms)
    this.drawMainMenuBackdrop(ctx, w, h);

    const contentW = Math.min(700, w - 44);
    const scaleY = h < 540 ? Math.max(0.84, h / 600) : 1;

    // 2. Clean Flat Indie Title + Subtle Brackets (No "PART 1")
    const titleBob = Math.sin(this.uiTime * 2.5) * 3;
    ctx.save();
    ctx.translate(w / 2, Math.round(62 * scaleY) + titleBob);

    const oopsText = 'OOPS!';
    const worldText = ' WORLD';
    const titleSize = Math.min(46, Math.max(32, Math.floor(contentW * 0.07)));
    ctx.font = `900 ${titleSize}px sans-serif`;
    const oopsW = ctx.measureText(oopsText).width;
    const worldW = ctx.measureText(worldText).width;
    const fullTitleW = oopsW + worldW;
    const startTitleX = -fullTitleW / 2;

    // Subtle slate framing brackets
    const brPadX = 18;
    const brLeft = startTitleX - brPadX;
    const brRight = startTitleX + fullTitleW + brPadX;
    const brTop = -titleSize * 0.84;
    const brBot = 10;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(brLeft + 12, brTop);
    ctx.lineTo(brLeft, brTop);
    ctx.lineTo(brLeft, brTop + 12);
    ctx.moveTo(brLeft + 12, brBot);
    ctx.lineTo(brLeft, brBot);
    ctx.lineTo(brLeft, brBot - 12);
    ctx.moveTo(brRight - 12, brTop);
    ctx.lineTo(brRight, brTop);
    ctx.lineTo(brRight, brTop + 12);
    ctx.moveTo(brRight - 12, brBot);
    ctx.lineTo(brRight, brBot);
    ctx.lineTo(brRight, brBot - 12);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // Crisp solid dark outline + flat balanced title fills (no neon glow)
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#0B1220';
    ctx.strokeText(oopsText, startTitleX, 0);
    ctx.fillStyle = '#F1F5F9';
    ctx.fillText(oopsText, startTitleX, 0);

    ctx.strokeText(worldText, startTitleX + oopsW, 0);
    ctx.fillStyle = '#4EA1E0';
    ctx.fillText(worldText, startTitleX + oopsW, 0);

    // Muted Gold Subtitle (No PART 1)
    ctx.textAlign = 'center';
    ctx.font = `800 ${Math.max(14, Math.floor(titleSize * 0.37))}px sans-serif`;
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0B1220';
    ctx.strokeText('★ THE GREAT DISASTER ★', 0, 26);
    ctx.fillStyle = '#DFAA38';
    ctx.fillText('★ THE GREAT DISASTER ★', 0, 26);
    ctx.restore();

    // 3. Bobo / Selected Hero on Clean Flat Grass Pedestal
    const pedY = Math.round(168 * scaleY);
    const pedW = 114;
    ctx.save();

    // Matte soil pedestal base
    ctx.fillStyle = '#251E2B';
    ctx.strokeStyle = '#151019';
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, w / 2 - pedW / 2 + 6, pedY + 5, pedW - 12, 18, 5);
    ctx.fill();
    ctx.stroke();

    // Clean flat mossy green grass top
    ctx.fillStyle = '#2E7D4F';
    this.roundRect(ctx, w / 2 - pedW / 2, pedY - 2, pedW, 10, 4);
    ctx.fill();
    ctx.fillStyle = '#3B945E';
    ctx.fillRect(w / 2 - pedW / 2 + 4, pedY - 2, pedW - 8, 3);

    // Small flat grass tufts
    ctx.fillStyle = '#3B945E';
    [-40, -18, 20, 38].forEach((gx) => {
      ctx.beginPath();
      ctx.moveTo(w / 2 + gx - 4, pedY);
      ctx.lineTo(w / 2 + gx, pedY - 6);
      ctx.lineTo(w / 2 + gx + 4, pedY);
      ctx.closePath();
      ctx.fill();
    });

    // Subtle accent rays flanking Bobo
    ctx.strokeStyle = 'rgba(223, 170, 56, 0.45)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    [
      [-34, pedY - 24, -46, pedY - 29],
      [-36, pedY - 15, -49, pedY - 15],
      [-33, pedY - 7, -45, pedY - 3],
      [34, pedY - 24, 46, pedY - 29],
      [36, pedY - 15, 49, pedY - 15],
      [33, pedY - 7, 45, pedY - 3]
    ].forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath();
      ctx.moveTo(w / 2 + x1, y1);
      ctx.lineTo(w / 2 + x2, y2);
      ctx.stroke();
    });

    // Render animated selected hero (Bobo by default) perched on pedestal
    ctx.save();
    ctx.translate(w / 2, pedY + Math.sin(this.uiTime * 3.5) * 2);
    ctx.scale(1.06, 1.06);
    const p = this.game.player;
    const prevId = p.characterId;
    p.characterId = storage.selectedCharacter || 'bobo';
    p.runCycle = this.uiTime * 7;
    p.drawCharacterBody(ctx);
    p.characterId = prevId;
    ctx.restore();
    ctx.restore();

    // 4. Clean Flat Horizontal Status Bar (Coins, Best Score, World Progress X/6, Friends Rescued Y/5)
    const allWorldIds = window.OopsWorld.CHAPTER_ORDER || [
      'geophysical',
      'hydrological',
      'meteorological',
      'climatological',
      'biological',
      'extraterrestrial'
    ];
    const completedWorlds = (storage.story?.completedChapters || []).filter((id) =>
      allWorldIds.includes(id)
    ).length;
    const rescuedFriends = Math.min(
      5,
      (storage.story?.rescuedFriends || []).filter((id) => id !== 'bobo').length
    );

    const barW = Math.min(contentW, w - 36);
    const barH = Math.round(38 * scaleY);
    const barX = w / 2 - barW / 2;
    const barY = pedY + 28;

    ctx.save();
    ctx.fillStyle = '#18243A';
    this.roundRect(ctx, barX, barY, barW, barH, 10);
    ctx.fill();
    ctx.strokeStyle = '#334666';
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, barX, barY, barW, barH, 10);
    ctx.stroke();

    const statusSegments = [
      { icon: '🪙', label: `${storage.totalCoins} Coins`, color: '#E2E8F0' },
      { icon: '🏆', label: `Best: ${storage.highScore} pts`, color: '#E2E8F0' },
      { icon: '📘', label: `Worlds: ${completedWorlds}/6`, color: '#CBD5E1' },
      { icon: '👥', label: `Rescued: ${rescuedFriends}/5`, color: '#CBD5E1' }
    ];
    const segW = barW / 4;
    const statusFontSize = Math.max(11, Math.min(13, Math.floor(barW * 0.0195)));
    ctx.font = `bold ${statusFontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    statusSegments.forEach((seg, idx) => {
      const cx = barX + segW * (idx + 0.5);
      const cy = barY + barH / 2 + 1;
      ctx.fillStyle = seg.color;
      ctx.fillText(`${seg.icon} ${seg.label}`, cx, cy);

      if (idx < 3) {
        const divX = barX + segW * (idx + 1);
        ctx.strokeStyle = '#2C3D5B';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(divX, barY + 9);
        ctx.lineTo(divX, barY + barH - 9);
        ctx.stroke();
      }
    });
    ctx.restore();

    // 5. Primary Buttons Row: CONTINUE + PLAY / WORLDS
    const nextChId = storageMgr.getHighestPlayableChapter();
    const nextMeta = this.game.chapters.getCardMeta(nextChId);
    const rowGap = Math.round(14 * scaleY);
    const mainGap = 16;
    const mainRowW = Math.min(contentW - 12, 650);
    const mainBtnW = Math.floor((mainRowW - mainGap) / 2);
    const mainBtnH = Math.round(54 * scaleY);
    const mainRowY = barY + barH + Math.round(18 * scaleY);
    const mainStartX = w / 2 - (mainBtnW * 2 + mainGap) / 2;

    this.drawArcadeMenuButton(ctx, {
      id: 'continue_btn',
      x: mainStartX,
      y: mainRowY,
      width: mainBtnW,
      height: mainBtnH,
      label: `▶  CONTINUE (CH. ${nextMeta.number})`,
      fillColor: '#2E8B57',
      borderColor: '#1E5E3A',
      lipColor: '#1B5233',
      fontSize: 16,
      onClick: () => {
        this.game.continueCampaign();
      }
    });

    this.drawArcadeMenuButton(ctx, {
      id: 'play_btn',
      x: mainStartX + mainBtnW + mainGap,
      y: mainRowY,
      width: mainBtnW,
      height: mainBtnH,
      label: '🌍  PLAY / WORLDS',
      fillColor: '#2C7AB8',
      borderColor: '#1B527F',
      lipColor: '#184A73',
      fontSize: 16,
      onClick: () => {
        this.game.state = 'disasters';
      }
    });

    // 6. Secondary Buttons Row: UPGRADES | FRIENDS (X/6) | ENDLESS
    const secGap = 14;
    const secRowW = Math.min(contentW, 680);
    const secBtnW = Math.floor((secRowW - secGap * 2) / 3);
    const secBtnH = Math.round(48 * scaleY);
    const secRowY = mainRowY + mainBtnH + rowGap;
    const secStartX = w / 2 - (secBtnW * 3 + secGap * 2) / 2;
    const unlockedHeroesCount = (window.OopsWorld.CHARACTERS || []).filter((c) =>
      storageMgr.isCharacterUnlocked(c.id)
    ).length;

    this.drawArcadeMenuButton(ctx, {
      id: 'upgrades_btn',
      x: secStartX,
      y: secRowY,
      width: secBtnW,
      height: secBtnH,
      label: '⚡  UPGRADES',
      fillColor: '#D97724',
      borderColor: '#9A4F12',
      lipColor: '#8B460E',
      fontSize: 14,
      onClick: () => {
        this.game.state = 'upgrades';
      }
    });

    this.drawArcadeMenuButton(ctx, {
      id: 'friends_btn',
      x: secStartX + secBtnW + secGap,
      y: secRowY,
      width: secBtnW,
      height: secBtnH,
      label: `👥  FRIENDS (${unlockedHeroesCount}/6)`,
      fillColor: '#298967',
      borderColor: '#195C44',
      lipColor: '#15513C',
      fontSize: 14,
      onClick: () => {
        this.game.state = 'friends_collection';
      }
    });

    this.drawArcadeMenuButton(ctx, {
      id: 'endless_btn',
      x: secStartX + (secBtnW + secGap) * 2,
      y: secRowY,
      width: secBtnW,
      height: secBtnH,
      label: '∞  ENDLESS',
      fillColor: '#3165B5',
      borderColor: '#1E437C',
      lipColor: '#1A3B6E',
      fontSize: 14,
      onClick: () => {
        this.game.startEndless();
      }
    });

    // 7. Bottom Buttons Row: SETTINGS | GUIDE | INTRO MOVIE
    const botRowY = secRowY + secBtnH + rowGap;

    this.drawArcadeMenuButton(ctx, {
      id: 'settings_btn',
      x: secStartX,
      y: botRowY,
      width: secBtnW,
      height: secBtnH,
      label: '⚙  SETTINGS',
      fillColor: '#4B596E',
      borderColor: '#313C4C',
      lipColor: '#2A3342',
      fontSize: 14,
      onClick: () => {
        this.game.state = 'settings';
      }
    });

    this.drawArcadeMenuButton(ctx, {
      id: 'howto_btn',
      x: secStartX + secBtnW + secGap,
      y: botRowY,
      width: secBtnW,
      height: secBtnH,
      label: '📖  GUIDE',
      fillColor: '#7B4EB2',
      borderColor: '#53327D',
      lipColor: '#482B6D',
      fontSize: 14,
      onClick: () => {
        this.game.state = 'howto';
      }
    });

    this.drawArcadeMenuButton(ctx, {
      id: 'cinematic_replay_btn',
      x: secStartX + (secBtnW + secGap) * 2,
      y: botRowY,
      width: secBtnW,
      height: secBtnH,
      label: '🎬  INTRO MOVIE',
      fillColor: '#4B596E',
      borderColor: '#313C4C',
      lipColor: '#2A3342',
      fontSize: 14,
      onClick: () => {
        this.game.narration.startOpeningCinematic(false);
      }
    });
  }

  drawMainMenuBackdrop(ctx, w, h) {
    const dbg = this.game.debug;
    const isDevBuild = Boolean(dbg && dbg.isBuildEnabled());
    const dayT = isDevBuild ? Math.max(0, Math.min(1, dbg.dayBlend || 0)) : 0;

    ctx.save();

    // Sky & horizon (exact night colors when dayT === 0, clean flat daylight when dayT === 1)
    ctx.fillStyle = dayT > 0 ? this.lerpHex('#0F172A', '#3B82C4', dayT) : '#0F172A';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = dayT > 0 ? this.lerpHex('#141E36', '#6AB4E8', dayT) : '#141E36';
    ctx.fillRect(0, h * 0.42, w, h * 0.58);

    // Subtle matte star dots (fade out smoothly in daylight)
    if (dayT < 0.98) {
      for (let i = 0; i < 28; i++) {
        const sx = ((i * 173 + 41) % 997) / 997 * w;
        const sy = ((i * 97 + 23) % 521) / 521 * (h * 0.56);
        const alpha = (0.2 + 0.25 * Math.abs(Math.sin(this.uiTime * (0.9 + (i % 3) * 0.4) + i))) * (1 - dayT);
        ctx.fillStyle = `rgba(203, 213, 225, ${alpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, i % 4 === 0 ? 1.5 : 1.0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Moon / Sun on top-right (clickable hidden trigger only in dev builds)
    const moonX = w * 0.9;
    const moonY = h * 0.165;
    const moonR = Math.min(32, Math.max(22, w * 0.03));

    if (isDevBuild) {
      const hitSize = Math.max(56, moonR * 2.2);
      this.registerButton('menu_moon_btn', moonX - hitSize / 2, moonY - hitSize / 2, hitSize, hitSize, () => {
        dbg.handleMoonClick(moonX, moonY);
      });
    }

    ctx.fillStyle = dayT > 0.5 ? 'rgba(253, 224, 71, 0.22)' : 'rgba(148, 163, 184, 0.12)';
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR * 1.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = dayT > 0 ? this.lerpHex('#B8CBE0', '#FACC15', dayT) : '#B8CBE0';
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();

    if (dayT < 0.98) {
      ctx.save();
      ctx.globalAlpha = 1 - dayT;
      ctx.fillStyle = '#9BB1CA';
      [
        [-0.3, -0.2, 0.18],
        [0.25, 0.18, 0.24],
        [-0.1, 0.42, 0.13]
      ].forEach(([dx, dy, sr]) => {
        ctx.beginPath();
        ctx.arc(moonX + dx * moonR, moonY + dy * moonR, moonR * sr, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // Activation expanding ring around moon when 10th click triggers Developer Debug Mode
    if (isDevBuild && dbg.activationAnimTimer > 0) {
      const progress = 1 - dbg.activationAnimTimer / 1.2;
      const ringR = moonR + progress * 75;
      const ringAlpha = Math.max(0, 1 - progress);
      ctx.save();
      ctx.strokeStyle = `rgba(46, 213, 115, ${ringAlpha})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(dbg.activationOrigin.x || moonX, dbg.activationOrigin.y || moonY, ringR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 215, 0, ${ringAlpha * 0.85})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(dbg.activationOrigin.x || moonX, dbg.activationOrigin.y || moonY, ringR * 0.72, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Muted flat clouds
    const cloudCol = dayT > 0 ? this.lerpHex('#1A2642', '#E8F2FC', dayT) : '#1A2642';
    const drawCloud = (cx, cy, cw) => {
      ctx.fillStyle = cloudCol;
      ctx.beginPath();
      ctx.arc(cx - cw * 0.26, cy + 4, cw * 0.2, 0, Math.PI * 2);
      ctx.arc(cx, cy - 4, cw * 0.26, 0, Math.PI * 2);
      ctx.arc(cx + cw * 0.26, cy + 4, cw * 0.19, 0, Math.PI * 2);
      ctx.rect(cx - cw * 0.42, cy + 2, cw * 0.84, cw * 0.16);
      ctx.fill();
    };
    drawCloud(w * 0.1, h * 0.16, 76);
    drawCloud(w * 0.2, h * 0.25, 50);
    drawCloud(w * 0.81, h * 0.26, 54);

    // Distant muted mountain silhouette
    ctx.fillStyle = dayT > 0 ? this.lerpHex('#182440', '#5283B0', dayT) : '#182440';
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h * 0.56);
    ctx.lineTo(w * 0.11, h * 0.44);
    ctx.lineTo(w * 0.23, h * 0.56);
    ctx.lineTo(w * 0.34, h * 0.46);
    ctx.lineTo(w * 0.48, h * 0.58);
    ctx.lineTo(w * 0.62, h * 0.47);
    ctx.lineTo(w * 0.76, h * 0.56);
    ctx.lineTo(w * 0.89, h * 0.43);
    ctx.lineTo(w, h * 0.54);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Foreground mountain silhouette
    ctx.fillStyle = dayT > 0 ? this.lerpHex('#131D35', '#3E6D96', dayT) : '#131D35';
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h * 0.64);
    ctx.lineTo(w * 0.08, h * 0.53);
    ctx.lineTo(w * 0.19, h * 0.66);
    ctx.lineTo(w * 0.3, h * 0.56);
    ctx.lineTo(w * 0.44, h * 0.68);
    ctx.lineTo(w * 0.6, h * 0.57);
    ctx.lineTo(w * 0.72, h * 0.66);
    ctx.lineTo(w * 0.85, h * 0.52);
    ctx.lineTo(w * 0.95, h * 0.61);
    ctx.lineTo(w, h * 0.56);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Subdued flat grass & earth platforms
    const centerTopY = h - 42;
    const sideW = Math.max(76, Math.round(w * 0.095));
    const sideTopY = h - 76;

    // Center earth base
    ctx.fillStyle = dayT > 0 ? this.lerpHex('#1B1622', '#47362B', dayT) : '#1B1622';
    ctx.fillRect(0, centerTopY, w, h - centerTopY);
    ctx.fillStyle = dayT > 0 ? this.lerpHex('#251E2E', '#594538', dayT) : '#251E2E';
    for (let rx = 80; rx < w - 80; rx += 110) {
      ctx.fillRect(rx, centerTopY + 14, 48, 10);
    }

    // Matte natural green grass top
    const grassMain = dayT > 0 ? this.lerpHex('#2A6B43', '#389E5D', dayT) : '#2A6B43';
    const grassHi = dayT > 0 ? this.lerpHex('#378254', '#4BB570', dayT) : '#378254';
    ctx.fillStyle = grassMain;
    ctx.fillRect(sideW - 6, centerTopY, w - (sideW - 6) * 2, 11);
    ctx.fillStyle = grassHi;
    ctx.fillRect(sideW - 6, centerTopY, w - (sideW - 6) * 2, 3);

    // Subtle flat grass blades
    ctx.fillStyle = grassHi;
    for (let gx = sideW + 30; gx < w - sideW - 30; gx += 140) {
      ctx.beginPath();
      ctx.moveTo(gx - 5, centerTopY);
      ctx.lineTo(gx, centerTopY - 8);
      ctx.lineTo(gx + 5, centerTopY);
      ctx.closePath();
      ctx.fill();
    }

    // Left & Right stepped cliff platforms
    const cliffEarth = dayT > 0 ? this.lerpHex('#211B29', '#4E3C31', dayT) : '#211B29';
    const cliffStone = dayT > 0 ? this.lerpHex('#2C2436', '#614C3F', dayT) : '#2C2436';
    const cliffBush = dayT > 0 ? this.lerpHex('#235938', '#2F8851', dayT) : '#235938';
    const drawSideCliff = (x, width, isLeft) => {
      ctx.fillStyle = cliffEarth;
      ctx.fillRect(x, sideTopY + 6, width, h - sideTopY);
      ctx.fillStyle = cliffStone;
      ctx.fillRect(isLeft ? x + 10 : x + 14, sideTopY + 20, width - 24, 18);

      ctx.fillStyle = grassMain;
      this.roundRect(ctx, isLeft ? x - 6 : x - 2, sideTopY, width + 8, 12, 4);
      ctx.fill();

      // Matte bush silhouette on cliff edge
      const bx = isLeft ? x + width * 0.45 : x + width * 0.55;
      ctx.fillStyle = cliffBush;
      ctx.beginPath();
      ctx.arc(bx - 10, sideTopY - 2, 8, 0, Math.PI * 2);
      ctx.arc(bx + 10, sideTopY - 2, 8, 0, Math.PI * 2);
      ctx.arc(bx, sideTopY - 6, 10, 0, Math.PI * 2);
      ctx.fill();
    };
    drawSideCliff(0, sideW, true);
    drawSideCliff(w - sideW, sideW, false);

    ctx.restore();
  }

  drawArcadeMenuButton(ctx, opts) {
    const {
      id,
      x,
      y,
      width,
      height,
      label,
      fillColor,
      borderColor,
      lipColor,
      fontSize = 15,
      onClick
    } = opts;

    this.registerButton(id, x, y, width, height, onClick);

    ctx.save();

    // Clean flat bottom lip for tactile 2D button depth (no blurry glow)
    ctx.fillStyle = lipColor || '#0F172A';
    this.roundRect(ctx, x, y + 4, width, height, 8);
    ctx.fill();

    // Crisp flat solid button face
    ctx.fillStyle = fillColor;
    this.roundRect(ctx, x, y, width, height, 8);
    ctx.fill();

    // Clean, sharp border
    ctx.strokeStyle = borderColor || '#1E293B';
    ctx.lineWidth = 1.6;
    this.roundRect(ctx, x, y, width, height, 8);
    ctx.stroke();

    // Crisp readable label
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillText(label, x + width / 2, y + height / 2 + 1);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(label, x + width / 2, y + height / 2);

    ctx.restore();
  }

  drawGameOver(ctx) {
    const w = this.game.width;
    const h = this.game.height;
    const ch = this.game.activeChapter;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(w / 2, 62);
    ctx.font = '900 46px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FF4757';
    ctx.fillText('OOPS!', 0, 0);

    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#FFA502';
    ctx.fillText(
      ch ? `CHAPTER ${ch.number}: ${ch.title} — RUN ENDED` : 'BOBO WIPED OUT!',
      0,
      28
    );
    ctx.restore();

    const cardW = 360;
    const cardH = ch ? 205 : 175;
    const cardX = w / 2 - cardW / 2;
    const cardY = 110;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    this.roundRect(ctx, cardX, cardY, cardW, cardH, 16);
    ctx.fill();
    ctx.strokeStyle = ch ? ch.color : 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, cardX, cardY, cardW, cardH, 16);
    ctx.stroke();

    const statRows = [
      { label: 'Distance Reached:', val: `${Math.floor(this.game.world.distance)}m` },
      { label: 'Coins Collected:', val: `+${this.game.coinsCollected} 🪙` },
      { label: 'Enemies Stomped:', val: `${this.game.enemiesStomped} 💥` },
      { label: 'Final Score:', val: `${this.game.score} ⭐`, highlight: true }
    ];

    if (ch) {
      statRows.unshift({
        label: 'Rescue Goal:',
        val: `${Math.min(ch.targetDistance, Math.floor(this.game.world.distance))}m / ${ch.targetDistance}m`
      });
    }

    statRows.forEach((row, i) => {
      const ry = cardY + 32 + i * 32;
      ctx.fillStyle = row.highlight ? '#FFD700' : '#E2E8F0';
      ctx.font = row.highlight ? 'bold 17px sans-serif' : '15px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(row.label, cardX + 20, ry);
      ctx.textAlign = 'right';
      ctx.fillText(row.val, cardX + cardW - 20, ry);
    });

    if (this.game.isNewHigh) {
      ctx.fillStyle = '#2ED573';
      ctx.font = '900 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎉 NEW HIGH SCORE! 🎉', w / 2, cardY + cardH + 22);
    }

    const btnStartY = cardY + cardH + 38;
    this.drawButton(
      ctx,
      'retry_btn',
      w / 2 - 140,
      btnStartY,
      280,
      46,
      ch ? `🔄 RETRY CHAPTER ${ch.number}` : '🔄 PLAY AGAIN',
      '#2ED573',
      '#FFFFFF',
      () => {
        this.game.retryCurrentMode();
      }
    );

    this.drawButton(
      ctx,
      'story_cards_btn',
      w / 2 - 140,
      btnStartY + 56,
      280,
      44,
      '🌍 WORLD SELECTION (CARDS)',
      '#00D2FF',
      '#001A33',
      () => {
        this.game.state = 'disasters';
      }
    );

    this.drawButton(ctx, 'menu_btn', w / 2 - 140, btnStartY + 110, 280, 44, '🏠 MAIN MENU', '#485460', '#FFFFFF', () => {
      this.game.state = 'menu';
    });
  }

  drawPauseMenu(ctx) {
    const w = this.game.width;
    const h = this.game.height;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, 0, w, h);

    ctx.font = '900 40px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', w / 2, 82);

    const isEndlessMode = !this.game.activeChapter;

    // Direct mid-run Hero & Theme selectors inside Pause Menu — Endless Mode only
    if (isEndlessMode) {
      const chars = window.OopsWorld.CHARACTERS || [];
      const themes = window.OopsWorld.THEMES || [];
      const curChar = chars.find((c) => c.id === (this.game.storage?.data?.selectedCharacter || 'bobo')) || { name: 'Bobo' };
      const curTheme = this.game.world?.theme || themes.find((t) => t.id === (this.game.storage?.data?.selectedTheme || 'forest')) || { name: 'Green Haven' };
      const switchW = Math.min(240, Math.floor((w - 84) / 2));
      const switchGap = 14;
      const switchX = w / 2 - (switchW * 2 + switchGap) / 2;

      this.drawButton(ctx, 'pause_hero_btn', switchX, 112, switchW, 46, `🦸 HERO: ${curChar.name.split(' ')[0]} ↻`, '#10AC84', '#FFFFFF', () => {
        const unlockedCount = chars.filter((c) => this.game.storage?.isCharacterUnlocked(c.id)).length;
        if (unlockedCount <= 1) {
          this.showToast('UNLOCK WORLD 2+ FOR MORE HEROES!', '#FFA502');
          return;
        }
        const next = this.game.cycleHero();
        if (next) this.showToast(`HERO: ${next.name.toUpperCase()}!`, '#2ED573');
      });

      this.drawButton(ctx, 'pause_theme_btn', switchX + switchW + switchGap, 112, switchW, 46, `🌄 THEME: ${(curTheme.name || 'Forest').split(' ')[0]} ↻`, '#FFA502', '#0F172A', () => {
        const next = this.game.cycleTheme();
        if (next) this.showToast(`THEME: ${next.name.toUpperCase()}!`, '#FFA502');
      });
    }

    const isDebug = Boolean(this.game.debug?.shouldShowDebugUI());
    const menuStartY = isEndlessMode ? 174 : 114;
    const btnStep = isDebug ? 52 : 56;
    const btnH = isDebug ? 44 : 46;

    this.drawButton(ctx, 'resume_btn', w / 2 - 125, menuStartY, 250, btnH, '▶ RESUME', '#2ED573', '#FFFFFF', () => {
      this.game.togglePause();
    });

    this.drawButton(ctx, 'restart_btn', w / 2 - 125, menuStartY + btnStep, 250, btnH, '🔄 RESTART', '#FFA502', '#FFFFFF', () => {
      this.game.retryCurrentMode();
    });

    const isMuted = this.game.audio.isMuted;
    this.drawButton(ctx, 'sound_btn', w / 2 - 125, menuStartY + btnStep * 2, 250, btnH, isMuted ? '🔇 SOUND: OFF' : '🔊 SOUND: ON', '#70A1FF', '#FFFFFF', () => {
      this.game.audio.setMuted(!isMuted);
    });

    this.drawButton(ctx, 'exit_worlds_btn', w / 2 - 125, menuStartY + btnStep * 3, 250, btnH, '🌍 WORLD SELECT', '#00D2FF', '#001A33', () => {
      this.game.audio.stopMusic();
      this.game.state = 'disasters';
    });

    this.drawButton(ctx, 'exit_btn', w / 2 - 125, menuStartY + btnStep * 4, 250, btnH, '🏠 MAIN MENU', '#FF4757', '#FFFFFF', () => {
      this.game.audio.stopMusic();
      this.game.state = 'menu';
    });

    if (isDebug) {
      this.drawButton(ctx, 'pause_dev_panel_btn', w / 2 - 125, menuStartY + btnStep * 5, 250, btnH, '🛠️ DEV PANEL', '#7B4EB2', '#FFFFFF', () => {
        this.game.debug.openPanel();
      });
    }
  }

  drawUpgradesShop(ctx) {
    const w = this.game.width;
    const h = this.game.height;
    const UPGRADES = window.OopsWorld.POWERUP_UPGRADES || [];
    const storageMgr = this.game.storage;

    ctx.fillStyle = 'rgba(11, 18, 34, 0.96)';
    ctx.fillRect(0, 0, w, h);

    ctx.font = '900 30px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ POWER-UP UPGRADES', w / 2, 46);

    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`AVAILABLE COINS: ${storageMgr.data.totalCoins} 🪙`, w / 2, 76);

    const gap = 12;
    const cardW = Math.min(176, Math.floor((w - 64 - gap * (UPGRADES.length - 1)) / UPGRADES.length));
    const cardH = 285;
    const totalW = UPGRADES.length * cardW + (UPGRADES.length - 1) * gap;
    const startX = w / 2 - totalW / 2;

    UPGRADES.forEach((upg, idx) => {
      const cx = startX + idx * (cardW + gap);
      const cy = 104;
      const lvl = storageMgr.getPowerupLevel(upg.id);
      const cost = storageMgr.getPowerupUpgradeCost(upg.id);
      const curDur = storageMgr.getPowerupDuration(upg.id);
      const isMax = lvl >= upg.maxLevel;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      this.roundRect(ctx, cx, cy, cardW, cardH, 12);
      ctx.fill();
      ctx.strokeStyle = isMax ? '#2ED573' : upg.color;
      ctx.lineWidth = 1.6;
      this.roundRect(ctx, cx, cy, cardW, cardH, 12);
      ctx.stroke();

      ctx.font = '34px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(upg.icon, cx + cardW / 2, cy + 50);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(upg.name, cx + cardW / 2, cy + 84);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '11px sans-serif';
      ctx.fillText(`Duration: ${curDur.toFixed(1)}s`, cx + cardW / 2, cy + 108);
      if (!isMax) {
        ctx.fillStyle = '#7BED9F';
        ctx.fillText(`Next: ${(curDur + upg.perLevel).toFixed(1)}s`, cx + cardW / 2, cy + 126);
      } else {
        ctx.fillStyle = '#2ED573';
        ctx.fillText('MAX POWER!', cx + cardW / 2, cy + 126);
      }

      // Level pips
      const pipW = 22;
      const pipStart = cx + cardW / 2 - (upg.maxLevel * (pipW + 5) - 5) / 2;
      for (let i = 0; i < upg.maxLevel; i++) {
        ctx.fillStyle = i < lvl ? upg.color : 'rgba(255, 255, 255, 0.16)';
        this.roundRect(ctx, pipStart + i * (pipW + 5), cy + 146, pipW, 10, 4);
        ctx.fill();
      }
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`LEVEL ${lvl} / ${upg.maxLevel}`, cx + cardW / 2, cy + 178);

      if (isMax) {
        ctx.fillStyle = '#2ED573';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText('MAXED ✔', cx + cardW / 2, cy + 236);
      } else {
        const canAfford = storageMgr.data.totalCoins >= cost;
        this.drawButton(
          ctx,
          `upg_${upg.id}`,
          cx + 10,
          cy + 216,
          cardW - 20,
          46,
          `UPGRADE 🪙 ${cost}`,
          canAfford ? '#FFD700' : '#475569',
          canAfford ? '#0F172A' : '#E2E8F0',
          () => {
            const res = storageMgr.upgradePowerup(upg.id);
            if (res.success) {
              this.game.audio.playPowerup();
              this.showToast(`${upg.name.toUpperCase()} LV.${res.newLevel}!`, '#2ED573');
            } else {
              this.showToast('NEED MORE COINS! 🪙', '#FF4757');
            }
          }
        );
      }
    });

    this.drawButton(ctx, 'upg_back', w / 2 - 190, 430, 175, 46, '◀ MAIN MENU', '#485460', '#FFFFFF', () => {
      this.game.state = 'menu';
    });
    this.drawButton(ctx, 'upg_worlds', w / 2 + 15, 430, 175, 46, '🌍 WORLDS', '#00D2FF', '#001A33', () => {
      this.game.state = 'disasters';
    });
  }

  drawFriendsCollection(ctx) {
    const w = this.game.width;
    const h = this.game.height;
    const storageMgr = this.game.storage;
    const CHARACTERS = window.OopsWorld.CHARACTERS || [];
    const CHAPTER_CARDS = window.OopsWorld.CHAPTER_CARDS || [];
    const unlockedCount = CHARACTERS.filter((c) => storageMgr.isCharacterUnlocked(c.id)).length;

    ctx.fillStyle = 'rgba(11, 18, 34, 0.96)';
    ctx.fillRect(0, 0, w, h);

    ctx.font = '900 26px sans-serif';
    ctx.fillStyle = '#2ED573';
    ctx.textAlign = 'center';
    ctx.fillText(`🏕 FRIENDS & HEROES (${unlockedCount}/${CHARACTERS.length} Unlocked)`, w / 2, 34);

    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = '#CBD5E1';
    ctx.fillText('Bobo starts ready in World 1. Unlock Worlds 2–6 to unlock every hero! Themes are free anytime.', w / 2, 56);

    const cols = 3;
    const gapX = 14;
    const gapY = 12;
    const cardW = Math.min(290, Math.floor((w - 56 - gapX * (cols - 1)) / cols));
    const cardH = 204;
    const totalW = cols * cardW + (cols - 1) * gapX;
    const startX = w / 2 - totalW / 2;
    const startY = 72;

    CHARACTERS.forEach((char, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cx = startX + col * (cardW + gapX);
      const cy = startY + row * (cardH + gapY);

      const worldNum = char.unlockWorldNum || idx + 1;
      const worldCard = CHAPTER_CARDS.find((c) => c.id === char.unlockChapter) || CHAPTER_CARDS[idx];
      const isUnlocked = storageMgr.isCharacterUnlocked(char.id);
      const isSelected = isUnlocked && (storageMgr.data.selectedCharacter || 'bobo') === char.id;
      const accent = isUnlocked ? (worldCard ? worldCard.color : char.color) : '#475569';

      ctx.fillStyle = isSelected
        ? 'rgba(46, 213, 115, 0.22)'
        : isUnlocked
          ? 'rgba(16, 172, 132, 0.13)'
          : 'rgba(15, 23, 42, 0.85)';
      this.roundRect(ctx, cx, cy, cardW, cardH, 12);
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#2ED573' : accent;
      ctx.lineWidth = isSelected ? 2.4 : 1.4;
      this.roundRect(ctx, cx, cy, cardW, cardH, 12);
      ctx.stroke();

      // World badge header
      ctx.fillStyle = isUnlocked ? accent : '#94A3B8';
      ctx.font = '900 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${worldCard ? worldCard.icon : '⭐'} WORLD ${worldNum} HERO`,
        cx + cardW / 2,
        cy + 20
      );

      // Animated character sprite (dimmed + lock badge if locked)
      ctx.save();
      ctx.translate(cx + cardW / 2, cy + 78);
      ctx.scale(1.05, 1.05);
      if (!isUnlocked) {
        ctx.globalAlpha = 0.28;
      }
      this.game.chapters.drawFriendSprite(ctx, char.id, 0, 0, this.uiTime + idx, !isUnlocked);
      ctx.restore();

      if (!isUnlocked) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        this.roundRect(ctx, cx + cardW / 2 - 36, cy + 44, 72, 22, 8);
        ctx.fill();
        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 1.2;
        this.roundRect(ctx, cx + cardW / 2 - 36, cy + 44, 72, 22, 8);
        ctx.stroke();
        ctx.fillStyle = '#F87171';
        ctx.font = '900 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔒 LOCKED', cx + cardW / 2, cy + 58);
      }

      ctx.fillStyle = isUnlocked ? '#FFFFFF' : '#94A3B8';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(char.name, cx + cardW / 2, cy + 102);

      ctx.fillStyle = isUnlocked ? '#FFD700' : '#64748B';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(char.trait, cx + cardW / 2, cy + 120);

      ctx.fillStyle = isUnlocked ? '#7BED9F' : '#FCA5A5';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(
        isUnlocked
          ? (worldNum === 1 ? '✅ Unlocked from Start' : `✅ World ${worldNum} Unlocked`)
          : `🔒 Unlock World ${worldNum} to Play`,
        cx + cardW / 2,
        cy + 139
      );

      if (isSelected) {
        ctx.fillStyle = 'rgba(46, 213, 115, 0.25)';
        this.roundRect(ctx, cx + 10, cy + 150, cardW - 20, 44, 10);
        ctx.fill();
        ctx.strokeStyle = '#2ED573';
        ctx.lineWidth = 1.8;
        this.roundRect(ctx, cx + 10, cy + 150, cardW - 20, 44, 10);
        ctx.stroke();
        ctx.fillStyle = '#2ED573';
        ctx.font = '900 13px sans-serif';
        ctx.fillText('ACTIVE HERO ✔', cx + cardW / 2, cy + 176);
      } else if (isUnlocked) {
        this.drawButton(ctx, `fr_sel_${char.id}`, cx + 10, cy + 150, cardW - 20, 44, 'SELECT HERO', '#2ED573', '#062010', () => {
          const picked = this.game.selectHero(char.id);
          if (picked) {
            this.showToast(`${char.name.toUpperCase()} SELECTED!`, '#2ED573');
          }
        });
      } else {
        this.drawButton(ctx, `fr_locked_${char.id}`, cx + 10, cy + 150, cardW - 20, 44, '🔒 LOCKED', '#334155', '#CBD5E1', () => {
          this.showToast(`🔒 LOCKED! UNLOCK WORLD ${worldNum} FIRST!`, '#FF4757');
        });
      }
    });

    ctx.fillStyle = '#94A3B8';
    ctx.font = 'italic 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Switch unlocked Heroes & Themes anytime in Pause or during play · Clear Worlds to unlock new Heroes!', w / 2, 512);

    const bGap = 16;
    const bW = Math.min(220, Math.floor((w - 84 - bGap) / 2));
    const bStartX = w / 2 - (bW * 2 + bGap) / 2;

    this.drawButton(ctx, 'fr_back', bStartX, 530, bW, 46, '◀ MAIN MENU', '#485460', '#FFFFFF', () => {
      this.game.state = 'menu';
    });
    this.drawButton(ctx, 'fr_worlds', bStartX + bW + bGap, 530, bW, 46, '🌍 WORLD SELECT', '#00D2FF', '#001A33', () => {
      this.game.state = 'disasters';
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

    this.drawButton(ctx, 'settings_back', w / 2 - 70, 370, 140, 44, '⬅ BACK', '#485460', '#FFF', () => {
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
      '⬆ SPACE / UP ARROW or [JUMP] : Jump & Double Jump across disaster hazards',
      '⬇ DOWN ARROW or [SLIDE] : Slide under low debris, icicles & lava arcs',
      '💥 STOMP ENEMIES : Land on enemy heads while falling to squash them!',
      '🤝 RESCUE FRIENDS : Reach the distance goal in Chapters 1–4 to unlock allies!',
      '⚡ POWER-UPS & UPGRADES : Collect Shields, Magnets & Boosts, then upgrade in Shop!'
    ];

    lines.forEach((line, i) => {
      ctx.fillStyle = i === 2 ? '#2ED573' : i === 3 ? '#00F0FF' : i === 4 ? '#FFD32A' : '#E2E8F0';
      ctx.font = '15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(line, w / 2, 110 + i * 44);
    });

    this.drawButton(ctx, 'guide_back', w / 2 - 75, 375, 150, 44, '⬅ BACK', '#485460', '#FFF', () => {
      this.game.state = 'menu';
    });
  }

  drawDisasterExpeditions(ctx) {
    const w = this.game.width;
    const h = this.game.height;
    const storageMgr = this.game.storage;
    const story = storageMgr.data.story || {};
    const cards = story.disasterCards || {};
    const disasterMeta = window.OopsWorld.CHAPTER_CARDS || [];

    // Backdrop
    ctx.fillStyle = 'rgba(10, 15, 29, 0.97)';
    ctx.fillRect(0, 0, w, h);

    // Subtle background stars
    ctx.fillStyle = 'rgba(0, 240, 255, 0.22)';
    for (let i = 0; i < 20; i++) {
      const sx = (i * 137) % w;
      const sy = (i * 73) % h;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Top Header
    ctx.save();
    ctx.font = '900 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00F0FF';
    ctx.fillText('WORLD SELECTION — SIX DISASTER CHAPTERS', w / 2, 30);

    const clearedPlayable = (story.completedChapters || []).filter((id) =>
      ['geophysical', 'hydrological', 'meteorological', 'climatological'].includes(id)
    ).length;
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(
      `🪙 ${storageMgr.data.totalCoins} Coins   |   Phase 1 Progress: ${clearedPlayable} / 4 Chapters Cleared   |   Select an unlocked zone to rescue Bobo’s friends!`,
      w / 2,
      52
    );
    ctx.restore();

    // Responsive 3 x 2 Grid of Six Disaster Cards
    const cols = 3;
    const gapX = 16;
    const gapY = 14;
    const cardW = Math.min(292, Math.floor((w - 56 - gapX * (cols - 1)) / cols));
    const cardH = 204;
    const totalW = cols * cardW + (cols - 1) * gapX;
    const startX = w / 2 - totalW / 2;
    const startY = 72;

    disasterMeta.forEach((meta, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cx = startX + col * (cardW + gapX);
      const cy = startY + row * (cardH + gapY);

      const cardData = cards[meta.id] || { progress: 0, target: meta.targetDistance, completed: false };
      const isUnlocked = storageMgr.isChapterUnlocked(meta.id);
      const isCompleted = storageMgr.isChapterCompleted(meta.id);
      const debugBypass = Boolean(this.game.debug?.canBypassChapterLocks());
      const isPlayable = meta.playableInPhase1 || debugBypass;

      ctx.save();
      ctx.fillStyle = isCompleted
        ? 'rgba(18, 42, 48, 0.94)'
        : isUnlocked
        ? 'rgba(16, 24, 42, 0.92)'
        : 'rgba(12, 16, 28, 0.86)';
      this.roundRect(ctx, cx, cy, cardW, cardH, 12);
      ctx.fill();

      ctx.strokeStyle = isCompleted ? '#2ED573' : isUnlocked ? meta.color : '#334155';
      ctx.lineWidth = isCompleted || isUnlocked ? 1.8 : 1.2;
      this.roundRect(ctx, cx, cy, cardW, cardH, 12);
      ctx.stroke();

      // Animated 2D Preview Banner
      const prevH = 66;
      this.game.chapters.drawCardPreview(
        ctx,
        meta.id,
        cx + 8,
        cy + 8,
        cardW - 16,
        prevH,
        this.uiTime + idx * 0.8,
        !isUnlocked || !isPlayable
      );

      // Status Badge over preview corner
      const badgeText = isCompleted
        ? '✅ COMPLETED'
        : !meta.playableInPhase1 && debugBypass
        ? '🛠️ DEBUG'
        : !isPlayable
        ? isUnlocked
          ? '🌟 PHASE 2'
          : '🔒 PHASE 2'
        : isUnlocked
        ? '🔓 UNLOCKED'
        : '🔒 LOCKED';
      const badgeW = 88;
      const badgeH = 20;
      const badgeX = cx + cardW - badgeW - 12;
      const badgeY = cy + 12;

      ctx.fillStyle = isCompleted
        ? '#2ED573'
        : !meta.playableInPhase1 && debugBypass
        ? '#A55EEA'
        : !isPlayable
        ? 'rgba(15, 23, 42, 0.88)'
        : isUnlocked
        ? 'rgba(0, 210, 255, 0.9)'
        : 'rgba(15, 23, 42, 0.88)';
      this.roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 6);
      ctx.fill();

      ctx.fillStyle = isCompleted || (isUnlocked && isPlayable && meta.playableInPhase1) ? '#0B2013' : '#FFFFFF';
      ctx.font = '900 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(badgeText, badgeX + badgeW / 2, badgeY + 13);

      // Card Title & Subtitle
      ctx.fillStyle = isUnlocked ? meta.color : '#94A3B8';
      ctx.font = '900 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${meta.icon} ${meta.number}. ${meta.title}`, cx + 10, cy + 92);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '10px sans-serif';
      const desc = meta.subtitle.length > 38 ? meta.subtitle.substring(0, 36) + '...' : meta.subtitle;
      ctx.fillText(desc, cx + 10, cy + 108);

      // Goal & Rewards Line
      ctx.fillStyle = isCompleted ? '#7BED9F' : '#FFD700';
      ctx.font = 'bold 10px sans-serif';
      const goalTxt = isPlayable
        ? `Goal: ${meta.targetDistance}m · +${meta.rewardCoins} 🪙 · Rescue ${meta.friendName.split(' ')[0]}`
        : `Goal: ${meta.targetDistance}m · +${meta.rewardCoins} 🪙 · Phase 2`;
      ctx.fillText(goalTxt, cx + 10, cy + 125);

      // Progress bar
      const barX = cx + 10;
      const barY = cy + 133;
      const barW = cardW - 20;
      const barH = 12;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      this.roundRect(ctx, barX, barY, barW, barH, 5);
      ctx.fill();

      const progressVal = isCompleted ? meta.targetDistance : Math.min(meta.targetDistance, cardData.progress || 0);
      const fillRatio = Math.max(0, Math.min(1, progressVal / meta.targetDistance));
      if (fillRatio > 0) {
        ctx.fillStyle = isCompleted ? '#2ED573' : meta.color;
        this.roundRect(ctx, barX, barY, Math.max(8, barW * fillRatio), barH, 5);
        ctx.fill();
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.floor(progressVal)}m / ${meta.targetDistance}m`, barX + barW / 2, barY + 9);

      // Card CTA Button (min 44px height)
      const ctaLabel = !isPlayable
        ? 'COMING IN PHASE 2'
        : !isUnlocked
        ? `🔒 CLEAR CH. ${meta.number - 1} FIRST`
        : isCompleted
        ? '▶ REPLAY CHAPTER'
        : '▶ PLAY CHAPTER';
      const ctaBg = !isPlayable
        ? '#334155'
        : !isUnlocked
        ? '#475569'
        : isCompleted
        ? '#2ED573'
        : meta.color;
      const ctaTextCol = isCompleted ? '#062010' : '#FFFFFF';

      this.drawButton(ctx, `card_play_${meta.id}`, cx + 10, cy + 153, cardW - 20, 44, ctaLabel, ctaBg, ctaTextCol, () => {
        this.game.startChapter(meta.id);
      });

      ctx.restore();
    });

    // Bottom Navigation Bar
    const navY = 516;
    const navW = Math.min(195, Math.floor((w - 84) / 4));
    const navGap = 14;
    const navTotal = navW * 4 + navGap * 3;
    const navX = w / 2 - navTotal / 2;

    this.drawButton(ctx, 'story_back_btn', navX, navY, navW, 48, '◀ MAIN MENU', '#485460', '#FFFFFF', () => {
      this.game.state = 'menu';
    });

    this.drawButton(ctx, 'story_friends_btn', navX + (navW + navGap), navY, navW, 48, '🏕 RESCUED FRIENDS', '#10AC84', '#FFFFFF', () => {
      this.game.state = 'friends_collection';
    });

    this.drawButton(ctx, 'story_upgrades_btn', navX + (navW + navGap) * 2, navY, navW, 48, '⚡ UPGRADES', '#FF6B35', '#FFFFFF', () => {
      this.game.state = 'upgrades';
    });

    this.drawButton(ctx, 'story_cinematic_btn', navX + (navW + navGap) * 3, navY, navW, 48, '🎬 REPLAY INTRO', '#00D2FF', '#001A33', () => {
      this.game.narration.startOpeningCinematic(false);
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

  lerpHex(hexA, hexB, t) {
    const a = hexA.replace('#', '');
    const b = hexB.replace('#', '');
    const r1 = parseInt(a.substring(0, 2), 16);
    const g1 = parseInt(a.substring(2, 4), 16);
    const b1 = parseInt(a.substring(4, 6), 16);
    const r2 = parseInt(b.substring(0, 2), 16);
    const g2 = parseInt(b.substring(2, 4), 16);
    const b2 = parseInt(b.substring(4, 6), 16);
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const bl = Math.round(b1 + (b2 - b1) * t);
    return `rgb(${r}, ${g}, ${bl})`;
  }

  drawDebugBadge(ctx) {
    const w = this.game.width;
    const st = this.game.state;
    const badgeW = 138;
    const badgeH = 30;
    const hitH = 44;

    let bx = 20;
    let by = 16;
    if (st === 'playing' || st === 'paused') {
      bx = 28;
      by = 98;
    } else if (st === 'chapter_intro') {
      bx = w - badgeW - 20;
      by = 22;
    }

    this.registerButton('debug_badge_btn', bx, by - 7, badgeW, hitH, () => {
      this.game.debug.openPanel();
    });

    ctx.save();
    ctx.fillStyle = '#18243A';
    this.roundRect(ctx, bx, by, badgeW, badgeH, 8);
    ctx.fill();
    ctx.strokeStyle = '#2ED573';
    ctx.lineWidth = 1.6;
    this.roundRect(ctx, bx, by, badgeW, badgeH, 8);
    ctx.stroke();

    ctx.fillStyle = '#2ED573';
    ctx.beginPath();
    ctx.arc(bx + 14, by + badgeH / 2, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('DEBUG MODE', bx + 24, by + badgeH / 2 + 0.5);
    ctx.restore();
  }

  drawDeveloperPanel(ctx) {
    const w = this.game.width;
    const h = this.game.height;
    const dbg = this.game.debug;
    const CHAPTER_CARDS = window.OopsWorld.CHAPTER_CARDS || [];
    if (!dbg || !dbg.shouldShowDebugUI()) return;

    ctx.save();
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, w, h);

    // Header
    ctx.fillStyle = '#2ED573';
    ctx.font = '900 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🛠️ DEVELOPER DEBUG PANEL', w / 2, 32);

    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(
      `DEBUG MODE ACTIVE · ISOLATED DEBUG SAVE (${this.game.storage?.data?.totalCoins || 0} Coins) · NORMAL PROGRESS PROTECTED`,
      w / 2,
      54
    );

    this.drawButton(ctx, 'dev_close_btn', 20, 14, 120, 44, '◀ BACK', '#4B596E', '#FFFFFF', () => {
      dbg.closePanel();
    });

    this.drawButton(ctx, 'dev_exit_btn', w - 166, 14, 146, 44, '🔒 EXIT DEBUG', '#C0392B', '#FFFFFF', () => {
      dbg.deactivate();
    });

    // Two-column responsive container
    const panelW = Math.min(780, w - 40);
    const panelX = w / 2 - panelW / 2;
    const colGap = 18;
    const colW = Math.floor((panelW - colGap) / 2);
    const leftX = panelX;
    const rightX = panelX + colW + colGap;

    // Column cards
    ctx.fillStyle = '#18243A';
    this.roundRect(ctx, leftX, 74, colW, 514, 12);
    ctx.fill();
    ctx.strokeStyle = '#334666';
    ctx.lineWidth = 1.4;
    this.roundRect(ctx, leftX, 74, colW, 514, 12);
    ctx.stroke();

    ctx.fillStyle = '#18243A';
    this.roundRect(ctx, rightX, 74, colW, 514, 12);
    ctx.fill();
    ctx.strokeStyle = '#334666';
    this.roundRect(ctx, rightX, 74, colW, 514, 12);
    ctx.stroke();

    // Left Column: Gameplay & Save Toggles
    ctx.fillStyle = '#E2E8F0';
    ctx.font = '900 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('GAMEPLAY & UNLOCK OVERRIDES', leftX + 14, 98);

    const toggleItems = [
      { key: 'unlimitedHealth', label: 'Unlimited Health' },
      { key: 'unlockAllChapters', label: 'Unlock All Chapters' },
      { key: 'unlimitedCoins', label: 'Unlimited Coins' },
      { key: 'disableObstacles', label: 'Disable Obstacles' },
      { key: 'unlimitedPowerups', label: 'Unlimited Power-Ups' }
    ];

    const btnPad = 14;
    const leftBtnW = colW - btnPad * 2;
    toggleItems.forEach((item, idx) => {
      const on = Boolean(dbg.flags[item.key]);
      const by = 112 + idx * 54;
      this.drawButton(
        ctx,
        `dev_toggle_${item.key}`,
        leftX + btnPad,
        by,
        leftBtnW,
        46,
        `${item.label}: ${on ? 'ON ✔' : 'OFF'}`,
        on ? '#2E8B57' : '#334155',
        '#FFFFFF',
        () => {
          dbg.toggleFlag(item.key);
        }
      );
    });

    this.drawButton(
      ctx,
      'dev_skip_missions_btn',
      leftX + btnPad,
      390,
      leftBtnW,
      46,
      '⏩ Skip Missions (Complete All Ch. 1–6)',
      '#D97724',
      '#FFFFFF',
      () => {
        dbg.skipMissions();
      }
    );

    this.drawButton(
      ctx,
      'dev_toggle_day_btn',
      leftX + btnPad,
      446,
      leftBtnW,
      46,
      dbg.isDayMode ? '🌙 Switch Home Sky: DAY → NIGHT' : '☀️ Switch Home Sky: NIGHT → DAY',
      '#2C7AB8',
      '#FFFFFF',
      () => {
        dbg.isDayMode = !dbg.isDayMode;
      }
    );

    this.drawButton(
      ctx,
      'dev_reset_progress_btn',
      leftX + btnPad,
      502,
      leftBtnW,
      46,
      '♻️ Reset Debug Progress',
      '#7F1D1D',
      '#FFFFFF',
      () => {
        dbg.resetDebugProgress();
      }
    );

    // Right Column: Direct Chapter Selection, Visual Testing Jumps, Final Trial & Part 1 Ending
    ctx.fillStyle = '#E2E8F0';
    ctx.font = '900 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('DIRECT CHAPTER SELECTION (CH. 1–6)', rightX + 14, 98);

    const chGap = 8;
    const chBtnW = Math.floor((colW - btnPad * 2 - chGap * 2) / 3);
    CHAPTER_CARDS.slice(0, 6).forEach((ch, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const cx = rightX + btnPad + col * (chBtnW + chGap);
      const cy = 112 + row * 52;
      const selected = dbg.selectedTestChapterId === ch.id;
      this.drawButton(
        ctx,
        `dev_ch_${ch.id}`,
        cx,
        cy,
        chBtnW,
        44,
        `${ch.icon} CH.${ch.number}`,
        selected ? '#2C7AB8' : '#334155',
        '#FFFFFF',
        () => {
          dbg.selectTestChapter(ch.id);
        }
      );
    });

    const selMeta = this.game.chapters.getCardMeta(dbg.selectedTestChapterId);
    this.drawButton(
      ctx,
      'dev_play_selected_btn',
      rightX + btnPad,
      218,
      leftBtnW,
      44,
      `▶ Play Chapter ${selMeta.number} (${selMeta.id.toUpperCase()})`,
      '#298967',
      '#FFFFFF',
      () => {
        this.game.startChapter(selMeta.id);
      }
    );

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '900 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`CHAPTER VISUAL TESTING — CH.${selMeta.number}`, rightX + 14, 284);

    const jumpRow1 = [
      { id: 'start', label: '⏮ Start', color: '#3165B5' },
      { id: 'middle', label: '⏯ Middle', color: '#D97724' },
      { id: 'end', label: '⏭ End', color: '#2E8B57' }
    ];
    jumpRow1.forEach((j, idx) => {
      this.drawButton(
        ctx,
        `dev_jump_${j.id}`,
        rightX + btnPad + idx * (chBtnW + chGap),
        296,
        chBtnW,
        44,
        j.label,
        j.color,
        '#FFFFFF',
        () => {
          dbg.jumpToChapterPhase(selMeta.id, j.id);
        }
      );
    });

    const halfGap = 10;
    const halfBtnW = Math.floor((leftBtnW - halfGap) / 2);
    this.drawButton(
      ctx,
      'dev_jump_rescue',
      rightX + btnPad,
      348,
      halfBtnW,
      44,
      '🤝 Rescue Sequence',
      '#298967',
      '#FFFFFF',
      () => {
        dbg.jumpToChapterPhase(selMeta.id, 'rescue');
      }
    );

    this.drawButton(
      ctx,
      'dev_jump_completion',
      rightX + btnPad + halfBtnW + halfGap,
      348,
      halfBtnW,
      44,
      '🏁 Completion Sequence',
      '#7B4EB2',
      '#FFFFFF',
      () => {
        dbg.jumpToChapterPhase(selMeta.id, 'completion');
      }
    );

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '900 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('ENDGAME & STORY TESTING', rightX + 14, 418);

    this.drawButton(
      ctx,
      'dev_final_trial_btn',
      rightX + btnPad,
      430,
      leftBtnW,
      46,
      '⚔️ Final Trial Testing (Multi-Disaster Gauntlet)',
      '#B83B2B',
      '#FFFFFF',
      () => {
        dbg.startFinalTrialTest();
      }
    );

    this.drawButton(
      ctx,
      'dev_part1_ending_btn',
      rightX + btnPad,
      486,
      leftBtnW,
      46,
      '🎬 Part 1 Ending Testing (Reunion Finale)',
      '#7B4EB2',
      '#FFFFFF',
      () => {
        dbg.startPart1EndingTest();
      }
    );

    ctx.fillStyle = '#94A3B8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      'Normal player coins, unlocks & rescued friends remain untouched.',
      rightX + colW / 2,
      562
    );

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
