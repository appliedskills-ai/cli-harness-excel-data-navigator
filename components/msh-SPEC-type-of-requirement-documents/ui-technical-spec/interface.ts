export type StateScope = "Global" | "Feature" | "Local";
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface UiTechnicalSpec {
  id: string;
  metadata: UiMetadata;
  overview: string;
  stateManagement: StateManagement;
  componentStructure: ComponentArchitecture;
  routing: RoutingConfig;
  apiBindings: ApiIntegration[];
  analytics: AnalyticsConfig;
  accessibility: AccessibilityStandard;
  responsiveBehavior: ResponsiveDesign;
}

interface UiMetadata {
  title: string;
  author: string; // Usually a Frontend Tech Lead
  reviewers: string[];
  status: "Draft" | "In Review" | "Approved";
  lastUpdated: string; // ISO 8601 Date
}

interface StateManagement {
  library: string; // e.g., "Zustand", "Redux Toolkit", "React Context"
  stores: StateStore[];
  cachingStrategy: string; // e.g., "React Query with 5-minute stale time"
}

interface StateStore {
  name: string;
  scope: StateScope;
  managedData: string[]; // e.g., ["Active Component AST", "User Session"]
  mutations: string[]; // Key actions that modify this state
}

interface ComponentArchitecture {
  stylingSolution: string; // e.g., "styled-components", "Tailwind CSS", "CSS Modules"
  designSystemRef: string; // Link to Figma or Storybook
  coreViews: ViewDefinition[];
  sharedComponents: string[]; // Reusable primitives (e.g., "Button", "DataGrid")
}

interface ViewDefinition {
  name: string;
  route: string;
  layout: string;
  childComponents: string[];
  errorBoundaries: string; // What happens when a child component crashes
}

interface RoutingConfig {
  routerLibrary: string; // e.g., "React Router v6", "Next.js App Router"
  routes: RouteDefinition[];
  navigationGuards: string[]; // e.g., ["RequireAuth", "RequireAdminRole"]
}

interface RouteDefinition {
  path: string;
  component: string;
  lazyLoaded: boolean;
  guardsApplied: string[];
}

interface ApiIntegration {
  endpointRef: string; // Link back to the API Specification ID
  method: HttpMethod;
  trigger: "On Mount" | "User Action" | "Polling";
  optimisticUI: boolean; // Does the UI update before the server responds?
  loadingState: string; // e.g., "Skeleton Loader", "Spinner"
  errorHandling: string; // e.g., "Toast Notification", "Inline Error Text"
}

interface AnalyticsConfig {
  provider: string; // e.g., "Mixpanel", "Google Analytics", "PostHog"
  trackedEvents: TrackingEvent[];
}

interface TrackingEvent {
  eventName: string; // e.g., "Component_Generated", "AST_Copied"
  trigger: string;
  payloadProps: string[];
}

interface AccessibilityStandard {
  targetCompliance: "WCAG 2.1 AA" | "WCAG 2.1 AAA" | "Section 508";
  ariaRoles: Record<string, string>; // Specific complex components and their required roles
  keyboardNavigation: string[]; // Expected tab order and shortcut keys
  screenReaderTesting: string[]; // Tools required for testing (e.g., "VoiceOver", "NVDA")
}

interface ResponsiveDesign {
  strategy: "Mobile First" | "Desktop First";
  breakpoints: Record<string, string>; // e.g., { "sm": "640px", "md": "768px", "lg": "1024px" }
  layoutShifts: string[]; // Descriptions of major UI changes across breakpoints
}
