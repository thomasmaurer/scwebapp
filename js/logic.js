/* =============================================
   Scoring & Logic Engine
   
   Computes weighted pillar scores from user
   answers, then determines recommendations.
   ============================================= */

const PILLARS = {
  SPC:  { key: "SPC",  name: "Sovereign Public Cloud",       color: "blue",   icon: "☁️" },
  SPrC: { key: "SPrC", name: "Sovereign Private Cloud",      color: "purple", icon: "🔒" },
  NPC:  { key: "NPC",  name: "National Partner Cloud",       color: "teal",   icon: "🏛️" },
  ALC:  { key: "ALC",  name: "Azure Local – Connected",      color: "green",  icon: "🔗" },
  ALD:  { key: "ALD",  name: "Azure Local – Disconnected",   color: "orange", icon: "🛡️" }
};

// Descriptions shown on the results page
const PILLAR_DESCRIPTIONS = {
  SPC: "Azure public cloud enhanced with sovereign controls — data residency guarantees, GDPR/FADP/FINMA/NIS2 alignment, Customer Managed Keys, confidential computing, and operational sovereignty features. Best for organizations that want the breadth of Azure services with strong sovereign guardrails.",
  SPrC: "A fully isolated, in-country cloud operated by a trusted national entity or government. Maximum physical and logical isolation for classified or highly sensitive workloads that cannot share infrastructure with any other tenant.",
  NPC: "Sovereign cloud operated by certified national partners — Bleu in France and Delos Cloud in Germany. These clouds run Azure technology under full national jurisdiction, operated exclusively by local entities with national security clearance. Available only to qualified public-sector customers and operators of essential services.",
  ALC: "Azure Local with cloud-connected management — Azure Arc integration, Policy, RBAC, Defender, Monitor, and GitOps governed from Azure. Run Azure-consistent workloads on your hardware with a cloud control plane.",
  ALD: "Azure Local for fully offline or intermittently connected environments. No dependency on the Azure control plane. Designed for high-security, isolated, classified, or edge scenarios requiring zero external connectivity."
};

// Key features per pillar (shown as bullet points)
const PILLAR_HIGHLIGHTS = {
  SPC: [
    "Full breadth of Azure PaaS/IaaS services",
    "Data residency with EU/Swiss Data Boundary",
    "Customer Managed Keys & Confidential Computing",
    "Elastic scaling with global capacity",
    "Microsoft-managed operations"
  ],
  SPrC: [
    "Physically isolated infrastructure",
    "Dedicated control plane — no shared tenancy",
    "Operated by national entity or government",
    "Supports classified & TOP SECRET workloads",
    "Full patch and update vetting"
  ],
  NPC: [
    "Bleu (France) & Delos Cloud (Germany)",
    "Operated by national entities under local jurisdiction only",
    "Exclusively for qualified public-sector customers",
    "In-country support with national security clearance",
    "Full regulatory alignment (GDPR, NIS2, national frameworks)"
  ],
  ALC: [
    "Azure Arc-managed on-premises infrastructure",
    "Azure Policy, RBAC, and GitOps from the cloud",
    "Microsoft Defender & Monitor on local hardware",
    "Azure-consistent VMs and AKS locally",
    "Cloud control plane with local compute"
  ],
  ALD: [
    "Fully air-gapped or intermittently connected",
    "Zero dependency on Azure control plane",
    "Self-contained local operations",
    "Suitable for classified and tactical workloads",
    "Edge and remote site deployments"
  ]
};

