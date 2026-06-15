export type AdrStatus = "Proposed" | "Accepted" | "Rejected" | "Deprecated" | "Superseded";

export interface ArchitectureDecisionRecord {
  id: string;
  metadata: AdrMetadata;
  context: string;
  decision: string;
  alternativesConsidered: Alternative[];
  consequences: Consequences;
  relatedDocuments?: RelatedDocuments;
}

interface AdrMetadata {
  title: string;
  author: string;
  date: string; // ISO 8601 Date
  status: AdrStatus;
  tags: string[];
}

interface Alternative {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  reasonForRejection: string;
}

interface Consequences {
  positive: string[];
  negative: string[];
  neutral: string[]; // Trade-offs that are neither strictly good nor bad, just facts of the new reality
}

interface RelatedDocuments {
  supersedes?: string[]; // IDs of older ADRs this decision invalidates
  supersededBy?: string; // ID of a newer ADR that replaced this one
  references?: string[]; // Links to relevant HLDs, SDSs, or external research
}
