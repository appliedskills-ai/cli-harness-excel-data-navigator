export type LifecyclePhase = "Discovery" | "Design Handoff" | "Engineering Review" | "Development" | "Launch";
export type AlignmentStatus = "Pending" | "In Progress" | "Aligned" | "Blocked" | "Requires Rework";

export interface ProductRequirementsDocument {
  id: string;
  metadata: PrdMetadata;
  productVision: string;
  targetAudience: UserPersona[];
  successMetrics: SuccessMetric[];
  designConstraints: string[];
  features: FeatureDefinition[];
  roadmap: RoadmapPhase[];
}

interface PrdMetadata {
  title: string;
  productManager: string; // The "What" owner
  leadDesigner: string;   // The "Flow" owner
  leadEngineer: string;   // The "How" owner
  currentPhase: LifecyclePhase;
  lastUpdated: string; // ISO 8601 Date
}

interface UserPersona {
  name: string;
  role: string;
  painPoints: string[];
  primaryGoal: string;
}

interface SuccessMetric {
  metricName: string;
  baseline: string;
  target: string;
  measurementTool: string;
}

interface FeatureDefinition {
  id: string;
  name: string;
  priority: "P0 (Must Have)" | "P1 (Should Have)" | "P2 (Nice to Have)";
  userStories: UserStory[];
  
  // Transition 1: Product -> UX
  uxTransition: UxAlignment;
  
  // Transition 2: UX -> Engineering (and Product -> Engineering)
  engineeringTransition: EngineeringAlignment;
}

interface UserStory {
  id: string;
  asA: string; // User persona
  iWantTo: string; // Action
  soThat: string; // Value/Benefit
}

interface UxAlignment {
  status: AlignmentStatus;
  designMockupRefs: string[]; // URLs to Figma/Zeplin
  interactionNotes: string; // Specific behavioral rules for the UI
  accessibilityRequirements: string[];
  pmSignOff: boolean; // Has the Product Manager approved this interpretation of the requirements?
}

interface EngineeringAlignment {
  status: AlignmentStatus;
  technicalConstraints: string[]; // Limitations raised by Eng
  architectureSpecRef?: string; // Link to the HLD or Tech Spec once created
  levelOfEffort: "Small" | "Medium" | "Large" | "Unknown";
  designFeasibilityConfirmed: boolean; // Has Engineering agreed the UX is technically viable?
}

interface RoadmapPhase {
  phaseName: string;
  targetDate: string; // e.g., "Q3 2026" or "Sprint 45"
  includedFeatureIds: string[];
}
