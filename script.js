'use strict';

(function () {
  const config = {
    tickMs: 1000,
    spawnProbability: 0.7, // 70% Chance pro Tick für neuen Angriff
    minAttackDurationMs: 10_000,
    maxAttackDurationMs: 28_000,
    maxLogEntries: 120,
    topTargetsWindow: 120, // Anzahl letzter Einträge, die für Top-Ziele betrachtet werden
  };

  const attackTypes = [
    'SYN Flood',
    'UDP Flood',
    'HTTP Flood',
    'ICMP Flood',
    'DNS Amplification',
    'NTP Amplification',
    'SSDP Amplification',
    'Memcached Amplification',
    'SNMP Amplification',
  ];

  // Grobe Länder-Zentroid-Positionen (ca.). Für die Demo ausreichend.
  const countries = [
    { name: 'USA', coords: [39.5, -98.35] },
    { name: 'Kanada', coords: [56.13, -106.35] },
    { name: 'Brasilien', coords: [-14.24, -51.93] },
    { name: 'Argentinien', coords: [-38.42, -63.62] },
    { name: 'Vereinigtes Königreich', coords: [55.37, -3.43] },
    { name: 'Deutschland', coords: [51.16, 10.45] },
    { name: 'Frankreich', coords: [46.23, 2.21] },
    { name: 'Spanien', coords: [40.46, -3.75] },
    { name: 'Italien', coords: [41.87, 12.57] },
    { name: 'Polen', coords: [51.92, 19.15] },
    { name: 'Niederlande', coords: [52.13, 5.29] },
    { name: 'Schweiz', coords: [46.82, 8.23] },
    { name: 'Österreich', coords: [47.52, 14.55] },
    { name: 'Schweden', coords: [60.13, 18.64] },
    { name: 'Norwegen', coords: [60.47, 8.47] },
    { name: 'Finnland', coords: [61.92, 25.75] },
    { name: 'Dänemark', coords: [56.26, 9.50] },
    { name: 'Irland', coords: [53.41, -8.24] },
    { name: 'Portugal', coords: [39.40, -8.22] },
    { name: 'Russland', coords: [61.52, 105.32] },
    { name: 'Ukraine', coords: [48.38, 31.17] },
    { name: 'Türkei', coords: [38.96, 35.24] },
    { name: 'Griechenland', coords: [39.07, 21.82] },
    { name: 'China', coords: [35.86, 104.20] },
    { name: 'Japan', coords: [36.20, 138.25] },
    { name: 'Südkorea', coords: [35.91, 127.77] },
    { name: 'Indien', coords: [20.59, 78.96] },
    { name: 'Pakistan', coords: [30.38, 69.35] },
    { name: 'Indonesien', coords: [-0.79, 113.92] },
    { name: 'Australien', coords: [-25.27, 133.77] },
    { name: 'Neuseeland', coords: [-40.90, 174.88] },
    { name: 'Südafrika', coords: [-30.56, 22.94] },
    { name: 'Ägypten', coords: [26.82, 30.80] },
    { name: 'Nigeria', coords: [9.08, 8.68] },
    { name: 'Kenia', coords: [-0.02, 37.91] },
    { name: 'Marokko', coords: [31.79, -7.09] },
    { name: 'Saudi-Arabien', coords: [23.89, 45.08] },
    { name: 'Vereinigte Arabische Emirate', coords: [23.42, 53.85] },
    { name: 'Israel', coords: [31.05, 34.85] },
    { name: 'Iran', coords: [32.43, 53.69] },
    { name: 'Irak', coords: [33.22, 43.68] },
    { name: 'Mexiko', coords: [23.63, -102.55] },
    { name: 'Kolumbien', coords: [4.57, -74.30] },
    { name: 'Peru', coords: [-9.19, -75.02] },
    { name: 'Chile', coords: [-35.68, -71.54] },
    { name: 'Venezuela', coords: [6.42, -66.59] },
  ];

  const dom = {
    mapEl: /** @type {HTMLElement} */ (document.getElementById('map')),
    totalAttacks: document.getElementById('total-attacks'),
    activeAttacks: document.getElementById('active-attacks'),
    totalBandwidth: document.getElementById('total-bandwidth'),
    totalPps: document.getElementById('total-pps'),
    affectedCountries: document.getElementById('affected-countries'),
    attackLog: document.getElementById('attack-log'),
    topTargets: document.getElementById('top-targets'),
    threatLevel: document.getElementById('threat-level'),
    threatBadge: document.getElementById('threat-badge'),
  };

  // Map initialisieren
  const map = L.map(dom.mapEl, {
    worldCopyJump: true,
    zoomControl: true,
    attributionControl: true,
  }).setView([20, 0], 2);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> Mitwirkende &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd'
  }).addTo(map);

  /** @typedef {{ id: string, source: any, target: any, type: string, bandwidthGbps: number, pps: number, intensity: 'low'|'medium'|'high', startedAt: number, endsAt: number, layerIds: string[] }} Attack */

  /** @type {Attack[]} */
  const activeAttacks = [];
  /** @type {{time: number, type: string, bandwidthGbps: number, pps: number, source: string, target: string, intensity: 'low'|'medium'|'high'}[]} */
  const logEntries = [];
  /** @type {Map<string, number>} */
  const targetCounts = new Map();

  let totalAttacksCounter = 0;

  function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  function formatNumber(num) {
    return Intl.NumberFormat('de-DE').format(Math.round(num));
  }

  function formatGbps(num) {
    return (Math.round(num * 10) / 10).toFixed(1);
  }

  function computeIntensity(bandwidthGbps) {
    if (bandwidthGbps < 10) return 'low';
    if (bandwidthGbps < 50) return 'medium';
    return 'high';
  }

  function computeColor(intensity) {
    switch (intensity) {
      case 'low': return '#34d399';
      case 'medium': return '#ffb300';
      case 'high': return '#ff3b63';
    }
  }

  function randomBandwidthGbps() {
    const r = Math.random();
    if (r < 0.60) return 1 + Math.random() * 9;       // low: 1-10
    if (r < 0.90) return 10 + Math.random() * 40;     // medium: 10-50
    return 50 + Math.random() * 150;                  // high: 50-200
  }

  function estimatePpsFromBandwidth(bandwidthGbps) {
    // Grobe Annahme: ~300k pps pro 1 Gbps (bei ~400 Byte/Packet)
    return bandwidthGbps * 300_000;
  }

  function createPolyline(sourceLatLng, targetLatLng, color) {
    const line = L.polyline([sourceLatLng, targetLatLng], {
      color,
      weight: 2,
      opacity: 0.8,
      dashArray: '6,6',
    }).addTo(map);
    return line;
  }

  function createPulseCircle(latlng, color, size) {
    const circle = L.circleMarker(latlng, {
      radius: size,
      color,
      opacity: 0.9,
      fillOpacity: 0.25,
      fillColor: color,
      weight: 2,
    }).addTo(map);

    // einfache Puls-Animation per Intervall
    let growing = true;
    let radius = size;
    const interval = setInterval(() => {
      radius += growing ? 0.6 : -0.6;
      if (radius > size * 1.5) growing = false;
      if (radius < size * 0.7) growing = true;
      circle.setRadius(radius);
    }, 80);

    return { circle, interval };
  }

  function addLogEntry(entry) {
    logEntries.push(entry);
    if (logEntries.length > config.maxLogEntries) logEntries.shift();

    const li = document.createElement('li');
    const time = new Date(entry.time);
    const hh = String(time.getHours()).padStart(2, '0');
    const mm = String(time.getMinutes()).padStart(2, '0');
    const ss = String(time.getSeconds()).padStart(2, '0');

    li.innerHTML = `
      <span class="log-time">${hh}:${mm}:${ss}</span>
      <span class="log-main"><strong>${entry.type}</strong> – ${entry.source} → ${entry.target}</span>
      <span class="log-meta">
        <span class="badge ${entry.intensity}">${formatGbps(entry.bandwidthGbps)} Gbps</span>
      </span>
    `;
    dom.attackLog.prepend(li);

    // trim DOM list
    while (dom.attackLog.children.length > config.maxLogEntries) {
      dom.attackLog.removeChild(dom.attackLog.lastChild);
    }
  }

  function updateTopTargets() {
    // Neuberechnung basierend auf den letzten N Einträgen
    targetCounts.clear();
    const windowEntries = logEntries.slice(-config.topTargetsWindow);
    for (const e of windowEntries) {
      targetCounts.set(e.target, (targetCounts.get(e.target) || 0) + 1);
    }
    const sorted = Array.from(targetCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);

    dom.topTargets.innerHTML = '';
    for (const [country, count] of sorted) {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${country}</strong> – <span class="badge">${count}</span>`;
      dom.topTargets.appendChild(li);
    }
  }

  function updateStats() {
    const now = Date.now();
    // aktive Bandbreite & pps
    let activeBandwidth = 0;
    let activePps = 0;
    const activeTargets = new Set();
    for (const a of activeAttacks) {
      activeBandwidth += a.bandwidthGbps;
      activePps += a.pps;
      activeTargets.add(a.target.name);
    }

    dom.totalAttacks.textContent = formatNumber(totalAttacksCounter);
    dom.activeAttacks.textContent = formatNumber(activeAttacks.length);
    dom.totalBandwidth.textContent = formatGbps(activeBandwidth);
    dom.totalPps.textContent = formatNumber(activePps);
    dom.affectedCountries.textContent = String(activeTargets.size);

    // Bedrohungsstufe anhand aktiver Angriffe
    let level = 'Niedrig';
    let cls = 'low';
    if (activeAttacks.length >= 6 && activeAttacks.length <= 12) { level = 'Mittel'; cls = 'medium'; }
    if (activeAttacks.length > 12) { level = 'Hoch'; cls = 'high'; }

    dom.threatLevel.textContent = level;
    dom.threatLevel.className = cls;
  }

  function startAttack() {
    const source = pickRandom(countries);
    let target = pickRandom(countries);
    let guard = 0;
    while (target.name === source.name && guard++ < 5) {
      target = pickRandom(countries);
    }

    const type = pickRandom(attackTypes);
    const bandwidthGbps = randomBandwidthGbps();
    const pps = estimatePpsFromBandwidth(bandwidthGbps);
    const intensity = computeIntensity(bandwidthGbps);
    const color = computeColor(intensity);

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = Date.now();
    const duration = config.minAttackDurationMs + Math.floor(Math.random() * (config.maxAttackDurationMs - config.minAttackDurationMs));
    const endsAt = now + duration;

    // Visual layers
    const line = createPolyline(source.coords, target.coords, color);
    const sourcePulse = createPulseCircle(source.coords, '#00c2ff', 5);
    const targetPulse = createPulseCircle(target.coords, color, 7);

    /** @type {Attack} */
    const attack = {
      id,
      source,
      target,
      type,
      bandwidthGbps,
      pps,
      intensity,
      startedAt: now,
      endsAt,
      layerIds: [],
    };

    // store refs for cleanup
    attack.layerIds.push(line._leaflet_id.toString());
    attack.layerIds.push(targetPulse.circle._leaflet_id.toString());
    attack.layerIds.push(sourcePulse.circle._leaflet_id.toString());

    // register for cleanup timers
    const cleanup = () => {
      // remove visuals
      try { map.removeLayer(line); } catch {}
      try { map.removeLayer(targetPulse.circle); } catch {}
      try { map.removeLayer(sourcePulse.circle); } catch {}
      clearInterval(targetPulse.interval);
      clearInterval(sourcePulse.interval);
      // remove from active
      const idx = activeAttacks.findIndex(a => a.id === attack.id);
      if (idx !== -1) activeAttacks.splice(idx, 1);
      updateStats();
    };

    setTimeout(cleanup, duration);

    activeAttacks.push(attack);
    totalAttacksCounter += 1;

    addLogEntry({
      time: now,
      type,
      bandwidthGbps,
      pps,
      source: source.name,
      target: target.name,
      intensity,
    });

    updateTopTargets();
    updateStats();
  }

  function tick() {
    if (Math.random() < config.spawnProbability) {
      startAttack();
    }
  }

  // initial UI paint
  updateStats();

  // start loop
  setInterval(tick, config.tickMs);
})();