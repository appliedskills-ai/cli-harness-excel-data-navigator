# Docs-as-Code Repository

Models a documentation site managed **as code** — a static-site framework (Docusaurus / MkDocs / Hugo / Nextra), its navigation tree, and a map of versioned Markdown files with frontmatter.

## Overview

This spec represents a documentation repository the way Git sees it: site config + framework, a nested navigation tree, and a `files` map keyed by filepath. Each Markdown file carries YAML frontmatter, raw content, embedded assets, referenced code snippets, and contributors pulled from Git history.

## Schema

Root interface: `ModularDocsRepository` (`interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Project name, repo URL, default branch, maintainers, last commit hash |
| `siteConfig` | Framework, config file ref, nested `navigationTree` |
| `files` | Filepath → Markdown file (frontmatter, content, contributors) |
| `files[].frontmatter` | Title, description, tags, status, slug + framework extensions |
| `files[].content` | Raw Markdown, embedded assets, referenced code snippets |

**Frameworks:** Docusaurus · MkDocs · Hugo · Nextra · Vanilla GitHub

## Example

- [`examples/openauth-proxy.json`](examples/openauth-proxy.json) — docs repository for an OpenAuth proxy project.
