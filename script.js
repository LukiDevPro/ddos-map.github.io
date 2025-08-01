// DDoS Attack Monitor - Simulated Data
class DDoSMonitor {
    constructor() {
        this.map = null;
        this.attackMarkers = [];
        this.totalAttacks = 0;
        this.activeAttacks = 0;
        this.attackLog = [];
        this.targets = {};
        this.init();
    }

    init() {
        this.initMap();
        this.initStats();
        this.startSimulation();
        this.updateLastUpdate();
    }

    initMap() {
        // Initialize Leaflet map
        this.map = L.map('map').setView([20, 0], 2);
        
        // Add dark tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '©OpenStreetMap, ©CartoDB',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(this.map);

        // Add custom map style
        this.map.on('load', () => {
            document.querySelector('.leaflet-container').style.background = '#1a1a2e';
        });
    }

    initStats() {
        this.updateStats();
        setInterval(() => this.updateStats(), 5000);
    }

    generateRandomAttack() {
        const attackTypes = [
            'SYN Flood', 'UDP Flood', 'HTTP Flood', 'ICMP Flood', 
            'DNS Amplification', 'NTP Amplification', 'SSDP Amplification',
            'Memcached Amplification', 'SNMP Amplification'
        ];

        const countries = [
            { name: 'United States', coords: [39.8283, -98.5795] },
            { name: 'Germany', coords: [51.1657, 10.4515] },
            { name: 'United Kingdom', coords: [55.3781, -3.4360] },
            { name: 'France', coords: [46.2276, 2.2137] },
            { name: 'Netherlands', coords: [52.1326, 5.2913] },
            { name: 'Russia', coords: [61.5240, 105.3188] },
            { name: 'China', coords: [35.8617, 104.1954] },
            { name: 'Japan', coords: [36.2048, 138.2529] },
            { name: 'South Korea', coords: [35.9078, 127.7669] },
            { name: 'Brazil', coords: [-14.2350, -51.9253] },
            { name: 'Canada', coords: [56.1304, -106.3468] },
            { name: 'Australia', coords: [-25.2744, 133.7751] },
            { name: 'India', coords: [20.5937, 78.9629] },
            { name: 'Italy', coords: [41.8719, 12.5674] },
            { name: 'Spain', coords: [40.4637, -3.7492] }
        ];

        const intensities = ['low', 'medium', 'high'];
        const intensity = intensities[Math.floor(Math.random() * intensities.length)];
        
        const country = countries[Math.floor(Math.random() * countries.length)];
        const attackType = attackTypes[Math.floor(Math.random() * attackTypes.length)];
        
        // Add some randomness to coordinates
        const lat = country.coords[0] + (Math.random() - 0.5) * 10;
        const lng = country.coords[1] + (Math.random() - 0.5) * 10;

        const attack = {
            id: Date.now() + Math.random(),
            type: attackType,
            target: country.name,
            intensity: intensity,
            coords: [lat, lng],
            bandwidth: this.generateBandwidth(intensity),
            packetsPerSec: this.generatePacketsPerSec(intensity),
            duration: Math.floor(Math.random() * 300) + 60, // 1-6 minutes
            timestamp: new Date(),
            source: this.generateSourceIP()
        };

        return attack;
    }

