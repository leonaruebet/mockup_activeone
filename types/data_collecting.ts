import type { DatasetRaw, ScraperRun } from '@shared/db/types';

type SerializableId = string;
type SerializableDate = string;

export type DatasetRowRecord = Omit<
  DatasetRaw,
  '_id' | 'run_id' | 'config_id' | 'org_id' | 'created_at' | 'updated_at'
> & {
  _id: SerializableId;
  run_id: SerializableId;
  config_id: SerializableId;
  org_id: SerializableId;
  created_at: SerializableDate;
  updated_at: SerializableDate;
};

export type ScraperRunRecord = Omit<
  ScraperRun,
  '_id' | 'config_id' | 'org_id' | 'created_at' | 'updated_at' | 'started_at' | 'completed_at'
> & {
  _id: SerializableId;
  config_id: SerializableId;
  org_id: SerializableId;
  created_at: SerializableDate;
  updated_at: SerializableDate;
  started_at?: SerializableDate | null;
  completed_at?: SerializableDate | null;
};

/**
 * derive_run_duration_seconds
 * Purpose: Compute run duration in whole seconds from serialized timestamps.
 */
export function derive_run_duration_seconds(run: ScraperRunRecord): number | null {
  const start = run.started_at ? new Date(run.started_at).getTime() : null;
  const end = run.completed_at ? new Date(run.completed_at).getTime() : null;
  if (start === null || end === null || Number.isNaN(start) || Number.isNaN(end)) {
    return null;
  }
  const diff = end - start;
  if (!Number.isFinite(diff) || diff < 0) {
    return null;
  }
  return Math.round(diff / 1000);
}

/**
 * derive_run_items_collected
 * Purpose: Normalize the items collected count for UI display.
 */
export function derive_run_items_collected(run: ScraperRunRecord): number {
  return typeof run.items_collected === 'number' && run.items_collected >= 0 ? run.items_collected : 0;
}
