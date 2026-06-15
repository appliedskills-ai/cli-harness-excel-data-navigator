export type MigrationStatus = "Draft" | "Review" | "Approved" | "In Progress" | "Completed" | "Rolled Back";
export type DataMigrationPattern = "Dual Write" | "Bulk ETL" | "Change Data Capture (CDC)" | "Lazy Migration";
export type CutoverStrategy = "Big Bang" | "Phased/Canary" | "Parallel Run";

export interface MigrationTransitionSpec {
  id: string;
  metadata: MigrationMetadata;
  executiveSummary: string;
  architectureStates: ArchitectureStates;
  dataMigration: DataMigrationConfig;
  backwardCompatibility: CompatibilityPlan;
  cutoverPlan: CutoverExecution;
  rollbackStrategy: RollbackPlan;
  deprecationTimeline: DeprecationSchedule;
}

interface MigrationMetadata {
  title: string;
  author: string;
  leadEngineer: string;
  status: MigrationStatus;
  targetCompletionDate: string; // ISO 8601 Date
}

interface ArchitectureStates {
  currentStateDescription: string;
  targetStateDescription: string;
  systemsToRetire: string[]; // e.g., ["Legacy MongoDB Cluster", "v1 Sync Script"]
  systemsToIntroduce: string[]; // e.g., ["PostgreSQL 16", "CDC Event Publisher"]
}

interface DataMigrationConfig {
  pattern: DataMigrationPattern;
  sourceDatastore: string;
  targetDatastore: string;
  estimatedVolume: string; // e.g., "500GB", "100M rows"
  validationStrategy: string[]; // e.g., ["Row count parity", "Hash sampling of 10k random records"]
  downtimeRequired: boolean;
}

interface CompatibilityPlan {
  requiresTranslationLayer: boolean;
  supportedLegacyClients: string[];
  breakingChanges: string[];
  mitigationForBreakingChanges: string;
}

interface CutoverExecution {
  strategy: CutoverStrategy;
  downtimeWindow: string; // e.g., "Saturday 2AM-4AM EST", "Zero Downtime"
  preRequisites: string[];
  executionSteps: CutoverStep[];
}

interface CutoverStep {
  order: number;
  owner: string; // Team, person, or automated pipeline
  action: string;
  estimatedDurationMinutes: number;
}

interface RollbackPlan {
  pointOfNoReturn: string; // The step after which rollback is impossible or requires a forward-fix
  automaticTriggers: string[];
  manualSteps: string[];
  dataReconciliation: string; // How to handle data written to the new system if we must revert to the old one
}

interface DeprecationSchedule {
  milestones: DeprecationMilestone[];
  finalDecommissionDate: string; // ISO 8601 Date
}

interface DeprecationMilestone {
  date: string;
  action: string; // e.g., "Stop accepting new writes to legacy DB", "Scale legacy pods to 0"
}
