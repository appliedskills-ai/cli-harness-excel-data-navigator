export type DocFramework = "Docusaurus" | "MkDocs" | "Hugo" | "Nextra" | "Vanilla GitHub";
export type DocStatus = "Draft" | "Published" | "Outdated" | "Deprecated";

export interface ModularDocsRepository {
  id: string;
  metadata: RepositoryMetadata;
  siteConfig: SiteConfiguration;
  files: Record<string, MarkdownFile>; // Keyed by filepath (e.g., "docs/data-model.md")
}

interface RepositoryMetadata {
  projectName: string;
  repositoryUrl: string;
  defaultBranch: string;
  primaryMaintainers: string[];
  lastCommitHash: string;
  lastUpdatedAt: string; // ISO 8601 Date
}

interface SiteConfiguration {
  framework: DocFramework;
  configFileRef: string; // e.g., "mkdocs.yml" or "docusaurus.config.js"
  navigationTree: NavigationNode[];
}

interface NavigationNode {
  title: string;
  filePathRef?: string; // Link to the markdown file
  externalLink?: string;
  children?: NavigationNode[]; // For nested sidebar folders
}

interface MarkdownFile {
  filename: string;
  directory: string;
  frontmatter: YamlFrontmatter;
  content: MarkdownContent;
  contributors: string[]; // Pulled from Git history
}

interface YamlFrontmatter {
  title: string;
  description: string;
  author?: string;
  date?: string; // ISO 8601 Date
  tags?: string[];
  status?: DocStatus;
  slug?: string; // Custom URL routing override
  [customProperty: string]: any; // Allow for framework-specific extensions (e.g., MDX props)
}

interface MarkdownContent {
  rawMarkdown: string;
  embeddedAssets: string[]; // Links to images or diagrams within the markdown
  referencedCodeSnippets: string[]; // Links to actual source code files included via plugins
}
