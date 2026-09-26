// Values within half a tenth of a basis point print as 0.0, so they count as neither cost nor improvement.
const NEUTRAL_BPS = 0.05;

export type Polarity = "cost" | "improve" | "neutral";

export function polarity(bps: number): Polarity {
  if (bps >= NEUTRAL_BPS) return "cost";
  if (bps <= -NEUTRAL_BPS) return "improve";
  return "neutral";
}

/** Signed basis points with one decimal, e.g. "+1.2" or "-0.8". Near-zero values print as "0.0". */
export function fmtSigned(bps: number): string {
  const p = polarity(bps);
  if (p === "neutral") return "0.0";
  return `${p === "cost" ? "+" : ""}${bps.toFixed(1)}`;
}

export const fmtBps = (bps: number) => `${fmtSigned(bps)} bps`;

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const usdCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const fmtUsd = (v: number) => usd.format(v);

/** "$105.0M", "$596.8K". Used where a full dollar figure would not fit. */
export const fmtUsdCompact = (v: number) => usdCompact.format(v);

/** Full dollars up to a million, compact above, so headline tiles never overflow. */
export const fmtUsdFit = (v: number) => (Math.abs(v) >= 1_000_000 ? fmtUsdCompact(v) : fmtUsd(v));
