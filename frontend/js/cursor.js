/**
 * Custom cursor — green ring, inner dot, magnetic hover
 */

const cursor = document.getElementById('cursor');
const cursorDot = cursor?.querySelector('.cursor-dot');
const cursorRing = cursor?.querySelector('.cursor-ring');

let mouseX = 0;
let mouseY = 0;
let ringX = 0;
let ringY = 0;

const isTouch = window.matchMedia('(pointer: coarse)').matches;

if (cursor && !isTouch) {
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (cursorDot) {
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    }
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;

    if (cursorRing) {
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
    }

    requestAnimationFrame(animateRing);
  }
  animateRing();

  const hoverTargets = document.querySelectorAll(
    'a, button, .btn, [data-cursor="hover"], .feature-card, .showcase-card'
  );

  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });
}

/* Magnetic buttons */
const magneticEls = document.querySelectorAll('.magnetic');

magneticEls.forEach((el) => {
  if (isTouch) return;

  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const strength = el.classList.contains('btn-large') ? 0.25 : 0.35;

    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  });

  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
  });
});

export {};
