export type Protocol = "REST" | "gRPC" | "GraphQL" | "Event/PubSub" | "WebSocket";
export type TopologyType = "Microservices" | "Event-Driven" | "Agentic-Workflow" | "Hub-and-Spoke" | "Monolith";

export interface HighLevelDesign {
  id: string;
  metadata: HLDMetadata;
  executiveSummary: string;
  systemContext: SystemContext;
  majorSystems: MajorSystem[];
  dataFlows: DataFlow[];
  integrations: Integration[];
  infrastructureShape: InfrastructureShape;
  nonFunctionalRequirements: NFRs;
}

interface HLDMetadata {
  title: string;
  architect: string;
  stakeholders: string[];
  status: "Draft" | "Under Review" | "Approved";
  lastUpdated: string; // ISO 8601 Date
}

interface SystemContext {
  description: string;
  primaryActors: string[]; // Users or external entities interacting with the system
  systemBoundary: string; // What is inside vs. outside the system control
}

interface MajorSystem {
  id: string;
  name: string;
  domain: string; // The bounded context (e.g., "Authentication", "Code Generation")
  coreResponsibilities: string[];
}

interface DataFlow {
  id: string;
  name: string;
  description: string;
  path: string[]; // Array of System IDs representing the flow sequence
  criticalPath: boolean;
}

interface Integration {
  sourceSystemId: string;
  targetSystemId: string;
  protocol: Protocol;
  payloadType: string; // e.g., "JSON", "Protobuf", "Figma Node Metadata"
  syncVsAsync: "Synchronous" | "Asynchronous";
}

interface InfrastructureShape {
  topology: TopologyType;
  cloudProvider: string;
  computeTier: string[]; // e.g., ["EKS", "Lambda", "EC2"]
  storageTier: string[]; // e.g., ["PostgreSQL", "S3", "DynamoDB"]
  observability: string[]; // e.g., ["Splunk", "Datadog", "OpenTelemetry"]
}

interface NFRs {
  scalability: string;
  availability: string; // e.g., "99.99%"
  latency: string;
  security: string[]; // High-level compliance/security boundaries
}
