export type FitStatus = "PRESENT" | "PARTIAL" | "MISSING";

export interface FitMatrixDocument {
  title: string;
  metadata: MatrixMetadata;
  legend: Record<FitStatus, string>;
  capabilities: CapabilityRow[];
  aggregateCounts: AggregateCounts;
}

interface MatrixMetadata {
  description: string;
  lastUpdated: string; // ISO 8601 Date
  surfacesEvaluated: string[];
}

interface CapabilityRow {
  id: string;
  expectation: string;
  category?: string; // Derived from the ID prefix (e.g., "1" = Trigger, "2" = Data Source)
  surfaces: {
    sdk: EvaluationCell;
    useCase: EvaluationCell;
    examples: EvaluationCell;
  };
}

interface EvaluationCell {
  status: FitStatus;
  notes: string; // The supporting evidence or explanation for the status
}

interface AggregateCounts {
  sdk: SurfaceTally;
  useCase: SurfaceTally;
  examples: SurfaceTally;
}

interface SurfaceTally {
  present: number;
  partial: number;
  missing: number;
}
