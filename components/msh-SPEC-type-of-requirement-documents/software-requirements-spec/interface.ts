export type SrsStatus = "Draft" | "In Review" | "Baselined" | "Approved" | "Deprecated";
export type RequirementPriority = "Low" | "Medium" | "High" | "Critical";
export type InterfaceCategory = "User" | "Hardware" | "Software" | "Communication";

export interface SoftwareRequirementsSpecification {
  id: string;
  metadata: SrsMetadata;
  introduction: Introduction;
  overallDescription: OverallDescription;
  specificRequirements: SpecificRequirements;
  externalInterfaces: ExternalInterface[];
  assumptionsAndConstraints: AssumptionsAndConstraints;
  appendices: Appendix[];
}

interface SrsMetadata {
  title: string;
  version: string;
  authors: string[];
  approvers: string[];
  status: SrsStatus;
  lastUpdated: string; // ISO 8601 Date
  projectCode: string;
}

interface Introduction {
  purpose: string;
  documentScope: string;
  definitionsAndAcronyms: Record<string, string>;
  references: DocumentReference[];
}

interface DocumentReference {
  documentId: string;
  title: string;
  urlOrLocation?: string;
}

interface OverallDescription {
  productPerspective: string; // Context: standalone system or part of a larger ecosystem?
  productFunctions: string[]; // High-level summary of capabilities
  userCharacteristics: string[]; // Target audience and their technical expertise
  operatingEnvironment: string; // Target OS, hardware, or cloud environments
}

interface SpecificRequirements {
  functionalRequirements: FunctionalRequirement[];
  nonFunctionalRequirements: NonFunctionalRequirements;
}

interface FunctionalRequirement {
  reqId: string; // e.g., "FR-SYS-001" (Crucial for traceability matrices)
  title: string;
  description: string;
  priority: RequirementPriority;
  inputs: string[];
  processingLogic: string;
  outputs: string[];
  errorHandling: string;
}

interface NonFunctionalRequirements {
  performance: string[];
  reliability: string[];
  availability: string[];
  security: string[];
  maintainability: string[];
  portability: string[];
}

interface ExternalInterface {
  interfaceId: string;
  category: InterfaceCategory;
  name: string;
  description: string;
  communicationProtocol?: string;
  dataFormat?: string;
}

interface AssumptionsAndConstraints {
  assumptions: string[]; // Facts assumed to be true for this design to work
  businessConstraints: string[]; // Budget, timeline, or organizational limits
  technicalConstraints: string[]; // Hard technological limits (e.g., "Must use Java 17")
  regulatoryCompliance: string[]; // Legal or industry standards (e.g., "HIPAA", "DO-178C")
}

interface Appendix {
  title: string;
  description: string;
  contentRef: string; // Link to diagrams, extensive glossaries, or DOORS modules
}
