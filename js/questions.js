/* =============================================
   Geo Options, Auto-Scores & Statement Pool

   GEO_OPTIONS     — selectable regions
   GEO_AUTO_SCORES — silent compliance adjustments
   STATEMENTS      — dynamic card pool with flow rules

   Pillars:
     SPC  = Public Cloud (with controls)
     SPrC = Private Cloud
     NPC  = National Partner Cloud
     ALC  = Azure Local – Connected
     ALD  = Azure Local – Disconnected
   ============================================= */

const GEO_OPTIONS = [
  { key: "EU",     label: "Europe (EU)",         icon: "🇪🇺" },
  { key: "USA",    label: "United States",       icon: "🇺🇸" },
  { key: "CA",     label: "Canada",              icon: "🇨🇦" },
  { key: "LATAM",  label: "Latin America",       icon: "🌎" },
  { key: "MEA",    label: "Middle East & Africa", icon: "🌍" },
  { key: "UK",     label: "United Kingdom",      icon: "🇬🇧" },
  { key: "CN",     label: "China",               icon: "🇨🇳" },
  { key: "APAC",   label: "Asia-Pacific",        icon: "🌏" }
];

/**
 * Silent score adjustments auto-applied when a geo is selected.
 * Reflects regional compliance (GDPR, NIS2, FADP, etc.) without cards.
 */
const GEO_AUTO_SCORES = {
  EU:    { SPC: 6, SPrC: 4, NPC: 4, ALC: 0, ALD: 0 },
  USA:   { SPC: 4, SPrC: 2, NPC: 0, ALC: 0, ALD: 0 },
  CA:    { SPC: 4, SPrC: 2, NPC: 0, ALC: 0, ALD: 0 },
  LATAM: { SPC: 3, SPrC: 1, NPC: 0, ALC: 0, ALD: 0 },
  MEA:   { SPC: 3, SPrC: 2, NPC: 0, ALC: 0, ALD: 0 },
  UK:    { SPC: 5, SPrC: 3, NPC: 0, ALC: 0, ALD: 0 },
  CN:    { SPC: 2, SPrC: 4, NPC: 0, ALC: 2, ALD: 2 },
  APAC:  { SPC: 3, SPrC: 2, NPC: 0, ALC: 0, ALD: 0 }
};

/**
 * Statements pool — concise, skimmable.
 *
 * Each entry:
 *   id, category, statement, context, weight, onYes, onNo
 *   requires? — { geo: [...] } and/or { answeredYes: [...] }
 *   skippedBy? — { answeredYes: [...] } or { answeredNo: [...] }
 *   npcGate?   — "country" | "publicSector"
 */
