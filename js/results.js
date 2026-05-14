/* =============================================
   Results Renderer
   
   Builds a comprehensive sovereignty report with
   pillar cards, Microsoft Learn links, hybrid
   combos, guided next steps, and downloadable
   summary.
   ============================================= */

class ResultsRenderer {
  /**
   * @param {HTMLElement} container - The #resultsContent element
   */
  constructor(container) {
    this.container = container;
  }

  /**
   * Render the full results report.
   * @param {Array} recommendations - From ScoringEngine.getRecommendations()
   * @param {Array} hybridCombos - From ScoringEngine.getHybridRecommendation()
   * @param {Function} onRestart - Callback for "Start Over" button
   * @param {number} [answeredCount]
   * @param {Object} [normalizedScores] - Map of pillar key → 0-100 score (all 5 pillars)
   */
  render(recommendations, hybridCombos, onRestart, answeredCount, normalizedScores) {
    this.container.innerHTML = '';
    this.answeredCount = answeredCount || 0;
    this.normalizedScores = normalizedScores || {};

    // Report header
    this._renderHeader();

    // Executive summary
    this._renderExecutiveSummary(recommendations, hybridCombos);

    // Radar (web) chart — visual centerpiece
    this._renderRadarChart(recommendations);

    // Hybrid combination banners
    for (const combo of hybridCombos) {
      this._renderComboBanner(combo);
    }

    // Pillar result cards with resource links
    for (const rec of recommendations) {
      const card = this._buildResultCard(rec);
      this.container.appendChild(card);
    }

    // Guided next steps with links
    this._renderNextSteps(recommendations);

    // General resources section
    this._renderGeneralResources();

    // Download report button
    this._renderDownloadButton(recommendations, hybridCombos);

    // Restart button
    const restartBtn = document.createElement('button');
    restartBtn.className = 'btn-restart';
    restartBtn.textContent = 'Start Over';
    restartBtn.addEventListener('click', onRestart);
    this.container.appendChild(restartBtn);

    // Trigger radar polygon draw-in animation after a frame
    requestAnimationFrame(() => {
      const polys = this.container.querySelectorAll('.radar-polygon');
      polys.forEach(p => p.classList.add('animate-in'));
    });
  }

  _renderHeader() {
    const header = document.createElement('div');
    header.className = 'results-header';
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    header.innerHTML = `
      <h2>Your Sovereignty Assessment Report</h2>
      <p>Based on ${this.answeredCount} responses — ${this._escapeHtml(date)}</p>
    `;
    this.container.appendChild(header);
  }

  _renderExecutiveSummary(recommendations, hybridCombos) {
    const recommended = recommendations.filter(r => r.recommended);
    const topPillar = recommendations[0];

    let summaryText = `Your responses indicate the strongest alignment with <strong>${this._escapeHtml(topPillar.name)}</strong> (${topPillar.score}% match).`;

    if (recommended.length > 1) {
      const others = recommended.slice(1).map(r => `<strong>${this._escapeHtml(r.name)}</strong>`);
      summaryText += ` Additionally, ${others.join(' and ')} ${others.length > 1 ? 'are' : 'is'} also recommended for your requirements.`;
    }

    if (hybridCombos.length > 0) {
      summaryText += ` A hybrid deployment strategy is suggested — see the combination recommendations below.`;
    }

    // Mention recommended sub-pillars (e.g. ALC/ALD under SPrC)
    const subRecs = [];
    for (const r of recommended) {
      if (r.subPillars) {
        for (const sub of r.subPillars) {
          if (sub.recommended) subRecs.push(sub);
        }
      }
    }
    if (subRecs.length > 0) {
      const subNames = subRecs.map(s => `<strong>${this._escapeHtml(s.name)}</strong>`);
      summaryText += ` Within Sovereign Private Cloud, ${subNames.join(' and ')} ${subRecs.length > 1 ? 'are' : 'is'} also relevant for your requirements.`;
    }

    const section = document.createElement('div');
    section.className = 'report-summary';
    section.innerHTML = `
      <h3>📋 Executive Summary</h3>
      <p>${summaryText}</p>
    `;
    this.container.appendChild(section);
  }

