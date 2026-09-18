/** Rounds a raw step up to the next 1, 2, 2.5, or 5 times a power of ten. */
export function niceStep(raw: number): number {
  if (!(raw > 0) || !Number.isFinite(raw)) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const normalized = raw / magnitude;
  const factor = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;
  return factor * magnitude;
}

// Clears float noise and negative zero, so a tick prints as "0" rather than "-0".
const clean = (v: number) => Number(v.toFixed(10)) || 0;

/**
 * Evenly spaced round ticks that cover [min, max], for example 0, 0.5, 1, 1.5, 2, 2.5.
 * Pass `integer` for counts, so an axis of trades never shows 2.5.
 */
export function niceTicks(min: number, max: number, target = 5, integer = false): number[] {
  const hi = max > min ? max : min + 1;
  const raw = niceStep((hi - min) / Math.max(1, target - 1));
  const step = integer ? Math.max(1, Math.ceil(raw)) : raw;
  const start = Math.floor(min / step) * step;
  const count = Math.ceil(clean((hi - start) / step));
  return Array.from({ length: count + 1 }, (_, i) => clean(start + i * step));
}

/** Ticks for signed values such as slippage, always including zero so the cost line shows. */
export function zeroAnchoredTicks(values: number[], target = 6): number[] {
  return niceTicks(Math.min(0, ...values), Math.max(0, ...values), target);
}

/** Decimal places needed to print ticks spaced by `step` without repeating a label. */
export function tickDecimals(ticks: number[]): number {
  if (ticks.length < 2) return 0;
  const step = Math.abs(ticks[1] - ticks[0]);
  // 2.5 needs one decimal even though it is above 1, or 7.5 would print as 8.
  for (let d = 0; d < 3; d++) {
    const scaled = step * 10 ** d;
    if (Math.abs(scaled - Math.round(scaled)) < 1e-9) return d;
  }
  return 3;
}

/**
 * Width in px for a category axis, sized to its longest label at 11px IBM Plex Mono
 * (0.6em advance). Capped so long uploaded names get cut instead of crushing the plot.
 */
export const MAX_AXIS_LABEL = 24;

export function categoryAxisWidth(labels: string[]): number {
  const longest = Math.min(MAX_AXIS_LABEL, Math.max(3, ...labels.map((l) => l.length)));
  return Math.round(longest * 6.6 + 14);
}

export function truncateLabel(label: string): string {
  return label.length > MAX_AXIS_LABEL ? `${label.slice(0, MAX_AXIS_LABEL - 1)}…` : label;
}
