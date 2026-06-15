// src/config/catalogs.mjs
//
// Loader + shape validator for preset catalogs. Every catalog follows the standard
// envelope { version, id, kind, title, description, presets:[{ id, kind, label, detail, description }] }.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const ENVELOPE_FIELDS = ['version', 'id', 'kind', 'title', 'description'];
const PRESET_FIELDS = ['id', 'kind', 'label', 'detail', 'description'];

export function loadCatalog(path) {
  const raw = fs.readFileSync(path, 'utf8');
  const catalog = JSON.parse(raw);

  for (const f of ENVELOPE_FIELDS) {
    if (catalog[f] === undefined || catalog[f] === null) {
      throw new Error(`Invalid preset catalog (${path}): missing envelope field "${f}"`);
    }
  }
  if (!Array.isArray(catalog.presets)) {
    throw new Error(`Invalid preset catalog (${path}): "presets" must be an array`);
  }
  for (const [i, entry] of catalog.presets.entries()) {
    for (const f of PRESET_FIELDS) {
      if (entry[f] === undefined || entry[f] === null) {
        throw new Error(`Invalid preset catalog (${path}): presets[${i}] missing "${f}"`);
      }
    }
  }
  return catalog;
}

export function loadAnalysisModes() {
  const path = fileURLToPath(new URL('./presets/analysis-modes.json', import.meta.url));
  return loadCatalog(path).presets;
}