// Microsoft Learn & documentation links per pillar
const PILLAR_RESOURCES = {
  SPC: [
    { title: "Microsoft Cloud for Sovereignty Overview", url: "https://learn.microsoft.com/industry/sovereignty/cloud-for-sovereignty" },
    { title: "Azure sovereign controls & data residency", url: "https://learn.microsoft.com/industry/sovereignty/sovereignty-capabilities" },
    { title: "EU Data Boundary for the Microsoft Cloud", url: "https://learn.microsoft.com/privacy/eudb/eu-data-boundary-learn" },
    { title: "Azure Customer Managed Keys", url: "https://learn.microsoft.com/azure/security/fundamentals/encryption-models" },
    { title: "Azure Confidential Computing", url: "https://learn.microsoft.com/azure/confidential-computing/overview" },
    { title: "Azure compliance documentation", url: "https://learn.microsoft.com/azure/compliance/" },
    { title: "Microsoft Cloud for Sovereignty – Policy Portfolio", url: "https://learn.microsoft.com/industry/sovereignty/policy-portfolio-overview" }
  ],
  SPrC: [
    { title: "Microsoft Cloud for Sovereignty Overview", url: "https://learn.microsoft.com/industry/sovereignty/cloud-for-sovereignty" },
    { title: "Sovereign Landing Zone overview", url: "https://learn.microsoft.com/industry/sovereignty/slz-overview" },
    { title: "Azure Dedicated Host", url: "https://learn.microsoft.com/azure/virtual-machines/dedicated-hosts" },
    { title: "Azure confidential computing for isolation", url: "https://learn.microsoft.com/azure/confidential-computing/overview" },
    { title: "Azure Private Link", url: "https://learn.microsoft.com/azure/private-link/private-link-overview" },
    { title: "Key management in Azure", url: "https://learn.microsoft.com/azure/security/fundamentals/key-management" }
  ],
  NPC: [
    { title: "Microsoft Cloud for Sovereignty Overview", url: "https://learn.microsoft.com/industry/sovereignty/cloud-for-sovereignty" },
    { title: "Bleu — Sovereign Cloud for France", url: "https://bleu.cloud/" },
    { title: "Delos Cloud — Sovereign Cloud for Germany", url: "https://dfrnt.com/blog/delos-cloud/" },
    { title: "Azure compliance offerings by region", url: "https://learn.microsoft.com/azure/compliance/" },
    { title: "Microsoft GDPR commitments", url: "https://learn.microsoft.com/compliance/regulatory/gdpr" },
    { title: "Azure in government", url: "https://learn.microsoft.com/azure/azure-government/documentation-government-welcome" }
  ],
  ALC: [
    { title: "Azure Local overview", url: "https://learn.microsoft.com/azure/azure-local/overview" },
    { title: "Azure Arc overview", url: "https://learn.microsoft.com/azure/azure-arc/overview" },
    { title: "Azure Arc-enabled servers", url: "https://learn.microsoft.com/azure/azure-arc/servers/overview" },
    { title: "Azure Policy for Azure Arc", url: "https://learn.microsoft.com/azure/azure-arc/servers/policy-reference" },
    { title: "Deploy AKS on Azure Local", url: "https://learn.microsoft.com/azure/aks/hybrid/aks-overview" },
    { title: "Microsoft Defender for Cloud with Arc", url: "https://learn.microsoft.com/azure/defender-for-cloud/defender-for-cloud-introduction" },
    { title: "Azure Monitor for hybrid environments", url: "https://learn.microsoft.com/azure/azure-monitor/overview" }
  ],
  ALD: [
    { title: "Azure Local overview", url: "https://learn.microsoft.com/azure/azure-local/overview" },
    { title: "Azure Local disconnected operations", url: "https://learn.microsoft.com/azure/azure-local/manage/disconnected-operations-overview" },
    { title: "Azure Local network requirements", url: "https://learn.microsoft.com/azure/azure-local/concepts/firewall-requirements" },
    { title: "Azure Local security features", url: "https://learn.microsoft.com/azure/azure-local/concepts/security-features" },
    { title: "Plan Azure Local deployment", url: "https://learn.microsoft.com/azure/azure-local/deploy/deployment-planning" },
    { title: "Azure Arc overview", url: "https://learn.microsoft.com/azure/azure-arc/overview" }
  ]
};

// General sovereignty resources (always shown)
const GENERAL_RESOURCES = [
  { title: "Microsoft Trust Center", url: "https://www.microsoft.com/trust-center" },
  { title: "Microsoft Service Trust Portal", url: "https://servicetrust.microsoft.com/" },
  { title: "Azure compliance documentation", url: "https://learn.microsoft.com/azure/compliance/" },
  { title: "Microsoft Cloud for Sovereignty", url: "https://learn.microsoft.com/industry/sovereignty/cloud-for-sovereignty" },
  { title: "Azure security best practices", url: "https://learn.microsoft.com/azure/security/fundamentals/best-practices-and-patterns" },
  { title: "Contact Microsoft Sales", url: "https://azure.microsoft.com/contact/" }
];

