export type DataSourceFormat = "CSV" | "JSONL" | "API_PULL";
export type ValidationAction = "Drop Row" | "Halt Batch" | "Send to Dead Letter Queue";

export interface BatchIngestionSpec {
  id: string;
  metadata: IngestionMetadata;
  dataSource: DataSourceConfig;
  schemaMapping: FieldMapping[];
  validationRules: IntakeValidationRule[];
  executionPolicies: BatchExecutionPolicy;
}

interface IngestionMetadata {
  pipelineName: string;
  ownerTeam: string;
  targetGraphRef: string; // e.g., "vulnrem-core-dag"
  lastUpdated: string;
}

interface DataSourceConfig {
  sourceType: DataSourceFormat;
  locationUri: string; // e.g., "s3://vuln-datasets/q3-remediation-list.csv"
  authenticationRef?: string;
  pollIntervalMinutes?: number; // If continuous intake rather than one-off
}

interface FieldMapping {
  sourceColumn: string; // The header in the CSV/JSON
  targetAgentStateField: string; // Where it maps in the Zod AgentState
  transformLogic?: string; // e.g., "Lowercase", "Parse Date", "Default to 'main'"
  isRequired: boolean;
}

interface IntakeValidationRule {
  ruleName: string;
  condition: string; // e.g., "targetBranch must exist in GitHub"
  onFailure: ValidationAction;
}

interface BatchExecutionPolicy {
  maxConcurrentThreads: number; // Prevent rate-limiting GitHub/LLMs
  staggerDelaySeconds: number; // Delay between spawning threads
  failureThresholdPercentage: number; // Abort entire batch if > X% fail
  deduplicationStrategy: "Skip Existing Open PRs" | "Overwrite" | "Create Alternative";
}
