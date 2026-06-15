export type AgileStatus = "Backlog" | "To Do" | "In Progress" | "In Review" | "Done";
export type StoryPoints = 1 | 2 | 3 | 5 | 8 | 13 | 21; // Standard Fibonacci sizing
export type PriorityLevel = "Highest" | "High" | "Medium" | "Low" | "Lowest";

export interface AgileEpic {
  id: string; // e.g., "EPIC-42"
  metadata: EpicMetadata;
  description: string;
  businessValue: string; // The strategic reason this epic exists
  userStories: UserStory[];
}

interface EpicMetadata {
  title: string;
  owner: string; // Usually the Product Manager
  status: AgileStatus;
  targetReleaseVersion: string; // e.g., "v2.1" or "Q3 Release"
  labels: string[];
}

interface UserStory {
  id: string; // e.g., "STORY-105"
  metadata: StoryMetadata;
  storyStatement: StoryStatement;
  acceptanceCriteria: AcceptanceCriterion[];
  technicalTasksRef?: string[]; // Links to implementation sub-tasks (e.g., LLDs or PRs)
}

interface StoryMetadata {
  title: string;
  assignee?: string; // Developer or team picking up the work
  status: AgileStatus;
  storyPoints?: StoryPoints;
  priority: PriorityLevel;
  labels: string[];
}

interface StoryStatement {
  role: string;    // The "As a..." clause
  feature: string; // The "I want..." clause
  benefit: string; // The "so that..." clause
}

interface AcceptanceCriterion {
  id: string;
  title: string;
  scenarios: GherkinScenario[]; // Multiple scenarios can exist under one AC
}

interface GherkinScenario {
  scenarioName: string;
  given: string[]; // Preconditions / Initial State
  when: string[];  // Actions / Triggers
  then: string[];  // Expected Outcomes / Validations
}
