export type ProcessState = "As-Is" | "To-Be";
export type DocumentStatus = "Draft" | "Under Review" | "Approved" | "Retired";
export type StepType = "Manual Task" | "Automated System Task" | "Decision Gateway" | "Sub-Process";
export type ActorType = "Human" | "System" | "External Entity";

export interface BusinessProcessDocument {
  id: string;
  metadata: ProcessMetadata;
  overview: ProcessOverview;
  actors: ProcessActor[];
  processSteps: ProcessStep[];
  exceptions: ExceptionHandling[];
  metrics: ProcessMetric[];
}

interface ProcessMetadata {
  title: string;
  processOwner: string; // The business leader accountable for this process
  author: string; // Usually a Business Analyst or Process Engineer
  state: ProcessState;
  status: DocumentStatus;
  version: string;
  lastUpdated: string; // ISO 8601 Date
}

interface ProcessOverview {
  purpose: string;
  scope: string; // Explicitly what is included and excluded
  triggeringEvents: string[]; // What kicks off this process?
  expectedOutcomes: string[]; // What represents a successful completion?
  systemsInvolved: string[]; // High-level list of software/tools utilized
}

interface ProcessActor {
  roleId: string;
  name: string; // e.g., "L1 Support Agent", "ERP System"
  type: ActorType;
  description: string;
}

interface ProcessStep {
  stepId: string; // e.g., "P-100", "P-110"
  name: string;
  type: StepType;
  actorRef: string; // Links back to ProcessActor.roleId
  description: string; // Detailed instructions of the action taken
  inputs: string[]; // Data, documents, or physical items required to start the step
  outputs: string[]; // Data, documents, or physical items produced by the step
  nextSteps: NextStepRouting[];
}

interface NextStepRouting {
  targetStepId: string;
  condition: string; // e.g., "Always", "If Approved", "If Rejected"
}

interface ExceptionHandling {
  exceptionId: string;
  triggeringStepIdRef: string; // Where the breakdown occurs
  condition: string; // What went wrong (e.g., "Customer failed credit check")
  handlingProcedure: string; // Step-by-step resolution or alternative path
  escalationRoleRef: string; // Who to contact if the exception cannot be resolved
}

interface ProcessMetric {
  kpiName: string;
  baseline: string; // Current performance (for As-Is)
  targetValue: string; // Goal performance (for To-Be)
  measurementMethod: string; // How this data is collected
}