/**
 * ScoringEngine — accumulates weighted scores per pillar
 * based on user answers (yes/no) and question weights.
 */
class ScoringEngine {
  constructor(statements) {
    this.statements = statements;
    this.answers = [];        // Array of { statementId, answer: 'yes'|'no' }
    this.scores = this._initScores();
    this.maxPossible = this._computeMaxPossible();
    // NPC qualification gates: both must be true for NPC to be recommended
    this.npcGates = { country: false, publicSector: false };
  }

  _initScores() {
    return { SPC: 0, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 };
  }

  /** Theoretical maximum if every statement answered 'yes' with max pillar contribution */
  _computeMaxPossible() {
    const max = this._initScores();
    for (const s of this.statements) {
      for (const pillar of Object.keys(max)) {
        const yesVal = (s.onYes[pillar] || 0) * s.weight;
        const noVal  = (s.onNo[pillar] || 0) * s.weight;
        max[pillar] += Math.max(yesVal, noVal);
      }
    }
    return max;
  }

  /** Record an answer and update scores */
  recordAnswer(statementId, answer) {
    const stmt = this.statements.find(s => s.id === statementId);
    if (!stmt) return;

    this.answers.push({ statementId, answer });

    const mapping = answer === 'yes' ? stmt.onYes : stmt.onNo;
    for (const pillar of Object.keys(this.scores)) {
      this.scores[pillar] += (mapping[pillar] || 0) * stmt.weight;
    }

    // Track NPC qualification gates
    if (stmt.npcGate && answer === 'yes') {
      this.npcGates[stmt.npcGate] = true;
    }
  }

  /** Undo the last answer */
  undoLast() {
    if (this.answers.length === 0) return null;

    const last = this.answers.pop();
    const stmt = this.statements.find(s => s.id === last.statementId);
    if (!stmt) return null;

    const mapping = last.answer === 'yes' ? stmt.onYes : stmt.onNo;
    for (const pillar of Object.keys(this.scores)) {
      this.scores[pillar] -= (mapping[pillar] || 0) * stmt.weight;
    }

    // Recompute NPC gate if undone statement was a gate
    if (stmt.npcGate && last.answer === 'yes') {
      this.npcGates[stmt.npcGate] = false;
    }

    return last;
  }

  /** Get normalized scores (0-100) */
  getNormalizedScores() {
    const normalized = {};
    for (const pillar of Object.keys(this.scores)) {
      const maxVal = this.maxPossible[pillar] || 1;
      normalized[pillar] = Math.round((this.scores[pillar] / maxVal) * 100);
    }
    return normalized;
  }

  /** Get raw scores */
  getRawScores() {
    return { ...this.scores };
  }

