'use strict';

(function () {
  /** @type {HTMLCanvasElement} */
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  const state = {
    running: false,
    paused: true,
    score: 0,
    lives: 3,
    level: 1,
    lastTime: 0,
    width: canvas.width,
    height: canvas.height,
  };

  const hud = {
    score: document.getElementById('score'),
    lives: document.getElementById('lives'),
    level: document.getElementById('level'),
    overlay: document.getElementById('overlay'),
    overlayTitle: document.getElementById('overlay-title'),
    overlaySub: document.getElementById('overlay-sub'),
  };

  const keys = new Set();

  const player = {
    x: state.width / 2,
    y: state.height - 80,
    vx: 0,
    vy: 0,
    speed: 360, // px/s
    w: 36,
    h: 42,
    cooldownMs: 220,
    lastShotAt: 0,
    invincibleUntil: 0,
  };

  /** @type {{x:number,y:number,vx:number,vy:number,w:number,h:number,life:number}[]} */
  const bullets = [];
  /** @type {{x:number,y:number,vx:number,vy:number,r:number,life:number}[]} */
  const asteroids = [];
  const particles = [];

  function rand(min, max) { return min + Math.random() * (max - min); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function spawnAsteroid() {
    const side = Math.random() < 0.5 ? 'top' : 'sides';
    let x, y, vx, vy;
    const r = rand(12, 36) * (1 + state.level * 0.08);
    if (side === 'top') {
      x = rand(0, state.width);
      y = -r - 10;
      vx = rand(-30, 30);
      vy = rand(60, 140) + state.level * 8;
    } else {
      const left = Math.random() < 0.5;
      x = left ? -r - 10 : state.width + r + 10;
      y = rand(0, state.height * 0.6);
      vx = left ? rand(40, 120) : rand(-120, -40);
      vy = rand(40, 120) + state.level * 6;
    }
    asteroids.push({ x, y, vx, vy, r, life: 1 });
  }

  function shoot(now) {
    if (now - player.lastShotAt < player.cooldownMs) return;
    player.lastShotAt = now;
    bullets.push({ x: player.x, y: player.y - player.h * 0.5, vx: 0, vy: -520, w: 4, h: 14, life: 1 });
  }

  function resetGame() {
    state.score = 0;
    state.lives = 3;
    state.level = 1;
    bullets.length = 0;
    asteroids.length = 0;
    particles.length = 0;
    player.x = state.width / 2;
    player.y = state.height - 80;
    player.invincibleUntil = 0;
  }

  function setRunning(running) {
    state.running = running;
    state.paused = !running;
    hud.overlay.classList.toggle('hidden', running);
  }

  function updateHud() {
    hud.score.textContent = String(state.score);
    hud.lives.textContent = String(state.lives);
    hud.level.textContent = String(state.level);
  }

  function aabb(a, b) {
    return a.x - a.w/2 < b.x + (b.w ? b.w/2 : b.r) &&
           a.x + a.w/2 > b.x - (b.w ? b.w/2 : b.r) &&
           a.y - a.h/2 < b.y + (b.h ? b.h/2 : b.r) &&
           a.y + a.h/2 > b.y - (b.h ? b.h/2 : b.r);
  }

  function explode(x, y, color) {
    for (let i = 0; i < 22; i++) {
      particles.push({
        x, y,
        vx: rand(-180, 180),
        vy: rand(-180, 180),
        life: rand(0.4, 0.9),
        color,
      });
    }
  }

  function drawNeonShip(x, y, color = '#7bffb1') {
    ctx.save();
    ctx.translate(x, y);
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(12, 16);
    ctx.lineTo(0, 10);
    ctx.lineTo(-12, 16);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  function drawNeonAsteroid(x, y, r, color = '#00e0ff') {
    ctx.save();
    ctx.translate(x, y);
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const rr = r * (0.8 + Math.random() * 0.25);
      const px = Math.cos(angle) * rr;
      const py = Math.sin(angle) * rr;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  function drawBullet(b) {
    ctx.save();
    ctx.shadowColor = '#ffd166';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(b.x - b.w/2, b.y - b.h/2, b.w, b.h);
    ctx.restore();
  }

  function drawGridBackground() {
    const w = state.width, h = state.height;
    ctx.fillStyle = '#02070c';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(0,255,200,0.06)';
    ctx.lineWidth = 1;
    const step = 40;
    ctx.beginPath();
    for (let x = 0; x <= w; x += step) {
      ctx.moveTo(x, 0); ctx.lineTo(x, h);
    }
    for (let y = 0; y <= h; y += step) {
      ctx.moveTo(0, y); ctx.lineTo(w, y);
    }
    ctx.stroke();
  }

  function update(dt) {
    // Input
    player.vx = 0; player.vy = 0;
    const up = keys.has('ArrowUp') || keys.has('KeyW');
    const down = keys.has('ArrowDown') || keys.has('KeyS');
    const left = keys.has('ArrowLeft') || keys.has('KeyA');
    const right = keys.has('ArrowRight') || keys.has('KeyD');
    if (up) player.vy -= 1; if (down) player.vy += 1;
    if (left) player.vx -= 1; if (right) player.vx += 1;
    const mag = Math.hypot(player.vx, player.vy) || 1;
    player.vx = (player.vx / mag) * player.speed;
    player.vy = (player.vy / mag) * player.speed;

    player.x += player.vx * dt;
    player.y += player.vy * dt;
    player.x = clamp(player.x, 20, state.width - 20);
    player.y = clamp(player.y, 20, state.height - 20);

    // Shooting
    if (keys.has('Space')) shoot(performance.now());

    // Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      if (b.y < -20 || b.life <= 0) bullets.splice(i, 1);
    }

    // Asteroids spawn rate scales with level
    if (Math.random() < Math.min(0.02 + state.level * 0.004, 0.06)) {
      spawnAsteroid();
    }

    for (let i = asteroids.length - 1; i >= 0; i--) {
      const a = asteroids[i];
      a.x += a.vx * dt; a.y += a.vy * dt; a.life -= dt * 0.001;
      if (a.x < -60 || a.x > state.width + 60 || a.y > state.height + 60) {
        asteroids.splice(i, 1);
        continue;
      }

      // Bullet collisions
      let destroyed = false;
      for (let j = bullets.length - 1; j >= 0; j--) {
        const b = bullets[j];
        if (Math.hypot(a.x - b.x, a.y - b.y) < a.r) {
          bullets.splice(j, 1);
          asteroids.splice(i, 1);
          destroyed = true;
          state.score += 10;
          if (state.score % 120 === 0) state.level += 1;
          explode(a.x, a.y, '#00e0ff');
          break;
        }
      }
      if (destroyed) continue;

      // Player collision
      if (performance.now() > player.invincibleUntil && Math.hypot(a.x - player.x, a.y - player.y) < a.r + 18) {
        asteroids.splice(i, 1);
        state.lives -= 1;
        player.invincibleUntil = performance.now() + 1200;
        explode(player.x, player.y, '#ff4d6d');
        if (state.lives <= 0) {
          gameOver();
          return;
        }
      }
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }

    updateHud();
  }

  function render() {
    drawGridBackground();
    // player
    const flicker = performance.now() < player.invincibleUntil && Math.floor(performance.now() / 100) % 2 === 0;
    if (!flicker) drawNeonShip(player.x, player.y);
    // bullets
    bullets.forEach(drawBullet);
    // asteroids
    for (const a of asteroids) drawNeonAsteroid(a.x, a.y, a.r);
    // particles
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 2, 2);
      ctx.restore();
    }
  }

  function loop(ts) {
    if (!state.running) return;
    const dt = Math.min((ts - state.lastTime) / 1000, 0.033);
    state.lastTime = ts;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  function startGame() {
    resetGame();
    hud.overlayTitle.textContent = 'Neon Space Shooter';
    hud.overlaySub.textContent = 'Drücke Enter, um zu pausieren';
    setRunning(true);
    state.lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  function resumeGame() {
    setRunning(true);
    hud.overlaySub.textContent = 'Drücke Enter, um zu pausieren';
    state.lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  function pauseGame() {
    setRunning(false);
    hud.overlayTitle.textContent = 'Pausiert';
    hud.overlaySub.textContent = 'Enter: Fortsetzen';
  }

  function gameOver() {
    setRunning(false);
    hud.overlayTitle.textContent = 'Game Over';
    hud.overlaySub.textContent = 'Enter: Neu starten';
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Enter') {
      if (!state.running && state.lives === 3 && state.score === 0 && asteroids.length === 0) {
        startGame();
      } else if (!state.running && state.lives > 0) {
        resumeGame();
      } else {
        pauseGame();
      }
      e.preventDefault();
      return;
    }
    if (!state.running) return;
    keys.add(e.code);
    if (e.code === 'Space') e.preventDefault();
  });

  window.addEventListener('keyup', (e) => {
    keys.delete(e.code);
  });
})();