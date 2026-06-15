export type PlanStatus = "Draft" | "In Review" | "Approved" | "Archived";
export type RequirementType = "Business" | "Stakeholder" | "Functional" | "Non-Functional" | "Transition";
export type ElicitationTechnique = "Interview" | "Workshop" | "Survey" | "Observation" | "Document Analysis" | "Prototyping";

export interface BusinessAnalysisPlan {
  id: string;
  metadata: PlanMetadata;
  rolesAndResponsibilities: RoleDefinition[];
  elicitationStrategy: ElicitationStrategy;
  requirementsLifecycle: RequirementsLifecycle;
  traceabilityApproach: TraceabilityApproach;
  changeControlProcess: ChangeControlProcess;
  communicationPlan: CommunicationPlan[];
}

interface PlanMetadata {
  title: string;
  businessAnalystLead: string;
  projectRef: string; // ID of the overarching project or initiative
  status: PlanStatus;
  lastUpdated: string; // ISO 8601 Date
}

interface RoleDefinition {
  roleName: string;
  assignedTo: string; // Name or Team
  responsibilities: string[];
  signOffAuthority: boolean; // Does this role have the power to baseline requirements?
}

interface ElicitationStrategy {
  primaryTechniques: ElicitationTechnique[];
  toolsUsed: string[]; // e.g., "Miro", "Zoom", "Typeform"
  keyActivities: ElicitationActivity[];
}

interface ElicitationActivity {
  activityName: string;
  technique: ElicitationTechnique;
  targetStakeholders: string[]; // Roles or names from the RoleDefinition array
  expectedOutcome: string;
}

interface RequirementsLifecycle {
  repositoryTool: string; // e.g., "Jira", "Confluence", "IBM DOORS"
  typesTracked: RequirementType[];
  prioritizationFramework: string; // e.g., "MoSCoW", "Kano Model", "WSJF"
  validationSteps: string[]; // Sequential steps a requirement takes from 'Draft' to 'Approved'
}

interface TraceabilityApproach {
  traceabilityTool: string;
  linkageModel: string[]; // e.g., ["Business Goal", "Epic", "User Story", "Test Case"]
  attributesTracked: string[]; // Metadata tracked per requirement (e.g., "Status", "Priority", "Owner")
}

interface ChangeControlProcess {
  changeRequestMechanism: string; // How stakeholders ask for a change after baselining
  impactAnalysisSLA: string; // Timeframe allowed to assess the impact of a change
  changeControlBoard: string[]; // Roles that must approve a post-baseline change
  versioningScheme: string; // e.g., "Semantic (v1.0 for baselined, v1.x for approved changes)"
}

interface CommunicationPlan {
  reportName: string;
  frequency: "Daily" | "Weekly" | "Bi-Weekly" | "Monthly" | "Milestone-Driven";
  audience: string[];
  deliveryMethod: string; // e.g., "Automated Jira Dashboard", "Email PDF", "SteerCo Meeting"
}
