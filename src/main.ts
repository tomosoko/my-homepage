document.addEventListener('DOMContentLoaded', () => {
  initCanvas()
  initMobileMenu()
  initScrollAnimations()
  initSimulator()
})

/* Canvas Animation: Network Nodes */
function initCanvas(): void {
  const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement | null
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let width: number
  let height: number
  let particles: Particle[] = []

  // Config
  const particleCount = window.innerWidth < 768 ? 40 : 80
  const connectionDistance = 150
  const mouseDistance = 200

  // Resize handling
  function resize(): void {
    width = canvas!.width = window.innerWidth
    height = canvas!.height = window.innerHeight
  }
  window.addEventListener('resize', resize)
  resize()

  // Mouse tracking
  const mouse: { x: number | null; y: number | null } = { x: null, y: null }
  window.addEventListener('mousemove', (e: MouseEvent) => {
    mouse.x = e.clientX
    mouse.y = e.clientY
  })

  // Particle Class
  class Particle {
    x: number
    y: number
    vx: number
    vy: number
    size: number

    constructor() {
      this.x = Math.random() * width
      this.y = Math.random() * height
      this.vx = (Math.random() - 0.5) * 0.5
      this.vy = (Math.random() - 0.5) * 0.5
      this.size = Math.random() * 1.5 + 0.5
    }

    update(): void {
      this.x += this.vx
      this.y += this.vy

      // Bounce off edges
      if (this.x < 0 || this.x > width) this.vx *= -1
      if (this.y < 0 || this.y > height) this.vy *= -1

      // Mouse interaction
      if (mouse.x != null && mouse.y != null) {
        const dx = mouse.x - this.x
        const dy = mouse.y - this.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < mouseDistance) {
          const forceDirectionX = dx / distance
          const forceDirectionY = dy / distance
          const force = (mouseDistance - distance) / mouseDistance
          const directionX = forceDirectionX * force * 0.5
          const directionY = forceDirectionY * force * 0.5
          this.vx -= directionX
          this.vy -= directionY
        }
      }
    }

    draw(): void {
      ctx!.fillStyle = '#06b6d4'
      ctx!.beginPath()
      ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      ctx!.fill()
    }
  }

  // Init particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle())
  }

  // Animation Loop
  function animate(): void {
    ctx!.clearRect(0, 0, width, height)

    particles.forEach(p => {
      p.update()
      p.draw()
    })

    connectParticles()
    requestAnimationFrame(animate)
  }

  function connectParticles(): void {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x
        const dy = particles[a].y - particles[b].y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < connectionDistance) {
          const opacity = 1 - distance / connectionDistance
          ctx!.strokeStyle = `rgba(6, 182, 212, ${opacity * 0.2})`
          ctx!.lineWidth = 1
          ctx!.beginPath()
          ctx!.moveTo(particles[a].x, particles[a].y)
          ctx!.lineTo(particles[b].x, particles[b].y)
          ctx!.stroke()
        }
      }
    }
  }

  animate()
}

/* UI Interactions */
function initMobileMenu(): void {
  const mobileBtn = document.querySelector('.mobile-menu-btn')
  const navLinks = document.querySelector('.nav-links')
  if (!mobileBtn || !navLinks) return

  // Create overlay
  const overlay = document.createElement('div')
  overlay.className = 'mobile-overlay'
  overlay.innerHTML = `
    <button class="mobile-overlay-close" aria-label="Close menu">✕</button>
    <nav class="mobile-nav">
      <a href="#about">About</a>
      <a href="#projects">Projects</a>
      <a href="#skills">Skills</a>
      <a href="#contact">Contact</a>
      <a href="https://github.com/tomosoko" target="_blank">GitHub</a>
    </nav>
  `
  document.body.appendChild(overlay)

  const closeBtn = overlay.querySelector('.mobile-overlay-close') as HTMLButtonElement | null
  if (!closeBtn) return

  function openMenu(): void {
    overlay.classList.add('is-open')
    document.body.style.overflow = 'hidden'
  }
  function closeMenu(): void {
    overlay.classList.remove('is-open')
    document.body.style.overflow = ''
  }

  mobileBtn.addEventListener('click', openMenu)
  closeBtn.addEventListener('click', closeMenu)
  overlay.addEventListener('click', (e: Event) => {
    if (e.target === overlay) closeMenu()
  })
  overlay.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMenu)
  })
}

