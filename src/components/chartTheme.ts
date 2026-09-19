export interface LegendItem {
  label: string;
  color: string;
}

export const POLARITY_LEGEND: LegendItem[] = [
  { label: "Cost", color: "var(--cost)" },
  { label: "Price improvement", color: "var(--improve)" },
];

export const SIDE_LEGEND: LegendItem[] = [
  { label: "Buy", color: "var(--buy)" },
  { label: "Sell", color: "var(--sell)" },
];

/** Shared axis styling so every chart's chrome recedes the same way. */
export const AXIS_TICK = { fill: "var(--text-muted)", fontSize: 11 };
export const AXIS_LINE = { stroke: "var(--baseline)" };
