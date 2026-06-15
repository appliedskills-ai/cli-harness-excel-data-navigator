export type BrdStatus = "Draft" | "Under Review" | "Approved" | "On Hold" | "Cancelled";
export type InfluenceLevel = "High" | "Medium" | "Low";
export type RequirementCategory = "Operational" | "Financial" | "Regulatory" | "Strategic";

export interface BusinessRequirementsDocument {
  id: string;
  metadata: BrdMetadata;
  executiveSummary: string;
  businessGoals: BusinessGoal[];
  projectScope: ProjectScope;
  stakeholders: Stakeholder[];
  highLevelRequirements: HighLevelRequirement[];
  financials: CostBenefitAnalysis;
  assumptionsAndConstraints: AssumptionsAndConstraints;
}

interface BrdMetadata {
  title: string;
  author: string; // Usually a Business Analyst
  executiveSponsor: string;
  status: BrdStatus;
  lastUpdated: string; // ISO 8601 Date
}

interface BusinessGoal {
  id: string;
  description: string;
  strategicAlignment: string; // How this ties to corporate OKRs
  successMetric: string; // Measurable KPI (e.g., "Increase revenue by 5%")
}

interface ProjectScope {
  inScope: string[];
  outOfScope: string[]; // Crucial for managing executive expectations
}

interface Stakeholder {
  name: string;
  role: string;
  department: string;
  influenceLevel: InfluenceLevel;
  coreExpectations: string[];
}

interface HighLevelRequirement {
  id: string; // e.g., "BR-001"
  category: RequirementCategory;
  description: string; // High-level capability, NOT a technical feature
  priority: "Critical" | "High" | "Medium" | "Low";
}

interface CostBenefitAnalysis {
  estimatedCostCap: number; // Maximum approved budget
  expectedFinancialBenefit: string; // e.g., "$2M annual savings"
  roiPercentage: number;
  paybackPeriodMonths: number;
}

interface AssumptionsAndConstraints {
  businessAssumptions: string[]; // E.g., "Market conditions remain stable"
  resourceConstraints: string[]; // E.g., "No new hires approved for this phase"
  scheduleConstraints: string[]; // E.g., "Must launch before Q4 holiday season"
}
