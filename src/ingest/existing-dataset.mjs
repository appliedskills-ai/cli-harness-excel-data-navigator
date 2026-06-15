// src/ingest/existing-dataset.mjs
//
// Detect a name collision against the dataset catalog, prompt for one of the four
// idea-mandated actions, and route the choice to the matching DB helper. This module is the
// dispatcher; the DB modules own the mutations.
import * as p from '@clack/prompts';
import { createTable, bulkInsert, appendRecords, replaceTable } from '../db/tables.mjs';
import { findByName, writeDatasetMeta, nextVersion } from '../db/metadata.mjs';

export const ACTIONS = Object.freeze({
  CONTINUE: 'CONTINUE',
  REPLACE: 'REPLACE',
  APPEND: 'APPEND',
  NEW_VERSION: 'NEW_VERSION',
});

/**
 * If the dataset exists, prompt for an action. Returns { existing, action }.
 * action is null when there is no existing dataset (caller does a fresh create).
 */
export async function promptExistingAction(name) {
  const existing = findByName(name);
  if (!existing) return { existing: null, action: null };

  const action = await p.select({
    message: `Dataset "${name}" already exists (v${existing.version}). What next?`,
    options: [
      { value: ACTIONS.CONTINUE, label: 'Continue using existing' },
      { value: ACTIONS.REPLACE, label: 'Re-ingest and replace' },
      { value: ACTIONS.APPEND, label: 'Append new records' },
      { value: ACTIONS.NEW_VERSION, label: 'Create new dataset version' },
    ],
  });
  if (p.isCancel(action)) {
    p.cancel('Ingestion cancelled.');
    process.exit(0);
  }
  return { existing, action };
}

/**
 * Detect collision, prompt, and apply the chosen action.
 * @param {{ name: string, columnDefs: object[], rows: any[][] }} input
 * @returns {Promise<object>} the resulting dataset metadata row
 */
export async function routeIngest(input) {
  const { name, columnDefs, rows } = input;
  const { existing, action } = await promptExistingAction(name);

  if (!existing) {
    createTable(name, columnDefs);
    const count = bulkInsert(name, columnDefs, rows);
    return writeDatasetMeta({ name, rowCount: count, columnDefs, version: 1, tableName: name });
  }

  switch (action) {
    case ACTIONS.CONTINUE:
      return existing; // no writes
    case ACTIONS.REPLACE:
      return replaceTable(existing, columnDefs, rows);
    case ACTIONS.APPEND:
      return appendRecords(existing, columnDefs, rows);
    case ACTIONS.NEW_VERSION:
      return nextVersion(existing, columnDefs, rows);
    default:
      throw new Error(`Unknown ingest action: ${action}`);
  }
}
