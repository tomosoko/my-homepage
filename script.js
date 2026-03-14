document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    initMobileMenu();
    initScrollAnimations();
    initSimulator();
});

/* Canvas Animation: Network Nodes */
function initCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    // Config
    const particleCount = window.innerWidth < 768 ? 40 : 80;
    const connectionDistance = 150;
    const mouseDistance = 200;

    // Resize handling
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // Mouse tracking
    let mouse = { x: null, y: null };
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Particle Class
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 1.5 + 0.5;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Mouse interaction
            if (mouse.x != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouseDistance) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouseDistance - distance) / mouseDistance;
                    const directionX = forceDirectionX * force * 0.5;
                    const directionY = forceDirectionY * force * 0.5;
                    this.vx -= directionX;
                    this.vy -= directionY;
                }
            }
        }

        draw() {
            ctx.fillStyle = '#06b6d4';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Init particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        connectParticles();
        requestAnimationFrame(animate);
    }

    function connectParticles() {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let dx = particles[a].x - particles[b].x;
                let dy = particles[a].y - particles[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    let opacity = 1 - (distance / connectionDistance);
                    ctx.strokeStyle = `rgba(6, 182, 212, ${opacity * 0.2})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    animate();
}

/* UI Interactions */
function initMobileMenu() {
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (!mobileBtn || !navLinks) return;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    overlay.innerHTML = `
        <button class="mobile-overlay-close" aria-label="Close menu">✕</button>
        <nav class="mobile-nav">
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
            <a href="#skills">Skills</a>
            <a href="#contact">Contact</a>
            <a href="https://github.com/tomosoko" target="_blank">GitHub</a>
        </nav>
    `;
    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector('.mobile-overlay-close');

    function openMenu() {
        overlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
        overlay.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    mobileBtn.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeMenu();
    });
    overlay.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', closeMenu);
    });
}

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.08 });

    const targets = document.querySelectorAll(
        '.project-item, .about-layout, .skills-grid, .about-stats, .earlier-card, .contact-layout'
    );
    targets.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

/* AI Simulator Logic */
function initSimulator() {
    const btnExtract = document.getElementById('btn-extract');
    const btnVerify = document.getElementById('btn-verify');
    const btnReset = document.getElementById('btn-reset');
    
    const simViewport = document.querySelector('.sim-viewport');
    const points = document.querySelectorAll('.point');
    const bbox = document.getElementById('sim-bbox');
    const consoleOut = document.getElementById('sim-console-out');
    
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');

    if(!btnExtract) return;

    function log(msg, type = '') {
        const time = new Date().toISOString().split('T')[1].substring(0,8);
        const spanClass = type === 'success' ? 'log-success' : type === 'warn' ? 'log-warn' : '';
        const line = `<div style="margin-bottom:4px;"><span class="log-time">[${time}]</span> <span class="${spanClass}">${msg}</span></div>`;
        consoleOut.innerHTML += line;
        consoleOut.scrollTop = consoleOut.scrollHeight;
    }

    btnExtract.addEventListener('click', () => {
        btnExtract.disabled = true;
        simViewport.classList.add('scanning');
        
        step1.classList.remove('active');
        step1.classList.add('done');
        step2.classList.add('active');

        log('> Starting Feature Extraction...');
        log('Loading ConvNeXt-Tiny weights...');
        
        setTimeout(() => log('Model loaded. Running forward pass...', 'warn'), 800);
        
        setTimeout(() => {
            simViewport.classList.remove('scanning');
            points.forEach(p => p.classList.add('active'));
            log('Features successfully extracted.', 'success');
            log('Landmarks: Femur Condyle, Tibial Plateau, Patella detected.');
            
            btnVerify.disabled = false;
        }, 2500);
    });

    btnVerify.addEventListener('click', () => {
        btnVerify.disabled = true;
        
        step2.classList.remove('active');
        step2.classList.add('done');
        step3.classList.add('active');

        log('> Verifying AI coordinates against ground truth...');
        log('Calculating Dice Score & MAE... Please wait.');

        setTimeout(() => {
            bbox.classList.add('active');
            log('Verification Complete.', 'success');
            log('Dice: 0.94, MAE: 1.2°', 'success');
            log('Target data is ready for training export.', 'success');
            
            step3.classList.remove('active');
            step3.classList.add('done');
            
            btnReset.disabled = false;
        }, 1500);
    });

    btnReset.addEventListener('click', () => {
        btnReset.disabled = true;
        btnExtract.disabled = false;
        btnVerify.disabled = true;
        
        points.forEach(p => p.classList.remove('active'));
        bbox.classList.remove('active');
        
        step1.classList.add('active');
        step1.classList.remove('done');
        step2.classList.remove('active', 'done');
        step3.classList.remove('active', 'done');
        
        consoleOut.innerHTML = `<div><span class="log-time">[System]</span> > System initialized. Ready for image analysis...</div>`;
    });
}