function initScrollAnimations(): void {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    },
    { threshold: 0.05 }
  )

  const targets = document.querySelectorAll(
    '.project-item, .about-layout, .skills-grid, .earlier-card, .contact-layout'
  )
  targets.forEach(el => {
    el.classList.add('will-animate')
    observer.observe(el)
  })
}

/* AI Simulator Logic */
type LogType = 'success' | 'warn' | ''

function initSimulator(): void {
  const btnExtract = document.getElementById('btn-extract') as HTMLButtonElement | null
  const btnVerify = document.getElementById('btn-verify') as HTMLButtonElement | null
  const btnReset = document.getElementById('btn-reset') as HTMLButtonElement | null

  const simViewport = document.querySelector('.sim-viewport')
  const points = document.querySelectorAll('.point')
  const bbox = document.getElementById('sim-bbox')
  const consoleOut = document.getElementById('sim-console-out')

  const step1 = document.getElementById('step-1')
  const step2 = document.getElementById('step-2')
  const step3 = document.getElementById('step-3')

  if (!btnExtract || !btnVerify || !btnReset || !simViewport || !consoleOut) return

  function log(msg: string, type: LogType = ''): void {
    const time = new Date().toISOString().split('T')[1].substring(0, 8)
    const spanClass =
      type === 'success' ? 'log-success' : type === 'warn' ? 'log-warn' : ''
    const line = `<div style="margin-bottom:4px;"><span class="log-time">[${time}]</span> <span class="${spanClass}">${msg}</span></div>`
    consoleOut!.innerHTML += line
    consoleOut!.scrollTop = consoleOut!.scrollHeight
  }

  btnExtract.addEventListener('click', () => {
    btnExtract!.disabled = true
    simViewport!.classList.add('scanning')

    step1?.classList.remove('active')
    step1?.classList.add('done')
    step2?.classList.add('active')

    log('> Starting Feature Extraction...')
    log('Loading ConvNeXt-Tiny weights...')

    setTimeout(() => log('Model loaded. Running forward pass...', 'warn'), 800)

    setTimeout(() => {
      simViewport!.classList.remove('scanning')
      points.forEach(p => p.classList.add('active'))
      log('Features successfully extracted.', 'success')
      log('Landmarks: Femur Condyle, Tibial Plateau, Patella detected.')

      btnVerify!.disabled = false
    }, 2500)
  })

  btnVerify.addEventListener('click', () => {
    btnVerify!.disabled = true

    step2?.classList.remove('active')
    step2?.classList.add('done')
    step3?.classList.add('active')

    log('> Verifying AI coordinates against ground truth...')
    log('Calculating Dice Score & MAE... Please wait.')

    setTimeout(() => {
      bbox?.classList.add('active')
      log('Verification Complete.', 'success')
      log('Dice: 0.94, MAE: 1.2°', 'success')
      log('Target data is ready for training export.', 'success')

      step3?.classList.remove('active')
      step3?.classList.add('done')

      btnReset!.disabled = false
    }, 1500)
  })

  btnReset.addEventListener('click', () => {
    btnReset!.disabled = true
    btnExtract!.disabled = false
    btnVerify!.disabled = true

    points.forEach(p => p.classList.remove('active'))
    bbox?.classList.remove('active')

    step1?.classList.add('active')
    step1?.classList.remove('done')
    step2?.classList.remove('active', 'done')
    step3?.classList.remove('active', 'done')

    consoleOut!.innerHTML = `<div><span class="log-time">[System]</span> > System initialized. Ready for image analysis...</div>`
  })
}
