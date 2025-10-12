// DOM Elements
const packetsEl = document.getElementById('packets');
const volumeEl = document.getElementById('volume');
const attackersEl = document.getElementById('attackers');
const feedList = document.getElementById('feed-list');

// --- Map Initialization ---
const map = L.map('map', {
    center: [20, 0], // Initial center of the map
    zoom: 2,         // Initial zoom level
    minZoom: 2,      // Minimum zoom level
    maxZoom: 10,     // Maximum zoom level
    zoomControl: false // Hide the default zoom control
});

// Use a dark tile layer from CartoDB
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);

// --- Functions ---
function updateStats() {
    // This can be updated later with real data
    const packetCount = Math.floor(Math.random() * 5000) + 15000;
    const volume = (Math.random() * 20 + 80).toFixed(2);
    packetsEl.textContent = packetCount.toLocaleString();
    volumeEl.textContent = volume;
}

function addFeedItem(attack) {
    const listItem = document.createElement('li');
    listItem.innerHTML = `<span>[ATTACK]</span> Source: ${attack.source.city} -> Target: ${attack.target.city} (${attack.company})`;
    feedList.appendChild(listItem);
    // Scroll to the bottom of the feed to show the latest attack
    feedList.scrollTop = feedList.scrollHeight;
}

function drawAttack(attack) {
    const source = [attack.source.lat, attack.source.lon];
    const target = [attack.target.lat, attack.target.lon];

    const line = L.polyline([source, target], { color: '#ff0000', weight: 1, opacity: 0.8 }).addTo(map);
    const sourceMarker = L.circleMarker(source, { radius: 3, color: '#ff0000', fillColor: '#f03', fillOpacity: 0.8 }).addTo(map);
    const targetMarker = L.circleMarker(target, { radius: 5, color: '#00ff00', fillColor: '#0f0', fillOpacity: 0.8 }).addTo(map);

    targetMarker.bindPopup(`<b>Target:</b> ${attack.target.city}<br><b>Company:</b> ${attack.company}`);
}

async function loadAndDisplayAttacks() {
    try {
        const response = await fetch('attacks.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const attacks = await response.json();

        attackersEl.textContent = attacks.length;

        // Process attacks one by one with a delay to simulate a live feed
        attacks.forEach((attack, index) => {
            setTimeout(() => {
                drawAttack(attack);
                addFeedItem(attack);
            }, index * 1500); // 1.5 second delay between each attack
        });

    } catch (error) {
        console.error("Could not load or display attack data:", error);
    }
}

// --- Start ---
setInterval(updateStats, 2000);
updateStats();
loadAndDisplayAttacks();