  /**
   * Generate final recommendations.
   * Returns an array sorted by score (descending), each with:
   *   { pillar, name, score, normalizedScore, recommended, description, highlights }
   */
  getRecommendations() {
    const normalized = this.getNormalizedScores();

    // Build pillar result objects for all five pillars
    const allResults = Object.keys(PILLARS).map(key => ({
      pillar: key,
      name: PILLARS[key].name,
      icon: PILLARS[key].icon,
      color: PILLARS[key].color,
      rawScore: this.scores[key],
      score: normalized[key],
      recommended: false,
      description: PILLAR_DESCRIPTIONS[key],
      highlights: PILLAR_HIGHLIGHTS[key],
      subPillars: []
    }));

    // Group ALC and ALD under Sovereign Private Cloud (SPrC)
    const sprc = allResults.find(r => r.pillar === 'SPrC');
    const alc  = allResults.find(r => r.pillar === 'ALC');
    const ald  = allResults.find(r => r.pillar === 'ALD');

    if (sprc) {
      if (alc) sprc.subPillars.push(alc);
      if (ald) sprc.subPillars.push(ald);

      // Parent score reflects the best alignment across SPrC, ALC, ALD
      sprc.score = Math.max(sprc.score, alc ? alc.score : 0, ald ? ald.score : 0);
    }

    // Top-level results: only SPC, SPrC, NPC
    const results = allResults.filter(r => r.pillar !== 'ALC' && r.pillar !== 'ALD');
    results.sort((a, b) => b.score - a.score);

    // Determine recommendations:
    // Primary: top scorer. Also recommend anything within 15 points of the top.
    const topScore = results[0].score;
    const threshold = 15;

    for (const r of results) {
      if (r.score >= topScore - threshold && r.score > 20) {
        r.recommended = true;
      }
    }

    // NPC qualification gate: only recommend if both gates are met
    const npcQualified = this.npcGates.country && this.npcGates.publicSector;
    const npc = results.find(r => r.pillar === 'NPC');
    if (npc) {
      if (!npcQualified && npc.recommended) {
        npc.recommended = false;
        npc.disqualified = true;
        npc.disqualifyReason = !this.npcGates.country && !this.npcGates.publicSector
          ? "National partner clouds (Bleu and Delos Cloud) are exclusively available to qualified public-sector customers in France and Germany."
          : !this.npcGates.country
            ? "National partner clouds are currently available only in France (Bleu) and Germany (Delos Cloud). Your organization is not based in an eligible country."
            : "National partner clouds (Bleu and Delos Cloud) are exclusively available to qualified public-sector entities. Your organization does not meet the public-sector eligibility criteria.";
      } else if (!npcQualified) {
        npc.disqualified = true;
        npc.disqualifyReason = "National partner clouds (Bleu and Delos Cloud) are available only to qualified public-sector customers in France and Germany.";
      }
    }

    // Mark sub-pillars as recommended if they meet the threshold
    if (sprc) {
      for (const sub of sprc.subPillars) {
        if (sub.score >= topScore - threshold && sub.score > 20) {
          sub.recommended = true;
          sprc.recommended = true;
        }
      }
      // Sort sub-pillars by score descending
      sprc.subPillars.sort((a, b) => b.score - a.score);
    }

    return results;
  }

  /** Detect if a hybrid combination should be recommended */
  getHybridRecommendation(results) {
    const rec = results.filter(r => r.recommended);
    const pillarKeys = rec.map(r => r.pillar);

    // Also collect recommended sub-pillar keys (ALC, ALD under SPrC)
    for (const r of rec) {
      if (r.subPillars) {
        for (const sub of r.subPillars) {
          if (sub.recommended) {
            pillarKeys.push(sub.pillar);
          }
        }
      }
    }

    const combos = [];

    // Azure Public + Azure Local Connected (classic hybrid)
    if (pillarKeys.includes('SPC') && pillarKeys.includes('ALC')) {
      combos.push({
        name: "Hybrid: Azure Public + Azure Local Connected",
        description: "Combine Azure's public cloud breadth with on-premises Azure Local infrastructure managed via Azure Arc. Ideal for organizations needing elastic cloud capacity alongside sovereign local compute."
      });
    }

    // Sovereign Private + Azure Local Disconnected (maximum isolation)
    if (pillarKeys.includes('SPrC') && pillarKeys.includes('ALD')) {
      combos.push({
        name: "Maximum Isolation: Private Cloud + Disconnected Local",
        description: "The highest isolation posture — fully isolated private cloud paired with air-gapped local operations. Designed for classified, defense, or critical infrastructure workloads."
      });
    }

    // National Partner + Azure Local Connected
    if (pillarKeys.includes('NPC') && pillarKeys.includes('ALC')) {
      combos.push({
        name: "National Sovereignty + Local Compute",
        description: "National partner-operated cloud with Azure Local on-premises nodes. Maintains full national jurisdiction while extending compute to your own facilities."
      });
    }

    // Azure Local Connected + Disconnected (mixed connectivity)
    if (pillarKeys.includes('ALC') && pillarKeys.includes('ALD')) {
      combos.push({
        name: "Mixed Connectivity: Connected + Disconnected Local",
        description: "Deploy Azure Local in both connected and disconnected modes across different sites — cloud-managed at headquarters, fully offline at remote or classified locations."
      });
    }

    return combos;
  }