  /**
   * Render an SVG radar (web) chart with the 5 pillar scores plotted
   * across a regular pentagon. Recommended pillars get a highlighted vertex;
   * disqualified NPC gets a muted axis label.
   */
  _renderRadarChart(recommendations) {
    const order = ['SPC', 'SPrC', 'NPC', 'ALC', 'ALD'];
    const meta = {
      SPC:  { name: 'Sovereign Public',     icon: '☁️' },
      SPrC: { name: 'Sovereign Private',    icon: '🔒' },
      NPC:  { name: 'National Partner',     icon: '🏛️' },
      ALC:  { name: 'Azure Local · Conn.',  icon: '🔗' },
      ALD:  { name: 'Azure Local · Disc.',  icon: '🛡️' }
    };

    // Build a quick lookup of recommended pillar keys (top-level + sub-pillars)
    const recommendedKeys = new Set();
    let disqualifiedNpc = false;
    for (const r of recommendations) {
      if (r.recommended) recommendedKeys.add(r.pillar);
      if (r.pillar === 'NPC' && r.disqualified) disqualifiedNpc = true;
      if (r.subPillars) {
        for (const sub of r.subPillars) {
          if (sub.recommended) recommendedKeys.add(sub.pillar);
        }
      }
    }

    const size = 420;
    const cx = size / 2;
    const cy = size / 2 + 8; // slight downward offset to leave room for top label
    const radius = 140;
    const n = order.length;

    // Compute axis points at angle -90° + i * 72° (pentagon, top vertex up)
    const axisPoint = (i, factor) => {
      const angle = (-Math.PI / 2) + (i * 2 * Math.PI / n);
      return {
        x: cx + Math.cos(angle) * radius * factor,
        y: cy + Math.sin(angle) * radius * factor
      };
    };

    // Grid rings at 20/40/60/80/100
    const rings = [0.2, 0.4, 0.6, 0.8, 1.0].map(f => {
      const pts = order.map((_, i) => {
        const p = axisPoint(i, f);
        return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      }).join(' ');
      return `<polygon class="radar-grid" points="${pts}" />`;
    }).join('');

    // Axis lines (spokes)
    const spokes = order.map((_, i) => {
      const p = axisPoint(i, 1);
      return `<line class="radar-axis" x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" />`;
    }).join('');

    // Score polygon
    const scorePoints = order.map((key, i) => {
      const score = Math.max(0, Math.min(100, this.normalizedScores[key] || 0));
      const p = axisPoint(i, score / 100);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(' ');

    // Vertex dots (highlighted for recommended pillars)
    const vertices = order.map((key, i) => {
      const score = Math.max(0, Math.min(100, this.normalizedScores[key] || 0));
      const p = axisPoint(i, score / 100);
      const isRec = recommendedKeys.has(key);
      const cls = `radar-vertex${isRec ? ' recommended' : ''}`;
      const r = isRec ? 6 : 4;
      return `<circle class="${cls}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r}" />`;
    }).join('');

    // Axis labels (positioned slightly past the outer ring)
    const labels = order.map((key, i) => {
      const p = axisPoint(i, 1.18);
      const m = meta[key];
      const score = Math.round(this.normalizedScores[key] || 0);
      const muted = (key === 'NPC' && disqualifiedNpc);
      const isRec = recommendedKeys.has(key);
      const cls = `radar-axis-label${isRec ? ' recommended' : ''}${muted ? ' muted' : ''}`;
      // Anchor based on position around the pentagon
      let anchor = 'middle';
      if (p.x > cx + 10) anchor = 'start';
      else if (p.x < cx - 10) anchor = 'end';
      const star = isRec ? ' ★' : '';
      const warn = muted ? ' ⚠' : '';
      return `
        <g class="${cls}" text-anchor="${anchor}">
          <text x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}" class="radar-label-name">${this._escapeHtml(m.icon)} ${this._escapeHtml(m.name)}${star}${warn}</text>
          <text x="${p.x.toFixed(1)}" y="${(p.y + 16).toFixed(1)}" class="radar-label-score">${score}%</text>
        </g>
      `;
    }).join('');

    // Legend rows
    const legendRows = order.map(key => {
      const m = meta[key];
      const score = Math.round(this.normalizedScores[key] || 0);
      const isRec = recommendedKeys.has(key);
      const muted = (key === 'NPC' && disqualifiedNpc);
      return `
        <li class="radar-legend-item${isRec ? ' recommended' : ''}${muted ? ' muted' : ''}">
          <span class="radar-legend-icon">${m.icon}</span>
          <span class="radar-legend-name">${this._escapeHtml(m.name)}</span>
          <span class="radar-legend-score">${score}%</span>
          ${isRec ? '<span class="radar-legend-star">★</span>' : ''}
          ${muted ? '<span class="radar-legend-warn">⚠</span>' : ''}
        </li>
      `;
    }).join('');

    const section = document.createElement('div');
    section.className = 'radar-chart-section';
    section.innerHTML = `
      <h3>📊 Pillar Alignment Overview</h3>
      <div class="radar-chart-wrap">
        <svg class="radar-chart" viewBox="0 0 ${size} ${size + 32}" role="img" aria-label="Radar chart of pillar alignment scores">
          <defs>
            <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#50e6ff" stop-opacity="0.55"/>
              <stop offset="100%" stop-color="#5c2d91" stop-opacity="0.45"/>
            </linearGradient>
            <linearGradient id="radarStroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#0078d4"/>
              <stop offset="100%" stop-color="#5c2d91"/>
            </linearGradient>
          </defs>
          <g class="radar-grid-group">${rings}</g>
          <g class="radar-axis-group">${spokes}</g>
          <polygon class="radar-polygon" points="${scorePoints}" fill="url(#radarFill)" stroke="url(#radarStroke)" />
          <g class="radar-vertex-group">${vertices}</g>
          <g class="radar-axis-labels">${labels}</g>
        </svg>
      </div>
      <ul class="radar-legend">${legendRows}</ul>
    `;
    this.container.appendChild(section);
  }

  _renderComboBanner(combo) {
    const banner = document.createElement('div');
    banner.className = 'combo-banner';
    banner.innerHTML = `
      <h3>💡 ${this._escapeHtml(combo.name)}</h3>
      <p>${this._escapeHtml(combo.description)}</p>
    `;
    this.container.appendChild(banner);
  }

  _buildResultCard(rec) {
    const card = document.createElement('div');
    card.className = `result-card${rec.recommended ? ' recommended' : ''}${rec.disqualified ? ' disqualified' : ''}`;

    const badgeText = rec.recommended ? '★ Recommended' : rec.disqualified ? '⚠ Not Eligible' : 'Also Evaluated';
    const resources = PILLAR_RESOURCES[rec.pillar] || [];

    // Build disqualification notice
    let disqualifyHtml = '';
    if (rec.disqualified && rec.disqualifyReason) {
      disqualifyHtml = `
        <div class="disqualify-notice">
          <span class="disqualify-icon">⚠</span>
          <p>${this._escapeHtml(rec.disqualifyReason)}</p>
        </div>
      `;
    }

    // Build resource links for recommended pillars
    let resourcesHtml = '';
    if (rec.recommended && resources.length > 0) {
      const links = resources.map(r =>
        `<li><a href="${this._escapeAttr(r.url)}" target="_blank" rel="noopener noreferrer">${this._escapeHtml(r.title)} ↗</a></li>`
      ).join('');
      resourcesHtml = `
        <div class="card-resources">
          <h4>📚 Learn More on Microsoft Docs</h4>
          <ul>${links}</ul>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="result-card-header">
        <div class="result-card-title">${rec.icon} ${this._escapeHtml(rec.name)}</div>
        <span class="result-badge">${badgeText}</span>
      </div>
      ${disqualifyHtml}
      <div class="result-score-label">
        <span>Alignment Score</span>
        <span class="result-score-value ${rec.color}">${rec.score}%</span>
      </div>
      <p class="result-description">${this._escapeHtml(rec.description)}</p>
      <ul class="result-highlights">
        ${rec.highlights.map(h => `<li>${this._escapeHtml(h)}</li>`).join('')}
      </ul>
      ${resourcesHtml}
    `;

    // Render sub-pillars (e.g. ALC/ALD under SPrC)
    if (rec.subPillars && rec.subPillars.length > 0) {
      const subSection = document.createElement('div');
      subSection.className = 'sub-pillars-section';
      subSection.innerHTML = `<h4 class="sub-pillars-heading">📦 Deployment Options</h4>`;

      for (const sub of rec.subPillars) {
        const subResources = PILLAR_RESOURCES[sub.pillar] || [];
        let subResourcesHtml = '';
        if (sub.recommended && subResources.length > 0) {
          const links = subResources.map(r =>
            `<li><a href="${this._escapeAttr(r.url)}" target="_blank" rel="noopener noreferrer">${this._escapeHtml(r.title)} ↗</a></li>`
          ).join('');
          subResourcesHtml = `
            <div class="card-resources">
              <h4>📚 Learn More</h4>
              <ul>${links}</ul>
            </div>
          `;
        }

        const subCard = document.createElement('div');
        subCard.className = `sub-pillar-card${sub.recommended ? ' recommended' : ''}`;
        subCard.innerHTML = `
          <div class="sub-pillar-header">
            <span class="sub-pillar-title">${sub.icon} ${this._escapeHtml(sub.name)}</span>
            ${sub.recommended ? '<span class="result-badge sub-badge">★ Recommended</span>' : ''}
          </div>
          <div class="result-score-label">
            <span>Alignment Score</span>
            <span class="result-score-value ${sub.color}">${sub.score}%</span>
          </div>
          <p class="result-description">${this._escapeHtml(sub.description)}</p>
          <ul class="result-highlights">
            ${sub.highlights.map(h => `<li>${this._escapeHtml(h)}</li>`).join('')}
          </ul>
          ${subResourcesHtml}
        `;
        subSection.appendChild(subCard);
      }

      card.appendChild(subSection);
    }

    return card;
  }

  _renderNextSteps(recommendations) {
    const recommended = recommendations.filter(r => r.recommended);
    const recKeys = [];
    for (const r of recommended) {
      recKeys.push(r.pillar);
      if (r.subPillars) {
        for (const sub of r.subPillars) {
          if (sub.recommended) recKeys.push(sub.pillar);
        }
      }
    }

    const steps = [
      { text: "Review the Microsoft Cloud for Sovereignty documentation", url: "https://learn.microsoft.com/industry/sovereignty/cloud-for-sovereignty", always: true },
      { text: "Explore the Sovereign Landing Zone architecture", url: "https://learn.microsoft.com/industry/sovereignty/slz-overview", condition: recKeys.includes('SPC') || recKeys.includes('SPrC') },
      { text: "Review Azure data residency and EU Data Boundary", url: "https://learn.microsoft.com/privacy/eudb/eu-data-boundary-learn", condition: recKeys.includes('SPC') || recKeys.includes('NPC') },
      { text: "Learn about Azure confidential computing options", url: "https://learn.microsoft.com/azure/confidential-computing/overview", condition: recKeys.includes('SPC') || recKeys.includes('SPrC') },
      { text: "Explore Customer Managed Keys and encryption models", url: "https://learn.microsoft.com/azure/security/fundamentals/encryption-models", condition: recKeys.includes('SPC') || recKeys.includes('SPrC') },
      { text: "Explore Azure Local deployment planning", url: "https://learn.microsoft.com/azure/azure-local/deploy/deployment-planning", condition: recKeys.includes('ALC') || recKeys.includes('ALD') },
      { text: "Plan Azure Arc onboarding for hybrid management", url: "https://learn.microsoft.com/azure/azure-arc/servers/plan-at-scale-deployment", condition: recKeys.includes('ALC') },
      { text: "Review disconnected operations for Azure Local", url: "https://learn.microsoft.com/azure/azure-local/manage/disconnected-operations-overview", condition: recKeys.includes('ALD') },
      { text: "Find a certified Microsoft cloud partner in your country", url: "https://partner.microsoft.com/partnership/find-a-partner", condition: recKeys.includes('NPC') },
      { text: "Review Azure compliance offerings for your region", url: "https://learn.microsoft.com/azure/compliance/", always: true },
      { text: "Check the Microsoft Service Trust Portal for audit reports", url: "https://servicetrust.microsoft.com/", always: true },
      { text: "Contact Microsoft Sales to discuss your sovereignty needs", url: "https://azure.microsoft.com/contact/", always: true }
    ];

    const activeSteps = steps.filter(s => s.always || s.condition);

    const section = document.createElement('div');
    section.className = 'next-steps';
    section.innerHTML = `
      <h3>🗺️ Recommended Next Steps</h3>
      <ul>
        ${activeSteps.map(s =>
          `<li><a href="${this._escapeAttr(s.url)}" target="_blank" rel="noopener noreferrer">${this._escapeHtml(s.text)} ↗</a></li>`
        ).join('')}
      </ul>
    `;
    this.container.appendChild(section);
  }

  _renderGeneralResources() {
    const section = document.createElement('div');
    section.className = 'general-resources';
    section.innerHTML = `
      <h3>🔗 General Resources</h3>
      <div class="resource-grid">
        ${GENERAL_RESOURCES.map(r => `
          <a href="${this._escapeAttr(r.url)}" target="_blank" rel="noopener noreferrer" class="resource-link-card">
            <span class="resource-link-title">${this._escapeHtml(r.title)}</span>
            <span class="resource-link-arrow">↗</span>
          </a>
        `).join('')}
      </div>
    `;
    this.container.appendChild(section);
  }

  _renderDownloadButton(recommendations, hybridCombos) {
    const btn = document.createElement('button');
    btn.className = 'btn-download';
    btn.textContent = '📄 Download Report';
    btn.addEventListener('click', () => this._downloadReport(recommendations, hybridCombos));
    this.container.appendChild(btn);
  }

  /** Generate and download a text report */
  _downloadReport(recommendations, hybridCombos) {
    const recommended = recommendations.filter(r => r.recommended);
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    let report = '';
    report += '════════════════════════════════════════════════════════════\n';
    report += '  MICROSOFT SOVEREIGN CLOUD EXPLORER — ASSESSMENT REPORT\n';
    report += '════════════════════════════════════════════════════════════\n';
    report += `  Generated: ${date}\n`;
    report += `  Questions Answered: ${this.answeredCount}\n\n`;

    report += '── EXECUTIVE SUMMARY ───────────────────────────────────────\n\n';
    report += `  Primary recommendation: ${recommendations[0].name} (${recommendations[0].score}% alignment)\n\n`;
    if (recommended.length > 1) {
      report += '  Also recommended:\n';
      recommended.slice(1).forEach(r => {
        report += `    • ${r.name} (${r.score}% alignment)\n`;
      });
      report += '\n';
    }

    if (hybridCombos.length > 0) {
      report += '── HYBRID DEPLOYMENT RECOMMENDATIONS ──────────────────────\n\n';
      hybridCombos.forEach(c => {
        report += `  ★ ${c.name}\n    ${c.description}\n\n`;
      });
    }

    report += '── DETAILED SCORES ────────────────────────────────────────\n\n';
    recommendations.forEach(r => {
      const filled = Math.round(r.score / 5);
      const bar = '█'.repeat(filled) + '░'.repeat(20 - filled);
      report += `  ${r.name}\n`;
      report += `  Score: ${r.score}%  [${bar}]  ${r.recommended ? '★ RECOMMENDED' : r.disqualified ? '⚠ NOT ELIGIBLE' : ''}\n`;
      if (r.disqualified && r.disqualifyReason) {
        report += `  ⚠ ${r.disqualifyReason}\n`;
      }
      report += `  ${r.description}\n\n`;
      report += '  Key features:\n';
      r.highlights.forEach(h => {
        report += `    ✓ ${h}\n`;
      });
      report += '\n';

      const resources = PILLAR_RESOURCES[r.pillar] || [];
      if (r.recommended && resources.length > 0) {
        report += '  Documentation & resources:\n';
        resources.forEach(res => {
          report += `    → ${res.title}\n      ${res.url}\n`;
        });
        report += '\n';
      }

      // Include sub-pillars (e.g. ALC/ALD under SPrC)
      if (r.subPillars && r.subPillars.length > 0) {
        report += '  ── Deployment Options ────────────────────────────────\n\n';
        r.subPillars.forEach(sub => {
          const subFilled = Math.round(sub.score / 5);
          const subBar = '█'.repeat(subFilled) + '░'.repeat(20 - subFilled);
          report += `    ${sub.name}\n`;
          report += `    Score: ${sub.score}%  [${subBar}]  ${sub.recommended ? '★ RECOMMENDED' : ''}\n`;
          report += `    ${sub.description}\n\n`;
          report += '    Key features:\n';
          sub.highlights.forEach(h => {
            report += `      ✓ ${h}\n`;
          });
          report += '\n';

          const subResources = PILLAR_RESOURCES[sub.pillar] || [];
          if (sub.recommended && subResources.length > 0) {
            report += '    Documentation & resources:\n';
            subResources.forEach(res => {
              report += `      → ${res.title}\n        ${res.url}\n`;
            });
            report += '\n';
          }
        });
      }
    });

    report += '── GENERAL RESOURCES ──────────────────────────────────────\n\n';
    GENERAL_RESOURCES.forEach(r => {
      report += `  → ${r.title}\n    ${r.url}\n\n`;
    });

    report += '════════════════════════════════════════════════════════════\n';
    report += '  Generated by Microsoft Sovereign Cloud Explorer\n';
    report += '  This is an indicative assessment — consult your Microsoft\n';
    report += '  account team for a detailed sovereignty workshop.\n';
    report += '════════════════════════════════════════════════════════════\n';

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sovereignty-assessment-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /** Escape HTML entities to prevent XSS */
  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /** Escape a value for use in an HTML attribute */
  _escapeAttr(text) {
    return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
