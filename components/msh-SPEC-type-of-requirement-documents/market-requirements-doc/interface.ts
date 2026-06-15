export type MrdStatus = "Draft" | "In Review" | "Approved" | "Archived";
export type MarketSegment = "Enterprise" | "Mid-Market" | "SMB" | "Consumer" | "Prosumer";
export type CompetitorTier = "Direct" | "Indirect" | "Status Quo / Manual";

export interface MarketRequirementsDocument {
  id: string;
  metadata: MrdMetadata;
  executiveSummary: string;
  marketAnalysis: MarketAnalysis;
  targetAudience: TargetAudience;
  competitiveLandscape: CompetitorProfile[];
  productPositioning: ProductPositioning;
  marketRequirements: HighLevelMarketRequirement[];
  goToMarketStrategy: GoToMarketStrategy;
}

interface MrdMetadata {
  title: string;
  author: string; // Usually Product Marketing Manager (PMM) or VP Product
  status: MrdStatus;
  targetLaunchQuarter: string; // e.g., "Q1 2027"
  lastUpdated: string; // ISO 8601 Date
}

interface MarketAnalysis {
  marketProblem: string; // The overarching pain point in the industry
  marketSize: {
    tamUsd: number; // Total Addressable Market
    samUsd: number; // Serviceable Available Market
    somUsd: number; // Serviceable Obtainable Market (Realistic 3-5 year goal)
  };
  keyMarketTrends: string[]; // Macro trends driving this opportunity
}

interface TargetAudience {
  primarySegments: MarketSegment[];
  buyerPersonas: Persona[]; // The people holding the budget (e.g., VP of Engineering)
  userPersonas: Persona[];  // The people using the tool daily (e.g., Frontend Developer)
}

interface Persona {
  name: string;
  role: string;
  painPoints: string[];
  buyingCriteria?: string[]; // Specifically what the buyer needs to sign the contract
}

interface CompetitorProfile {
  name: string;
  tier: CompetitorTier;
  strengths: string[];
  weaknesses: string[];
  ourCompetitiveAdvantage: string; // How we beat them
}

interface ProductPositioning {
  valueProposition: string; // 1-2 sentence core promise
  elevatorPitch: string;
  keyDifferentiators: string[];
}

interface HighLevelMarketRequirement {
  id: string;
  theme: string;
  description: string;
  marketDriver: string; // Why the market demands this (e.g., "Required to sell to banks")
}

interface GoToMarketStrategy {
  pricingModel: string; // e.g., "Seat-based SaaS + Usage tiers"
  primarySalesChannels: string[]; // e.g., "Direct Enterprise Sales", "Product-Led Growth (PLG)"
  marketingChannels: string[];
  partnershipOpportunities: string[];
}
