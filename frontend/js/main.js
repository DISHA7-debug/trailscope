/**
 * TrailScope landing — main entry: loader, particles, spotlight, init
 */

/* Loading screen */
const loader = document.getElementById('loader');

function hideLoader() {
  if (!loader) return;
  loader.classList.add('hidden');
  document.body.classList.add('loaded');
}

window.addEventListener('load', () => {
  setTimeout(hideLoader, 1200);
});

setTimeout(hideLoader, 3500);

/* Ambient particles */
function initParticles() {
  const canvas = document.getElementById('particlesCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function createParticles(count) {
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 255, 102, ${p.opacity})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  resize();
  createParticles(Math.min(80, Math.floor((w * h) / 20000)));
  draw();

  window.addEventListener('resize', () => {
    resize();
    createParticles(Math.min(80, Math.floor((w * h) / 20000)));
  });
}

/* Mouse-reactive spotlight */
function initSpotlight() {
  const spotlight = document.getElementById('spotlight');
  if (!spotlight || window.matchMedia('(pointer: coarse)').matches) return;

  document.addEventListener('mousemove', (e) => {
    spotlight.style.left = `${e.clientX}px`;
    spotlight.style.top = `${e.clientY}px`;
  });
}

/* Smooth anchor links via Lenis (scroll.js sets window.lenis) */
function initAnchorLinks() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;

      e.preventDefault();
      const target = document.querySelector(id);
      if (target && window.lenis) {
        window.lenis.scrollTo(target, { offset: -72 });
      } else if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

initParticles();
initSpotlight();

document.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(initAnchorLinks);
});

/* Fallback ring styles injected when Spline unavailable */
const fallbackStyles = document.createElement('style');
fallbackStyles.textContent = `
  .fallback-ring {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .fallback-ring-inner {
    width: min(280px, 60vw);
    height: min(280px, 60vw);
    border-radius: 50%;
    border: 3px solid rgba(0, 255, 102, 0.6);
    box-shadow:
      0 0 60px rgba(0, 255, 102, 0.3),
      inset 0 0 40px rgba(0, 255, 102, 0.1);
    animation: fallback-spin 12s linear infinite;
    position: relative;
  }
  .fallback-ring-inner::before {
    content: '';
    position: absolute;
    inset: 20%;
    border-radius: 50%;
    border: 2px solid rgba(0, 255, 102, 0.3);
    animation: fallback-spin 8s linear infinite reverse;
  }
  .fallback-ring-glow {
    position: absolute;
    inset: 20%;
    background: radial-gradient(circle, rgba(0,255,102,0.25) 0%, transparent 70%);
    filter: blur(30px);
    animation: pulse-glow 4s ease-in-out infinite;
  }
  @keyframes fallback-spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(fallbackStyles);
