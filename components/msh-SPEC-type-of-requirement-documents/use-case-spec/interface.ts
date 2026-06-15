export type ActorType = "Primary" | "Secondary" | "System";
export type UseCaseStatus = "Draft" | "Review" | "Approved" | "Obsolete";

export interface UseCaseSpecification {
  id: string;
  metadata: UseCaseMetadata;
  actors: Actor[];
  preconditions: string[];
  mainFlow: FlowStep[];
  alternateFlows: AlternateFlow[];
  exceptions: ExceptionFlow[];
  postconditions: Postconditions;
}

interface UseCaseMetadata {
  title: string;
  author: string;
  version: string;
  status: UseCaseStatus;
  lastUpdated: string; // ISO 8601 Date
  relatedRequirements?: string[]; // Links back to SRS or PRD IDs
}

interface Actor {
  name: string;
  type: ActorType;
  description: string;
}

interface FlowStep {
  stepNumber: number;
  actorRef: string; // The specific actor taking the action
  action: string;
}

interface AlternateFlow {
  id: string;
  name: string;
  branchingStepNumber: number; // The step in the Main Flow where this branches off
  condition: string; // The trigger for this alternate path
  steps: FlowStep[];
  rejoinsAtStepNumber?: number; // Where it merges back into the Main Flow (if it doesn't end the use case)
}

interface ExceptionFlow {
  id: string;
  name: string;
  branchingStepNumber: number; // The step where the failure occurs
  condition: string; // What went wrong
  handlingSteps: FlowStep[];
  systemStateAfter: "Terminated" | "Rolled Back" | "Degraded";
}

interface Postconditions {
  onSuccess: string[]; // What must be true after the Main or Alternate flows complete
  onFailure: string[]; // What must be true after an Exception flow terminates
}
