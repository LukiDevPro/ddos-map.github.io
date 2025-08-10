// DDoS Attack Monitor - Enhanced Realistic Simulation
class DDoSMonitor {
    constructor() {
        this.map = null;
        this.attackMarkers = [];
        this.totalAttacks = 0;
        this.activeAttacks = 0;
        this.attackLog = [];
        this.targets = {};
        this.networkStats = {
            totalTraffic: 0,
            peakBandwidth: 0,
            averageResponseTime: 0,
            packetLoss: 0
        };
        this.forceCriticalMode = true;
        this.init();
    }

    init() {
        this.initMap();
        this.initStats();
        this.startSimulation();
        this.updateLastUpdate();
        this.initNetworkMonitoring();
    }

    initMap() {
        // Initialize Leaflet map with enhanced styling
        this.map = L.map('map').setView([20, 0], 2);
        
        // Add dark tile layer with better attribution
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
        setInterval(() => this.updateStats(), 3000);
    }

    initNetworkMonitoring() {
        // Simulate network monitoring data
        setInterval(() => {
            this.networkStats.totalTraffic += Math.random() * 50;
            this.networkStats.peakBandwidth = Math.max(this.networkStats.peakBandwidth, 
                this.networkStats.totalTraffic + Math.random() * 100);
            this.networkStats.averageResponseTime = 50 + Math.random() * 200;
            this.networkStats.packetLoss = Math.random() * 5;
        }, 2000);
    }

    generateRandomAttack() {
        const attackTypes = [
            { name: 'SYN Flood', description: 'TCP SYN packet flood attack', protocol: 'TCP' },
            { name: 'UDP Flood', description: 'UDP packet flood attack', protocol: 'UDP' },
            { name: 'HTTP Flood', description: 'HTTP GET/POST request flood', protocol: 'HTTP' },
            { name: 'ICMP Flood', description: 'ICMP echo request flood', protocol: 'ICMP' },
            { name: 'DNS Amplification', description: 'DNS query amplification attack', protocol: 'DNS' },
            { name: 'NTP Amplification', description: 'NTP monlist amplification', protocol: 'NTP' },
            { name: 'SSDP Amplification', description: 'SSDP M-SEARCH amplification', protocol: 'SSDP' },
            { name: 'Memcached Amplification', description: 'Memcached amplification attack', protocol: 'Memcached' },
            { name: 'SNMP Amplification', description: 'SNMP GET amplification', protocol: 'SNMP' },
            { name: 'Slowloris', description: 'Slow HTTP request attack', protocol: 'HTTP' },
            { name: 'Ping of Death', description: 'Oversized ICMP packet attack', protocol: 'ICMP' },
            { name: 'Teardrop', description: 'Fragmented packet attack', protocol: 'UDP' }
        ];

        const countries = [
            { name: 'United States', coords: [39.8283, -98.5795], iso: 'US' },
            { name: 'Germany', coords: [51.1657, 10.4515], iso: 'DE' },
            { name: 'United Kingdom', coords: [55.3781, -3.4360], iso: 'GB' },
            { name: 'France', coords: [46.2276, 2.2137], iso: 'FR' },
            { name: 'Netherlands', coords: [52.1326, 5.2913], iso: 'NL' },
            { name: 'Russia', coords: [61.5240, 105.3188], iso: 'RU' },
            { name: 'China', coords: [35.8617, 104.1954], iso: 'CN' },
            { name: 'Japan', coords: [36.2048, 138.2529], iso: 'JP' },
            { name: 'South Korea', coords: [35.9078, 127.7669], iso: 'KR' },
            { name: 'Brazil', coords: [-14.2350, -51.9253], iso: 'BR' },
            { name: 'Canada', coords: [56.1304, -106.3468], iso: 'CA' },
            { name: 'Australia', coords: [-25.2744, 133.7751], iso: 'AU' },
            { name: 'India', coords: [20.5937, 78.9629], iso: 'IN' },
            { name: 'Italy', coords: [41.8719, 12.5674], iso: 'IT' },
            { name: 'Spain', coords: [40.4637, -3.7492], iso: 'ES' },
            { name: 'Singapore', coords: [1.3521, 103.8198], iso: 'SG' },
            { name: 'Sweden', coords: [60.1282, 18.6435], iso: 'SE' },
            { name: 'Switzerland', coords: [46.8182, 8.2275], iso: 'CH' }
        ];

        const intensities = [
            { level: 'low', probability: 0.4, color: '#00ff88' },
            { level: 'medium', probability: 0.4, color: '#ffaa00' },
            { level: 'high', probability: 0.2, color: '#ff4444' }
        ];
        
        const intensity = this.weightedRandom(intensities);
        const country = countries[Math.floor(Math.random() * countries.length)];
        const attackType = attackTypes[Math.floor(Math.random() * attackTypes.length)];
        
        // Add realistic coordinate variation
        const lat = country.coords[0] + (Math.random() - 0.5) * 8;
        const lng = country.coords[1] + (Math.random() - 0.5) * 8;

        const selectedIntensity = this.forceCriticalMode ? { level: 'high' } : intensity;

        const attack = {
            id: Date.now() + Math.random(),
            type: attackType.name,
            description: attackType.description,
            protocol: attackType.protocol,
            target: country.name,
            countryCode: country.iso,
            intensity: selectedIntensity.level,
            coords: [lat, lng],
            bandwidth: this.forceCriticalMode ? Math.floor(Math.random() * 400) + 200 : this.generateBandwidth(intensity.level),
            packetsPerSec: this.forceCriticalMode ? Math.floor(Math.random() * 400000) + 300000 : this.generatePacketsPerSec(intensity.level),
            duration: Math.floor(Math.random() * 600) + 120, // 2-12 minutes
            timestamp: new Date(),
            source: this.generateSourceIP(),
            sourcePort: Math.floor(Math.random() * 65535) + 1024,
            destinationPort: this.generateDestinationPort(attackType.protocol),
            packetSize: this.generatePacketSize(attackType.protocol),
            ttl: Math.floor(Math.random() * 64) + 32,
            flags: this.generateFlags(attackType.protocol),
            signature: this.generateSignature(),
            mitigation: this.generateMitigation(attackType.name)
        };

        return attack;
    }

