// src/modes/search/charts.mjs
//
// Terminal charts using ONLY ASCII / box-drawing characters — zero rendering dependencies, output
// stays copy-pasteable into logs and tickets. Empty / single-value series are handled gracefully.
const BLOCKS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

/** Horizontal bar chart from { label, value }[]. */
export function barChart(buckets, { width = 40 } = {}) {
  if (!buckets || buckets.length === 0) return '(no data)';
  const max = Math.max(...buckets.map((b) => Math.abs(b.value)), 0);
  if (max === 0) return buckets.map((b) => `${b.label}: 0`).join('\n');
  const labelW = Math.max(...buckets.map((b) => String(b.label).length));
  return buckets
    .map((b) => {
      const len = Math.round((Math.abs(b.value) / max) * width);
      return `${String(b.label).padEnd(labelW)} | ${'█'.repeat(len)} ${b.value}`;
    })
    .join('\n');
}

/** Compact single-line sparkline from a numeric series (block-eighths). */
export function sparkline(values) {
  if (!values || values.length === 0) return '(empty series)';
  if (values.length < 2) return BLOCKS[3];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values.map((v) => BLOCKS[Math.min(BLOCKS.length - 1, Math.floor(((v - min) / span) * (BLOCKS.length - 1)))]).join('');
}

/** Trend for a time-ordered numeric series: sparkline + direction marker + % change. */
export function trendLine(points) {
  if (!points || points.length < 2) return '(series too short to trend)';
  const values = points.map((p) => Number(p.v ?? p));
  const first = values[0];
  const last = values[values.length - 1];
  const changePct = first === 0 ? 0 : ((last - first) / Math.abs(first)) * 100;
  const marker = changePct > 1 ? '↑' : changePct < -1 ? '↓' : '→';
  return `${sparkline(values)} ${marker} ${changePct.toFixed(1)}%`;
}
