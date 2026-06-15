export type ApiProtocol = "REST" | "GraphQL" | "gRPC" | "WebSocket";
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";
export type AuthType = "API Key" | "OAuth2" | "JWT" | "Basic Auth" | "Mutual TLS" | "None";

export interface ApiSpecification {
  id: string;
  metadata: ApiMetadata;
  servers: ServerEnvironment[];
  securitySchemes: SecurityScheme[];
  rateLimits: GlobalRateLimit;
  endpoints: ApiEndpoint[];
  sharedModels: Record<string, DataModel>; // Centralized schemas (like OpenAPI components/schemas)
}

interface ApiMetadata {
  title: string;
  description: string;
  version: string; // e.g., "v1.2.0"
  protocol: ApiProtocol;
  contactEmail?: string;
}

interface ServerEnvironment {
  environment: "Development" | "Staging" | "Production";
  baseUrl: string;
  description: string;
}

interface SecurityScheme {
  id: string;
  type: AuthType;
  description: string;
  tokenUrl?: string; // Necessary for OAuth2 flows
  scopes?: Record<string, string>; // e.g., { "read:components": "Read access to UI components" }
  headerName?: string; // e.g., "Authorization" or "X-API-Key"
}

interface GlobalRateLimit {
  requestsPerWindow: number;
  windowDurationSeconds: number;
  description: string;
  headersReturned: string[]; // e.g., ["X-RateLimit-Limit", "X-RateLimit-Remaining"]
}

interface ApiEndpoint {
  id: string;
  path: string;
  method: HttpMethod;
  summary: string;
  description: string;
  securityRequired: string[]; // Array of SecurityScheme IDs
  parameters: ApiParameter[];
  requestBody?: RequestBody;
  responses: Record<string, ApiResponse>; // Keyed by HTTP status code (e.g., "200", "400")
  deprecated: boolean;
}

interface ApiParameter {
  name: string;
  in: "path" | "query" | "header" | "cookie";
  required: boolean;
  schemaType: string;
  description: string;
  example?: string | number;
}

interface RequestBody {
  contentType: string; // e.g., "application/json", "application/x-protobuf"
  schemaRef: string; // Reference key to sharedModels
  required: boolean;
  example?: any;
}

interface ApiResponse {
  description: string;
  content?: Record<string, ResponseContent>; // Keyed by content type
  headers?: Record<string, string>; // Expected response headers
}

interface ResponseContent {
  schemaRef: string; // Reference key to sharedModels
  example?: any;
}

interface DataModel {
  type: "object" | "array" | "string" | "integer" | "boolean";
  description?: string;
  properties?: Record<string, ModelProperty>;
  required?: string[];
}

interface ModelProperty {
  type: string;
  format?: string; // e.g., "uuid", "date-time", "email"
  description?: string;
  example?: any;
}
