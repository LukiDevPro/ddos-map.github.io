'use strict';

(function () {
  const ui = {
    startBtn: document.getElementById('start-btn'),
    stopBtn: document.getElementById('stop-btn'),
    soundToggle: document.getElementById('sound-toggle'),
    terminal: document.getElementById('terminal'),
    bar: document.getElementById('progress-bar'),
    matrix: /** @type {HTMLCanvasElement} */ (document.getElementById('matrix')),
  };

  let running = false;
  let lineTimer = 0;
  let barTimer = 0;
  let progress = 0;
  let audioCtx = null;

  // Matrix rain background
  const ctx = ui.matrix.getContext('2d');
  let columns = [];
  function resizeMatrix() {
    ui.matrix.width = window.innerWidth;
    ui.matrix.height = window.innerHeight;
    const fontSize = 16;
    const cols = Math.floor(ui.matrix.width / fontSize);
    columns = new Array(cols).fill(0).map(() => Math.floor(Math.random() * ui.matrix.height));
    ctx.font = fontSize + 'px monospace';
  }
  function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(0, 0, ui.matrix.width, ui.matrix.height);
    ctx.fillStyle = '#00ffa2';
    columns.forEach((y, i) => {
      const char = String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96));
      const x = i * 16;
      ctx.fillText(char, x, y);
      const ny = y + (16 + Math.random() * 12);
      columns[i] = ny > ui.matrix.height ? 0 : ny;
    });
    requestAnimationFrame(drawMatrix);
  }
  resizeMatrix();
  drawMatrix();
  window.addEventListener('resize', resizeMatrix);

  function beep(freq = 880, durMs = 60) {
    if (!ui.soundToggle.checked) return;
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(freq, audioCtx.currentTime);
    g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + durMs / 1000);
    o.connect(g).connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + durMs / 1000);
  }

  function fmtTime(d = new Date()) {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  const fakeFiles = ['holiday_photos.zip', 'notes.txt', 'budget.xlsx', 'accounts.db', 'backup.tar', 'project.docx', 'videos.mov', 'archive.7z'];
  const ops = ['Scan', 'Analyse', 'Encrypt', 'Decrypt', 'Checksum', 'Index', 'Map'];

  function addLine(kind, text) {
    const line = document.createElement('div');
    line.className = 'line';
    const time = document.createElement('span');
    time.className = 'time';
    time.textContent = `[${fmtTime()}]`;
    const span = document.createElement('span');
    span.className = kind;
    span.textContent = ' ' + text;
    line.appendChild(time);
    line.appendChild(span);
    ui.terminal.appendChild(line);
    ui.terminal.scrollTop = ui.terminal.scrollHeight;
  }

  function randomOpLine() {
    const op = ops[Math.floor(Math.random() * ops.length)];
    const file = fakeFiles[Math.floor(Math.random() * fakeFiles.length)];
    const pct = (progress + Math.floor(Math.random() * 7)) % 100;
    const kind = Math.random() < 0.05 ? 'err' : (Math.random() < 0.2 ? 'warn' : 'ok');
    const msg = `${op} :: ${file} :: ${pct}%`;
    addLine(kind, msg);
    if (kind === 'err') beep(180, 80); else if (kind === 'warn') beep(440, 50); else beep(880, 30);
  }

  function start() {
    if (running) return;
    running = true;
    ui.startBtn.disabled = true;
    ui.stopBtn.disabled = false;
    ui.terminal.innerHTML = '';
    progress = 0;
    ui.bar.style.width = '0%';
    addLine('ok', 'Simulation gestartet – harmlos, nur Textausgabe.');

    lineTimer = window.setInterval(() => {
      if (!running) return;
      randomOpLine();
    }, 220);

    barTimer = window.setInterval(() => {
      if (!running) return;
      progress = Math.min(100, progress + 1 + Math.floor(Math.random() * 4));
      ui.bar.style.width = progress + '%';
      if (progress >= 100) {
        addLine('ok', 'Vorgang abgeschlossen. (Simulation)');
        stop(false);
      }
    }, 240);
  }

  function stop(addMsg = true) {
    running = false;
    ui.startBtn.disabled = false;
    ui.stopBtn.disabled = true;
    window.clearInterval(lineTimer);
    window.clearInterval(barTimer);
    if (addMsg) addLine('warn', 'Simulation gestoppt.');
  }

  ui.startBtn.addEventListener('click', start);
  ui.stopBtn.addEventListener('click', () => stop(true));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') stop(true);
  });
})();