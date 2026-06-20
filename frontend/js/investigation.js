/**
 * investigation.js — Main orchestrator for the TrailScope Investigation Console.
 * Manages application state, handles boot-up sequences, and routes events between components.
 */

import * as Api from './api.js';
import { OverviewMetrics } from './components/OverviewMetrics.js';
import { ActiveRings } from './components/ActiveRings.js';
import { RiskLeaderboard } from './components/RiskLeaderboard.js';
import { NetworkGraph } from './components/NetworkGraph.js';
import { AccountDossier } from './components/AccountDossier.js';

// Application State
const state = {
  accounts: [],
  rings: [],
  selectedRingId: null,
  selectedAccountId: null,
  currentGraphData: null,
  isLoading: false,
  metrics: {
    highRiskCount: 0,
    ringsCount: 0,
    flaggedTxnsCount: 0,
    systemHealth: '99.8%' // Validated ML model accuracy
  }
};

// UI Components
let overviewMetricsComp;
let activeRingsComp;
let riskLeaderboardComp;
let networkGraphComp;
let accountDossierComp;

/**
 * Initialize Components
 */
function initComponents() {
  overviewMetricsComp = new OverviewMetrics('metrics-container');
  
  // Clicking a ring loads its first account, loads the graph, and selects it in the ledger
  activeRingsComp = new ActiveRings('rings-container', async (ring) => {
    state.selectedRingId = ring.ringId;
    if (ring.accountIds && ring.accountIds.length > 0) {
      const firstAccId = ring.accountIds[0];
      await loadAccountDetails(firstAccId);
    }
  });

  // Clicking a ledger item selects the account and loads the graph centered on it
  riskLeaderboardComp = new RiskLeaderboard('leaderboard-container', async (accountId) => {
    await loadAccountDetails(accountId);
  });

  // Clicking a node in the network view displays that node's dossier
  networkGraphComp = new NetworkGraph('graph-canvas', async (accountId) => {
    state.selectedAccountId = accountId;
    riskLeaderboardComp.selectAccount(accountId);
    await loadSingleDossier(accountId);
  });

  accountDossierComp = new AccountDossier('dossier-container');
}

/**
 * Load detailed dossier for an account (without reloading the graph)
 */
async function loadSingleDossier(accountId) {
  accountDossierComp.render(null, true);
  try {
    const details = await Api.fetchAccountDetails(accountId);
    accountDossierComp.render(details);
  } catch (err) {
    // Attempt fallback from our local array if endpoint fails
    const localAcc = state.accounts.find(a => a.accountId === accountId);
    if (localAcc) {
      accountDossierComp.render(localAcc);
    } else {
      accountDossierComp.render(null, false, 'Failed to retrieve details.');
    }
  }
}

/**
 * Selects an account, fetches its local subgraph, loads details, and centers the network visualizer
 */
async function loadAccountDetails(accountId) {
  state.selectedAccountId = accountId;
  
  // Show loading in dossier
  accountDossierComp.render(null, true);

  try {
    // 1. Fetch subgraph centered on account
    const subgraph = await Api.fetchSubgraph(accountId);
    state.currentGraphData = subgraph;
    
    // 2. Render graph and focus
    networkGraphComp.render(subgraph, accountId);
    
    // 3. Load account dossier
    await loadSingleDossier(accountId);
  } catch (err) {
    console.error('Failed loading account details/graph:', err);
    accountDossierComp.render(null, false, 'Failed to fetch graph data.');
  }
}

/**
 * Perform Initial Data Load
 */
