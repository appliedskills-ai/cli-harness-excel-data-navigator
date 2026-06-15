export type EnvironmentTier = "Development" | "Staging" | "Production" | "Disaster Recovery";
export type DeploymentStrategy = "Rolling" | "Blue/Green" | "Canary" | "Recreate";
export type HostingModel = "Kubernetes" | "Serverless" | "Virtual Machines" | "PaaS";

export interface InfrastructureDeploymentSpec {
  id: string;
  metadata: InfraMetadata;
  environments: Record<EnvironmentTier, EnvironmentConfig>;
  networking: NetworkingConfig;
  ciCd: CiCdPipeline;
  secretsManagement: SecretsConfig;
  observability: ObservabilityConfig;
  deploymentAndRollback: DeploymentAndRollback;
}

interface InfraMetadata {
  title: string;
  author: string;
  platformTeamOwner: string;
  status: "Draft" | "Review" | "Approved" | "Provisioned";
  lastUpdated: string; // ISO 8601 Date
}

interface EnvironmentConfig {
  accountId: string; // e.g., AWS Account ID or GCP Project ID
  region: string; // e.g., "us-east-1"
  hostingModel: HostingModel;
  computeDetails: Record<string, string>; // e.g., { "instanceType": "m5.large", "ami": "ami-0abcdef123" }
  scaling: ScalingPolicy;
}

interface ScalingPolicy {
  minInstances: number;
  maxInstances: number;
  targetUtilizationPercent: number;
  scaleOutCooldownSeconds: number;
  scaleInCooldownSeconds: number;
}

interface NetworkingConfig {
  vpcIdRef: string;
  subnets: "Public" | "Private" | "Isolated";
  ingressRules: SecurityRule[];
  egressRules: SecurityRule[];
  dnsAndTls: DnsConfig;
}

interface SecurityRule {
  protocol: "TCP" | "UDP" | "ICMP" | "All";
  portRange: string;
  sourceOrDestination: string; // CIDR block, Security Group ID, or "0.0.0.0/0"
  description: string;
}

interface DnsConfig {
  domainName: string;
  loadBalancerType: "Application" | "Network" | "None";
  certificateManager: string; // e.g., "AWS ACM" or "Let's Encrypt"
}

interface CiCdPipeline {
  sourceRepository: string;
  buildRunner: string; // e.g., "GitHub Actions", "TeamCity"
  artifactRegistry: string; // e.g., "AWS ECR", "JFrog Artifactory"
  deploymentTool: string; // e.g., "ArgoCD", "AWS CodeDeploy"
  requiredChecks: string[]; // e.g., ["SonarQube", "Snyk Container Scan", "Unit Tests"]
}

interface SecretsConfig {
  provider: string; // e.g., "HashiCorp Vault", "AWS Secrets Manager"
  injectedVia: "Environment Variables" | "File Mounts" | "Sidecar Proxy";
  rotationPolicyDays: number;
}

interface ObservabilityConfig {
  metricsProvider: string; // e.g., "Datadog", "Prometheus"
  logsProvider: string; // e.g., "Splunk", "Elasticsearch"
  tracingProvider: string; // e.g., "OpenTelemetry", "AWS X-Ray"
  criticalAlerts: AlertRule[];
}

interface AlertRule {
  metric: string;
  threshold: string;
  evaluationWindow: string; // e.g., "5 minutes"
  routingKey: string; // e.g., "PagerDuty-High-Urgency"
}

interface DeploymentAndRollback {
  strategy: DeploymentStrategy;
  promotionFlow: EnvironmentTier[]; // e.g., ["Development", "Staging", "Production"]
  automatedRollbackTriggers: string[];
  manualRollbackRunbookUrl: string;
}