const STATEMENTS = [

  // ── Data & Residency ────────────────────────
  {
    id: 1,
    category: "Data Residency",
    statement: "All data must stay within national borders",
    context: "Including storage, processing, backups, and disaster recovery — no cross-border transfers.",
    weight: 3,
    onYes: { SPC: 2, SPrC: 3, NPC: 3, ALC: 1, ALD: 2 },
    onNo:  { SPC: 2, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 2,
    category: "Data Residency",
    statement: "Metadata and telemetry must also remain in-country",
    context: "Logs, support tickets, and operational metadata cannot leave national borders.",
    weight: 2,
    onYes: { SPC: 1, SPrC: 3, NPC: 3, ALC: 1, ALD: 2 },
    onNo:  { SPC: 2, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 },
    requires: { answeredYes: [1] }
  },
  {
    id: 3,
    category: "Data Residency",
    statement: "Multi-region replication is needed, but only within the country",
    context: "High availability across zones without ever crossing national boundaries.",
    weight: 2,
    onYes: { SPC: 2, SPrC: 2, NPC: 3, ALC: 0, ALD: 0 },
    onNo:  { SPC: 1, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 },
    requires: { answeredYes: [1] }
  },

  // ── Operational Control ─────────────────────
  {
    id: 4,
    category: "Operational Control",
    statement: "Cloud operations must be performed by national personnel only",
    context: "No foreign administrators, support engineers, or operators can access the environment.",
    weight: 3,
    onYes: { SPC: 0, SPrC: 3, NPC: 3, ALC: 0, ALD: 2 },
    onNo:  { SPC: 3, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 5,
    category: "Operational Control",
    statement: "We must vet and approve all software updates before deployment",
    context: "Full control over patches and updates for supply-chain security.",
    weight: 2,
    onYes: { SPC: 1, SPrC: 3, NPC: 2, ALC: 2, ALD: 3 },
    onNo:  { SPC: 2, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 6,
    category: "Operational Control",
    statement: "A dedicated, isolated control plane is required — no shared tenancy",
    context: "Your own management infrastructure, fully separated from other tenants.",
    weight: 3,
    onYes: { SPC: 0, SPrC: 3, NPC: 2, ALC: 2, ALD: 3 },
    onNo:  { SPC: 3, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },

  // ── Encryption & Key Management ─────────────
  {
    id: 7,
    category: "Encryption & Keys",
    statement: "We need full control over encryption keys (Customer Managed Keys)",
    context: "Your organization controls the keys, not the cloud provider.",
    weight: 2,
    onYes: { SPC: 3, SPrC: 2, NPC: 2, ALC: 1, ALD: 1 },
    onNo:  { SPC: 1, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 8,
    category: "Encryption & Keys",
    statement: "Encryption keys must never leave our physical premises (on-prem HSM)",
    context: "Hardware security modules hosted on-site — keys stay with you at all times.",
    weight: 3,
    onYes: { SPC: 2, SPrC: 3, NPC: 2, ALC: 2, ALD: 3 },
    onNo:  { SPC: 2, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 },
    requires: { answeredYes: [7] }
  },
  {
    id: 9,
    category: "Encryption & Keys",
    statement: "Confidential computing is required — data encrypted even while in use",
    context: "Hardware enclaves (AMD SEV-SNP, Intel SGX) protect data during processing.",
    weight: 2,
    onYes: { SPC: 3, SPrC: 2, NPC: 1, ALC: 1, ALD: 1 },
    onNo:  { SPC: 1, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },

  // ── Isolation & Network ─────────────────────
  {
    id: 10,
    category: "Isolation & Network",
    statement: "Our environment must be fully air-gapped — no internet connectivity",
    context: "Complete physical and logical isolation from the public internet.",
    weight: 3,
    onYes: { SPC: 0, SPrC: 3, NPC: 1, ALC: 0, ALD: 3 },
    onNo:  { SPC: 3, SPrC: 0, NPC: 0, ALC: 1, ALD: 0 }
  },
  {
    id: 11,
    category: "Isolation & Network",
    statement: "Dedicated physical infrastructure is required — no shared hardware",
    context: "Bare-metal isolation or dedicated hosts exclusively for your workloads.",
    weight: 2,
    onYes: { SPC: 1, SPrC: 3, NPC: 2, ALC: 2, ALD: 3 },
    onNo:  { SPC: 2, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 12,
    category: "Isolation & Network",
    statement: "All traffic must flow over private connections only — no public endpoints",
    context: "ExpressRoute, VPN, or equivalent private links for all communication.",
    weight: 2,
    onYes: { SPC: 2, SPrC: 3, NPC: 2, ALC: 2, ALD: 1 },
    onNo:  { SPC: 2, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 },
    skippedBy: { answeredYes: [10] }
  },

  // ── Workload Sensitivity ────────────────────
  {
    id: 13,
    category: "Workload Sensitivity",
    statement: "We run government or public-sector workloads with strict mandates",
    context: "E-government, citizen services, or public administration systems.",
    weight: 2,
    onYes: { SPC: 1, SPrC: 3, NPC: 3, ALC: 1, ALD: 2 },
    onNo:  { SPC: 2, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 14,
    category: "Workload Sensitivity",
    statement: "Our workloads are classified at SECRET or TOP SECRET level",
    context: "National security classifications requiring the highest isolation.",
    weight: 3,
    onYes: { SPC: 0, SPrC: 3, NPC: 1, ALC: 0, ALD: 3 },
    onNo:  { SPC: 2, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 15,
    category: "Workload Sensitivity",
    statement: "We operate critical national infrastructure (energy, telecom, transport)",
    context: "Systems whose failure could impact national security or public safety.",
    weight: 2,
    onYes: { SPC: 1, SPrC: 3, NPC: 2, ALC: 2, ALD: 2 },
    onNo:  { SPC: 2, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 16,
    category: "Workload Sensitivity",
    statement: "We process regulated financial services data",
    context: "Banking, trading, or insurance workloads under strict national regulation.",
    weight: 2,
    onYes: { SPC: 2, SPrC: 2, NPC: 3, ALC: 1, ALD: 1 },
    onNo:  { SPC: 1, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 17,
    category: "Workload Sensitivity",
    statement: "We handle healthcare data requiring strict data protection",
    context: "Patient records, medical imaging, or health informatics under regulation.",
    weight: 2,
    onYes: { SPC: 2, SPrC: 2, NPC: 3, ALC: 1, ALD: 1 },
    onNo:  { SPC: 1, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },

  // ── Hybrid & On-Premises ────────────────────
  {
    id: 18,
    category: "Hybrid & On-Premises",
    statement: "We need to run workloads on-premises with cloud management",
    context: "Local compute managed from the Azure portal — Arc, Policy, RBAC.",
    weight: 3,
    onYes: { SPC: 1, SPrC: 0, NPC: 0, ALC: 3, ALD: 0 },
    onNo:  { SPC: 1, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 19,
    category: "Hybrid & On-Premises",
    statement: "Edge computing is needed at locations with limited or no connectivity",
    context: "Remote sites, ships, field operations, or tactical environments.",
    weight: 3,
    onYes: { SPC: 0, SPrC: 0, NPC: 0, ALC: 1, ALD: 3 },
    onNo:  { SPC: 1, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 20,
    category: "Hybrid & On-Premises",
    statement: "Azure Arc integration for policy and monitoring is important",
    context: "Unified cloud management across on-premises, edge, and multi-cloud.",
    weight: 2,
    onYes: { SPC: 2, SPrC: 0, NPC: 0, ALC: 3, ALD: 0 },
    onNo:  { SPC: 1, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 },
    requires: { answeredYes: [18] }
  },
  {
    id: 21,
    category: "Hybrid & On-Premises",
    statement: "Local compute must work even if the cloud connection is severed",
    context: "Business continuity when connectivity to the cloud is interrupted.",
    weight: 3,
    onYes: { SPC: 0, SPrC: 1, NPC: 0, ALC: 2, ALD: 3 },
    onNo:  { SPC: 2, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 },
    requires: { answeredYes: [18] }
  },
  {
    id: 22,
    category: "Hybrid & On-Premises",
    statement: "Local operations must function with zero external network dependencies",
    context: "Fully self-contained — no reliance on any cloud control plane.",
    weight: 3,
    onYes: { SPC: 0, SPrC: 1, NPC: 0, ALC: 0, ALD: 3 },
    onNo:  { SPC: 1, SPrC: 0, NPC: 0, ALC: 2, ALD: 0 },
    requires: { answeredYes: [18] }
  },

  // ── National Partner Cloud (NPC) Gate ───────
  {
    id: 23,
    category: "National Partner Cloud",
    statement: "Our organization is based in France or Germany",
    context: "National partner clouds (Bleu and Delos Cloud) are available only in these countries.",
    weight: 0,
    onYes: { SPC: 0, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 },
    onNo:  { SPC: 1, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 },
    npcGate: "country",
    requires: { geo: ["EU"] }
  },
  {
    id: 24,
    category: "National Partner Cloud",
    statement: "We are a qualified public-sector entity (government, defense, or critical services)",
    context: "Bleu and Delos Cloud are exclusively for qualified public-sector organizations.",
    weight: 0,
    onYes: { SPC: 0, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 },
    onNo:  { SPC: 1, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 },
    npcGate: "publicSector",
    requires: { answeredYes: [23] }
  },
  {
    id: 25,
    category: "National Partner Cloud",
    statement: "A cloud operated by a certified national partner under local jurisdiction is preferred",
    context: "A national entity operates the cloud — no foreign government can compel data disclosure.",
    weight: 3,
    onYes: { SPC: 0, SPrC: 2, NPC: 3, ALC: 0, ALD: 0 },
    onNo:  { SPC: 3, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 },
    requires: { answeredYes: [23, 24] }
  },

  // ── Cloud Strategy ──────────────────────────
  {
    id: 26,
    category: "Cloud Strategy",
    statement: "Cloud-first with Azure as the primary platform",
    context: "Strategic commitment to Azure for innovation and digital transformation.",
    weight: 2,
    onYes: { SPC: 3, SPrC: 1, NPC: 1, ALC: 2, ALD: 0 },
    onNo:  { SPC: 0, SPrC: 1, NPC: 1, ALC: 0, ALD: 2 }
  },
  {
    id: 27,
    category: "Cloud Strategy",
    statement: "Access to the broadest set of cloud services (AI, Analytics, IoT) is important",
    context: "200+ services vs. a curated subset with tighter controls.",
    weight: 2,
    onYes: { SPC: 3, SPrC: 0, NPC: 1, ALC: 1, ALD: 0 },
    onNo:  { SPC: 0, SPrC: 2, NPC: 1, ALC: 0, ALD: 1 }
  },
  {
    id: 28,
    category: "Cloud Strategy",
    statement: "Elastic scaling with global capacity is needed",
    context: "Burst capacity, auto-scale, and consumption-based pricing.",
    weight: 2,
    onYes: { SPC: 3, SPrC: 0, NPC: 2, ALC: 0, ALD: 0 },
    onNo:  { SPC: 0, SPrC: 1, NPC: 0, ALC: 1, ALD: 1 }
  },
  {
    id: 29,
    category: "Cloud Strategy",
    statement: "Minimizing operational overhead matters more than maximum control",
    context: "Prefer Microsoft-managed operations over self-managed infrastructure.",
    weight: 2,
    onYes: { SPC: 3, SPrC: 0, NPC: 2, ALC: 0, ALD: 0 },
    onNo:  { SPC: 0, SPrC: 2, NPC: 0, ALC: 1, ALD: 2 }
  },
  {
    id: 30,
    category: "Cloud Strategy",
    statement: "A hybrid combination of public cloud and on-premises is anticipated",
    context: "Some workloads in the cloud, some on local infrastructure — managed together.",
    weight: 2,
    onYes: { SPC: 2, SPrC: 0, NPC: 1, ALC: 3, ALD: 1 },
    onNo:  { SPC: 1, SPrC: 1, NPC: 0, ALC: 0, ALD: 0 }
  },

  // ── Defense / Classified (conditional) ──────
  {
    id: 31,
    category: "Defense & Classified",
    statement: "Compliance with national defense or classified information standards is required",
    context: "Military, intelligence, or government secret classifications.",
    weight: 3,
    onYes: { SPC: 0, SPrC: 3, NPC: 1, ALC: 1, ALD: 3 },
    onNo:  { SPC: 2, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 },
    requires: { answeredYes: [13] }
  }
];