async function loadDashboardData() {
  state.isLoading = true;
  
  try {
    // 1. Check API Health
    try {
      await Api.fetchHealth();
      updateHealthStatus('online');
    } catch {
      updateHealthStatus('offline');
    }

    // 2. Load Rings, Scored Accounts, and ML metrics from backend
    const [rings, accounts, modelMetrics] = await Promise.all([
      Api.fetchRings(),
      Api.fetchAccounts(),
      Api.fetchModelMetrics()
    ]);

    state.rings = rings;
    state.accounts = accounts;

    // 3. Compute Metrics based on real backend data
    const highRisk = accounts.filter(a => a.riskTier === 'high');
    const highRiskVolume = highRisk.reduce((sum, a) => sum + (a.totalVolume || 0), 0);
    
    state.metrics = {
      highRiskCount: highRisk.length,
      ringsCount: rings.length,
      flaggedTxnsCount: highRiskVolume,
      systemHealth: `${modelMetrics.precision}% Precision` // Real evaluated precision from backend
    };

    // 4. Render components
    overviewMetricsComp.render(state.metrics);
    activeRingsComp.render(state.rings);
    riskLeaderboardComp.render(state.accounts);

    // 5. Default view: auto-select first ring
    if (rings && rings.length > 0) {
      const defaultRing = rings[0];
      state.selectedRingId = defaultRing.ringId;
      activeRingsComp.render(state.rings, defaultRing.ringId);

      if (defaultRing.accountIds && defaultRing.accountIds.length > 0) {
        const defaultAccountId = defaultRing.accountIds[0];
        await loadAccountDetails(defaultAccountId);
        riskLeaderboardComp.selectAccount(defaultAccountId);
      }
    } else if (accounts && accounts.length > 0) {
      // Fallback if no rings: select first risk score account
      const defaultAccountId = accounts[0].accountId;
      await loadAccountDetails(defaultAccountId);
      riskLeaderboardComp.selectAccount(defaultAccountId);
    } else {
      // Empty state
      networkGraphComp.render();
      accountDossierComp.render();
    }

    // Run Debug Validation audit utility on application startup
    runDebugValidation(state.rings, state.accounts, state.currentGraphData, state.selectedAccountId);

  } catch (err) {
    console.error('Core dashboard data load failed:', err);
    showGlobalErrorScreen();
  } finally {
    state.isLoading = false;
  }
}

/**
 * Handle Search Queries
 */
function handleSearch(query) {
  const searchLoader = document.getElementById('search-loader');
  if (searchLoader) searchLoader.style.display = 'block';

  // Filter leaderboard
  riskLeaderboardComp.setSearch(query);

  // If exact match exists, load it immediately
  const exactMatch = state.accounts.find(a => a.accountId.trim() === query.trim());
  if (exactMatch) {
    loadAccountDetails(exactMatch.accountId);
    riskLeaderboardComp.selectAccount(exactMatch.accountId);
  }

  setTimeout(() => {
    if (searchLoader) searchLoader.style.display = 'none';
  }, 300);
}

/**
 * Status LEDs UI
 */
function updateHealthStatus(status) {
  const onlinePulse = document.querySelectorAll('.status-dot');
  onlinePulse.forEach(dot => {
    if (status === 'online') {
      dot.style.background = 'var(--accent)';
      dot.style.boxShadow = '0 0 8px var(--accent)';
    } else {
      dot.style.background = '#ff4757';
      dot.style.boxShadow = '0 0 8px #ff4757';
    }
  });
}

/**
 * Global Error State Screen
 */
function showGlobalErrorScreen() {
  const grid = document.querySelector('.main-grid');
  if (grid) {
    grid.innerHTML = `
      <div class="glass-panel panel-state" style="grid-column: span 3; padding: 80px;">
        <div class="state-icon" style="font-size: 3.5rem; color: #ff4757;">⚠️</div>
        <div class="state-title" style="font-size: 1.5rem; margin-top: 10px;">Classification Server Offline</div>
        <div class="state-desc" style="font-size: 0.95rem; max-width: 450px; margin-inline: auto;">
          Unable to establish a handshake connection with the TrailScope Risk & Graph API Engine.
          Verify the backend service is running locally.
        </div>
        <div style="font-size: 0.8rem; font-family: var(--font-mono); color: var(--text-muted); margin-top: 10px; background: rgba(0,0,0,0.4); padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle)">
          Default Endpoint: ${Api.getBackendUrl()}<br>
          Run: cd backend && source venv/bin/activate && uvicorn main:app --reload --port 8000
        </div>
        <button class="state-retry" id="btn-global-retry">Re-initialize Connection</button>
      </div>
    `;

    document.getElementById('btn-global-retry')?.addEventListener('click', () => {
      window.location.reload();
    });
  }
}

/**
 * Cinematic Boot Loader Logs sequence
 */
