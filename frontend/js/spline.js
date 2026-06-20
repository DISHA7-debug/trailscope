/**
 * Spline 3D scenes — hero ring + scroll-reactive experience
 * Replace SPLINE_HERO_URL / SPLINE_SCROLL_URL with your own .splinecode exports
 */

import { Application } from 'https://unpkg.com/@splinetool/runtime@1.9.36/build/runtime.js';

const SPLINE_HERO_URL =
  'https://prod.spline.design/9NWZLuZgVfgkvv4b/scene.splinecode';
const SPLINE_SCROLL_URL =
  'https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode';

const heroCanvas = document.getElementById('heroSpline');
const scrollCanvas = document.getElementById('scrollSpline');

let heroApp = null;
let scrollApp = null;
let heroObject = null;

async function loadHeroSpline() {
  if (!heroCanvas) return;

  try {
    heroApp = new Application(heroCanvas);
    await heroApp.load(SPLINE_HERO_URL);
    console.log("Spline loaded");
    console.log(heroApp);

    heroObject =
    heroApp.findObjectByName('CyberRing') ||
    heroApp.findObjectByName('Cyber Ring') ||
    heroApp.findObjectByName('Ring') ||
  heroApp.findObjectByName('Scene');

    //startHeroIdleAnimation();
    //initHeroMouseFollow();
  } catch (err) {
    console.warn('Spline hero failed, using CSS fallback:', err);
    showFallbackRing(heroCanvas.parentElement);
  }
}

async function loadScrollSpline() {
  if (!scrollCanvas) return;

  try {
    scrollApp = new Application(scrollCanvas);
    await scrollApp.load(SPLINE_SCROLL_URL);
    initScrollSplineAnimation();
  } catch (err) {
    console.warn('Spline scroll scene failed, using CSS fallback:', err);
    showFallbackRing(scrollCanvas.parentElement);
  }
}

function showFallbackRing(container) {
  if (!container || container.querySelector('.fallback-ring')) return;

  container.innerHTML = `
    <div class="fallback-ring" aria-hidden="true">
      <div class="fallback-ring-inner"></div>
      <div class="fallback-ring-glow"></div>
    </div>
  `;
}

function startHeroIdleAnimation() {
  if (!heroObject) return;

  let t = 0;
  const baseY = heroObject.rotation?.y ?? 0;

  function idle() {
    t += 0.008;
    if (heroObject.rotation) {
      heroObject.rotation.y = baseY + Math.sin(t) * 0.15;
      heroObject.rotation.x = Math.sin(t * 0.7) * 0.08;
    }
    if (heroObject.position) {
      heroObject.position.y = Math.sin(t * 1.2) * 0.08;
    }
    requestAnimationFrame(idle);
  }
  idle();
}

function initHeroMouseFollow() {
  if (!heroObject || window.matchMedia('(pointer: coarse)').matches) return;

  let targetRotX = 0;
  let targetRotY = 0;
  let currentRotX = 0;
  let currentRotY = 0;

  document.addEventListener('mousemove', (e) => {
    const cx = (e.clientX / window.innerWidth - 0.5) * 2;
    const cy = (e.clientY / window.innerHeight - 0.5) * 2;
    targetRotY = cx * 0.4;
    targetRotX = -cy * 0.25;
  });

  function follow() {
    currentRotX += (targetRotX - currentRotX) * 0.06;
    currentRotY += (targetRotY - currentRotY) * 0.06;

    if (heroObject.rotation) {
      heroObject.rotation.x += currentRotX * 0.02;
      heroObject.rotation.y += currentRotY * 0.02;
    }

    requestAnimationFrame(follow);
  }
  follow();
}

function initScrollSplineAnimation() {
  const section = document.querySelector('.spline-section');
  if (!section || !scrollApp) return;

  const scrollObject =
    scrollApp.findObjectByName('Torus') ||
    scrollApp.findObjectByName('Ring') ||
    scrollApp.findObjectByName('Scene');

  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1,
    onUpdate: (self) => {
      const p = self.progress;

      if (scrollObject?.rotation) {
        scrollObject.rotation.y = p * Math.PI * 2;
        scrollObject.rotation.x = p * Math.PI * 0.5;
      }

      if (scrollObject?.scale) {
        const s = 0.8 + Math.sin(p * Math.PI) * 0.3;
        scrollObject.scale.x = s;
        scrollObject.scale.y = s;
        scrollObject.scale.z = s;
      }

      gsap.to('.spline-section-content', {
        opacity: 0.4 + (1 - Math.abs(p - 0.5) * 2) * 0.6,
        y: (p - 0.5) * -40,
        duration: 0.1,
        overwrite: true,
      });
    },
  });
}

loadHeroSpline();
loadScrollSpline();

export { heroApp, scrollApp };
