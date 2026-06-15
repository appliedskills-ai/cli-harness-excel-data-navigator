export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type CodeUnitType = "Class" | "Function" | "React Component" | "Middleware" | "Agent Skill";

export interface LowLevelDesign {
  id: string;
  metadata: LLDMetadata;
  parentComponentRef: string; // Links back to the specific HLD component ID
  modules: ModuleDesign[];
  apiContracts: ApiContract[];
  dataModels: DataModel[];
  sequenceLogic: DetailedSequence[];
}

interface LLDMetadata {
  title: string;
  author: string;
  reviewers: string[];
  status: "Draft" | "In Review" | "Approved";
  lastUpdated: string; // ISO 8601 Date
}

interface ModuleDesign {
  id: string;
  name: string;
  directoryPath: string; // e.g., "src/services/ingestion/"
  description: string;
  codeUnits: CodeUnit[];
}

interface CodeUnit {
  name: string;
  type: CodeUnitType;
  description: string;
  parameters: Parameter[];
  returnType: string;
  validationRules: string[];
  exceptionsThrown: string[];
}

interface Parameter {
  name: string;
  dataType: string;
  required: boolean;
  description: string;
}

interface ApiContract {
  endpoint: string;
  method: HttpMethod;
  description: string;
  requestSchema: string; // JSON Schema or reference to a DTO interface
  responseSchema: string;
  errorCodes: Record<number, string>; // e.g., { 400: "InvalidFigmaSignature", 404: "NodeNotFound" }
}

interface DataModel {
  tableName: string; // or Collection name
  description: string;
  fields: DataField[];
  indexes: string[]; // e.g., ["CREATE INDEX idx_node_id ON normalized_nodes(node_id)"]
}

interface DataField {
  name: string;
  dataType: string;
  constraints: string[]; // e.g., ["PRIMARY KEY", "NOT NULL", "UNIQUE"]
  description: string;
}

interface DetailedSequence {
  scenarioName: string;
  trigger: string;
  steps: SequenceStep[];
}

interface SequenceStep {
  stepNumber: number;
  actor: string; // The class, function, or service executing the step
  action: string;
  onFailure: string; // Error handling or fallback logic
}