  /** Apply geo-specific auto-scores (silent compliance adjustments) */
  applyGeoScores(geoKey) {
    const adjustments = GEO_AUTO_SCORES[geoKey];
    if (!adjustments) return;
    for (const pillar of Object.keys(this.scores)) {
      this.scores[pillar] += (adjustments[pillar] || 0);
    }
  }

  /** Update the active statement pool (recomputes max possible) */
  setActiveStatements(statements) {
    this.statements = statements;
    this.maxPossible = this._computeMaxPossible();
  }

  /** Reset all state */
  reset() {
    this.answers = [];
    this.scores = this._initScores();
    this.maxPossible = this._computeMaxPossible();
    this.npcGates = { country: false, publicSector: false };
  }
}

/**
 * FlowEngine — manages dynamic card flow based on geo and prior answers.
 * Determines which statements to show and in what order.
 */
class FlowEngine {
  constructor(statements) {
    this.allStatements = statements;
    this.geo = null;
    this.answeredIds = new Map();  // id → 'yes'|'no'
    this.history = [];             // ordered list of statement ids answered
  }

  /** Select a geo region — determines which statements are geo-eligible */
  selectGeo(geoKey) {
    this.geo = geoKey;
  }

  /** Check if a statement's conditions are met */
  _isEligible(stmt) {
    const req = stmt.requires;
    if (req) {
      // Geo requirement
      if (req.geo && !req.geo.includes(this.geo)) return false;
      // Must have answered yes to specific statements
      if (req.answeredYes) {
        for (const id of req.answeredYes) {
          if (this.answeredIds.get(id) !== 'yes') return false;
        }
      }
      // Must have answered no to specific statements
      if (req.answeredNo) {
        for (const id of req.answeredNo) {
          if (this.answeredIds.get(id) !== 'no') return false;
        }
      }
    }

    // SkippedBy: skip if a specific answer was given
    const skip = stmt.skippedBy;
    if (skip) {
      if (skip.answeredYes) {
        for (const id of skip.answeredYes) {
          if (this.answeredIds.get(id) === 'yes') return false;
        }
      }
      if (skip.answeredNo) {
        for (const id of skip.answeredNo) {
          if (this.answeredIds.get(id) === 'no') return false;
        }
      }
    }

    return true;
  }

  /** Get the next statement to show, or null if done */
  getNextStatement() {
    for (const stmt of this.allStatements) {
      if (this.answeredIds.has(stmt.id)) continue;
      if (this._isEligible(stmt)) return stmt;
    }
    return null;
  }

  /** Peek ahead to get upcoming statements (for card stack preview) */
  peekNext(count) {
    const upcoming = [];
    for (const stmt of this.allStatements) {
      if (upcoming.length >= count) break;
      if (this.answeredIds.has(stmt.id)) continue;
      if (this._isEligible(stmt)) upcoming.push(stmt);
    }
    return upcoming;
  }

  /** Record an answer */
  recordAnswer(id, answer) {
    this.answeredIds.set(id, answer);
    this.history.push(id);
  }

  /** Undo last answer. Returns the undone id or null. */
  undoLast() {
    if (this.history.length === 0) return null;
    const id = this.history.pop();
    this.answeredIds.delete(id);
    return id;
  }

  /** Get progress as { answered, estimated } */
  getProgress() {
    const answered = this.history.length;
    // Estimate remaining by checking eligible unanswered statements
    let remaining = 0;
    for (const stmt of this.allStatements) {
      if (this.answeredIds.has(stmt.id)) continue;
      if (this._isEligible(stmt)) remaining++;
    }
    return { answered, estimated: answered + remaining };
  }

  /** Get the list of active statements (for scoring engine pool) */
  getActiveStatements() {
    return this.allStatements.filter(s => {
      if (!s.requires || !s.requires.geo) return true;
      return s.requires.geo.includes(this.geo);
    });
  }

  /** Reset all state */
  reset() {
    this.geo = null;
    this.answeredIds = new Map();
    this.history = [];
  }
}
