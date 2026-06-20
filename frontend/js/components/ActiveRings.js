/**
 * ActiveRings.js — Component for Section 2 (Active Fraud Rings dossiers).
 */

export class ActiveRings {
  /**
   * @param {string} containerId - Container DOM element ID.
   * @param {Function} onRingSelect - Callback function(ring) triggered when a ring is clicked.
   */
  constructor(containerId, onRingSelect) {
    this.container = document.getElementById(containerId);
    this.onRingSelect = onRingSelect;
    this.rings = [];
    this.selectedRingId = null;
  }

  /**
   * Render the rings grid.
   * @param {Array<Object>} rings - Array of ring objects from API.
   * @param {string} selectedRingId - Currently selected ring's ID.
   */
  render(rings = [], selectedRingId = null) {
    this.rings = rings;
    this.selectedRingId = selectedRingId;

    if (!this.container) return;

    if (rings.length === 0) {
      this.container.innerHTML = `
        <div class="panel-state" style="grid-column: span 5;">
          <div class="state-icon">🕵️‍♂️</div>
          <div class="state-title">No Fraud Rings Found</div>
          <div class="state-desc">System clean. Risk engine did not isolate any multi-party clusters.</div>
        </div>
      `;
      return;
    }

    this.container.innerHTML = rings
      .map((ring, idx) => {
        const isSelected = ring.ringId === this.selectedRingId;
        const selectClass = isSelected ? 'selected' : '';
        const numAccounts = ring.accountIds ? ring.accountIds.length : 0;
        
        // Stagger index for initial animation
        const delay = 100 + idx * 50;

        return `
          <div 
            class="ring-card ${selectClass} reveal-scale" 
            data-ring-id="${ring.ringId}"
            style="--delay: ${delay}ms"
          >
            <div class="ring-card-header">
              <div class="ring-name" title="${ring.label || 'Fraud Ring'}">${ring.label || 'Fraud Ring'}</div>
              <div class="ring-accounts-badge">${numAccounts} Acc</div>
            </div>
            <div class="ring-desc">${ring.description || 'No description available for this cluster.'}</div>
            <div class="ring-risk-summary">
              <span class="status-dot" style="background: var(--accent); box-shadow: 0 0 8px var(--accent);"></span>
              <span>100% Risk Alert</span>
            </div>
          </div>
        `;
      })
      .join('');

    // Bind click events
    this.container.querySelectorAll('.ring-card').forEach((card) => {
      card.addEventListener('click', () => {
        const ringId = card.getAttribute('data-ring-id');
        const foundRing = this.rings.find((r) => r.ringId === ringId);
        if (foundRing && this.onRingSelect) {
          // Visual highlight update
          this.container.querySelectorAll('.ring-card').forEach((c) => c.classList.remove('selected'));
          card.classList.add('selected');
          this.selectedRingId = ringId;
          
          this.onRingSelect(foundRing);
        }
      });
    });

    // Animate item entries if GSAP is available
    if (window.gsap) {
      window.gsap.to(this.container.querySelectorAll('.ring-card'), {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: 'power2.out'
      });
    } else {
      this.container.querySelectorAll('.ring-card').forEach((el) => {
        el.style.opacity = 1;
        el.style.transform = 'none';
      });
    }
  }
}
