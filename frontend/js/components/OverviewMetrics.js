/**
 * OverviewMetrics.js — Component for Section 1 (Intelligence Overview metrics).
 */

export class OverviewMetrics {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  /**
   * Render the metrics panel.
   * @param {Object} metrics - The metrics data.
   * @param {number} metrics.highRiskCount - Number of high risk accounts.
   * @param {number} metrics.ringsCount - Number of detected fraud rings.
   * @param {number} metrics.flaggedTxnsCount - Number of flagged transactions.
   * @param {string} metrics.systemHealth - Health percent or status text.
   */
  render(metrics = {}) {
    if (!this.container) return;

    const {
      highRiskCount = 0,
      ringsCount = 0,
      flaggedTxnsCount = 0,
      systemHealth = '100%'
    } = metrics;

    this.container.innerHTML = `
      <!-- High Risk Accounts -->
      <div class="metric-card glass-panel reveal-up" style="--delay: 100ms">
        <span class="metric-label">High Risk Accounts</span>
        <div class="metric-value text-glow" id="metric-high-risk">${highRiskCount}</div>
        <span class="metric-trend">🔴 Critical anomaly score</span>
      </div>

      <!-- Fraud Rings -->
      <div class="metric-card glass-panel reveal-up" style="--delay: 150ms">
        <span class="metric-label">Fraud Rings Detected</span>
        <div class="metric-value" id="metric-rings">${ringsCount}</div>
        <span class="metric-trend">● Active network groups</span>
      </div>

      <!-- Flagged Transactions -->
      <div class="metric-card glass-panel reveal-up" style="--delay: 200ms">
        <span class="metric-label">Flagged Volume</span>
        <div class="metric-value" id="metric-volume" style="font-size: 1.6rem; padding-top: 5px;">₹${(flaggedTxnsCount / 1000000).toFixed(2)}M</div>
        <span class="metric-trend">⚠️ Total funds at risk</span>
      </div>

      <!-- System Health -->
      <div class="metric-card glass-panel reveal-up" style="--delay: 250ms">
        <span class="metric-label">Model Accuracy</span>
        <div class="metric-value" id="metric-health">${systemHealth}</div>
        <span class="metric-trend">● Random Forest score</span>
      </div>
    `;

    // Apply animated count-up numbers using GSAP if available
    if (window.gsap) {
      this.animateValue('metric-high-risk', 0, highRiskCount, 1.2);
      this.animateValue('metric-rings', 0, ringsCount, 1.2);
    }
  }

  /**
   * Helper to count up integer values using GSAP.
   */
  animateValue(id, start, end, duration) {
    const el = document.getElementById(id);
    if (!el) return;
    
    const obj = { val: start };
    window.gsap.to(obj, {
      val: end,
      duration: duration,
      ease: 'power3.out',
      onUpdate: () => {
        el.textContent = Math.floor(obj.val);
      }
    });
  }
}
