export type ScopeStatus = "Draft" | "In Review" | "Approved" | "Amended" | "Closed";

export interface ScopeStatement {
  id: string;
  metadata: ScopeMetadata;
  projectJustification: string;
  scopeDefinition: ScopeDefinition;
  deliverables: Deliverable[];
  boundariesAndConstraints: BoundariesAndConstraints;
  assumptions: string[];
  acceptanceCriteria: AcceptanceCriteria[];
  approvals: ApprovalRecord[];
}

interface ScopeMetadata {
  projectName: string;
  projectManager: string;
  projectSponsor: string; // The executive funding or championing the project
  status: ScopeStatus;
  version: string;
  lastUpdated: string; // ISO 8601 Date
}

interface ScopeDefinition {
  inScope: string[]; // Explicit list of features, processes, or systems to be created/modified
  outOfScope: string[]; // Explicit list of related items that will NOT be addressed
}

interface Deliverable {
  id: string;
  name: string;
  description: string;
  targetDate?: string; // ISO 8601 Date or milestone
}

interface BoundariesAndConstraints {
  budgetCap?: number;
  hardDeadlines: string[]; // e.g., "Must launch before regulatory deadline"
  resourceConstraints: string[]; // e.g., "Limited to 2 backend engineers"
  technicalBoundaries: string[]; // e.g., "Must build on top of existing legacy database"
}

interface AcceptanceCriteria {
  deliverableIdRef: string;
  criteria: string[];
  approverRole: string; // Who decides if this deliverable is officially complete?
}

interface ApprovalRecord {
  role: string;
  name: string;
  status: "Pending" | "Signed" | "Rejected";
  dateSigned?: string; // ISO 8601 Date
}