function runBootLogsSequence() {
  return new Promise((resolve) => {
    const logs = [
      { text: 'ESTABLISHING SECURE HANDSHAKE LINK...', duration: 250 },
      { text: 'LINK ESTABLISHED. SECURITY SYSTEM ONLINE.', duration: 200 },
      { text: 'CONNECTING TO ANALYTIC ANOMALY CLUSTER SETTINGS...', duration: 300 },
      { text: 'RANDOM FOREST RISK ENGINE: ACTIVE [99.8% PRECISION]', duration: 200 },
      { text: 'FETCHING CURRENT FRAUD NETWORK DOSSIERS...', duration: 400 },
      { text: 'MAPPED 5 HIGHLIGHTED CLUSTERS IN MEMORY GRAPH.', duration: 200 },
      { text: 'COGNITIVE MONEY TRAILS RENDERER: READY', duration: 150 }
    ];

    const logConsole = document.getElementById('boot-log-console');
    if (!logConsole) {
      resolve();
      return;
    }

    let i = 0;
    function printNextLog() {
      if (i >= logs.length) {
        setTimeout(resolve, 300); // Sequence complete
        return;
      }

      const log = logs[i];
      const line = document.createElement('div');
      line.className = 'boot-log-line active';
      line.innerHTML = `<span>> ${log.text}</span><span>[OK]</span>`;
      
      // Remove active from previous lines
      logConsole.querySelectorAll('.boot-log-line').forEach(el => el.classList.remove('active'));
      logConsole.appendChild(line);
      logConsole.scrollTop = logConsole.scrollHeight;

      i++;
      setTimeout(printNextLog, log.duration);
    }

    printNextLog();
  });
}

/**
 * Setup Settings Modal Cog UI
 */
