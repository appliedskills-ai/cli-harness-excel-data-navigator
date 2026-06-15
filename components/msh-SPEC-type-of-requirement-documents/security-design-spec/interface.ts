export type DataClassificationLevel = "Public" | "Internal" | "Confidential" | "Restricted";
export type SeverityLevel = "Low" | "Medium" | "High" | "Critical";
export type ThreatMethodology = "STRIDE" | "DREAD" | "PASTA" | "Custom";

export interface SecurityDesignSpec {
  id: string;
  metadata: SecurityMetadata;
  systemOverview: string;
  identityAndAccess: IdentityAndAccess;
  dataProtection: DataProtection;
  secretsManagement: SecretsManagement;
  threatModel: ThreatModel;
  auditAndMonitoring: AuditAndMonitoring;
  compliance: ComplianceConsiderations;
}

interface SecurityMetadata {
  title: string;
  author: string; // Usually a Security Architect or Lead Engineer
  reviewers: string[];
  status: "Draft" | "In Review" | "Approved" | "Deprecated";
  lastUpdated: string; // ISO 8601 Date
}

interface IdentityAndAccess {
  authentication: AuthnMechanism[];
  authorization: AuthzMechanism;
  mfaRequirements: string;
}

interface AuthnMechanism {
  type: "SSO" | "OIDC" | "SAML" | "Mutual TLS" | "API Key" | "JWT";
  provider: string; // e.g., "Okta", "AWS IAM", "Auth0"
  description: string;
}

interface AuthzMechanism {
  model: "RBAC" | "ABAC" | "PBAC";
  enforcementPoint: string; // Where the check happens (e.g., "API Gateway", "Middleware")
  roles: string[];
}

interface DataProtection {
  dataClassification: Record<DataClassificationLevel, string[]>; // Maps sensitivity levels to specific data types
  encryptionAtRest: EncryptionDetails;
  encryptionInTransit: EncryptionDetails;
  piiHandlingStrategy: string;
}

interface EncryptionDetails {
  algorithm: string; // e.g., "AES-256-GCM", "TLS 1.3"
  keyManagement: string; // e.g., "AWS KMS", "HashiCorp Vault"
}

interface SecretsManagement {
  storageMechanism: string;
  rotationPolicy: string;
  accessControl: string;
}

interface ThreatModel {
  methodology: ThreatMethodology;
  trustBoundaries: string[];
  identifiedThreats: Threat[];
  abuseCases: AbuseCase[];
}

interface Threat {
  id: string;
  description: string;
  category: string; // Based on methodology (e.g., "Spoofing", "Tampering")
  severity: SeverityLevel;
  mitigationStrategy: string;
  residualRisk: string; // The risk remaining after mitigation
}

interface AbuseCase {
  scenario: string;
  actor: string; // e.g., "Malicious Insider", "External Attacker", "Compromised Dependency"
  impact: string;
  preventionMechanism: string;
}

interface AuditAndMonitoring {
  loggedEvents: string[];
  logStorage: string; // e.g., "Splunk", "S3 Immutable Bucket"
  retentionPeriodDays: number;
  alertingTriggers: string[];
}

interface ComplianceConsiderations {
  applicableFrameworks: string[]; // e.g., ["SOC 2 Type II", "GDPR", "HIPAA"]
  mappedControls: Record<string, string>; // Keys are framework requirements, values are the system's implementation
}
