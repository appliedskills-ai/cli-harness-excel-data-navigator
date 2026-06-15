export type FeaturePriority = "Must Have" | "Should Have" | "Could Have" | "Won't Have"; // MoSCoW method
export type FeatureStatus = "Draft" | "In Review" | "Approved" | "Implemented" | "Deferred";

export interface FeatureRequirementsDocument {
  featureId: string;
  metadata: FrdMetadata;
  description: FeatureDescription;
  priority: FeaturePriority;
  dependencies: Dependencies;
  uiMockups: UiMockup[];
  apiContracts: ApiRequirement[];
}

interface FrdMetadata {
  title: string;
  productManager: string;
  engineeringLead: string;
  status: FeatureStatus;
  targetRelease: string; // e.g., "v2.4.0" or "Sprint 42"
  lastUpdated: string; // ISO 8601 Date
}

interface FeatureDescription {
  summary: string;
  userProblem: string; // What pain point are we solving?
  proposedSolution: string; // How does this feature solve it?
  outOfScope: string[]; // Explicit boundaries to prevent scope creep
}

interface Dependencies {
  prerequisiteFeatures: string[]; // IDs of other features that must be built first
  externalSystems: string[]; // e.g., "Stripe Billing API"
  teamDependencies: string[]; // e.g., "Requires Core Platform team to update the gateway"
}

interface UiMockup {
  viewName: string;
  designLink: string; // URL to Figma, Zeplin, etc.
  interactionNotes: string; // Details on hover states, animations, or transitions
  stateVariants: string[]; // e.g., ["Empty State", "Loading State", "Error State"]
  accessibilityRequirements: string[];
}

interface ApiRequirement {
  endpointPattern: string; // e.g., "POST /api/v1/components/{id}/export"
  purpose: string;
  dataRequirements: string; // What the payload must contain
  status: "Requires New Endpoint" | "Requires Modification to Existing" | "Uses Existing As-Is";
}
