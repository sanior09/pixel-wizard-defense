/**
 * Main Game Engine for "อัศวินเวทมนตร์พิทักษ์ปราสาท"
 * 2D Pixel Art Fantasy Arcade Shooter (60-second defense)
 */
(function () {
  const CANVAS_W = 480;
  const CANVAS_H = 680;
  const RAMPART_Y = 604;
  const WIZARD_Y = 576;
  const GAME_DURATION = 60;
  const HIGH_SCORE_KEY = 'magic_castle_defender_highscore_v1';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // DOM elements
  const scoreValueEl = document.getElementById('scoreValue');
  const timerValueEl = document.getElementById('timerValue');
  const timerCardEl = document.getElementById('timerCard');
  const startOverlay = document.getElementById('startOverlay');
  const gameOverOverlay = document.getElementById('gameOverOverlay');
  const startBtn = document.getElementById('startBtn');
  const restartBtn = document.getElementById('restartBtn');
  const muteBtn = document.getElementById('muteBtn');
  const finalScoreEl = document.getElementById('finalScore');
  const highScoreBadgeEl = document.getElementById('highScoreBadge');
  const statMonstersEl = document.getElementById('statMonsters');
  const statAlliesEl = document.getElementById('statAllies');
  const rankTextEl = document.getElementById('rankText');

  const btnLeft = document.getElementById('btnLeft');
  const btnRight = document.getElementById('btnRight');
  const btnFire = document.getElementById('btnFire');

  // Initialize pixel sprites & mini legend previews
  SpriteBank.init(3); // 16x16 * 3 = 48x48 crisp pixel sprites
  SpriteBank.populateMiniLegends();

  // Entity Catalog
  const ENTITY_TYPES = {
    slime: {
      sprite: 'slime',
      isMonster: true,
      points: 10,
      speedMin: 82,
      speedMax: 120,
      radius: 20,
      swayAmp: 18,
      swayFreq: 3.2,
      label: '+10',
      burstColor: '#4ade80',
    },
    bat: {
      sprite: 'bat',
      isMonster: true,
      points: 10,
      speedMin: 112,
      speedMax: 158,
      radius: 20,
      swayAmp: 46,
      swayFreq: 4.5,
      label: '+10',
      burstColor: '#c084fc',
    },
    ghost: {
      sprite: 'ghost',
      isMonster: true,
      points: 10,
      speedMin: 92,
      speedMax: 135,
      radius: 20,
      swayAmp: 34,
      swayFreq: 2.6,
      label: '+10',
      burstColor: '#74e8ff',
    },
    dragon: {
      sprite: 'dragon',
      isMonster: true,
      points: 10,
      speedMin: 120,
      speedMax: 168,
      radius: 22,
      swayAmp: 38,
      swayFreq: 3.8,
      label: '+10',
      burstColor: '#ff7b47',
    },
    fairy: {
      sprite: 'fairy',
      isMonster: false,
      points: -10,
      speedMin: 78,
      speedMax: 114,
      radius: 20,
      swayAmp: 28,
      swayFreq: 2.4,
      label: '-10',
      burstColor: '#ffd166',
    },
    pet: {
      sprite: 'pet',
      isMonster: false,
      points: -10,
      speedMin: 82,
      speedMax: 118,
      radius: 20,
      swayAmp: 24,
      swayFreq: 2.8,
      label: '-10',
      burstColor: '#ff99cc',
    },
  };

  const MONSTER_KEYS = ['slime', 'bat', 'ghost', 'dragon'];
  const ALLY_KEYS = ['fairy', 'pet'];

  // Background stars & fireflies (generated once for consistent night scene)
  const stars = Array.from({ length: 58 }, (_, i) => ({
    x: Math.floor((Math.sin(i * 91.7) * 0.5 + 0.5) * (CANVAS_W - 12)) + 6,
    y: Math.floor((Math.cos(i * 47.3) * 0.5 + 0.5) * 340) + 10,
    size: i % 5 === 0 ? 3 : 2,
    phase: i * 0.8,
    speed: 1.5 + (i % 4) * 0.7,
    cross: i % 9 === 0,
  }));

  const fireflies = Array.from({ length: 14 }, (_, i) => ({
    baseX: 30 + (i * 34) % (CANVAS_W - 60),
    baseY: 430 + ((i * 53) % 160),
    phase: i * 1.1,
    speed: 0.9 + (i % 3) * 0.4,
  }));

  // Game State
  const state = {
    mode: 'start', // 'start' | 'playing' | 'gameover'
    score: 0,
    timeLeft: GAME_DURATION,
    lastSecondBeep: GAME_DURATION,
    monstersHit: 0,
    alliesHit: 0,
    spawnTimer: 0,
    elapsed: 0,
    shakeTimer: 0,
    penaltyFlash: 0,
    wizard: {
      x: CANVAS_W / 2,
      targetX: null,
      speed: 310,
      castTimer: 0,
      shootCooldown: 0,
      facing: 1,
    },
    input: {
      left: false,
      right: false,
      fire: false,
      pointerX: CANVAS_W / 2,
      pointerY: 220,
      hasPointer: false,
    },
    bullets: [],
    entities: [],
    particles: [],
    popups: [],
  };

  function getHighScore() {
    try {
      return parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0', 10) || 0;
    } catch {
      return 0;
    }
  }

  function saveHighScore(val) {
    try {
      const prev = getHighScore();
      if (val > prev) {
        localStorage.setItem(HIGH_SCORE_KEY, String(val));
        return val;
      }
      return prev;
    } catch {
      return val;
    }
  }

  function updateHUD() {
    scoreValueEl.textContent = String(state.score);
    const sec = Math.max(0, Math.ceil(state.timeLeft));
    timerValueEl.textContent = String(sec);
    if (sec <= 10 && state.mode === 'playing') {
      timerCardEl.classList.add('urgent');
    } else {
      timerCardEl.classList.remove('urgent');
    }
  }

  function resetGame() {
    state.score = 0;
    state.timeLeft = GAME_DURATION;
    state.lastSecondBeep = GAME_DURATION;
    state.monstersHit = 0;
    state.alliesHit = 0;
    state.spawnTimer = 0.35;
    state.elapsed = 0;
    state.shakeTimer = 0;
    state.penaltyFlash = 0;
    state.wizard.x = CANVAS_W / 2;
    state.wizard.targetX = null;
    state.wizard.castTimer = 0;
    state.wizard.shootCooldown = 0;
    state.bullets = [];
    state.entities = [];
    state.particles = [];
    state.popups = [];
    updateHUD();
  }

  function startGame() {
    SoundFX.unlock();
    resetGame();
    state.mode = 'playing';
    startOverlay.classList.remove('active');
    gameOverOverlay.classList.remove('active');
    SoundFX.playStart();
    updateHUD();
  }

  function getRankTitle(score) {
    if (score >= 450) return 'มหาจอมเวทผู้พิทักษ์แห่งตำนาน';
    if (score >= 300) return 'อัศวินเวทมนตร์ระดับปรมาจารย์';
    if (score >= 180) return 'องครักษ์ปราสาทผู้แม่นยำ';
    if (score >= 80) return 'นักเวทแห่งหอคอยจันทรา';
    return 'จอมเวทฝึกหัดแห่งหอคอย';
  }

  function endGame() {
    state.mode = 'gameover';
    timerCardEl.classList.remove('urgent');
    SoundFX.playGameOver();

    const best = saveHighScore(state.score);
    finalScoreEl.textContent = String(state.score);
    highScoreBadgeEl.textContent = `สถิติสูงสุด: ${best}`;
    statMonstersEl.textContent = String(state.monstersHit);
    statAlliesEl.textContent = String(state.alliesHit);
    rankTextEl.textContent = getRankTitle(state.score);

    gameOverOverlay.classList.add('active');
    updateHUD();
  }

  function spawnEntity() {
    // ~74% Monster, ~26% Friendly Fairy or Magical Pet
    const isMonster = Math.random() < 0.74;
    const key = isMonster
      ? MONSTER_KEYS[Math.floor(Math.random() * MONSTER_KEYS.length)]
      : ALLY_KEYS[Math.floor(Math.random() * ALLY_KEYS.length)];

    const def = ENTITY_TYPES[key];
    // Difficulty ramps gently as 60s progresses
    const progress = Math.min(1, state.elapsed / GAME_DURATION);
    const speedMult = 1 + progress * 0.36;
    const speed = (def.speedMin + Math.random() * (def.speedMax - def.speedMin)) * speedMult;

    const margin = 42;
    const baseX = margin + Math.random() * (CANVAS_W - margin * 2);

    state.entities.push({
      type: key,
      def,
      x: baseX,
      baseX,
      y: -26,
      vy: speed,
      phase: Math.random() * Math.PI * 2,
      radius: def.radius,
      animOffset: Math.random() * 10,
    });
  }

  function fireMagicBall(targetX, targetY) {
    if (state.mode !== 'playing') return;
    if (state.wizard.shootCooldown > 0) return;

    const originX = state.wizard.x + (state.wizard.facing >= 0 ? 12 : -12);
    const originY = WIZARD_Y - 14;

    let vx = 0;
    let vy = -560;

    if (typeof targetX === 'number' && typeof targetY === 'number') {
      const dx = targetX - originX;
      const dy = Math.min(-40, targetY - originY); // Always shoot upward toward sky
      const dist = Math.hypot(dx, dy) || 1;
      const speed = 580;
      vx = (dx / dist) * speed;
      vy = (dy / dist) * speed;
      state.wizard.facing = dx >= 0 ? 1 : -1;
    }

    state.bullets.push({
      x: originX,
      y: originY,
      vx,
      vy,
      radius: 8,
      life: 0,
    });

    state.wizard.castTimer = 0.16;
    state.wizard.shootCooldown = 0.19;
    SoundFX.playShoot();

    // Staff cast sparkles
    spawnBurst(originX, originY, '#74e8ff', 6, 90);
  }

  function spawnBurst(x, y, color, count = 14, maxSpeed = 160) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 35 + Math.random() * maxSpeed;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() < 0.5 ? 4 : 3,
        color,
        life: 0.35 + Math.random() * 0.28,
        maxLife: 0.63,
      });
    }
  }

  function addPopup(x, y, text, color) {
    state.popups.push({
      x,
      y,
      text,
      color,
      life: 0.85,
      maxLife: 0.85,
    });
  }

  function update(dt) {
    state.elapsed += dt;

    if (state.shakeTimer > 0) {
      state.shakeTimer = Math.max(0, state.shakeTimer - dt);
    }
    if (state.penaltyFlash > 0) {
      state.penaltyFlash = Math.max(0, state.penaltyFlash - dt * 2.5);
    }

    if (state.mode !== 'playing') {
      return;
    }

    // Countdown timer (60 seconds)
    state.timeLeft -= dt;
    const ceilSec = Math.ceil(state.timeLeft);
    if (ceilSec !== state.lastSecondBeep && ceilSec <= 5 && ceilSec > 0) {
      state.lastSecondBeep = ceilSec;
      SoundFX.playTick();
    }

    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      endGame();
      return;
    }

    updateHUD();

    // Wizard Movement
    const wiz = state.wizard;
    if (wiz.castTimer > 0) wiz.castTimer = Math.max(0, wiz.castTimer - dt);
    if (wiz.shootCooldown > 0) wiz.shootCooldown = Math.max(0, wiz.shootCooldown - dt);

    let moveDir = 0;
    if (state.input.left) moveDir -= 1;
    if (state.input.right) moveDir += 1;

    if (moveDir !== 0) {
      wiz.targetX = null;
      wiz.x += moveDir * wiz.speed * dt;
      wiz.facing = moveDir;
    } else if (wiz.targetX !== null) {
      const diff = wiz.targetX - wiz.x;
      if (Math.abs(diff) > 4) {
        const step = Math.sign(diff) * Math.min(Math.abs(diff), wiz.speed * 1.15 * dt);
        wiz.x += step;
        wiz.facing = Math.sign(diff);
      } else {
        wiz.targetX = null;
      }
    }

    wiz.x = Math.max(30, Math.min(CANVAS_W - 30, wiz.x));

    // Continuous fire if Space / Fire button held
    if (state.input.fire && wiz.shootCooldown <= 0) {
      fireMagicBall();
    }

    // Spawner
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      spawnEntity();
      const progress = Math.min(1, state.elapsed / GAME_DURATION);
      const minInterval = 0.42;
      const maxInterval = 0.94 - progress * 0.42;
      state.spawnTimer = minInterval + Math.random() * (maxInterval - minInterval);
    }

    // Update Magic Balls
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      const b = state.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life += dt;

      if (Math.random() < 0.7) {
        state.particles.push({
          x: b.x + (Math.random() - 0.5) * 4,
          y: b.y + 4,
          vx: (Math.random() - 0.5) * 18,
          vy: 25 + Math.random() * 25,
          size: 3,
          color: Math.random() < 0.5 ? '#74e8ff' : '#ffd166',
          life: 0.2,
          maxLife: 0.2,
        });
      }

      if (b.y < -20 || b.x < -20 || b.x > CANVAS_W + 20) {
        state.bullets.splice(i, 1);
      }
    }

    // Update Falling Entities & Collisions
    for (let i = state.entities.length - 1; i >= 0; i--) {
      const ent = state.entities[i];
      ent.y += ent.vy * dt;
      ent.phase += ent.def.swayFreq * dt;
      ent.x = Math.max(
        26,
        Math.min(CANVAS_W - 26, ent.baseX + Math.sin(ent.phase) * ent.def.swayAmp)
      );

      // Check collision with magic balls
      let hit = false;
      for (let j = state.bullets.length - 1; j >= 0; j--) {
        const b = state.bullets[j];
        const dist = Math.hypot(ent.x - b.x, ent.y - b.y);
        if (dist <= ent.radius + b.radius) {
          state.bullets.splice(j, 1);
          hit = true;
          break;
        }
      }

      if (hit) {
        state.score += ent.def.points;
        if (ent.def.isMonster) {
          state.monstersHit += 1;
          SoundFX.playMonsterHit();
          spawnBurst(ent.x, ent.y, ent.def.burstColor, 16, 170);
          addPopup(ent.x, ent.y - 10, '+10', '#4ade80');
        } else {
          state.alliesHit += 1;
          state.shakeTimer = 0.22;
          state.penaltyFlash = 0.7;
          SoundFX.playAllyPenalty();
          spawnBurst(ent.x, ent.y, '#ff5d73', 16, 160);
          addPopup(ent.x, ent.y - 10, '-10!', '#ff5d73');
        }
        updateHUD();
        state.entities.splice(i, 1);
        continue;
      }

      // Reached Castle Battlement
      if (ent.y >= RAMPART_Y - 10) {
        const shieldColor = ent.def.isMonster ? '#6366f1' : '#ffd166';
        spawnBurst(ent.x, RAMPART_Y - 6, shieldColor, 6, 70);
        state.entities.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        state.particles.splice(i, 1);
      }
    }

    // Update Floating Score Popups
    for (let i = state.popups.length - 1; i >= 0; i--) {
      const pop = state.popups[i];
      pop.y -= 42 * dt;
      pop.life -= dt;
      if (pop.life <= 0) {
        state.popups.splice(i, 1);
      }
    }
  }

  // Draw Night-time Pixel Art Fantasy Castle Scene
  function drawBackground(t) {
    // Stepped Pixel Sky Bands
    const skyBands = [
      { y: 0, h: 110, color: '#070918' },
      { y: 110, h: 110, color: '#0b0f29' },
      { y: 220, h: 120, color: '#11183d' },
      { y: 340, h: 140, color: '#182152' },
      { y: 480, h: 200, color: '#1f2961' },
    ];
    for (const band of skyBands) {
      ctx.fillStyle = band.color;
      ctx.fillRect(0, band.y, CANVAS_W, band.h);
    }

    // Pixel Crescent Moon (top right)
    const moonX = 394;
    const moonY = 72;
    ctx.fillStyle = 'rgba(255, 224, 125, 0.12)';
    ctx.fillRect(moonX - 36, moonY - 36, 72, 72);
    ctx.fillStyle = 'rgba(255, 224, 125, 0.22)';
    ctx.fillRect(moonX - 28, moonY - 28, 56, 56);
    ctx.fillStyle = '#ffe999';
    ctx.fillRect(moonX - 20, moonY - 20, 40, 40);
    ctx.fillStyle = '#fff6cc';
    ctx.fillRect(moonX - 16, moonY - 16, 28, 28);
    // Crescent cutout
    ctx.fillStyle = '#070918';
    ctx.fillRect(moonX - 4, moonY - 22, 26, 30);

    // Twinkling Pixel Stars
    for (const s of stars) {
      const twinkle = Math.sin(t * s.speed + s.phase);
      if (twinkle < -0.55) continue;
      ctx.fillStyle = twinkle > 0.4 ? '#ffffff' : '#9eb8ff';
      ctx.fillRect(s.x, s.y, s.size, s.size);
      if (s.cross && twinkle > 0.2) {
        ctx.fillRect(s.x - 2, s.y + 1, 6, 1);
        ctx.fillRect(s.x + 1, s.y - 2, 1, 6);
      }
    }

    // Distant Enchanted Mountain & Forest Silhouette
    ctx.fillStyle = '#101533';
    const peaks = [
      [0, 500, 90, 430, 175, 500],
      [130, 500, 235, 415, 340, 500],
      [285, 500, 390, 435, 480, 500],
    ];
    for (const [x1, y1, x2, y2, x3, y3] of peaks) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.closePath();
      ctx.fill();
    }

    // Castle Silhouette Towers (Background Midground)
    drawCastleTowers(t);

    // Drifting Mana Fireflies
    for (const f of fireflies) {
      const fx = Math.round(f.baseX + Math.sin(t * f.speed + f.phase) * 16);
      const fy = Math.round(f.baseY + Math.cos(t * f.speed * 0.8 + f.phase) * 10);
      const glow = 0.45 + 0.5 * Math.sin(t * 3 + f.phase);
      ctx.fillStyle = `rgba(116, 232, 255, ${glow.toFixed(2)})`;
      ctx.fillRect(fx, fy, 3, 3);
    }

    // Foreground Castle Battlement Rampart (where Wizard stands)
    drawCastleRampart(t);
  }

  function drawCastleTowers(t) {
    // Left Grand Wizard Tower
    ctx.fillStyle = '#181e45';
    ctx.fillRect(14, 410, 68, 200);
    ctx.fillStyle = '#232c61';
    ctx.fillRect(20, 416, 56, 190);
    // Pointed Roof
    ctx.fillStyle = '#32286b';
    for (let row = 0; row < 12; row++) {
      const w = 72 - row * 6;
      ctx.fillRect(48 - w / 2, 410 - row * 4, w, 4);
    }
    // Banner flag
    const wave = Math.sin(t * 4) > 0 ? 2 : 0;
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(47, 346, 2, 18);
    ctx.fillStyle = '#ff5d73';
    ctx.fillRect(49, 346 + wave, 14, 7);

    // Left Tower Glowing Windows
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(38, 442, 18, 26);
    ctx.fillStyle = '#fff5bd';
    ctx.fillRect(42, 446, 10, 18);
    ctx.fillStyle = '#5ef2ff';
    ctx.fillRect(40, 502, 14, 20);

    // Right Grand Castle Keep
    ctx.fillStyle = '#181e45';
    ctx.fillRect(CANVAS_W - 86, 392, 74, 220);
    ctx.fillStyle = '#232c61';
    ctx.fillRect(CANVAS_W - 80, 398, 62, 210);
    // Right Roof
    ctx.fillStyle = '#32286b';
    for (let row = 0; row < 13; row++) {
      const w = 78 - row * 6;
      ctx.fillRect(CANVAS_W - 49 - w / 2, 392 - row * 4, w, 4);
    }
    // Right Flag
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(CANVAS_W - 50, 326, 2, 18);
    ctx.fillStyle = '#5ef2ff';
    ctx.fillRect(CANVAS_W - 48, 326 + (2 - wave), 14, 7);

    // Right Tower Glowing Windows
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(CANVAS_W - 58, 428, 18, 26);
    ctx.fillStyle = '#fff5bd';
    ctx.fillRect(CANVAS_W - 54, 432, 10, 18);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(CANVAS_W - 56, 492, 14, 20);

    // Distant Center Arch Bridge / Castle Wall
    ctx.fillStyle = '#14193b';
    ctx.fillRect(82, 518, CANVAS_W - 168, 90);
    for (let x = 90; x < CANVAS_W - 95; x += 28) {
      ctx.fillStyle = '#1e2554';
      ctx.fillRect(x, 506, 16, 14);
    }
    // Small glowing slit windows in center wall
    ctx.fillStyle = '#ffb74d';
    for (let x = 136; x <= 340; x += 68) {
      ctx.fillRect(x, 540, 8, 16);
    }
  }

  function drawCastleRampart(t) {
    // Arcane Barrier Line above rampart
    const barrierAlpha = 0.25 + 0.12 * Math.sin(t * 4);
    ctx.fillStyle = `rgba(94, 242, 255, ${barrierAlpha.toFixed(2)})`;
    ctx.fillRect(0, RAMPART_Y - 2, CANVAS_W, 3);

    // Stone parapet base
    ctx.fillStyle = '#252d5c';
    ctx.fillRect(0, RAMPART_Y, CANVAS_W, CANVAS_H - RAMPART_Y);

    // Crenellations / Battlement teeth
    ctx.fillStyle = '#364180';
    for (let x = 0; x < CANVAS_W; x += 32) {
      ctx.fillRect(x, RAMPART_Y, 20, 10);
      ctx.fillStyle = '#4c5ba8';
      ctx.fillRect(x, RAMPART_Y, 20, 3);
      ctx.fillStyle = '#364180';
    }

    // Brick Pattern
    ctx.fillStyle = '#1a2047';
    for (let row = 0; row < 4; row++) {
      const y = RAMPART_Y + 18 + row * 16;
      const offset = (row % 2) * 16;
      ctx.fillRect(0, y, CANVAS_W, 2);
      for (let x = offset; x < CANVAS_W; x += 32) {
        ctx.fillRect(x, y, 2, 16);
      }
    }

    // Glowing Arcane Runes embedded in wall
    const runeGlow = 0.55 + 0.35 * Math.sin(t * 3.2);
    ctx.fillStyle = `rgba(116, 232, 255, ${runeGlow.toFixed(2)})`;
    for (let x = 44; x < CANVAS_W - 30; x += 96) {
      ctx.fillRect(x, RAMPART_Y + 26, 8, 8);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 2, RAMPART_Y + 28, 4, 4);
      ctx.fillStyle = `rgba(116, 232, 255, ${runeGlow.toFixed(2)})`;
    }
  }

  function render() {
    const t = state.elapsed;
    ctx.save();

    if (state.shakeTimer > 0) {
      const mag = 5;
      ctx.translate(
        Math.round((Math.random() - 0.5) * mag * 2),
        Math.round((Math.random() - 0.5) * mag * 2)
      );
    }

    drawBackground(t);

    // Subtle Aim Guide when pointer is active during play
    if (state.mode === 'playing' && state.input.hasPointer) {
      const px = Math.round(state.input.pointerX);
      const py = Math.round(Math.min(RAMPART_Y - 30, state.input.pointerY));
      ctx.strokeStyle = 'rgba(116, 232, 255, 0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(px - 8, py - 8, 16, 16);
      ctx.fillStyle = 'rgba(255, 209, 102, 0.7)';
      ctx.fillRect(px - 1, py - 1, 3, 3);
    }

    // Draw Falling Entities
    for (const ent of state.entities) {
      const frameIdx = Math.floor((t + ent.animOffset) * 5) % 2;
      const sprite = SpriteBank.get(ent.def.sprite, frameIdx);
      const drawX = Math.round(ent.x - 24);
      const drawY = Math.round(ent.y - 24);

      // Gentle halo around Friendly Fairies & Magical Pets so player spots them clearly
      if (!ent.def.isMonster) {
        const pulse = 22 + Math.sin(t * 6 + ent.phase) * 2;
        ctx.strokeStyle = ent.type === 'fairy'
          ? 'rgba(255, 209, 102, 0.55)'
          : 'rgba(255, 153, 204, 0.55)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(Math.round(ent.x), Math.round(ent.y), pulse, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (sprite) {
        ctx.drawImage(sprite, drawX, drawY);
      }
    }

    // Draw Magic Balls
    for (const b of state.bullets) {
      const bx = Math.round(b.x);
      const by = Math.round(b.y);
      // Outer arcane glow
      ctx.fillStyle = 'rgba(94, 242, 255, 0.35)';
      ctx.fillRect(bx - 8, by - 8, 16, 16);
      // Mid orb
      ctx.fillStyle = '#38d9ff';
      ctx.fillRect(bx - 5, by - 5, 10, 10);
      // Bright core
      ctx.fillStyle = '#fff6b3';
      ctx.fillRect(bx - 3, by - 3, 6, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx - 1, by - 1, 2, 2);
    }

    // Draw Wizard
    const wiz = state.wizard;
    const wizFrame = wiz.castTimer > 0 ? 1 : 0;
    const wizSprite = SpriteBank.get('wizard', wizFrame);
    if (wizSprite) {
      ctx.save();
      ctx.translate(Math.round(wiz.x), Math.round(WIZARD_Y));
      if (wiz.facing < 0) {
        ctx.scale(-1, 1);
      }
      ctx.drawImage(wizSprite, -24, -24);
      ctx.restore();
    }

    // Draw Pixel Particles
    for (const p of state.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1;

    // Draw Floating +10 / -10 Popups
    ctx.font = 'bold 16px "Press Start 2P", "Chakra Petch", monospace';
    ctx.textAlign = 'center';
    for (const pop of state.popups) {
      const alpha = Math.max(0, Math.min(1, pop.life / 0.35));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#070918';
      ctx.fillText(pop.text, Math.round(pop.x) + 2, Math.round(pop.y) + 2);
      ctx.fillStyle = pop.color;
      ctx.fillText(pop.text, Math.round(pop.x), Math.round(pop.y));
    }
    ctx.globalAlpha = 1;

    // Penalty red screen tint
    if (state.penaltyFlash > 0) {
      ctx.fillStyle = `rgba(255, 59, 92, ${(state.penaltyFlash * 0.28).toFixed(2)})`;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }

    ctx.restore();
  }

  // Coordinate Conversion Helper
  function clientToCanvas(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  // Keyboard Controls
  window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      state.input.left = true;
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      state.input.right = true;
    } else if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      if (state.mode === 'playing') {
        e.preventDefault();
        state.input.fire = true;
        fireMagicBall();
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      state.input.left = false;
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      state.input.right = false;
    } else if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      state.input.fire = false;
    }
  });

  // Pointer (Mouse & Touch) Controls on Canvas
  let pointerActive = false;

  canvas.addEventListener('pointerdown', (e) => {
    if (state.mode !== 'playing') return;
    SoundFX.unlock();
    pointerActive = true;
    const pos = clientToCanvas(e.clientX, e.clientY);
    state.input.pointerX = pos.x;
    state.input.pointerY = pos.y;
    state.input.hasPointer = true;

    // Move wizard toward tap X and fire magic ball toward tapped target
    state.wizard.targetX = pos.x;
    fireMagicBall(pos.x, pos.y);
  });

  canvas.addEventListener('pointermove', (e) => {
    const pos = clientToCanvas(e.clientX, e.clientY);
    state.input.pointerX = pos.x;
    state.input.pointerY = pos.y;
    state.input.hasPointer = true;
    if (pointerActive && state.mode === 'playing') {
      state.wizard.targetX = pos.x;
    }
  });

  window.addEventListener('pointerup', () => {
    pointerActive = false;
  });

  // Mobile Touch Bar Controls
  function bindHoldButton(el, onDown, onUp) {
    const start = (e) => {
      e.preventDefault();
      SoundFX.unlock();
      el.classList.add('pressed');
      onDown();
    };
    const end = (e) => {
      e.preventDefault();
      el.classList.remove('pressed');
      onUp();
    };
    el.addEventListener('pointerdown', start);
    el.addEventListener('pointerup', end);
    el.addEventListener('pointerleave', end);
    el.addEventListener('pointercancel', end);
  }

  bindHoldButton(
    btnLeft,
    () => { state.input.left = true; },
    () => { state.input.left = false; }
  );
  bindHoldButton(
    btnRight,
    () => { state.input.right = true; },
    () => { state.input.right = false; }
  );
  bindHoldButton(
    btnFire,
    () => {
      state.input.fire = true;
      fireMagicBall();
    },
    () => { state.input.fire = false; }
  );

  // UI Buttons
  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', startGame);
  muteBtn.addEventListener('click', () => {
    SoundFX.unlock();
    const muted = SoundFX.toggleMute();
    muteBtn.textContent = muted ? '🔇' : '🔊';
  });

  // Main Animation Loop
  let lastTime = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  updateHUD();
  requestAnimationFrame(loop);
})();
