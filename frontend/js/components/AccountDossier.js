/**
 * AccountDossier.js — Component for Section 3 Right Panel (Investigation Dossier).
 */

export class AccountDossier {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  /**
   * Render the dossier panel.
   * @param {Object} account - Single account detail object.
   * @param {boolean} isLoading - Loading state.
   * @param {string} error - Error message if any.
   */
  render(account = null, isLoading = false, error = '') {
    if (!this.container) return;

    // 1. Loading State
    if (isLoading) {
      this.container.innerHTML = `
        <div class="dossier-scroll">
          <div class="dossier-header-section">
            <div>
              <div class="skeleton skeleton-title"></div>
              <div class="skeleton skeleton-text" style="width: 40%"></div>
            </div>
            <div class="skeleton" style="width: 54px; height: 54px; border-radius: 50%;"></div>
          </div>
          <div class="dossier-stats-grid">
            <div class="dossier-stat-box"><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text"></div></div>
            <div class="dossier-stat-box"><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text"></div></div>
          </div>
          <div class="skeleton" style="height: 40px; border-radius: var(--radius-md);"></div>
          <div class="findings-container">
            <div class="skeleton skeleton-text" style="width: 30%"></div>
            <div class="skeleton" style="height: 60px; border-radius: var(--radius-md); margin-bottom: 8px;"></div>
            <div class="skeleton" style="height: 60px; border-radius: var(--radius-md);"></div>
          </div>
        </div>
      `;
      return;
    }

    // 2. Error State
    if (error) {
      this.container.innerHTML = `
        <div class="panel-state">
          <div class="state-icon">❌</div>
          <div class="state-title">Dossier Load Failed</div>
          <div class="state-desc">${error}</div>
        </div>
      `;
      return;
    }

    // 3. Empty State (No Account Selected)
    if (!account) {
      this.container.innerHTML = `
        <div class="panel-state">
          <div class="state-icon">🧬</div>
          <div class="state-title">No Account Selected</div>
          <div class="state-desc">Select an account from the leaderboard or click on a node in the graph trail to pull up its full intelligence dossier.</div>
        </div>
      `;
      return;
    }

    // 4. Populate account details
    const {
      accountId,
      riskScore = 0,
      riskTier = 'low',
      totalTransactions = 0,
      totalVolume = 0,
      isFraudGroundTruth = false,
      flaggedReasons = []
    } = account;

    // Currency representation
    const formattedVolume = `₹${(totalVolume).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    
    // Tier badge classes
    const tierBadgeClass = `badge-${riskTier}`;
    const tierText = riskTier.toUpperCase();

    // Circular SVG Progress Ring
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (riskScore / 100) * circumference;

    // Ground truth indicator banner
    let bannerHTML = '';
    if (isFraudGroundTruth) {
      bannerHTML = `
        <div class="dossier-banner banner-ground-truth">
          <span>🚨</span>
          <span>GROUND-TRUTH FRAUD CONFIRMED (LBL)</span>
        </div>
      `;
    } else {
      bannerHTML = `
        <div class="dossier-banner banner-unverified">
          <span>🔍</span>
          <span>NO HISTORICAL COMPLAINTS DETECTED</span>
        </div>
      `;
    }

    // Findings section
    let findingsHTML = '';
    if (flaggedReasons && flaggedReasons.length > 0) {
      findingsHTML = flaggedReasons
        .map(
          (reason) => `
          <div class="finding-card">
            <span class="finding-icon">⚠️</span>
            <span class="finding-text">${reason}</span>
          </div>
        `
        )
        .join('');
    } else {
      findingsHTML = `
        <div class="findings-empty">
          No suspicious anomalies detected for this account. System online.
        </div>
      `;
    }

    this.container.innerHTML = `
      <div class="dossier-scroll reveal-fade">
        <div class="dossier-header-section">
          <div>
            <div class="dossier-id" title="${accountId}">${accountId}</div>
            <div style="margin-top: 4px; display: flex; align-items: center; gap: 8px;">
              <span class="risk-tier-badge ${tierBadgeClass}">${tierText}</span>
              <span class="account-meta">${totalTransactions} Transactions</span>
            </div>
          </div>
          
          <div class="dossier-score-ring">
            <svg class="dossier-score-svg" width="54" height="54">
              <circle cx="27" cy="27" r="${radius}" stroke="rgba(255, 255, 255, 0.05)" stroke-width="3" fill="transparent"/>
              <circle 
                cx="27" 
                cy="27" 
                r="${radius}" 
                stroke="var(--accent)" 
                stroke-width="3" 
                fill="transparent"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${strokeDashoffset}"
                stroke-linecap="round"
                style="transition: stroke-dashoffset 0.8s ease;"
              />
            </svg>
            <span class="dossier-score-num">${Math.round(riskScore)}</span>
          </div>
        </div>

        <!-- Dossier Stats -->
        <div class="dossier-stats-grid">
          <div class="dossier-stat-box">
            <span class="dossier-stat-label">Total Flow</span>
            <span class="dossier-stat-val" style="color: var(--accent);">${formattedVolume}</span>
          </div>
          <div class="dossier-stat-box">
            <span class="dossier-stat-label">Risk Severity</span>
            <span class="dossier-stat-val tier-${riskTier}">${Math.round(riskScore)}%</span>
          </div>
        </div>

        <!-- Ground Truth Verification Banner -->
        ${bannerHTML}

        <!-- Intelligence Findings -->
        <div class="findings-container">
          <h4 class="findings-title">Intelligence Findings</h4>
          ${findingsHTML}
        </div>
      </div>
    `;

    // Trigger reveal animation if GSAP is available
    if (window.gsap) {
      window.gsap.to(this.container.querySelector('.dossier-scroll'), {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power1.out'
      });
    } else {
      const scrollEl = this.container.querySelector('.dossier-scroll');
      if (scrollEl) scrollEl.style.opacity = 1;
    }
  }
}