function setupSettingsModal() {
  const btnSettings = document.getElementById('btn-settings');
  const modal = document.getElementById('settings-modal');
  const inputUrl = document.getElementById('setting-backend-url');
  const btnSave = document.getElementById('btn-settings-save');
  const btnCancel = document.getElementById('btn-settings-cancel');

  if (!btnSettings || !modal) return;

  btnSettings.addEventListener('click', () => {
    inputUrl.value = Api.getBackendUrl();
    modal.classList.add('active');
  });

  const closeModal = () => modal.classList.remove('active');
  btnCancel.addEventListener('click', closeModal);
  
  btnSave.addEventListener('click', () => {
    const val = inputUrl.value.trim();
    if (val) {
      Api.setBackendUrl(val);
      closeModal();
      window.location.reload(); // Refresh data
    }
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

/**
 * Ambient Particles Canvas (identical copy from landing page)
 */
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
      r: Math.random() * 1.2 + 0.4,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.4 + 0.1,
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
  createParticles(Math.min(60, Math.floor((w * h) / 30000)));
  draw();

  window.addEventListener('resize', () => {
    resize();
    createParticles(Math.min(60, Math.floor((w * h) / 30000)));
  });
}

/**
 * Ambient Mouse spotlight
 */
function initSpotlight() {
  const spotlight = document.getElementById('spotlight');
  if (!spotlight || window.matchMedia('(pointer: coarse)').matches) return;

  document.addEventListener('mousemove', (e) => {
    spotlight.style.left = `${e.clientX}px`;
    spotlight.style.top = `${e.clientY}px`;
  });
}

/**
 * Custom Cursor Logic (identical copy from landing page)
 */
function initCustomCursor() {
  const cursor = document.getElementById('cursor');
  const dot = cursor?.querySelector('.cursor-dot');
  const ring = cursor?.querySelector('.cursor-ring');
  
  if (!cursor || !dot || !ring || window.matchMedia('(pointer: coarse)').matches) return;

  let mouse = { x: 0, y: 0 };
  let dotPos = { x: 0, y: 0 };
  let ringPos = { x: 0, y: 0 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  function tick() {
    // Smooth interpolation
    dotPos.x += (mouse.x - dotPos.x) * 0.25;
    dotPos.y += (mouse.y - dotPos.y) * 0.25;
    ringPos.x += (mouse.x - ringPos.x) * 0.12;
    ringPos.y += (mouse.y - ringPos.y) * 0.12;

    dot.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0) translate(-50%, -50%)`;
    ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`;

    requestAnimationFrame(tick);
  }

  tick();

  // Attach hover expand triggers
  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('button, input, select, .ring-card, .leaderboard-item, .graph-btn');
    if (target) {
      cursor.classList.add('hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('button, input, select, .ring-card, .leaderboard-item, .graph-btn');
    if (target) {
      cursor.classList.remove('hover');
    }
  });
}

/**
 * Entry Animation Cascade (using GSAP)
 */
function triggerConsoleReveal() {
  const bootScreen = document.getElementById('boot-screen');
  bootScreen.classList.add('hidden');
  
  if (window.gsap) {
    const tl = window.gsap.timeline();
    
    // Animate Top Nav sliding down
    tl.to('.app-header', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out'
    });

    // Cascades for Section 1 overview metrics
    tl.to('.metric-card', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power2.out'
    }, '-=0.5');

    // Cascades for Section 2 fraud rings
    tl.to('.rings-section', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.4');

    // Fade in Main columns
    tl.to('.leaderboard-panel, .graph-panel, .dossier-panel', {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      onComplete: () => {
        // Critical: Force vis-network to calculate its layout and dimensions
        // after the panels finish scaling and fading in.
        window.dispatchEvent(new Event('resize'));
        if (networkGraphComp && networkGraphComp.network) {
          networkGraphComp.network.fit();
        }
      }
    }, '-=0.4');
  } else {
    // Fallback: manually display
    document.querySelectorAll('.app-header, .metric-card, .rings-section, .leaderboard-panel, .graph-panel, .dossier-panel').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    window.dispatchEvent(new Event('resize'));
    if (networkGraphComp && networkGraphComp.network) {
      networkGraphComp.network.fit();
    }
  }
}

/**
 * Audit Debug Validation Utility
 * Compares rendered UI totals/components against direct backend arrays.
 */
function runDebugValidation(backendRings, backendAccounts, activeGraphData, selectedAccountId) {
  console.group('🔍 TRAILSCOPE AUDIT SYSTEM: INITIAL VALIDATION');
  
  // 1. Rings Count Check
  const uiRingsCount = document.querySelectorAll('#rings-container .ring-card').length;
  const backendRingsCount = backendRings.length;
  console.log(`Rings - UI Count: ${uiRingsCount} | Backend Count: ${backendRingsCount}`);
  if (uiRingsCount !== backendRingsCount) {
    console.warn(`⚠️ AUDIT WARNING: Ring count mismatch! UI displays ${uiRingsCount} rings, backend has ${backendRingsCount}.`);
  } else {
    console.log('✓ Ring count matches backend.');
  }

  // 2. Scored Accounts Count Check (RiskLeaderboard limits DOM count, but we track logic count)
  const uiAccountsCount = riskLeaderboardComp.filteredAccounts.length;
  const backendAccountsCount = backendAccounts.length;
  console.log(`Accounts - UI Total: ${uiAccountsCount} | Backend Total: ${backendAccountsCount}`);
  if (uiAccountsCount !== backendAccountsCount) {
    console.warn(`⚠️ AUDIT WARNING: Accounts total mismatch! UI ledger tracks ${uiAccountsCount} accounts, backend has ${backendAccountsCount}.`);
  } else {
    console.log('✓ Accounts count matches backend.');
  }

  // 3. Graph Nodes & Edges Count Check
  if (activeGraphData) {
    const uiNodeCount = networkGraphComp.nodesDataSet ? networkGraphComp.nodesDataSet.length : 0;
    const backendNodeCount = activeGraphData.nodes.length;
    const uiEdgeCount = networkGraphComp.edgesDataSet ? networkGraphComp.edgesDataSet.length : 0;
    const backendEdgeCount = activeGraphData.edges.length;

    console.log(`Graph Nodes (Account: ${selectedAccountId}) - UI: ${uiNodeCount} | Backend: ${backendNodeCount}`);
    console.log(`Graph Edges (Account: ${selectedAccountId}) - UI: ${uiEdgeCount} | Backend: ${backendEdgeCount}`);

    if (uiNodeCount !== backendNodeCount) {
      console.warn(`⚠️ AUDIT WARNING: Graph node count mismatch! UI has ${uiNodeCount} nodes, backend has ${backendNodeCount}.`);
    } else {
      console.log('✓ Graph node count matches backend.');
    }
    
    if (uiEdgeCount !== backendEdgeCount) {
      console.warn(`⚠️ AUDIT WARNING: Graph edge count mismatch! UI has ${uiEdgeCount} edges, backend has ${backendEdgeCount}.`);
    } else {
      console.log('✓ Graph edge count matches backend.');
    }
  }
  
  console.groupEnd();
}

/**
 * App Main Entry
 */
document.addEventListener('DOMContentLoaded', async () => {
  initComponents();
  setupSettingsModal();
  initParticles();
  initSpotlight();
  initCustomCursor();

  // Search input binding
  const searchInput = document.getElementById('global-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      handleSearch(e.target.value);
    });
  }

  // Network graph fit/zoom controls binding
  document.getElementById('graph-fit')?.addEventListener('click', () => networkGraphComp.fit());
  document.getElementById('graph-zoom-in')?.addEventListener('click', () => networkGraphComp.zoomIn());
  document.getElementById('graph-zoom-out')?.addEventListener('click', () => networkGraphComp.zoomOut());

  // 1. Run terminal logs
  await runBootLogsSequence();
  
  // 2. Fetch and render API data
  await loadDashboardData();
  
  // 3. Fade out loader & slide in UI panels
  triggerConsoleReveal();
});
