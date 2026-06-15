// src/export/doc-types.mjs
//
// The seam over the vendored requirement-document spec — the ONLY file that reads
// components/msh-SPEC-type-of-requirement-documents. Each doc type is a directory with a README.md
// (a `# Title`, an Overview paragraph, and a `## Schema` field table) and an interface.ts. If the
// spec's layout changes, only this file changes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SPEC_ROOT = fileURLToPath(
  new URL('../../components/msh-SPEC-type-of-requirement-documents/', import.meta.url),
);

// Parse the first-column field names from the markdown table under a `## Schema` heading.
function parseFields(readme) {
  const lines = readme.split('\n');
  const start = lines.findIndex((l) => /^##\s+Schema/i.test(l));
  if (start < 0) return [];
  const fields = [];
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i].trim();
    if (l.startsWith('##')) break; // next section
    const m = l.match(/^\|\s*`?([^`|]+?)`?\s*\|/);
    if (m) {
      const name = m[1].trim();
      if (name && !/^field$/i.test(name) && !/^-+$/.test(name)) fields.push(name);
    }
  }
  return fields;
}

function parseEntry(dir) {
  const readmePath = path.join(SPEC_ROOT, dir, 'README.md');
  if (!fs.existsSync(readmePath)) return null;
  const readme = fs.readFileSync(readmePath, 'utf8');
  const title = readme.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? dir;
  const desc = readme.split('\n').map((l) => l.trim()).find((l) => l && !l.startsWith('#')) ?? '';
  return { id: dir, label: title, description: desc, fields: parseFields(readme) };
}

/** Load the doc-type catalog: [{ id, label, description, fields }]. */
export async function loadDocTypeCatalog() {
  if (!fs.existsSync(SPEC_ROOT)) return [];
  return fs
    .readdirSync(SPEC_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
    .map((d) => parseEntry(d.name))
    .filter(Boolean);
}

/**
 * Resolve a user's request to a catalog entry: exact id/label first, then a case-insensitive
 * label/description contains match; otherwise { matched: false }.
 */
export function matchDocType(query, catalog) {
  const q = String(query).trim().toLowerCase();
  const exact = catalog.find((e) => e.id.toLowerCase() === q || e.label.toLowerCase() === q);
  if (exact) return exact;
  const contains = catalog.find(
    (e) => e.label.toLowerCase().includes(q) || e.description.toLowerCase().includes(q),
  );
  return contains ?? { matched: false };
}
