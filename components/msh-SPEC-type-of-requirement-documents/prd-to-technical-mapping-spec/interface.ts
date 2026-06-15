export type MappingStatus = "Draft" | "Review" | "Approved" | "Superseded";
export type EffortSize = "Small" | "Medium" | "Large" | "Extra Large";

export interface PrdTechMappingSpec {
  id: string;
  metadata: MappingMetadata;
  executiveSummary: string;
  requirementMappings: RequirementMapping[];
  systemImpactSummary: SystemImpactSummary;
  engineeringPhases: EngineeringPhase[];
  technicalAssumptions: TechnicalAssumption[];
}

interface MappingMetadata {
  title: string;
  prdReferenceUrl: string; // Link to Jira, Confluence, Notion, etc.
  productManager: string;
  engineeringLead: string;
  status: MappingStatus;
  lastUpdated: string; // ISO 8601 Date
}

interface RequirementMapping {
  prdRequirementId: string; // e.g., "PRD-F-001"
  userStory: string; // The PM's description
  technicalTranslation: string; // The Engineering translation
  impactedComponents: string[]; // System IDs
  outOfScopeTechnically: string[]; // Clarifications on technical boundaries
}

interface SystemImpactSummary {
  newServicesRequired: string[];
  legacyServicesModified: string[];
  databaseSchemaChanges: string[];
  externalApiIntegrations: string[];
}

interface EngineeringPhase {
  milestoneName: string;
  targetRelease: string; // e.g., "Q3 2026"
  epics: TechnicalEpic[];
  blockers: string[]; // Hard dependencies that must be resolved first
}

interface TechnicalEpic {
  epicName: string;
  componentRef: string;
  tasks: string[];
  estimatedEffort: EffortSize;
}

interface TechnicalAssumption {
  id: string;
  description: string;
  validationPlan: string; // How engineering will prove this assumption true or false
}
