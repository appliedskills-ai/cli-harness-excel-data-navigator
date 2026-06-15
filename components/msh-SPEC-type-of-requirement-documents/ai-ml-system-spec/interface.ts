export type ModelProvider = "OpenAI" | "Anthropic" | "Google" | "Self-Hosted" | "AWS Bedrock";
export type HumanInTheLoopTrigger = "Confidence Threshold" | "High-Risk Action" | "Random Sample" | "None";

export interface AiMlSystemSpec {
  id: string;
  metadata: AiSpecMetadata;
  modelConfiguration: ModelConfiguration;
  contextAndData: ContextSources;
  safetyAndGuardrails: GuardrailConfig;
  reliability: ReliabilityAndFallbacks;
  evaluation: EvaluationCriteria;
  monitoringAndFinancials: OperationsAndCost;
}

interface AiSpecMetadata {
  title: string;
  author: string; // Typically an AI Engineer or Data Scientist
  systemRef: string; // Links back to the HLD or System ID
  status: "Draft" | "Review" | "Approved" | "Deprecated";
  lastUpdated: string; // ISO 8601 Date
}

interface ModelConfiguration {
  primaryModel: string; // e.g., "claude-3-5-sonnet-20240620"
  provider: ModelProvider;
  hyperparameters: {
    temperature: number;
    maxTokens: number;
    topP?: number;
  };
  systemPrompts: Record<string, string>; // Named prompts or paths to instruction files
}

interface ContextSources {
  retrievalStrategy: "RAG" | "Static Inject" | "Agentic Search" | "None";
  vectorDatabase?: string; // e.g., "Pinecone", "pgvector"
  injectedDataSchemas: string[]; // What specific data shapes are fed into the context window
  contextWindowLimit: number; // Hard limit on tokens before truncation
}

interface GuardrailConfig {
  inputValidation: string[]; // e.g., "Prompt Injection Detection", "PII Redaction"
  outputValidation: string[]; // e.g., "Valid JSON Enforcer", "AST Syntax Checker"
  guardrailAction: "Block and Retry" | "Block and Fallback" | "Flag for Review";
}

interface ReliabilityAndFallbacks {
  fallbackModel?: string; // Cheaper or more highly available model if primary fails
  heuristicFallback?: string; // Non-AI deterministic logic to run if all models fail
  humanReview: {
    trigger: HumanInTheLoopTrigger;
    threshold?: number; // e.g., 0.85 confidence
    routingQueue: string; // e.g., "Jira: Manual Code Review"
  };
}

interface EvaluationCriteria {
  offlineEvaluation: {
    datasetRef: string; // Link to the golden dataset for testing
    metrics: string[]; // e.g., "ROUGE-L", "Exact Match", "Human Preference Elo"
  };
  onlineEvaluation: {
    implicitFeedback: string[]; // e.g., "User accepted PR without edits"
    explicitFeedback: string[]; // e.g., "Thumbs up/down buttons"
  };
}

interface OperationsAndCost {
  costControls: {
    maxBudgetPerDayUsd: number;
    maxTokensPerSession: number;
    alertThresholds: number[]; // e.g., [50, 75, 90, 100] percentages of budget
  };
  telemetry: {
    logInputsAndOutputs: boolean;
    complianceRetentionDays: number;
  };
}
