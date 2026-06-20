/**
 * Lenis smooth scroll + GSAP ScrollTrigger + horizontal showcase
 */

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  touchMultiplier: 1.5,
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

/* Scroll progress bar */
const scrollProgress = document.getElementById('scrollProgress');

lenis.on('scroll', ({ progress }) => {
  if (scrollProgress) {
    scrollProgress.style.width = `${progress * 100}%`;
  }
});

/* Text reveals */
function initReveals() {
  const heroLines = document.querySelectorAll('.hero-title .line');
  if (heroLines.length) {
    gsap.to(heroLines, {
      y: 0,
      opacity: 1,
      duration: 1.1,
      stagger: 0.12,
      delay: 1.4,
      ease: 'power4.out',
    });
  }

  const heroReveals = document.querySelectorAll('.hero-eyebrow, .hero-sub, .hero-cta, .hero-scroll-hint');
  gsap.to(heroReveals, {
    y: 0,
    opacity: 1,
    duration: 0.9,
    stagger: 0.1,
    delay: 1.8,
    ease: 'power3.out',
  });

  const scrollTextLines = document.querySelectorAll('.display-title .line, .cta-title .line');

  scrollTextLines.forEach((line, i) => {
    gsap.to(line, {
      y: 0,
      opacity: 1,
      duration: 1.1,
      delay: i * 0.12,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: line.closest('section') || line,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  gsap.utils.toArray('.reveal-up').forEach((el, i) => {
    if (el.closest('.hero')) return;

    gsap.to(el, {
      y: 0,
      opacity: 1,
      duration: 0.9,
      delay: i * 0.05,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });
  });

  gsap.utils.toArray('.feature-card').forEach((card, i) => {
    gsap.from(card, {
      y: 60,
      opacity: 0,
      duration: 0.8,
      delay: i * 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    });
  });

  gsap.utils.toArray('.testimonial-card').forEach((card, i) => {
    gsap.from(card, {
      y: 50,
      opacity: 0,
      rotateX: 8,
      duration: 0.9,
      delay: i * 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    });
  });
}

/* Horizontal showcase scroll */
function initHorizontalScroll() {
  const track = document.getElementById('showcaseTrack');
  const section = document.querySelector('.showcase');

  if (!track || !section) return;

  const getScrollAmount = () => -(track.scrollWidth - window.innerWidth + 48);

  gsap.to(track, {
    x: getScrollAmount,
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${Math.abs(getScrollAmount())}`,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      anticipatePin: 1,
    },
  });
}

/* Animated counters */
function initCounters() {
  document.querySelectorAll('.metric-number').forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const obj = { val: 0 };

    gsap.to(obj, {
      val: target,
      duration: 2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      onUpdate: () => {
        el.textContent = obj.val.toFixed(decimals) + suffix;
      },
    });
  });
}

/* Mouse parallax on sections */
function initParallax() {
  const parallaxEls = document.querySelectorAll('[data-parallax-depth]');

  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.addEventListener('mousemove', (e) => {
    const cx = (e.clientX / window.innerWidth - 0.5) * 2;
    const cy = (e.clientY / window.innerHeight - 0.5) * 2;

    parallaxEls.forEach((el) => {
      const depth = parseFloat(el.dataset.parallaxDepth || '0.02');
      gsap.to(el, {
        x: cx * depth * 100,
        y: cy * depth * 100,
        duration: 0.8,
        ease: 'power2.out',
      });
    });
  });
}

/* 3D tilt cards */
function initTilt() {
  const cards = document.querySelectorAll('[data-tilt]');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(card, {
        rotateY: x * 12,
        rotateX: -y * 12,
        transformPerspective: 800,
        duration: 0.4,
        ease: 'power2.out',
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.6,
        ease: 'power3.out',
      });
    });
  });
}

/* Morphing background on scroll */
function initBgGradient() {
  const bg = document.getElementById('bgGradient');
  if (!bg) return;

  ScrollTrigger.create({
    trigger: '#about',
    start: 'top center',
    end: 'bottom center',
    onEnter: () => {
      bg.style.background =
        'radial-gradient(ellipse 70% 50% at 70% 30%, rgba(0,255,102,0.08) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 20% 70%, rgba(0,255,102,0.05) 0%, transparent 50%), #050505';
    },
    onLeaveBack: () => {
      bg.style.background =
        'radial-gradient(ellipse 80% 60% at 20% 20%, rgba(0,255,102,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(0,255,102,0.04) 0%, transparent 50%), #050505';
    },
  });
}

/* Nav hide on scroll down */
function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  let lastScroll = 0;

  lenis.on('scroll', ({ scroll }) => {
    if (scroll > lastScroll && scroll > 100) {
      nav.style.transform = 'translateY(-100%)';
    } else {
      nav.style.transform = 'translateY(0)';
    }
    lastScroll = scroll;
  });
}

initReveals();
initHorizontalScroll();
initCounters();
initParallax();
initTilt();
initBgGradient();
initNav();

window.addEventListener('resize', () => ScrollTrigger.refresh());

window.lenis = lenis;
export { lenis };
