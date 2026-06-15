export type RunbookStatus = "Draft" | "Active" | "Archived";
export type IncidentSeverity = "SEV-1" | "SEV-2" | "SEV-3" | "SEV-4";
export type EscalationTier = "L1 Support" | "Primary On-Call" | "Secondary On-Call" | "Engineering Manager";

export interface OperationalRunbook {
  id: string;
  metadata: RunbookMetadata;
  serviceOverview: ServiceOverview;
  dashboards: ObservabilityDashboard[];
  alerts: AlertResponse[];
  knownFailureModes: FailureMode[];
  maintenanceTasks: RoutineMaintenance[];
  escalationPath: EscalationPolicy;
}

interface RunbookMetadata {
  title: string;
  serviceIdRef: string; // Links back to the system catalog or HLD ID
  ownerTeam: string;
  status: RunbookStatus;
  lastUpdated: string; // ISO 8601 Date
  reviewCadenceDays: number;
}

interface ServiceOverview {
  description: string;
  criticalityTier: "Tier 1" | "Tier 2" | "Tier 3";
  dependencies: string[]; // Upstream/Downstream services to check during an outage
}

interface ObservabilityDashboard {
  name: string;
  url: string; // Link to Datadog, Grafana, Splunk, etc.
  description: string; // e.g., "Primary dashboard for API latency and error rates"
}

interface AlertResponse {
  alertName: string;
  severity: IncidentSeverity;
  triggerCondition: string; // What exactly caused the alarm to fire
  immediateAction: string; // The very first thing the on-call engineer should do
  linkedFailureModeId?: string; // Reference to the detailed recovery steps below
}

interface FailureMode {
  id: string;
  symptom: string; // What the user or system is experiencing
  probableCauses: string[];
  investigationSteps: string[]; // Read-only commands to run, logs to check
  recoverySteps: string[]; // Mutating actions to fix the issue (e.g., restart, clear cache, scale up)
  verificationSteps: string[]; // How to prove the fix actually worked
}

interface RoutineMaintenance {
  taskName: string;
  frequency: "Daily" | "Weekly" | "Monthly" | "Ad-Hoc";
  automationStatus: "Fully Automated" | "Partially Automated" | "Manual";
  procedure: string[]; // Step-by-step instructions or script references
}

interface EscalationPolicy {
  primaryContact: EscalationTier;
  escalationTriggers: Record<string, EscalationTier>; // Maps conditions to the next level up
  contactRosterUrl: string; // Link to PagerDuty or internal directory
}
