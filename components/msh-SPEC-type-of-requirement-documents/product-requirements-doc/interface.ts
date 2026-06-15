export type PrdStatus = "Draft" | "In Review" | "Approved" | "Cancelled" | "Shipped";
export type FeaturePriority = "Must Have" | "Should Have" | "Nice to Have" | "Won't Have";

export interface ProductRequirementsDocument {
  id: string;
  metadata: PrdMetadata;
  purpose: string;
  goalsAndKpis: Goal[];
  features: ProductFeature[];
  userScenarios: UserScenario[];
  constraints: Constraints;
  timeline: TimelineMilestone[];
}

interface PrdMetadata {
  title: string;
  productManager: string;
  targetAudience: string;
  status: PrdStatus;
  lastUpdated: string; // ISO 8601 Date
}

interface Goal {
  objective: string;
  kpis: KPI[];
}

interface KPI {
  name: string;
  baseline: string;
  target: string;
}

interface ProductFeature {
  id: string;
  name: string;
  description: string;
  priority: FeaturePriority;
}

interface UserScenario {
  persona: string;
  scenario: string;
  expectedOutcome: string;
}

interface Constraints {
  technical: string[];
  business: string[];
  design: string[];
}

interface TimelineMilestone {
  milestone: string;
  targetDate: string; // ISO 8601 Date or Quarter/Month (e.g., "Q3 2026")
  deliverables: string[];
}
