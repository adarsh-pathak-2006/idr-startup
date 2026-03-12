// --- Initialize DOM Elements ---
const cursorGlow = document.getElementById('cursorGlow');
const nav = document.querySelector('.nav');
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');
const revealElements = document.querySelectorAll('.reveal');
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const pipelineLine = document.getElementById('pipelineLine');
const particleCanvas = document.getElementById('particleCanvas');

let ctx = null;
let particles = [];
let mouseX = 0;
let mouseY = 0;

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- Cursor Glow ---
if (!prefersReducedMotion && cursorGlow) {
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
    });
}

// --- Particle System ---
function initParticles() {
    if (!particleCanvas || prefersReducedMotion) return;
    ctx = particleCanvas.getContext('2d');
    resizeCanvas();
    
    const particleCount = Math.min(80, Math.floor(window.innerWidth / 20));
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * particleCanvas.width,
            y: Math.random() * particleCanvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.2
        });
    }
    animateParticles();
}

function resizeCanvas() {
    if (!particleCanvas) return;
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
}

function animateParticles() {
    if (!ctx || prefersReducedMotion) return;
    ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    
    particles.forEach(function(particle, index) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 150) {
            const force = (150 - dist) / 150;
            particle.vx -= (dx / dist) * force * 0.02;
            particle.vy -= (dy / dist) * force * 0.02;
        }
        
        if (particle.x < 0 || particle.x > particleCanvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > particleCanvas.height) particle.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, Math.max(0.5, particle.radius), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(232, 93, 4, ' + particle.opacity + ')';
        ctx.fill();
        
        particles.forEach(function(other, otherIndex) {
            if (index < otherIndex) {
                const odx = particle.x - other.x;
                const ody = particle.y - other.y;
                const odist = Math.sqrt(odx * odx + ody * ody);
                if (odist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(other.x, other.y);
                    ctx.strokeStyle = 'rgba(232, 93, 4, ' + (0.1 * (1 - odist / 120)) + ')';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        });
    });
    requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', resizeCanvas);
initParticles();

// --- Navigation ---
function handleScroll() {
    if (window.scrollY > 50) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
}
window.addEventListener('scroll', handleScroll);

mobileToggle.addEventListener('click', function() {
    this.classList.toggle('active');
    navLinks.classList.toggle('active');
    this.setAttribute('aria-expanded', this.classList.contains('active'));
});

navLinks.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
        mobileToggle.classList.remove('active');
        navLinks.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
    });
});

// --- Reveal on Scroll ---
function revealOnScroll() {
    const windowHeight = window.innerHeight;
    revealElements.forEach(function(element) {
        if (element.getBoundingClientRect().top < windowHeight - 150) {
            element.classList.add('active');
        }
    });
}

// --- Counter Animation ---
function animateCounters() {
    document.querySelectorAll('.stat-number[data-target]').forEach(function(counter) {
        if (counter.getBoundingClientRect().top < window.innerHeight && !counter.classList.contains('counted')) {
            counter.classList.add('counted');
            const target = parseInt(counter.getAttribute('data-target'));
            const prefix = counter.getAttribute('data-prefix') || '';
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            
            function update() {
                current += step;
                if (current < target) {
                    counter.textContent = prefix + Math.floor(current);
                    requestAnimationFrame(update);
                } else {
                    counter.textContent = prefix + target;
                }
            }
            prefersReducedMotion ? counter.textContent = prefix + target : update();
        }
    });
}

// --- Pipeline Line ---
function animatePipeline() {
    if (!pipelineLine) return;
    if (pipelineLine.getBoundingClientRect().top < window.innerHeight && !pipelineLine.classList.contains('animate')) {
        pipelineLine.classList.add('animate');
    }
}

// --- Scroll Listener ---
if (!prefersReducedMotion) {
    window.addEventListener('scroll', function() {
        revealOnScroll();
        animateCounters();
        animatePipeline();
    });
    revealOnScroll();
    animateCounters();
    animatePipeline();
} else {
    revealElements.forEach(function(el) { el.classList.add('active'); });
    document.querySelectorAll('.stat-number[data-target]').forEach(function(c) {
        c.textContent = (c.getAttribute('data-prefix') || '') + c.getAttribute('data-target');
    });
    if(pipelineLine) pipelineLine.classList.add('animate');
}

// --- Smooth Scroll ---
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const navHeight = nav.offsetHeight;
                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.pageYOffset - navHeight,
                    behavior: prefersReducedMotion ? 'auto' : 'smooth'
                });
            }
        }
    });
});

// --- Form ---
contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const interest = document.getElementById('interest').value;
    const message = document.getElementById('message').value.trim();

    if (!firstName || !lastName || !email || !interest || !message) {
        submitBtn.textContent = 'Please fill all fields';
        submitBtn.style.background = '#EF4444';
        setTimeout(function() { submitBtn.textContent = 'Send Message'; submitBtn.style.background = ''; }, 2000);
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        submitBtn.textContent = 'Invalid email';
        submitBtn.style.background = '#EF4444';
        setTimeout(function() { submitBtn.textContent = 'Send Message'; submitBtn.style.background = ''; }, 2000);
        return;
    }

    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    setTimeout(function() {
        submitBtn.textContent = 'Message Sent!';
        submitBtn.style.background = '#10B981';
        setTimeout(function() {
            contactForm.reset();
            submitBtn.textContent = originalText;
            submitBtn.style.background = '';
            submitBtn.disabled = false;
        }, 2500);
    }, 1500);
});

// --- Keyboard ---
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        mobileToggle.classList.remove('active');
        navLinks.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
    }
});