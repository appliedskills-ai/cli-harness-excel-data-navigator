export type SensitivityLevel = "Public" | "Internal" | "Confidential" | "Restricted (PII/PHI)";
export type InterfaceProtocol = "REST" | "gRPC" | "GraphQL" | "Kafka" | "AMQP" | "SFTP";
export type FlowFrequency = "Real-time" | "Micro-batch" | "Daily Batch" | "Event-Driven";

export interface DataAndInterfaceRequirements {
  id: string;
  metadata: DocumentMetadata;
  conceptualArchitecture: string; // High-level description of how data moves
  dataModels: DataModel[];
  dataDictionary: DataDictionaryEntry[];
  dataFlows: DataFlow[];
  systemInterfaces: SystemInterface[];
  governanceAndSecurity: DataGovernance;
}

interface DocumentMetadata {
  title: string;
  leadDataArchitect: string;
  integrationLead: string;
  status: "Draft" | "Review" | "Approved" | "Deprecated";
  lastUpdated: string; // ISO 8601 Date
}

interface DataModel {
  domainName: string; // e.g., "Customer Identity", "Order Management"
  entities: Entity[];
  relationships: string[]; // e.g., "Customer (1) -> (N) Orders"
}

interface Entity {
  name: string;
  description: string;
  primaryKey: string;
  estimatedVolume: string; // Initial load + annual growth
}

interface DataDictionaryEntry {
  elementName: string;
  entityRef: string; // Which entity this belongs to
  dataType: string; // e.g., "VARCHAR(255)", "DECIMAL(10,2)", "TIMESTAMP"
  format: string; // e.g., "ISO-8601", "UUIDv4", "+1-XXX-XXX-XXXX"
  sensitivity: SensitivityLevel;
  isNullable: boolean;
  validationRules: string[]; // e.g., "Must be > 0", "Regex match: ^[A-Z]{2}$"
}

interface DataFlow {
  flowId: string;
  description: string;
  sourceSystem: string;
  targetSystem: string;
  frequency: FlowFrequency;
  transformationLogic: string; // e.g., "Flatten nested JSON, drop SSN, cast strings to INT"
}

interface SystemInterface {
  interfaceId: string;
  name: string;
  protocol: InterfaceProtocol;
  dataFormat: "JSON" | "XML" | "Protobuf" | "Avro" | "Parquet";
  schemaRef: string; // Link to OpenAPI, AsyncAPI, or Schema Registry
  throughputExpectation: string; // e.g., "500 msgs/sec peak"
  errorHandling: string; // e.g., "Dead Letter Queue after 3 retries"
}

interface DataGovernance {
  dataRetentionPolicy: string; // e.g., "7 years for financial records, 30 days for logs"
  complianceRequirements: string[]; // e.g., "GDPR Right to be Forgotten", "HIPAA"
  encryptionStandards: string; // e.g., "AES-256 for Data at Rest, TLS 1.3 for Transit"
}
