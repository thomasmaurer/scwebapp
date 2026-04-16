/* =============================================
   Sovereignty Question Set
   Each question targets one or more pillars via
   the scoring weights in logic.js.
   
   Pillars:
     SPC  = Sovereign Public Cloud
     SPrC = Sovereign Private Cloud
     NPC  = National Partner Cloud
     ALC  = Azure Local – Connected
     ALD  = Azure Local – Disconnected
   ============================================= */

const QUESTIONS = [
  // ── Data Residency ──────────────────────────
  {
    id: 1,
    category: "Data Residency",
    text: "Must all customer data remain within a specific country's borders at all times?",
    context: "Including storage, processing, backups, and disaster recovery.",
    weight: 3,
    onYes: { SPC: 2, SPrC: 3, NPC: 3, ALC: 1, ALD: 2 },
    onNo:  { SPC: 2, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 2,
    category: "Data Residency",
    text: "Do you require metadata (telemetry, logs, support data) to also stay in-country?",
    context: "Some sovereign regulations extend beyond primary data to include operational metadata.",
    weight: 2,
    onYes: { SPC: 1, SPrC: 3, NPC: 3, ALC: 1, ALD: 2 },
    onNo:  { SPC: 2, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 3,
    category: "Data Residency",
    text: "Is multi-region replication required, but only within national boundaries?",
    context: "High-availability across zones while never crossing borders.",
    weight: 2,
    onYes: { SPC: 2, SPrC: 2, NPC: 3, ALC: 0, ALD: 0 },
    onNo:  { SPC: 1, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },

  // ── Regulatory Requirements ─────────────────
  {
    id: 4,
    category: "Regulatory Compliance",
    text: "Are you subject to GDPR with strict data localization obligations?",
    context: "General Data Protection Regulation – EU data protection framework.",
    weight: 2,
    onYes: { SPC: 3, SPrC: 2, NPC: 2, ALC: 0, ALD: 0 },
    onNo:  { SPC: 1, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 5,
    category: "Regulatory Compliance",
    text: "Must you comply with Swiss FADP/FINMA requirements?",
    context: "Swiss Federal Act on Data Protection and financial regulatory mandates.",
    weight: 2,
    onYes: { SPC: 2, SPrC: 2, NPC: 3, ALC: 0, ALD: 0 },
    onNo:  { SPC: 1, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 6,
    category: "Regulatory Compliance",
    text: "Does your organization fall under NIS2 critical infrastructure requirements?",
    context: "EU directive for network and information systems security of essential services.",
    weight: 2,
    onYes: { SPC: 2, SPrC: 3, NPC: 2, ALC: 1, ALD: 1 },
    onNo:  { SPC: 1, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 7,
    category: "Regulatory Compliance",
    text: "Do you require compliance with national defense or classified information standards?",
    context: "Military, intelligence, or government secret classifications.",
    weight: 3,
    onYes: { SPC: 0, SPrC: 3, NPC: 1, ALC: 1, ALD: 3 },
    onNo:  { SPC: 2, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },

  // ── Operational Sovereignty ─────────────────
  {
    id: 8,
    category: "Operational Sovereignty",
    text: "Must cloud operations (admin, support, engineering) be performed exclusively by nationals?",
    context: "No foreign personnel can access or manage the environment.",
    weight: 3,
    onYes: { SPC: 0, SPrC: 3, NPC: 3, ALC: 0, ALD: 2 },
    onNo:  { SPC: 3, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 9,
    category: "Operational Sovereignty",
    text: "Do you need to control or approve all software updates and patches before deployment?",
    context: "Vetting updates for sovereignty or supply-chain security.",
    weight: 2,
    onYes: { SPC: 1, SPrC: 3, NPC: 2, ALC: 2, ALD: 3 },
    onNo:  { SPC: 2, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 10,
    category: "Operational Sovereignty",
    text: "Do you require a dedicated, isolated control plane not shared with other tenants?",
    context: "Your own management infrastructure separate from the public cloud.",
    weight: 3,
    onYes: { SPC: 0, SPrC: 3, NPC: 2, ALC: 2, ALD: 3 },
    onNo:  { SPC: 3, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },

  // ── Encryption & Key Management ─────────────
  {
    id: 11,
    category: "Encryption & Key Management",
    text: "Do you require Customer Managed Keys (CMK) for all data-at-rest encryption?",
    context: "You control the encryption keys rather than Microsoft.",
    weight: 2,
    onYes: { SPC: 3, SPrC: 2, NPC: 2, ALC: 1, ALD: 1 },
    onNo:  { SPC: 1, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 12,
    category: "Encryption & Key Management",
    text: "Do you need Hold Your Own Key (HYOK) with on-premises HSM integration?",
    context: "Cryptographic keys never leave your physical premises.",
    weight: 3,
    onYes: { SPC: 2, SPrC: 3, NPC: 2, ALC: 2, ALD: 3 },
    onNo:  { SPC: 2, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 13,
    category: "Encryption & Key Management",
    text: "Is confidential computing (encrypted in-use data via hardware enclaves) a requirement?",
    context: "AMD SEV-SNP, Intel SGX, or similar TEE technologies.",
    weight: 2,
    onYes: { SPC: 3, SPrC: 2, NPC: 1, ALC: 1, ALD: 1 },
    onNo:  { SPC: 1, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },

  // ── Isolation & Network Controls ────────────
  {
    id: 14,
    category: "Isolation & Network",
    text: "Do you need a fully air-gapped network with no internet connectivity?",
    context: "Complete physical and logical isolation from the public internet.",
    weight: 3,
    onYes: { SPC: 0, SPrC: 3, NPC: 1, ALC: 0, ALD: 3 },
    onNo:  { SPC: 3, SPrC: 0, NPC: 0, ALC: 1, ALD: 0 }
  },
  {
    id: 15,
    category: "Isolation & Network",
    text: "Is dedicated physical infrastructure (not shared hardware) required?",
    context: "Bare-metal isolation or dedicated hosts for your workloads.",
    weight: 2,
    onYes: { SPC: 1, SPrC: 3, NPC: 2, ALC: 2, ALD: 3 },
    onNo:  { SPC: 2, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 16,
    category: "Isolation & Network",
    text: "Do you require a private connection (ExpressRoute/VPN) with no public endpoints?",
    context: "All traffic flows over private network links only.",
    weight: 2,
    onYes: { SPC: 2, SPrC: 3, NPC: 2, ALC: 2, ALD: 1 },
    onNo:  { SPC: 2, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },

  // ── Workload Sensitivity ────────────────────
  {
    id: 17,
    category: "Workload Sensitivity",
    text: "Will you run government or public-sector workloads with sovereignty mandates?",
    context: "E-government, citizen services, or public administration systems.",
    weight: 2,
    onYes: { SPC: 1, SPrC: 3, NPC: 3, ALC: 1, ALD: 2 },
    onNo:  { SPC: 2, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 18,
    category: "Workload Sensitivity",
    text: "Do you handle healthcare data requiring sovereign-level data protection?",
    context: "Patient records, medical imaging, health informatics under strict regulation.",
    weight: 2,
    onYes: { SPC: 2, SPrC: 2, NPC: 3, ALC: 1, ALD: 1 },
    onNo:  { SPC: 1, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 19,
    category: "Workload Sensitivity",
    text: "Are your workloads classified at a SECRET or TOP SECRET level?",
    context: "National security classifications requiring highest isolation.",
    weight: 3,
    onYes: { SPC: 0, SPrC: 3, NPC: 1, ALC: 0, ALD: 3 },
    onNo:  { SPC: 2, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 20,
    category: "Workload Sensitivity",
    text: "Do you operate critical national infrastructure (energy, telecom, transport)?",
    context: "Systems whose failure could impact national security or public safety.",
    weight: 2,
    onYes: { SPC: 1, SPrC: 3, NPC: 2, ALC: 2, ALD: 2 },
    onNo:  { SPC: 2, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 21,
    category: "Workload Sensitivity",
    text: "Do you process financial services data under strict national banking regulation?",
    context: "Trading platforms, banking cores, or insurance systems with local mandates.",
    weight: 2,
    onYes: { SPC: 2, SPrC: 2, NPC: 3, ALC: 1, ALD: 1 },
    onNo:  { SPC: 1, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },

  // ── Hybrid & Edge Requirements ──────────────
  {
    id: 22,
    category: "Hybrid & Edge",
    text: "Do you need to run workloads on-premises with Azure cloud management?",
    context: "Local compute managed from the Azure portal with Arc, Policy, and RBAC.",
    weight: 3,
    onYes: { SPC: 1, SPrC: 0, NPC: 0, ALC: 3, ALD: 0 },
    onNo:  { SPC: 1, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 23,
    category: "Hybrid & Edge",
    text: "Do you require edge computing at locations with limited or no internet connectivity?",
    context: "Remote sites, ships, field operations, or tactical environments.",
    weight: 3,
    onYes: { SPC: 0, SPrC: 0, NPC: 0, ALC: 1, ALD: 3 },
    onNo:  { SPC: 1, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 24,
    category: "Hybrid & Edge",
    text: "Is Azure Arc integration for policy, GitOps, and monitoring important to you?",
    context: "Unified cloud management across on-premises, edge, and multi-cloud.",
    weight: 2,
    onYes: { SPC: 2, SPrC: 0, NPC: 0, ALC: 3, ALD: 0 },
    onNo:  { SPC: 1, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 25,
    category: "Hybrid & Edge",
    text: "Do you need local compute that can operate even if the cloud connection is severed?",
    context: "Business continuity when connectivity to Azure is interrupted.",
    weight: 3,
    onYes: { SPC: 0, SPrC: 1, NPC: 0, ALC: 2, ALD: 3 },
    onNo:  { SPC: 2, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 26,
    category: "Hybrid & Edge",
    text: "Do you want Microsoft Defender, Monitor, and Update Manager on local infrastructure?",
    context: "Cloud-grade security and observability for on-premises systems.",
    weight: 2,
    onYes: { SPC: 1, SPrC: 0, NPC: 0, ALC: 3, ALD: 0 },
    onNo:  { SPC: 0, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },

  // ── Azure Local Specifics ──────────────────
  {
    id: 27,
    category: "Azure Local Operations",
    text: "Do you need Azure-consistent VM and container orchestration running locally?",
    context: "Run AKS, Azure VMs, and Azure services on your own hardware.",
    weight: 2,
    onYes: { SPC: 1, SPrC: 0, NPC: 0, ALC: 3, ALD: 2 },
    onNo:  { SPC: 1, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 28,
    category: "Azure Local Operations",
    text: "Must local operations function with zero external network dependencies?",
    context: "No reliance on any Azure control plane — fully self-contained.",
    weight: 3,
    onYes: { SPC: 0, SPrC: 1, NPC: 0, ALC: 0, ALD: 3 },
    onNo:  { SPC: 1, SPrC: 0, NPC: 0, ALC: 2, ALD: 0 }
  },
  {
    id: 29,
    category: "Azure Local Operations",
    text: "Do you need intermittent connectivity — mostly offline with periodic sync?",
    context: "Occasional connection to Azure for updates and telemetry uploads.",
    weight: 2,
    onYes: { SPC: 0, SPrC: 1, NPC: 0, ALC: 1, ALD: 3 },
    onNo:  { SPC: 1, SPrC: 0, NPC: 0, ALC: 1, ALD: 0 }
  },
  {
    id: 30,
    category: "Azure Local Operations",
    text: "Would you like Azure RBAC and Policy to govern your local infrastructure?",
    context: "Centralized identity and governance extending to on-premises.",
    weight: 2,
    onYes: { SPC: 1, SPrC: 0, NPC: 0, ALC: 3, ALD: 0 },
    onNo:  { SPC: 0, SPrC: 0, NPC: 0, ALC: 0, ALD: 1 }
  },

  // ── National Partner Cloud ─────────────────
  {
    id: 31,
    category: "National Partner Cloud",
    text: "Do you prefer a cloud operated by a certified national partner in your country?",
    context: "Local company operating Azure infrastructure under national oversight.",
    weight: 3,
    onYes: { SPC: 0, SPrC: 1, NPC: 3, ALC: 0, ALD: 0 },
    onNo:  { SPC: 2, SPrC: 1, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 32,
    category: "National Partner Cloud",
    text: "Is local-language support and in-country technical assistance a priority?",
    context: "Native-language help desk, documentation, and professional services.",
    weight: 1,
    onYes: { SPC: 1, SPrC: 1, NPC: 3, ALC: 0, ALD: 0 },
    onNo:  { SPC: 1, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },
  {
    id: 33,
    category: "National Partner Cloud",
    text: "Must the cloud provider be subject to only your country's legal jurisdiction?",
    context: "No foreign government can compel data disclosure.",
    weight: 3,
    onYes: { SPC: 0, SPrC: 3, NPC: 3, ALC: 1, ALD: 2 },
    onNo:  { SPC: 3, SPrC: 0, NPC: 0, ALC: 0, ALD: 0 }
  },

  // ── Cloud Strategy ─────────────────────────
  {
    id: 34,
    category: "Cloud Strategy",
    text: "Is your organization adopting a cloud-first strategy with Azure as the primary platform?",
    context: "Strategic commitment to Azure for innovation and digital transformation.",
    weight: 2,
    onYes: { SPC: 3, SPrC: 1, NPC: 1, ALC: 2, ALD: 0 },
    onNo:  { SPC: 0, SPrC: 1, NPC: 1, ALC: 0, ALD: 2 }
  },
  {
    id: 35,
    category: "Cloud Strategy",
    text: "Do you need the broadest possible set of Azure PaaS services (AI, Analytics, IoT)?",
    context: "Access to 200+ Azure services vs. a curated sovereign subset.",
    weight: 2,
    onYes: { SPC: 3, SPrC: 0, NPC: 1, ALC: 1, ALD: 0 },
    onNo:  { SPC: 0, SPrC: 2, NPC: 1, ALC: 0, ALD: 1 }
  },
  {
    id: 36,
    category: "Cloud Strategy",
    text: "Do you need to scale elastically with global Azure capacity?",
    context: "Burst capacity, auto-scale, and consumption-based pricing.",
    weight: 2,
    onYes: { SPC: 3, SPrC: 0, NPC: 2, ALC: 0, ALD: 0 },
    onNo:  { SPC: 0, SPrC: 1, NPC: 0, ALC: 1, ALD: 1 }
  },
  {
    id: 37,
    category: "Cloud Strategy",
    text: "Is minimizing operational overhead more important than maximum sovereignty control?",
    context: "Microsoft-managed operations vs. self-managed sovereign operations.",
    weight: 2,
    onYes: { SPC: 3, SPrC: 0, NPC: 2, ALC: 0, ALD: 0 },
    onNo:  { SPC: 0, SPrC: 2, NPC: 0, ALC: 1, ALD: 2 }
  },
  {
    id: 38,
    category: "Cloud Strategy",
    text: "Do you anticipate needing a hybrid combination of public cloud and on-premises?",
    context: "Some workloads in Azure, some on local infrastructure — managed together.",
    weight: 2,
    onYes: { SPC: 2, SPrC: 0, NPC: 1, ALC: 3, ALD: 1 },
    onNo:  { SPC: 1, SPrC: 1, NPC: 0, ALC: 0, ALD: 0 }
  }
];
