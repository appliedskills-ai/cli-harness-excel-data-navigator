export type AlertSeverity = "SEV-1" | "SEV-2" | "SEV-3" | "SEV-4";
export type MetricType = "Counter" | "Gauge" | "Histogram" | "Summary";
export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";

export interface ObservabilitySpec {
  id: string;
  metadata: ObservabilityMetadata;
  serviceLevelObjectives: SLO[];
  telemetry: TelemetryConfig;
  dashboards: RequiredDashboard[];
  alertingRules: AlertRule[];
}

interface ObservabilityMetadata {
  title: string;
  author: string; // Typically an SRE or Lead Engineer
  systemRef: string; // Links back to the HLD or System ID
  status: "Draft" | "Review" | "Approved" | "Implemented";
  lastUpdated: string; // ISO 8601 Date
}

interface SLO {
  id: string;
  name: string;
  serviceLevelIndicator: string; // The exact metric used to measure this
  targetPercentage: number; // e.g., 99.9
  evaluationWindow: string; // e.g., "Rolling 30 days"
  errorBudgetPolicy: string; // What happens when the budget is burned (e.g., "Halt feature deploys")
}

interface TelemetryConfig {
  instrumentationStandard: string; // e.g., "OpenTelemetry v1.x"
  logs: LogConfiguration;
  metrics: MetricConfiguration[];
  traces: TraceConfiguration;
}

interface LogConfiguration {
  format: "JSON" | "Text" | "Structured";
  standardAttributes: string[]; // Fields that MUST be on every log (e.g., trace_id, user_id, environment)
  piiMaskingRules: string[];
  retentionDays: number;
}

interface MetricConfiguration {
  name: string;
  type: MetricType;
  description: string;
  dimensions: string[]; // Tags/Labels for filtering (e.g., "region", "http_status", "client_id")
}

interface TraceConfiguration {
  contextPropagation: "W3C Trace Context" | "B3" | "Jaeger";
  samplingRate: {
    defaultPercentage: number;
    errorPercentage: number; // Often 100% to capture all errors
    criticalPaths: Record<string, number>; // Override for specific high-value endpoints
  };
}

interface RequiredDashboard {
  name: string;
  audience: "Executive" | "Engineering" | "Support";
  keyPanels: string[]; // Specific visual components that must be present
}

interface AlertRule {
  id: string;
  name: string;
  metricQuery: string; // The actual PromQL or Datadog query
  triggerCondition: string; // e.g., "> 5% error rate for 5 minutes"
  severity: AlertSeverity;
  routingTarget: string; // e.g., "PagerDuty: Platform-OnCall", "Slack: #alerts-nonprod"
  runbookRef: string; // Link to the Operational Runbook for resolution steps
}
