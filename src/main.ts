document.addEventListener('DOMContentLoaded', () => {
  initCanvas()
  initMobileMenu()
  initScrollAnimations()
  initScrollSpy()
  initBackToTop()
})

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* Canvas Animation: Network Nodes */
function initCanvas(): void {
  const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement | null
  if (!canvas) return

  // Skip canvas animation entirely when user prefers reduced motion
  if (prefersReducedMotion) return

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
  let animationId: number | null = null

  function animate(): void {
    ctx!.clearRect(0, 0, width, height)

    particles.forEach(p => {
      p.update()
      p.draw()
    })

    connectParticles()
    animationId = requestAnimationFrame(animate)
  }

  function startAnimation(): void {
    if (animationId === null) animationId = requestAnimationFrame(animate)
  }

  function stopAnimation(): void {
    if (animationId !== null) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
  }

  // Pause when hero scrolls out of view to save CPU/battery
  const visibilityObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startAnimation()
        } else {
          stopAnimation()
          ctx!.clearRect(0, 0, width, height)
        }
      })
    },
    { threshold: 0 }
  )
  visibilityObserver.observe(canvas)

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

  // Animation starts via IntersectionObserver when canvas enters viewport
}

/* UI Interactions */
function initMobileMenu(): void {
  const mobileBtn = document.querySelector('.mobile-menu-btn')
  const navLinks = document.querySelector('.nav-links')
  if (!mobileBtn || !navLinks) return

  // Create overlay
  const overlay = document.createElement('div')
  overlay.className = 'mobile-overlay'
  overlay.id = 'mobile-overlay'
  overlay.setAttribute('role', 'dialog')
  overlay.setAttribute('aria-modal', 'true')
  overlay.setAttribute('aria-label', 'Navigation menu')
  overlay.innerHTML = `
    <button class="mobile-overlay-close" aria-label="Close menu">✕</button>
    <nav class="mobile-nav">
      <a href="#about">About</a>
      <a href="#projects">Projects</a>
      <a href="#presentations">Presentations</a>
      <a href="#skills">Skills</a>
      <a href="#contact">Contact</a>
      <a href="https://github.com/tomosoko" target="_blank" rel="noopener noreferrer">GitHub</a>
    </nav>
  `
  document.body.appendChild(overlay)

  const closeBtn = overlay.querySelector('.mobile-overlay-close') as HTMLButtonElement | null
  if (!closeBtn) return

  function openMenu(): void {
    overlay.classList.add('is-open')
    document.body.style.overflow = 'hidden'
    ;(mobileBtn as HTMLButtonElement).setAttribute('aria-expanded', 'true')
    closeBtn?.focus()
  }
  function closeMenu(): void {
    overlay.classList.remove('is-open')
    document.body.style.overflow = ''
    ;(mobileBtn as HTMLButtonElement).setAttribute('aria-expanded', 'false')
    ;(mobileBtn as HTMLButtonElement).focus()
  }

  mobileBtn.addEventListener('click', openMenu)
  closeBtn.addEventListener('click', closeMenu)
  overlay.addEventListener('click', (e: Event) => {
    if (e.target === overlay) closeMenu()
  })
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (!overlay.classList.contains('is-open')) return

    if (e.key === 'Escape') {
      closeMenu()
      return
    }

    // Focus trap: keep Tab/Shift+Tab within the overlay
    if (e.key === 'Tab') {
      const focusable = Array.from(
        overlay.querySelectorAll<HTMLElement>('button, a, [tabindex]:not([tabindex="-1"])')
      ).filter(el => !el.hasAttribute('disabled'))
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
  })
  overlay.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMenu)
  })
}

function initScrollAnimations(): void {
  const targets = document.querySelectorAll<Element>(
    '.project-item, .about-layout, .skills-grid, .earlier-card, .contact-layout, .pres-item'
  )

  // Skip animation setup when user prefers reduced motion — show all elements immediately
  if (prefersReducedMotion) {
    targets.forEach(el => el.classList.add('visible'))
    return
  }

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

  targets.forEach(el => {
    el.classList.add('will-animate')
    observer.observe(el)
  })
}

function initScrollSpy(): void {
  const sectionIds = ['about', 'projects', 'presentations', 'skills', 'contact']
  const navLinks = document.querySelectorAll<HTMLAnchorElement>('.nav-links a[href^="#"]')

  const sections = sectionIds
    .map(id => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null)

  function setActive(id: string): void {
    navLinks.forEach(a => {
      const href = a.getAttribute('href')
      if (href === `#${id}`) {
        a.classList.add('active')
        a.setAttribute('aria-current', 'true')
      } else {
        a.classList.remove('active')
        a.removeAttribute('aria-current')
      }
    })
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActive(entry.target.id)
        }
      })
    },
    {
      rootMargin: '-40% 0px -55% 0px',
      threshold: 0,
    }
  )

  sections.forEach(section => observer.observe(section))
}

function initBackToTop(): void {
  const btn = document.getElementById('back-to-top') as HTMLButtonElement | null
  if (!btn) return

  const SHOW_THRESHOLD = 300

  window.addEventListener('scroll', () => {
    if (window.scrollY > SHOW_THRESHOLD) {
      btn.classList.add('is-visible')
    } else {
      btn.classList.remove('is-visible')
    }
  }, { passive: true })

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'instant' : 'smooth' })
  })
}
