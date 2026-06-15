export type TestSpecStatus = "Draft" | "Review" | "Approved" | "Deprecated";
export type TestLevel = "Unit" | "Integration" | "System" | "E2E" | "UAT";

export interface TestDesignSpec {
  id: string;
  metadata: TestMetadata;
  strategyOverview: string;
  acceptanceCriteria: AcceptanceCriterion[];
  testingLevels: TestingLevels;
  nonFunctionalTesting: NonFunctionalTesting;
  testDataManagement: TestDataManagement;
  testEnvironments: TestEnvironment[];
}

interface TestMetadata {
  title: string;
  author: string; // Usually a QA Lead or SDET
  engineeringLead: string;
  status: TestSpecStatus;
  lastUpdated: string; // ISO 8601 Date
}

interface AcceptanceCriterion {
  id: string;
  featureRef: string; // Link to Jira ticket, PR, or PRD requirement
  description: string;
  testType: TestLevel;
}

interface TestingLevels {
  unit: LevelConfig;
  integration: LevelConfig;
  e2e: E2EConfig;
}

interface LevelConfig {
  frameworks: string[]; // e.g., ["Jest", "PyTest"]
  coverageTargetPercentage: number;
  focusAreas: string[];
}

interface E2EConfig extends LevelConfig {
  criticalUserJourneys: string[]; // High-level flows that must not break
  crossPlatformTargeting?: string[]; // e.g., ["Chrome Desktop", "Safari iOS"]
}

interface NonFunctionalTesting {
  performance: PerformanceConfig;
  security: SecurityConfig;
}

interface PerformanceConfig {
  tools: string[]; // e.g., ["k6", "JMeter", "Artillery"]
  loadTargets: {
    concurrentUsers: number;
    requestsPerSecond: number;
    p99LatencyMs: number;
  };
  enduranceTestingRequired: boolean;
}

interface SecurityConfig {
  tools: string[]; // e.g., ["Snyk", "TruffleHog", "OWASP ZAP"]
  penetrationTestingRequired: boolean;
  complianceChecks: string[]; // e.g., ["Check for unmasked PII in logs"]
}

interface TestDataManagement {
  generationStrategy: "Synthetic" | "Production-Masked" | "Static Mocks" | "Ephemeral Factory";
  refreshCadence: string; // e.g., "On every PR", "Nightly DB clone"
  dataDependencies: string[]; // e.g., "Valid OAuth tokens", "Mock Figma webhooks"
}

interface TestEnvironment {
  tier: "Local" | "CI" | "Staging" | "UAT";
  infrastructureRef: string; // Link to specific Infra/Deployment environment
  mockedExternalServices: string[];
}
