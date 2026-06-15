export interface ComprehensiveSRS {
  id: string;
  metadata: DocumentMetadata;
  introduction: Introduction;
  overallDescription: OverallDescription;
  specificRequirements: SpecificRequirements;
  appendices: Appendices;
}

interface DocumentMetadata {
  title: string;
  version: string;
  lastUpdated: string; // ISO 8601 Date
}

// 1. Introduction
interface Introduction {
  purposeAndScope: string;
  definitionsAndAcronyms: Record<string, string>;
  references: DocumentReference[];
  overviewOfTheDocument: string;
}

interface DocumentReference {
  documentName: string;
  locationOrUrl: string;
}

// 2. Overall Description / Background
interface OverallDescription {
  productPerspective: string;
  assumptionsAndDependencies: string[];
  constraints: string[]; // e.g., technology, regulatory
  stakeholdersAndUsers: Stakeholder[];
  operatingEnvironment: string; // hardware, software constraints
}

interface Stakeholder {
  role: string;
  description: string;
}

// 3. Specific Requirements
interface SpecificRequirements {
  functionalRequirements: FunctionalRequirement[];
  nonFunctionalRequirements: NonFunctionalRequirement[];
  interfaces: SystemInterface[];
  dataRequirements: DataModel[];
  errorAndExceptionHandling: ExceptionHandlingRule[];
  validationAndAcceptanceCriteria: AcceptanceCriteria[];
  dependenciesAndPriorities: RequirementDependency[];
}

interface FunctionalRequirement {
  reqId: string;
  title: string;
  detailedBehavior: string; // use cases, features, system behavior
}

interface NonFunctionalRequirement {
  reqId: string;
  category: "Performance" | "Reliability" | "Security" | "Usability" | "Maintainability" | "Other";
  description: string;
}

interface SystemInterface {
  interfaceId: string;
  apiOrSystemName: string;
  interactionDescription: string;
}

interface DataModel {
  entityName: string;
  databaseDesignNotes: string;
}

interface ExceptionHandlingRule {
  scenario: string;
  systemResponse: string;
}

interface AcceptanceCriteria {
  reqIdRef: string;
  criteria: string[];
}

interface RequirementDependency {
  reqIdRef: string;
  priority: "High" | "Medium" | "Low";
  dependsOnReqIds: string[];
}

// 4. Appendices / Supporting Material
interface Appendices {
  glossary: Record<string, string>;
  diagramsAndMockups: SupportingArtifact[];
  traceabilityMatrices: SupportingArtifact[];
  revisionHistory: RevisionRecord[];
}

interface SupportingArtifact {
  title: string;
  assetUrl: string;
}

interface RevisionRecord {
  version: string;
  date: string;
  author: string;
  changeDescription: string;
}
