export type Percentile = "p50" | "p90" | "p95" | "p99" | "p99.9";
export type CacheStrategyType = "Write-Through" | "Write-Behind" | "Cache-Aside" | "Read-Through" | "None";

export interface PerformanceScalabilitySpec {
  id: string;
  metadata: PerformanceMetadata;
  loadAssumptions: LoadAssumptions;
  serviceLevelAgreements: SLAConfig;
  concurrencyModel: ConcurrencyConfig;
  cachingStrategy: CachingStrategy[];
  scalingLimits: ScalingLimits;
  loadTestingRequirements: LoadTestingPlan;
}

interface PerformanceMetadata {
  title: string;
  author: string; // Usually a Performance Engineer or Architect
  systemRef: string; // ID of the system this spec applies to
  status: "Draft" | "Review" | "Approved" | "Deprecated";
  lastUpdated: string; // ISO 8601 Date
}

interface LoadAssumptions {
  baselineTraffic: TrafficProfile;
  peakTraffic: TrafficProfile;
  expectedAnnualGrowthPercentage: number;
  seasonality: string; // e.g., "Black Friday spikes", "End of month reporting"
}

interface TrafficProfile {
  requestsPerSecond: number;
  concurrentActiveUsers: number;
  averagePayloadSizeBytes: number;
}

interface SLAConfig {
  latencyTargets: Record<Percentile, string>; // e.g., { "p99": "200ms" }
  throughputTargets: ThroughputTarget[];
  availabilityTarget: string; // e.g., "99.99%"
}

interface ThroughputTarget {
  operationName: string; // e.g., "Design Ingestion", "Code Generation"
  targetUnitsPerSecond: number;
}

interface ConcurrencyConfig {
  maxConcurrentConnections: number;
  threadPoolSize?: number;
  connectionPoolConfig: {
    database: number;
    redis: number;
    externalApis: number;
  };
  backpressureStrategy: "Drop Requests" | "Queue" | "Rate Limit (429)";
}

interface CachingStrategy {
  layerName: string; // e.g., "API Gateway Edge Cache", "Redis Session Cache"
  strategyType: CacheStrategyType;
  ttlSeconds: number;
  evictionPolicy: "LRU" | "LFU" | "FIFO" | "TTL-Only";
  expectedHitRatePercentage: number;
}

interface ScalingLimits {
  identifiedBottlenecks: string[]; // Hardware or software limits
  maxScaleOutInstances: number;
  databaseConnectionLimit: number;
  externalQuotaLimits: Record<string, string>; // e.g., { "OpenAI": "10,000 TPM" }
}

interface LoadTestingPlan {
  tool: string;
  targetScenarios: string[];
  successCriteria: string[];
}
