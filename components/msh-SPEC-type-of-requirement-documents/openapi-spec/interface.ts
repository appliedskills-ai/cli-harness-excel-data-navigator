//industry-standard OpenAPI Specification (OAS 3.x).

export type HttpMethod = "get" | "put" | "post" | "delete" | "options" | "head" | "patch" | "trace";
export type ParameterLocation = "query" | "header" | "path" | "cookie";

export interface OpenApiSpec {
  openapi: string; // e.g., "3.0.3"
  info: ApiInfo;
  servers: Server[];
  tags?: Tag[];
  paths: Record<string, PathItem>; // Key is the endpoint URL path, e.g., "/api/v1/components"
  components?: Components;
  security?: Record<string, string[]>[];
}

interface ApiInfo {
  title: string;
  description?: string;
  version: string;
  contact?: {
    name?: string;
    url?: string;
    email?: string;
  };
  license?: {
    name: string;
    url?: string;
  };
}

interface Server {
  url: string;
  description?: string;
}

interface Tag {
  name: string;
  description?: string;
}

interface PathItem {
  summary?: string;
  description?: string;
  // Dynamic keys for HTTP methods (get, post, etc.) mapping to an Operation object
  [method: string]: Operation | string | undefined; 
}

interface Operation {
  tags?: string[];
  summary?: string;
  description?: string;
  operationId?: string; // Crucial for SDK generation
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses: Record<string, ApiResponse>; // Key is HTTP status code, e.g., "200", "404"
  security?: Record<string, string[]>[];
  deprecated?: boolean;
}

interface Parameter {
  name: string;
  in: ParameterLocation;
  description?: string;
  required?: boolean;
  schema?: SchemaObject | ReferenceObject;
}

interface RequestBody {
  description?: string;
  content: Record<string, MediaType>; // Key is mime type, e.g., "application/json"
  required?: boolean;
}

interface ApiResponse {
  description: string;
  content?: Record<string, MediaType>;
  headers?: Record<string, HeaderObject>;
}

interface MediaType {
  schema?: SchemaObject | ReferenceObject;
  example?: any;
}

interface HeaderObject {
  description?: string;
  schema?: SchemaObject | ReferenceObject;
}

interface Components {
  schemas?: Record<string, SchemaObject | ReferenceObject>;
  securitySchemes?: Record<string, SecurityScheme>;
}

interface SecurityScheme {
  type: "apiKey" | "http" | "mutualTLS" | "oauth2" | "openIdConnect";
  description?: string;
  name?: string; // Required for apiKey
  in?: "query" | "header" | "cookie"; // Required for apiKey
  scheme?: "bearer" | "basic"; // Required for http
  bearerFormat?: "JWT" | string;
}

interface SchemaObject {
  type?: "object" | "array" | "string" | "number" | "integer" | "boolean";
  format?: string; // e.g., "uuid", "date-time"
  properties?: Record<string, SchemaObject | ReferenceObject>;
  items?: SchemaObject | ReferenceObject; // Required if type is "array"
  required?: string[];
  description?: string;
  example?: any;
}

interface ReferenceObject {
  $ref: string; // e.g., "#/components/schemas/ComponentAst"
}