    generateBandwidth(intensity) {
        const ranges = {
            low: [1, 10],
            medium: [10, 50],
            high: [50, 200]
        };
        const [min, max] = ranges[intensity];
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    generatePacketsPerSec(intensity) {
        const ranges = {
            low: [1000, 10000],
            medium: [10000, 100000],
            high: [100000, 1000000]
        };
        const [min, max] = ranges[intensity];
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    generateSourceIP() {
        const segments = [];
        for (let i = 0; i < 4; i++) {
            segments.push(Math.floor(Math.random() * 256));
        }
        return segments.join('.');
    }

    addAttackToMap(attack) {
        const colors = {
            low: '#00ff88',
            medium: '#ffaa00',
            high: '#ff4444'
        };

        const sizes = {
            low: 8,
            medium: 12,
            high: 18
        };

        const marker = L.circleMarker(attack.coords, {
            radius: sizes[attack.intensity],
            fillColor: colors[attack.intensity],
            color: colors[attack.intensity],
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(this.map);

        // Add popup
        const popupContent = `
            <div class="attack-popup">
                <h3>🚨 ${attack.type}</h3>
                <p><strong>Target:</strong> ${attack.target}</p>
                <p><strong>Intensity:</strong> ${attack.intensity.toUpperCase()}</p>
                <p><strong>Bandwidth:</strong> ${attack.bandwidth} Gbps</p>
                <p><strong>Packets/sec:</strong> ${attack.packetsPerSec.toLocaleString()}</p>
                <p><strong>Source:</strong> ${attack.source}</p>
                <p><strong>Duration:</strong> ${Math.floor(attack.duration / 60)}m ${attack.duration % 60}s</p>
            </div>
        `;

        marker.bindPopup(popupContent);

        // Add pulsing animation
        marker.getElement()?.classList.add('pulse');

        this.attackMarkers.push({
            marker: marker,
            attack: attack,
            endTime: Date.now() + (attack.duration * 1000)
        });
    }

    addAttackToLog(attack) {
        const logEntry = document.createElement('div');
        logEntry.className = `attack-entry ${attack.intensity}`;
        
        const time = attack.timestamp.toLocaleTimeString();
        logEntry.innerHTML = `
            <div class="attack-time">${time}</div>
            <div class="attack-target">${attack.target}</div>
            <div class="attack-details">${attack.type} • ${attack.bandwidth} Gbps • ${attack.packetsPerSec.toLocaleString()} pps</div>
        `;

        const attackLog = document.getElementById('attackLog');
        attackLog.insertBefore(logEntry, attackLog.firstChild);

        // Keep only last 20 entries
        const entries = attackLog.querySelectorAll('.attack-entry');
        if (entries.length > 20) {
            entries[entries.length - 1].remove();
        }
    }

    updateStats() {
        const totalElement = document.getElementById('totalAttacks');
        const activeElement = document.getElementById('activeAttacks');
        const threatElement = document.getElementById('threatLevel');
        const bandwidthElement = document.getElementById('bandwidthUsed');
        const packetsElement = document.getElementById('packetsPerSec');
        const countriesElement = document.getElementById('targetCountries');

        // Calculate totals
        let totalBandwidth = 0;
        let totalPackets = 0;
        const uniqueCountries = new Set();

        this.attackMarkers.forEach(({ attack }) => {
            totalBandwidth += attack.bandwidth;
            totalPackets += attack.packetsPerSec;
            uniqueCountries.add(attack.target);
        });

        // Update display
        totalElement.textContent = this.totalAttacks;
        activeElement.textContent = this.activeAttacks;
        bandwidthElement.textContent = `${totalBandwidth} Gbps`;
        packetsElement.textContent = `${(totalPackets / 1000000).toFixed(1)} M`;
        countriesElement.textContent = uniqueCountries.size;

        // Update threat level
        if (this.activeAttacks > 15) {
            threatElement.textContent = 'CRITICAL';
            threatElement.style.color = '#ff4444';
        } else if (this.activeAttacks > 10) {
            threatElement.textContent = 'HIGH';
            threatElement.style.color = '#ffaa00';
        } else if (this.activeAttacks > 5) {
            threatElement.textContent = 'MEDIUM';
            threatElement.style.color = '#ffaa00';
        } else {
            threatElement.textContent = 'LOW';
            threatElement.style.color = '#00ff88';
        }
    }

    updateTopTargets() {
        const targetCounts = {};
        
        this.attackMarkers.forEach(({ attack }) => {
            targetCounts[attack.target] = (targetCounts[attack.target] || 0) + 1;
        });

        const sortedTargets = Object.entries(targetCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        const topTargetsElement = document.getElementById('topTargets');
        topTargetsElement.innerHTML = '';

        sortedTargets.forEach(([target, count]) => {
            const targetItem = document.createElement('div');
            targetItem.className = 'target-item';
            targetItem.innerHTML = `
                <span class="target-name">${target}</span>
                <span class="target-count">${count}</span>
            `;
            topTargetsElement.appendChild(targetItem);
        });
    }

    updateLastUpdate() {
        const now = new Date();
        document.getElementById('lastUpdate').textContent = now.toLocaleString();
    }

    cleanupExpiredAttacks() {
        const now = Date.now();
        this.attackMarkers = this.attackMarkers.filter(({ marker, attack, endTime }) => {
            if (now > endTime) {
                marker.remove();
                return false;
            }
            return true;
        });
        this.activeAttacks = this.attackMarkers.length;
    }

    startSimulation() {
        // Generate initial attacks
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const attack = this.generateRandomAttack();
                this.addAttackToMap(attack);
                this.addAttackToLog(attack);
                this.totalAttacks++;
                this.activeAttacks++;
                this.updateTopTargets();
            }, i * 2000);
        }

        // Continue generating attacks
        setInterval(() => {
            if (Math.random() < 0.7) { // 70% chance to generate new attack
                const attack = this.generateRandomAttack();
                this.addAttackToMap(attack);
                this.addAttackToLog(attack);
                this.totalAttacks++;
                this.activeAttacks++;
                this.updateTopTargets();
            }
        }, 3000);

        // Cleanup expired attacks
        setInterval(() => {
            this.cleanupExpiredAttacks();
        }, 1000);

        // Update last update time
        setInterval(() => {
            this.updateLastUpdate();
        }, 10000);
    }
}

// Initialize the monitor when page loads
document.addEventListener('DOMContentLoaded', () => {
    new DDoSMonitor();
});

// Add some realistic console messages
console.log('%c🌐 DDoS Attack Monitor Initialized', 'color: #00ff88; font-size: 16px; font-weight: bold;');
console.log('%c⚠️ This is a demonstration dashboard with simulated data', 'color: #ffaa00; font-size: 12px;');
console.log('%c📊 All statistics and attacks are generated for educational purposes', 'color: #888; font-size: 12px;'); 