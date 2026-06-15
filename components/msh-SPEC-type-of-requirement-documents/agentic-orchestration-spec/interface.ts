export type AgentStatus = "Discovered" | "InTriage" | "Patching" | "Tested" | "Committed" | "Promoted" | "NotAffected" | "Affected";
export type InterruptKind = "major_bump_review" | "exception" | "false_positive_review";
export type ExitCode = 0 | 1 | 2 | 3 | 4 | 5 | 7 | 75 | 76;

export interface AgenticOrchestrationSpec {
  id: string;
  metadata: SpecMetadata;
  graphTopology: DagTopology;
  stateSchema: AgentStateSchema;
  humanInTheLoop: HitlBoundary[];
  durabilityAndMonitoring: SystemInfrastructure;
  executionContracts: ExecutionContract;
}

interface SpecMetadata {
  title: string;
  systemRef: string;
  author: string;
  lastUpdated: string; // ISO 8601 Date
}

interface DagTopology {
  nodes: GraphNode[];
  routingEdges: RoutingEdge[];
  pureDecisions: string[]; // Nodes that do not mutate state or shell out
}

interface GraphNode {
  id: string;
  implementationRef: string; // e.g., "packages/mjs/src/nodes/planner.mjs"
  description: string;
}

interface RoutingEdge {
  sourceNode: string;
  targetNode: string;
  routingLogic: string;
  isCyclic?: boolean; // Flags loops like tested -> planner
}

interface AgentStateSchema {
  vulnerabilityContext: string[]; // Target CVE, severity, package
  appendOnlyLedgers: string[]; // Arrays that only grow (e.g., attempts, errors)
  transientState: string[]; // Last failure, exit codes
}

interface HitlBoundary {
  kind: InterruptKind;
  triggerCondition: string;
  resumePayloadShape: string;
  notificationMethod: string;
}

interface SystemInfrastructure {
  checkpointer: string;
  storageLayout: Record<string, string>; // Maps file paths to their purpose
  monitoringDaemon: DaemonConfig;
}

interface DaemonConfig {
  intervalMinutes: number;
  feedSources: string[];
  reawakenTrigger: string;
}

interface ExecutionContract {
  exitCodeMatrix: Record<ExitCode, string>;
  architecturalInvariants: string[];
}