    weightedRandom(items) {
        const totalWeight = items.reduce((sum, item) => sum + item.probability, 0);
        let random = Math.random() * totalWeight;
        
        for (const item of items) {
            random -= item.probability;
            if (random <= 0) return item;
        }
        return items[0];
    }

    generateBandwidth(intensity) {
        const ranges = {
            low: [5, 25],
            medium: [25, 100],
            high: [100, 500]
        };
        const [min, max] = ranges[intensity];
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    generatePacketsPerSec(intensity) {
        const ranges = {
            low: [5000, 25000],
            medium: [25000, 100000],
            high: [100000, 500000]
        };
        const [min, max] = ranges[intensity];
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    generateSourceIP() {
        // Generate more realistic IP ranges
        const privateRanges = [
            [10, 0, 0, 0, 10, 255, 255, 255],
            [172, 16, 0, 0, 172, 31, 255, 255],
            [192, 168, 0, 0, 192, 168, 255, 255]
        ];
        
        const range = privateRanges[Math.floor(Math.random() * privateRanges.length)];
        const segments = [];
        for (let i = 0; i < 4; i++) {
            segments.push(Math.floor(Math.random() * (range[i+4] - range[i] + 1)) + range[i]);
        }
        return segments.join('.');
    }

    generateDestinationPort(protocol) {
        const commonPorts = {
            'HTTP': [80, 443, 8080, 8443],
            'DNS': [53],
            'NTP': [123],
            'SNMP': [161],
            'SSDP': [1900],
            'Memcached': [11211],
            'TCP': [80, 443, 22, 21, 25, 110, 143, 993, 995],
            'UDP': [53, 123, 161, 1900, 11211],
            'ICMP': [0]
        };
        
        const ports = commonPorts[protocol] || [80, 443];
        return ports[Math.floor(Math.random() * ports.length)];
    }

    generatePacketSize(protocol) {
        const ranges = {
            'HTTP': [64, 1500],
            'DNS': [64, 512],
            'NTP': [48, 68],
            'SNMP': [64, 484],
            'SSDP': [64, 1500],
            'Memcached': [64, 1500],
            'TCP': [64, 1500],
            'UDP': [64, 1500],
            'ICMP': [64, 1500]
        };
        
        const [min, max] = ranges[protocol] || [64, 1500];
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    generateFlags(protocol) {
        if (protocol === 'TCP') {
            const flags = ['SYN', 'ACK', 'RST', 'FIN', 'PSH', 'URG'];
            return flags[Math.floor(Math.random() * flags.length)];
        }
        return 'N/A';
    }

    generateSignature() {
        const signatures = [
            'ET DDoS',
            'ET TROJAN',
            'ET MALWARE',
            'ET SCAN',
            'ET POLICY',
            'ET ATTACK_RESPONSE',
            'ET CURRENT_EVENTS',
            'ET MALWARE_CNC',
            'ET MALWARE_Win32',
            'ET MALWARE_Win64'
        ];
        return signatures[Math.floor(Math.random() * signatures.length)];
    }

    generateMitigation(attackType) {
        const mitigations = {
            'SYN Flood': 'Rate limiting, SYN cookies',
            'UDP Flood': 'UDP rate limiting, blackhole routing',
            'HTTP Flood': 'WAF rules, CAPTCHA, rate limiting',
            'ICMP Flood': 'ICMP rate limiting, packet filtering',
            'DNS Amplification': 'DNS rate limiting, response rate limiting',
            'NTP Amplification': 'NTP rate limiting, monlist disable',
            'SSDP Amplification': 'SSDP rate limiting, response filtering',
            'Memcached Amplification': 'Memcached rate limiting, authentication',
            'SNMP Amplification': 'SNMP rate limiting, community string protection',
            'Slowloris': 'Connection timeout, rate limiting',
            'Ping of Death': 'Packet size validation, ICMP filtering',
            'Teardrop': 'Fragment reassembly validation, packet filtering'
        };
        return mitigations[attackType] || 'Rate limiting, packet filtering';
    }

    addAttackToMap(attack) {
        const colors = {
            low: '#00ff88',
            medium: '#ffaa00',
            high: '#ff4444'
        };

        const sizes = {
            low: 10,
            medium: 15,
            high: 22
        };

        const marker = L.circleMarker(attack.coords, {
            radius: sizes[attack.intensity],
            fillColor: colors[attack.intensity],
            color: colors[attack.intensity],
            weight: 3,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(this.map);

        // Enhanced popup with more detailed information
        const popupContent = `
            <div class="attack-popup">
                <h3>🚨 ${attack.type}</h3>
                <p><strong>Target:</strong> ${attack.target} (${attack.countryCode})</p>
                <p><strong>Intensity:</strong> <span style="color: ${colors[attack.intensity]}">${attack.intensity.toUpperCase()}</span></p>
                <p><strong>Protocol:</strong> ${attack.protocol}</p>
                <p><strong>Bandwidth:</strong> ${attack.bandwidth} Gbps</p>
                <p><strong>Packets/sec:</strong> ${attack.packetsPerSec.toLocaleString()}</p>
                <p><strong>Source:</strong> ${attack.source}:${attack.sourcePort}</p>
                <p><strong>Destination:</strong> *:${attack.destinationPort}</p>
                <p><strong>Packet Size:</strong> ${attack.packetSize} bytes</p>
                <p><strong>TTL:</strong> ${attack.ttl}</p>
                <p><strong>Flags:</strong> ${attack.flags}</p>
                <p><strong>Signature:</strong> ${attack.signature}</p>
                <p><strong>Mitigation:</strong> ${attack.mitigation}</p>
                <p><strong>Duration:</strong> ${Math.floor(attack.duration / 60)}m ${attack.duration % 60}s</p>
            </div>
        `;

        marker.bindPopup(popupContent);

        // Add enhanced pulsing animation
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
        const duration = `${Math.floor(attack.duration / 60)}m ${attack.duration % 60}s`;
        
        logEntry.innerHTML = `
            <div class="attack-time">${time}</div>
            <div class="attack-target">${attack.target} (${attack.countryCode})</div>
            <div class="attack-details">
                ${attack.type} • ${attack.protocol} • ${attack.bandwidth} Gbps • ${attack.packetsPerSec.toLocaleString()} pps
            </div>
            <div class="attack-meta">
                Source: ${attack.source}:${attack.sourcePort} • Duration: ${duration} • ${attack.signature}
            </div>
        `;

        const attackLog = document.getElementById('attackLog');
        attackLog.insertBefore(logEntry, attackLog.firstChild);

        // Keep only last 25 entries
        const entries = attackLog.querySelectorAll('.attack-entry');
        if (entries.length > 25) {
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
        const responseTimeElement = document.getElementById('responseTime');
        const avgPacketSizeElement = document.getElementById('avgPacketSize');
        const commonProtocolElement = document.getElementById('commonProtocol');
        const peakBandwidthElement = document.getElementById('peakBandwidth');
        const avgDurationElement = document.getElementById('avgDuration');
        const packetLossElement = document.getElementById('packetLoss');

        // Calculate enhanced totals
        let totalBandwidth = 0;
        let totalPackets = 0;
        const uniqueCountries = new Set();
        let totalTraffic = 0;
        let totalPacketSize = 0;
        let protocolCounts = {};
        let totalDuration = 0;
        let attackCount = 0;

        this.attackMarkers.forEach(({ attack }) => {
            totalBandwidth += attack.bandwidth;
            totalPackets += attack.packetsPerSec;
            uniqueCountries.add(attack.target);
            totalTraffic += attack.bandwidth * attack.packetsPerSec * attack.packetSize;
            totalPacketSize += attack.packetSize;
            protocolCounts[attack.protocol] = (protocolCounts[attack.protocol] || 0) + 1;
            totalDuration += attack.duration;
            attackCount++;
        });

        // Update network stats
        this.networkStats.totalTraffic = totalTraffic;
        this.networkStats.peakBandwidth = Math.max(this.networkStats.peakBandwidth, totalBandwidth);

        // Calculate averages
        const avgPacketSize = attackCount > 0 ? Math.round(totalPacketSize / attackCount) : 0;
        const avgDuration = attackCount > 0 ? Math.round(totalDuration / attackCount / 60) : 0;
        const avgResponseTime = 50 + Math.random() * 200;
        const packetLossRate = Math.random() * 5;

        // Find most common protocol
        const mostCommonProtocol = Object.keys(protocolCounts).reduce((a, b) => 
            protocolCounts[a] > protocolCounts[b] ? a : b, 'TCP');

        // Update display with enhanced formatting
        totalElement.textContent = this.totalAttacks.toLocaleString();
        activeElement.textContent = this.activeAttacks;
        bandwidthElement.textContent = `${totalBandwidth.toFixed(1)} Gbps`;
        packetsElement.textContent = `${(totalPackets / 1000000).toFixed(2)} M`;
        countriesElement.textContent = uniqueCountries.size;
        responseTimeElement.textContent = `${Math.round(avgResponseTime)}ms`;
        avgPacketSizeElement.textContent = `${avgPacketSize} bytes`;
        commonProtocolElement.textContent = mostCommonProtocol;
        peakBandwidthElement.textContent = `${this.networkStats.peakBandwidth.toFixed(1)} Gbps`;
        avgDurationElement.textContent = `${avgDuration}m`;
        packetLossElement.textContent = `${packetLossRate.toFixed(1)}%`;

        // Enhanced threat level calculation
        if (this.forceCriticalMode) {
            threatElement.textContent = 'CRITICAL';
            threatElement.style.color = '#ff4444';
            threatElement.style.textShadow = '0 0 10px #ff4444';
        } else {
            const threatScore = this.activeAttacks * (totalBandwidth / 100);
            if (threatScore > 1000) {
                threatElement.textContent = 'CRITICAL';
                threatElement.style.color = '#ff4444';
                threatElement.style.textShadow = '0 0 10px #ff4444';
            } else if (threatScore > 500) {
                threatElement.textContent = 'HIGH';
                threatElement.style.color = '#ffaa00';
                threatElement.style.textShadow = '0 0 10px #ffaa00';
            } else if (threatScore > 200) {
                threatElement.textContent = 'MEDIUM';
                threatElement.style.color = '#ffaa00';
                threatElement.style.textShadow = '0 0 10px #ffaa00';
            } else {
                threatElement.textContent = 'LOW';
                threatElement.style.color = '#00ff88';
                threatElement.style.textShadow = '0 0 10px #00ff88';
            }
        }
    }

    updateTopTargets() {
        const targetCounts = {};
        
        this.attackMarkers.forEach(({ attack }) => {
            targetCounts[attack.target] = (targetCounts[attack.target] || 0) + 1;
        });

        const sortedTargets = Object.entries(targetCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8);

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
        // Generate initial attacks with staggered timing
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const attack = this.generateRandomAttack();
                this.addAttackToMap(attack);
                this.addAttackToLog(attack);
                this.totalAttacks++;
                this.activeAttacks++;
                this.updateTopTargets();
            }, i * 1500);
        }

        // Continue generating attacks with more realistic timing and patterns
        setInterval(() => {
            const chance = Math.random();
            const currentTime = new Date().getHours();
            
            // More attacks during peak hours (business hours and evening)
            const isPeakHour = (currentTime >= 9 && currentTime <= 17) || (currentTime >= 19 && currentTime <= 23);
            const baseChance = this.forceCriticalMode ? 0.95 : (isPeakHour ? 0.7 : 0.4);
            
            if (chance < baseChance) { // Normal attack
                const attack = this.generateRandomAttack();
                this.addAttackToMap(attack);
                this.addAttackToLog(attack);
                this.totalAttacks++;
                this.activeAttacks++;
                this.updateTopTargets();
            } else if (chance < baseChance + 0.15) { // Coordinated attack (15% chance)
                // Generate multiple attacks in quick succession
                const numAttacks = this.forceCriticalMode ? Math.floor(Math.random() * 4) + 4 : Math.floor(Math.random() * 3) + 2;
                for (let i = 0; i < numAttacks; i++) {
                    setTimeout(() => {
                        const attack = this.generateRandomAttack();
                        this.addAttackToMap(attack);
                        this.addAttackToLog(attack);
                        this.totalAttacks++;
                        this.activeAttacks++;
                        this.updateTopTargets();
                    }, i * 300);
                }
            } else if (chance < baseChance + 0.25) { // Massive attack (10% chance)
                // Generate a high-intensity attack
                const attack = this.generateRandomAttack();
                attack.intensity = 'high';
                attack.bandwidth = Math.floor(Math.random() * 400) + 200; // 200-600 Gbps
                attack.packetsPerSec = Math.floor(Math.random() * 400000) + 300000; // 300k-700k pps
                attack.duration = Math.floor(Math.random() * 900) + 300; // 5-20 minutes
                
                this.addAttackToMap(attack);
                this.addAttackToLog(attack);
                this.totalAttacks++;
                this.activeAttacks++;
                this.updateTopTargets();
            }
        }, 4000);

        // Cleanup expired attacks
        setInterval(() => {
            this.cleanupExpiredAttacks();
        }, 1000);

        // Update last update time
        setInterval(() => {
            this.updateLastUpdate();
        }, 10000);

        // Add realistic system messages
        this.addSystemMessages();
    }

    addSystemMessages() {
        const messages = [
            '🔍 Scanning network traffic for anomalies...',
            '🛡️ DDoS protection filters active',
            '📊 Analyzing packet patterns...',
            '⚡ Rate limiting rules applied',
            '🌐 Monitoring global threat feeds...',
            '🔒 SSL/TLS inspection enabled',
            '📡 Real-time threat intelligence updated',
            '🛡️ WAF rules refreshed',
            '⚡ Traffic shaping applied',
            '🔍 Deep packet inspection active'
        ];

        setInterval(() => {
            const message = messages[Math.floor(Math.random() * messages.length)];
            console.log(`%c${message}`, 'color: #00d4ff; font-size: 11px; font-style: italic;');
        }, 15000);
    }
}

// Initialize the monitor when page loads
document.addEventListener('DOMContentLoaded', () => {
    new DDoSMonitor();
});

// Enhanced console messages with more professional appearance
console.log('%c🌐 DDoS Attack Monitor v2.1.0', 'color: #00ff88; font-size: 18px; font-weight: bold;');
console.log('%c🔒 Advanced Threat Detection System Active', 'color: #00d4ff; font-size: 14px; font-weight: bold;');
console.log('%c📊 Real-time Network Traffic Analysis Running', 'color: #ffaa00; font-size: 12px;');
console.log('%c⚠️ This is a demonstration dashboard with simulated data', 'color: #ff4444; font-size: 11px;');
console.log('%c📈 All statistics and attacks are generated for educational purposes', 'color: #888; font-size: 10px;'); 