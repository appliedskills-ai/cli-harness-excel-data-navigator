export type RequirementPriority = "Critical" | "High" | "Medium" | "Low";
export type InterfaceType = "API" | "UI" | "Hardware" | "Event Stream";
export type SrsStatus = "Draft" | "Review" | "Baselined" | "Signed-Off" | "Superseded";

export interface SystemRequirementsSpecification {
  id: string;
  metadata: SrsMetadata;
  functionalRequirements: FunctionalRequirement[];
  nonFunctionalRequirements: NonFunctionalRequirements;
  interfaces: SystemInterface[];
  dataModels: DataModel[];
  constraints: SystemConstraints;
  contractBaseline: ContractBaseline;
}

interface SrsMetadata {
  title: string;
  version: string;
  authors: string[];
  targetAudience: string[]; // e.g., ["Architects", "QA", "Backend Team"]
  status: SrsStatus;
  lastUpdated: string; // ISO 8601 Date
}

interface FunctionalRequirement {
  id: string; // Traceable ID, e.g., "FR-INV-001"
  title: string;
  description: string;
  priority: RequirementPriority;
  triggerEvent: string; // What causes this function to execute
  expectedOutcome: string;
  acceptanceCriteria: string[]; // Heavily utilized by QA for test case generation
}

interface NonFunctionalRequirements {
  performance: PerformanceCriteria;
  security: SecurityCriteria;
  usability: string[];
  reliability: string[];
}

interface PerformanceCriteria {
  latencyP99Ms: number;
  throughputRequestsPerSecond: number;
  concurrentUsers: number;
}

interface SecurityCriteria {
  authenticationMethod: string;
  encryptionAtRest: string;
  encryptionInTransit: string;
  complianceStandards: string[]; // e.g., ["SOC 2 Type II", "GDPR"]
}

interface SystemInterface {
  id: string;
  type: InterfaceType;
  name: string;
  description: string;
  protocol: string; // e.g., "REST/HTTPS", "gRPC", "MQTT"
  dataFormat: string; // e.g., "JSON", "Protobuf"
}

interface DataModel {
  entityName: string;
  description: string;
  attributes: DataAttribute[];
  estimatedVolume: string; // Critical for architecture sizing
}

interface DataAttribute {
  name: string;
  dataType: string;
  isRequired: boolean;
  constraints: string; // e.g., "Unique", "Foreign Key to User"
}

interface SystemConstraints {
  technical: string[]; // e.g., "Must be deployed on AWS EKS"
  regulatory: string[]; // e.g., "Data must not leave the EU"
  business: string[]; // e.g., "Must launch before Black Friday"
}

interface ContractBaseline {
  isBaselined: boolean;
  baselineDate?: string; // ISO 8601 Date
  stakeholderSignOffs: Record<string, "Pending" | "Approved" | "Rejected">; // Key: Role/Name
}
