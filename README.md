# 🌐 DDoS Attack Monitor - Live Map

Eine interaktive, simulierte DDoS-Angriffs-Monitoring-Dashboard mit Live-Weltkarte und Echtzeit-Statistiken.

## 🚀 Features

- **Interaktive Weltkarte** mit Leaflet.js
- **Live-Angriffs-Simulation** mit verschiedenen Intensitätsstufen
- **Echtzeit-Statistiken** (Bandbreite, Pakete/Sekunde, Ziel-Länder)
- **Angriffs-Log** mit detaillierten Informationen
- **Top-Ziele-Liste** mit Angriffs-Häufigkeit
- **Responsive Design** für alle Geräte
- **Moderne UI** mit Cyberpunk-Design

## 🎯 Angriffs-Typen

Das Dashboard simuliert verschiedene DDoS-Angriffs-Typen:

- **SYN Flood** - TCP SYN-Paket-Überflutung
- **UDP Flood** - UDP-Paket-Überflutung
- **HTTP Flood** - HTTP-Request-Überflutung
- **ICMP Flood** - ICMP-Ping-Überflutung
- **DNS Amplification** - DNS-Verstärkungsangriffe
- **NTP Amplification** - NTP-Verstärkungsangriffe
- **SSDP Amplification** - SSDP-Verstärkungsangriffe
- **Memcached Amplification** - Memcached-Verstärkungsangriffe
- **SNMP Amplification** - SNMP-Verstärkungsangriffe

## 🎨 Design-Features

- **Dunkles Cyberpunk-Theme** mit Neon-Akzenten
- **Glasmorphismus-Effekte** mit Backdrop-Blur
- **Pulsierende Animationen** für aktive Angriffe
- **Gradient-Text-Effekte** für Überschriften
- **Responsive Layout** für Desktop und Mobile

## 📊 Statistik-Dashboard

### Live-Metriken:
- **Gesamtangriffe** - Anzahl aller simulierten Angriffe
- **Aktive Angriffe** - Aktuell laufende Angriffe
- **Bedrohungsstufe** - Dynamisch basierend auf aktiven Angriffen
- **Bandbreitenverbrauch** - Gesamte simulierte Bandbreite
- **Pakete/Sekunde** - Gesamte Paketrate
- **Ziel-Länder** - Anzahl betroffener Länder

### Intensitätsstufen:
- 🟢 **Niedrig** (1-10 Gbps) - Grüne Markierungen
- 🟡 **Mittel** (10-50 Gbps) - Gelbe Markierungen  
- 🔴 **Hoch** (50-200 Gbps) - Rote Markierungen

## 🛠️ Technologie-Stack

- **HTML5** - Struktur
- **CSS3** - Styling mit modernen Features
- **JavaScript (ES6+)** - Interaktivität und Logik
- **Leaflet.js** - Interaktive Karten
- **Google Fonts** - Orbitron-Schriftart

## 🚨 Wichtiger Hinweis

⚠️ **Dies ist eine Demonstrations-Anwendung mit simulierten Daten für Bildungszwecke.**

- Alle Angriffe sind **simuliert** und nicht real
- Keine echten Netzwerk-Daten werden gesammelt
- Dient nur zur Demonstration von UI/UX-Konzepten
- Nicht für echte Sicherheitsüberwachung geeignet

## 🎮 Verwendung

1. Öffnen Sie `index.html` in einem modernen Webbrowser
2. Die Karte lädt automatisch und zeigt simulierte Angriffe
3. Klicken Sie auf Markierungen für detaillierte Informationen
4. Beobachten Sie die Live-Updates in der Seitenleiste

## 📱 Browser-Kompatibilität

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## 🔧 Anpassungen

### Angriffs-Frequenz ändern:
```javascript
// In script.js, Zeile ~280
if (Math.random() < 0.7) { // 70% Chance für neuen Angriff
```

### Neue Länder hinzufügen:
```javascript
// In script.js, countries Array erweitern
{ name: 'Neues Land', coords: [lat, lng] }
```

### Design-Farben anpassen:
```css
/* In style.css */
:root {
    --primary-color: #00ff88;
    --secondary-color: #ffaa00;
    --danger-color: #ff4444;
}
```

## 📄 Lizenz

Dieses Projekt dient ausschließlich Bildungs- und Demonstrationszwecken.

## 🤝 Beitragen

Verbesserungsvorschläge und Bug-Reports sind willkommen!

---

**Entwickelt mit ❤️ für Bildungszwecke** 