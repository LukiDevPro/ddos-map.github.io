(function() {
  const startButton = document.getElementById('startBtn');
  const stopButton = document.getElementById('stopBtn');
  const logEl = document.getElementById('log');
  const modal = document.getElementById('modal');
  const closeModal = document.getElementById('closeModal');

  let intervalId = null;
  let lineCounter = 0;
  const messages = [
    () => `[${time()}] Initialisiere Scan-Engine v1.9.4…`,
    () => `[${time()}] Lade Signaturen (lokal) … OK`,
    () => `[${time()}] Scanne Speicherblöcke… ${rand(120, 320)} Bereiche`,
    () => `[${time()}] Prüfe Netzwerkports… 0 offene riskante Ports`,
    () => `[${time()}] Analysiere Browser-Caches…` ,
    () => `[${time()}] Ungewöhnliche Aktivität: <none>`,
    () => `[${time()}] Hash-Validierung von Systemdateien… OK`,
    () => `[${time()}] Prüfe Autostarts… ${rand(2, 8)} Einträge`,
    () => `[${time()}] Quarantäne: nichts zu tun`,
    () => `[${time()}] Warnung: Test-Signatur EICAR simuliert (harmlos)`,
    () => `[${time()}] Ergebnis: Keine Bedrohungen gefunden ✅`,
  ];

  function time() {
    return new Date().toLocaleTimeString('de-DE', { hour12: false });
  }
  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function appendLine(text, className = '') {
    const line = document.createElement('div');
    line.className = `line ${className}`.trim();
    line.textContent = text;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function startScan() {
    if (intervalId) return;
    clearLog();
    lineCounter = 0;
    startButton.disabled = true;
    stopButton.disabled = false;

    intervalId = setInterval(() => {
      const idx = lineCounter % messages.length;
      const message = messages[idx]();
      const type = idx === 9 ? 'warn' : idx === 10 ? 'line' : 'line';
      appendLine(message, type === 'line' ? '' : type);
      lineCounter++;

      if (lineCounter >= messages.length) {
        stopScan();
        setTimeout(() => modal.classList.remove('hidden'), 350);
      }
    }, 350 + Math.random() * 250);
  }

  function stopScan() {
    if (!intervalId) return;
    clearInterval(intervalId);
    intervalId = null;
    startButton.disabled = false;
    stopButton.disabled = true;
  }

  function clearLog() {
    logEl.innerHTML = '';
  }

  startButton.addEventListener('click', startScan);
  stopButton.addEventListener('click', stopScan);
  closeModal.addEventListener('click', () => modal.classList.add('hidden'));
})();
