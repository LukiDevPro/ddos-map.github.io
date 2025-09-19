const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size to full window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Stats elements
const packetsEl = document.getElementById('packets');
const volumeEl = document.getElementById('volume');
const attackersEl = document.getElementById('attackers');

// --- Configuration ---
const TARGET = { x: canvas.width / 2, y: canvas.height / 2 };
const ATTACKER_COUNT = 20;
const PARTICLE_SPEED = 2;
const PARTICLE_LIFESPAN = 300; // frames

let attackers = [];
let particles = [];

// --- Classes ---
class Attacker {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 5;
    }

    draw() {
        ctx.fillStyle = '#ff0000'; // Red for attackers
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Particle {
    constructor(startX, startY) {
        this.x = startX;
        this.y = startY;
        this.life = PARTICLE_LIFESPAN;

        const angle = Math.atan2(TARGET.y - this.y, TARGET.x - this.x);
        this.vx = Math.cos(angle) * PARTICLE_SPEED;
        this.vy = Math.sin(angle) * PARTICLE_SPEED;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }

    draw() {
        // Fade out as it gets closer to the end of its life
        const alpha = Math.max(0, this.life / PARTICLE_LIFESPAN);
        ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
        ctx.fillRect(this.x, this.y, 2, 2);
    }
}

// --- Functions ---
function setup() {
    // Create attackers at random positions on the edge of the screen
    for (let i = 0; i < ATTACKER_COUNT; i++) {
        let x, y;
        if (Math.random() > 0.5) {
            // Top or bottom edge
            x = Math.random() * canvas.width;
            y = Math.random() > 0.5 ? 0 : canvas.height;
        } else {
            // Left or right edge
            x = Math.random() > 0.5 ? 0 : canvas.width;
            y = Math.random() * canvas.height;
        }
        attackers.push(new Attacker(x, y));
    }
    attackersEl.textContent = ATTACKER_COUNT;

    // Start the animation loop
    animate();
}

function updateStats() {
    const packetCount = Math.floor(Math.random() * 5000) + 15000;
    const volume = (Math.random() * 20 + 80).toFixed(2);

    packetsEl.textContent = packetCount.toLocaleString();
    volumeEl.textContent = volume;
}

function animate() {
    // Fading effect for trails
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw target
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(TARGET.x, TARGET.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(TARGET.x, TARGET.y, 15, 0, Math.PI * 2);
    ctx.stroke();


    // Draw attackers
    attackers.forEach(attacker => attacker.draw());

    // Create new particles
    attackers.forEach(attacker => {
        if (Math.random() > 0.95) { // Chance to spawn a particle each frame
            particles.push(new Particle(attacker.x, attacker.y));
        }
    });

    // Update and draw particles
    particles.forEach((particle, index) => {
        particle.update();
        particle.draw();

        // Remove dead particles
        if (particle.life <= 0) {
            particles.splice(index, 1);
        }
    });

    // Update stats periodically
    if (Math.random() > 0.8) {
        updateStats();
    }

    requestAnimationFrame(animate);
}

// --- Start ---
setup();

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    TARGET.x = canvas.width / 2;
    TARGET.y = canvas.height / 2;
    // We could regenerate attackers here, but for simplicity we'll leave them.
});
