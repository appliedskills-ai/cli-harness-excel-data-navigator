export type ProtocolType = "REST" | "GraphQL" | "gRPC" | "AMQP" | "Kafka" | "Webhook" | "SOAP" | "SFTP";
export type PayloadFormat = "JSON" | "XML" | "Protobuf" | "Avro" | "CSV" | "EDI";
export type RetryStrategy = "Exponential Backoff" | "Fixed Interval" | "Immediate" | "None";

export interface IntegrationDesignSpec {
  id: string;
  metadata: IntegrationMetadata;
  systems: ConnectedSystems;
  connectionDetails: ConnectionDetails;
  dataContract: DataContract;
  resilience: ResilienceStrategy;
  errorHandling: ErrorHandling;
  security: SecurityRequirements;
}

interface IntegrationMetadata {
  title: string;
  author: string;
  status: "Draft" | "Review" | "Approved" | "Deprecated";
  businessContext: string; // Why this integration exists
  thirdPartyDependencies?: string[]; // e.g., "Figma Enterprise", "Stripe"
}

interface ConnectedSystems {
  sourceSystem: SystemDetail;
  targetSystem: SystemDetail;
  middleware?: SystemDetail; // e.g., an API Gateway, ESB, or Kafka cluster sitting in the middle
}

interface SystemDetail {
  name: string;
  ownerTeam: string;
  internalOrExternal: "Internal" | "External";
}

interface ConnectionDetails {
  pattern: "Request/Reply" | "Fire and Forget" | "Pub/Sub" | "Batch Streaming" | "Polling";
  protocol: ProtocolType;
  syncVsAsync: "Synchronous" | "Asynchronous";
  expectedThroughput: string; // e.g., "500 msgs/sec" or "10GB daily batch"
}

interface DataContract {
  format: PayloadFormat;
  schemaRegistryUrl?: string; // Link to the exact schema definition (e.g., Protobuf/Avro schema)
  eventRoutingKey?: string; // For message brokers like RabbitMQ/Kafka
  samplePayloadRef: string; // Link or reference to a payload example
}

interface ResilienceStrategy {
  timeouts: {
    connectionTimeoutMs: number;
    readTimeoutMs: number;
  };
  retryPolicy: {
    strategy: RetryStrategy;
    maxAttempts: number;
    initialIntervalMs?: number;
    maxIntervalMs?: number;
  };
  circuitBreaker: {
    enabled: boolean;
    failureThresholdPercentage?: number;
    resetTimeoutMs?: number;
  };
}

interface ErrorHandling {
  idempotencyGuarantee: boolean;
  idempotencyKey?: string; // Which field ensures duplicate messages aren't processed twice
  deadLetterQueue?: DeadLetterQueueConfig;
  alertingRules: string[];
}

interface DeadLetterQueueConfig {
  enabled: boolean;
  destination: string; // e.g., "sqs-ingestion-dlq"
  reprocessingStrategy: "Manual" | "Automated Script" | "Discard";
}

interface SecurityRequirements {
  authentication: "mTLS" | "OAuth2" | "API Key" | "HMAC Signature" | "None";
  encryptionInTransit: string; // e.g., "TLS 1.3"
  dataMaskingRequired: boolean; // Are there PII/PCI fields that need masking?
}
