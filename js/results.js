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
   */
  render(recommendations, hybridCombos, onRestart) {
    this.container.innerHTML = '';

    // Report header
    this._renderHeader();

    // Executive summary
    this._renderExecutiveSummary(recommendations, hybridCombos);

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

    // Trigger score bar animations after a frame
    requestAnimationFrame(() => {
      const fills = this.container.querySelectorAll('.result-score-fill');
      fills.forEach(fill => {
        fill.style.width = fill.dataset.width;
      });
    });
  }

  _renderHeader() {
    const header = document.createElement('div');
    header.className = 'results-header';
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    header.innerHTML = `
      <h2>Your Sovereignty Assessment Report</h2>
      <p>Based on ${QUESTIONS.length} responses — ${this._escapeHtml(date)}</p>
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
    card.className = `result-card${rec.recommended ? ' recommended' : ''}`;

    const badgeText = rec.recommended ? '★ Recommended' : 'Also Evaluated';
    const resources = PILLAR_RESOURCES[rec.pillar] || [];

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
      <div class="result-score-label">
        <span>Alignment Score</span>
        <span>${rec.score}%</span>
      </div>
      <div class="result-score-bar">
        <div class="result-score-fill ${rec.color}" data-width="${rec.score}%" style="width: 0%"></div>
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
            <span>${sub.score}%</span>
          </div>
          <div class="result-score-bar">
            <div class="result-score-fill ${sub.color}" data-width="${sub.score}%" style="width: 0%"></div>
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
    report += `  Questions Answered: ${QUESTIONS.length}\n\n`;

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
      report += `  Score: ${r.score}%  [${bar}]  ${r.recommended ? '★ RECOMMENDED' : ''}\n`;
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
