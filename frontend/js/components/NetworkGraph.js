/**
 * NetworkGraph.js — Component for Section 3 Center Panel (Network Visualization).
 * Orchestrates vis-network with custom nodes, edges, shadows, and physics settings.
 */

export class NetworkGraph {
  /**
   * @param {string} containerId - Canvas container element ID.
   * @param {Function} onNodeSelect - Callback function(nodeId) triggered when a node is clicked.
   */
  constructor(containerId, onNodeSelect) {
    this.container = document.getElementById(containerId);
    this.onNodeSelect = onNodeSelect;
    this.network = null;
    this.nodesDataSet = null;
    this.edgesDataSet = null;
    this.graphData = null;
    this.selectedNodeId = null;
  }

  /**
   * Render the graph.
   * @param {Object} graphData - The graph payload (nodes and edges).
   * @param {string} centerNodeId - Central account to highlight or zoom to.
   */
  render(graphData = { nodes: [], edges: [] }, centerNodeId = null) {
    this.graphData = graphData;
    
    if (!this.container) return;

    if (!window.vis) {
      this.container.innerHTML = `
        <div class="panel-state">
          <div class="state-icon">⚠️</div>
          <div class="state-title">Visualization Library Offline</div>
          <div class="state-desc">vis-network failed to load. Check your internet connection.</div>
        </div>
      `;
      return;
    }

    if (!graphData.nodes || graphData.nodes.length === 0) {
      this.container.innerHTML = `
        <div class="panel-state">
          <div class="state-icon">🧬</div>
          <div class="state-title">Graph Area Ready</div>
          <div class="state-desc">Select an account from the leaderboard or click an active ring to generate money trails.</div>
        </div>
      `;
      return;
    }

    this.container.innerHTML = ''; // Clear container

    // 1. Process Nodes
    const nodesArray = graphData.nodes.map((node) => {
      const riskScore = node.riskScore || 0;
      const riskTier = node.riskTier || 'low';
      
      // Node size scaled by risk score
      let size = 12 + (riskScore / 100) * 18;
      let colorSettings = {};
      let shadowSettings = { enabled: false };

      if (riskTier === 'high') {
        colorSettings = {
          background: '#00ff66',
          border: '#00ff66',
          highlight: { background: '#00ff66', border: '#ffffff' },
          hover: { background: '#ffffff', border: '#00ff66' }
        };
        shadowSettings = {
          enabled: true,
          color: 'rgba(0, 255, 102, 0.65)',
          size: 20,
          x: 0,
          y: 0
        };
      } else if (riskTier === 'medium') {
        colorSettings = {
          background: 'rgba(0, 255, 102, 0.6)',
          border: 'rgba(0, 255, 102, 0.8)',
          highlight: { background: '#00ff66', border: 'rgba(0, 255, 102, 0.8)' },
          hover: { background: '#ffffff', border: 'rgba(0, 255, 102, 0.8)' }
        };
        shadowSettings = {
          enabled: true,
          color: 'rgba(0, 255, 102, 0.25)',
          size: 10,
          x: 0,
          y: 0
        };
      } else {
        // Low risk node - muted styling
        colorSettings = {
          background: '#131822',
          border: 'rgba(255, 255, 255, 0.2)',
          highlight: { background: '#131822', border: 'rgba(0, 255, 102, 0.5)' },
          hover: { background: '#131822', border: '#00ff66' }
        };
      }

      // Highlight the queried account itself
      const isCenter = node.id === centerNodeId;
      if (isCenter) {
        size += 6;
        colorSettings.border = '#ffffff';
        colorSettings.borderWidth = 3;
      }

      return {
        id: node.id,
        label: node.label || node.id,
        size: size,
        color: colorSettings,
        shadow: shadowSettings,
        borderWidth: isCenter ? 3 : 1.5,
        font: {
          color: isCenter ? '#ffffff' : '#7B879C',
          size: isCenter ? 12 : 10,
          face: 'JetBrains Mono, IBM Plex Mono, monospace'
        }
      };
    });

    // 2. Process Edges
    const edgesArray = graphData.edges.map((edge, idx) => {
      const amount = edge.amount || 0;
      
      // Scale line width logarithmically with transaction amount
      // Standard PaySim transaction values range from ₹1,000 to ₹10,000,000+
      const width = 1 + Math.max(0.5, Math.min(7.5, Math.log10(amount + 1) * 0.8));

      return {
        id: edge.id || `edge_${idx}`,
        from: edge.from,
        to: edge.to,
        width: width,
        arrows: {
          to: { enabled: true, scaleFactor: 0.5 }
        },
        color: {
          color: 'rgba(0, 255, 102, 0.15)',
          highlight: '#00ff66',
          hover: 'rgba(0, 255, 102, 0.5)'
        },
        smooth: {
          type: 'cubicBezier',
          forceDirection: 'none',
          roundness: 0.2
        },
        title: `Txn: ₹${amount.toLocaleString('en-IN')}` // Hover tooltip
      };
    });

    // 3. Initialize vis DataSet
    const vis = window.vis;
    this.nodesDataSet = new vis.DataSet(nodesArray);
    this.edgesDataSet = new vis.DataSet(edgesArray);

    const data = {
      nodes: this.nodesDataSet,
      edges: this.edgesDataSet
    };

    // 4. Graph options
    const options = {
      physics: {
        enabled: true,
        stabilization: {
          enabled: true,
          iterations: 150,
          updateInterval: 25,
          fit: true
        },
        barnesHut: {
          gravitationalConstant: -1800,
          centralGravity: 0.35,
          springLength: 110,
          springConstant: 0.04,
          damping: 0.09,
          avoidOverlap: 1
        }
      },
      nodes: {
        shape: 'dot',
        font: {
          face: 'JetBrains Mono, IBM Plex Mono, monospace'
        }
      },
      edges: {
        selectionWidth: 1.5,
        hoverWidth: 1.5
      },
      interaction: {
        hover: true,
        tooltipDelay: 150,
        selectable: true,
        selectConnectedEdges: true,
        navigationButtons: false, // Custom styled HTML controls instead
        keyboard: false
      }
    };

    // 5. Build network instance
    this.network = new vis.Network(this.container, data, options);

    // 6. Handle click events
    this.network.on('click', (params) => {
      if (params.nodes.length > 0) {
        const clickedNodeId = params.nodes[0];
        this.selectedNodeId = clickedNodeId;
        if (this.onNodeSelect) {
          this.onNodeSelect(clickedNodeId);
        }
      }
    });

    // 7. Focus on center node if provided
    if (centerNodeId) {
      this.network.once('stabilizationFinished', () => {
        this.focusOnNode(centerNodeId);
      });
    }
  }

  /**
   * Smoothly zoom and center on a node ID.
   */
  focusOnNode(nodeId) {
    if (!this.network || !this.nodesDataSet.get(nodeId)) return;
    
    this.network.focus(nodeId, {
      scale: 1.1,
      animation: {
        duration: 800,
        easingFunction: 'easeOutQuint'
      }
    });

    // Select the node visually
    this.network.selectNodes([nodeId]);
    this.selectedNodeId = nodeId;
  }

  /**
   * Reset zoom and pan to fit all nodes.
   */
  fit() {
    if (!this.network) return;
    this.network.fit({
      animation: {
        duration: 600,
        easingFunction: 'easeInOutQuad'
      }
    });
  }

  /**
   * Manual zoom in controller.
   */
  zoomIn() {
    if (!this.network) return;
    const currentScale = this.network.getScale();
    this.network.moveTo({
      scale: currentScale * 1.3,
      animation: { duration: 250 }
    });
  }

  /**
   * Manual zoom out controller.
   */
  zoomOut() {
    if (!this.network) return;
    const currentScale = this.network.getScale();
    this.network.moveTo({
      scale: currentScale / 1.3,
      animation: { duration: 250 }
    });
  }
}
