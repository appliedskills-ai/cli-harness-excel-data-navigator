export type SeverityLevel = "Low" | "Medium" | "High" | "Critical";
export type SpecStatus = "Draft" | "In Review" | "Approved" | "Rejected" | "Deprecated";

export interface SolutionDesignSpec {
  id: string;
  metadata: DocumentMetadata;
  overview: string;
  goals: SpecGoals;
  architecture: Architecture;
  components: SystemComponent[];
  flows: SystemFlow[];
  dependencies: Dependencies;
  risks: RiskAssessment[];
  rolloutPlan: RolloutPlan;
}

interface DocumentMetadata {
  title: string;
  author: string;
  reviewers: string[];
  status: SpecStatus;
  createdAt: string; // ISO 8601 Date
  updatedAt: string; // ISO 8601 Date
  tags: string[];
}

interface SpecGoals {
  inScope: string[];
  outOfScope: string[];
  successMetrics: string[];
}

interface Architecture {
  pattern: string; // e.g., "Event-Driven", "Microservices", "Agentic Orchestration"
  description: string;
  diagrams: string[]; // URLs or markdown references to architecture diagrams
  designDecisions: Record<string, string>; // Key: Decision context, Value: Chosen path & rationale
}

interface SystemComponent {
  id: string;
  name: string;
  type: "Service" | "Database" | "UI" | "Agent" | "Infrastructure" | "Harness";
  responsibilities: string[];
  interfaceDefinitions?: string; // Links to OpenAPI specs, GraphQL schemas, etc.
}

interface SystemFlow {
  name: string;
  description: string;
  trigger: string;
  steps: string[]; // Sequential steps or directed graph nodes
  sequenceDiagram?: string; // URL or mermaid.js string
}

interface Dependencies {
  internalServices: string[]; // IDs of other internal microservices/components
  externalAPIs: string[]; // e.g., "Figma API", "OpenAI"
  infrastructure: string[]; // e.g., "AWS Identity Center", "PostgreSQL"
}

interface RiskAssessment {
  id: string;
  description: string;
  impact: SeverityLevel;
  likelihood: SeverityLevel;
  mitigationStrategy: string;
}

interface RolloutPlan {
  strategy: "Canary" | "Blue/Green" | "Phased" | "Big Bang";
  phases: RolloutPhase[];
  rollbackProcedure: string;
}

interface RolloutPhase {
  name: string;
  targetAudience: string; // e.g., "Internal Users", "10% Traffic"
  successCriteria: string[];
  durationEstimate: string;
}
