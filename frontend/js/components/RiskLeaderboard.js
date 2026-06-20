/**
 * RiskLeaderboard.js — Component for Section 3 Left Panel (Risk Leaderboard / Risk Ledger).
 */

export class RiskLeaderboard {
  /**
   * @param {string} containerId - Container DOM element ID.
   * @param {Function} onAccountSelect - Callback function(accountId) triggered when an account is clicked.
   */
  constructor(containerId, onAccountSelect) {
    this.container = document.getElementById(containerId);
    this.onAccountSelect = onAccountSelect;
    this.accounts = [];
    this.filteredAccounts = [];
    this.selectedAccountId = null;
    this.searchQuery = '';
    this.currentSortField = 'riskScore';
    this.currentSortOrder = 'desc';
    this.displayLimit = 100; // Limit visible DOM nodes for performance
  }

  /**
   * Render the leaderboard.
   * @param {Array<Object>} accounts - List of all scored accounts from API.
   * @param {string} selectedAccountId - Currently active account ID.
   */
  render(accounts = [], selectedAccountId = null) {
    if (accounts.length > 0) {
      this.accounts = accounts;
    }
    if (selectedAccountId !== null) {
      this.selectedAccountId = selectedAccountId;
    }

    if (!this.container) return;

    // Apply search filter and sorting
    this.applyFilterAndSort();

    if (this.filteredAccounts.length === 0) {
      this.container.innerHTML = `
        <div class="panel-state">
          <div class="state-icon">🔍</div>
          <div class="state-title">No Accounts Found</div>
          <div class="state-desc">Try search terms matching ID strings (e.g. C100...)</div>
        </div>
      `;
      return;
    }

    // Slice to display limit to avoid lagging the DOM
    const visibleAccounts = this.filteredAccounts.slice(0, this.displayLimit);

    this.container.innerHTML = visibleAccounts
      .map((acc) => {
        const isSelected = acc.accountId === this.selectedAccountId;
        const selectClass = isSelected ? 'selected' : '';
        const tier = acc.riskTier || 'low';
        const tierBadgeClass = `badge-${tier}`;
        const tierLabel = tier.toUpperCase();
        
        // Format volume as currency if needed
        const vol = acc.totalVolume ? `₹${(acc.totalVolume).toLocaleString('en-IN', {maximumFractionDigits: 0})}` : '₹0';

        return `
          <div 
            class="leaderboard-item ${tier} ${selectClass}" 
            data-account-id="${acc.accountId}"
          >
            <div class="account-info">
              <span class="account-id">${acc.accountId}</span>
              <span class="account-meta">${acc.totalTransactions || 0} txns · ${vol}</span>
            </div>
            <div class="risk-badge-group">
              <span class="risk-score-display tier-${tier}">${Math.round(acc.riskScore)}</span>
              <span class="risk-tier-badge ${tierBadgeClass}">${tierLabel}</span>
            </div>
          </div>
        `;
      })
      .join('');

    // Bind click handlers
    this.container.querySelectorAll('.leaderboard-item').forEach((item) => {
      item.addEventListener('click', () => {
        const accountId = item.getAttribute('data-account-id');
        this.selectAccount(accountId);
      });
    });
  }

  /**
   * Selection highlight logic.
   */
  selectAccount(accountId) {
    this.selectedAccountId = accountId;
    this.container.querySelectorAll('.leaderboard-item').forEach((item) => {
      const itemAccId = item.getAttribute('data-account-id');
      if (itemAccId === accountId) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });

    if (this.onAccountSelect) {
      this.onAccountSelect(accountId);
    }
  }

  /**
   * Filter the leaderboard by search query.
   */
  setSearch(query) {
    this.searchQuery = query.trim().toLowerCase();
    this.render();
  }

  /**
   * Apply filters and sorting to local list.
   */
  applyFilterAndSort() {
    // 1. Search filter
    if (this.searchQuery) {
      this.filteredAccounts = this.accounts.filter((acc) =>
        acc.accountId.toLowerCase().includes(this.searchQuery)
      );
    } else {
      this.filteredAccounts = [...this.accounts];
    }

    // 2. Sorting
    this.filteredAccounts.sort((a, b) => {
      let valA = a[this.currentSortField];
      let valB = b[this.currentSortField];

      // Handle undefined/null values
      if (valA === undefined || valA === null) valA = 0;
      if (valB === undefined || valB === null) valB = 0;

      if (this.currentSortOrder === 'desc') {
        return valB > valA ? 1 : valB < valA ? -1 : 0;
      } else {
        return valA > valB ? 1 : valA < valB ? -1 : 0;
      }
    });
  }

  /**
   * Set sorting options.
   */
  setSort(field, order) {
    this.currentSortField = field;
    this.currentSortOrder = order;
    this.render();
  }
}
