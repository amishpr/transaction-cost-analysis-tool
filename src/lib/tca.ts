import type { GroupStats, RawTrade, TradeMetrics } from "../types";

/**
 * Cost sign convention: positive bps/usd = the fill was worse than the
 * benchmark (a cost). Negative = the fill beat the benchmark (price
 * improvement). This holds for both BUY (paying more is bad) and SELL
 * (receiving less is bad).
 */
export function computeMetrics(trade: RawTrade): TradeMetrics {
  const sign = trade.side === "BUY" ? 1 : -1;
  const notional = trade.quantity * trade.execPrice;

  const arrivalSlippageBps =
    (sign * (trade.execPrice - trade.arrivalPrice) * 10000) / trade.arrivalPrice;
  const arrivalCostUsd = sign * (trade.execPrice - trade.arrivalPrice) * trade.quantity;

  const vwapSlippageBps =
    (sign * (trade.execPrice - trade.vwapPrice) * 10000) / trade.vwapPrice;
  const vwapCostUsd = sign * (trade.execPrice - trade.vwapPrice) * trade.quantity;

  return {
    ...trade,
    notional,
    arrivalSlippageBps,
    arrivalCostUsd,
    vwapSlippageBps,
    vwapCostUsd,
  };
}

export function groupBy(
  trades: TradeMetrics[],
  keyFn: (t: TradeMetrics) => string,
): GroupStats[] {
  const groups = new Map<string, TradeMetrics[]>();
  for (const t of trades) {
    const k = keyFn(t);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(t);
  }

  const out: GroupStats[] = [];
  for (const [key, items] of groups) {
    const notional = items.reduce((s, t) => s + t.notional, 0);
    const avgArrivalBps =
      notional === 0
        ? 0
        : items.reduce((s, t) => s + t.arrivalSlippageBps * t.notional, 0) / notional;
    const avgVwapBps =
      notional === 0
        ? 0
        : items.reduce((s, t) => s + t.vwapSlippageBps * t.notional, 0) / notional;
    const totalArrivalCostUsd = items.reduce((s, t) => s + t.arrivalCostUsd, 0);
    const quantity = items.reduce((s, t) => s + t.quantity, 0);
    out.push({
      key,
      count: items.length,
      notional,
      quantity,
      avgArrivalBps,
      avgVwapBps,
      totalArrivalCostUsd,
    });
  }
  return out;
}

export interface Summary {
  tradeCount: number;
  totalNotional: number;
  totalQuantity: number;
  avgArrivalBps: number;
  avgVwapBps: number;
  totalArrivalCostUsd: number;
  totalVwapCostUsd: number;
  pctPriceImprovement: number;
  worstSymbol: GroupStats | null;
  bestSymbol: GroupStats | null;
}

export function summarize(trades: TradeMetrics[]): Summary {
  const totalNotional = trades.reduce((s, t) => s + t.notional, 0);
  const totalQuantity = trades.reduce((s, t) => s + t.quantity, 0);
  const avgArrivalBps =
    totalNotional === 0
      ? 0
      : trades.reduce((s, t) => s + t.arrivalSlippageBps * t.notional, 0) / totalNotional;
  const avgVwapBps =
    totalNotional === 0
      ? 0
      : trades.reduce((s, t) => s + t.vwapSlippageBps * t.notional, 0) / totalNotional;
  const totalArrivalCostUsd = trades.reduce((s, t) => s + t.arrivalCostUsd, 0);
  const totalVwapCostUsd = trades.reduce((s, t) => s + t.vwapCostUsd, 0);
  const pctPriceImprovement =
    trades.length === 0
      ? 0
      : (100 * trades.filter((t) => t.arrivalSlippageBps < 0).length) / trades.length;

  const bySymbol = groupBy(trades, (t) => t.symbol).sort(
    (a, b) => b.avgArrivalBps - a.avgArrivalBps,
  );

  return {
    tradeCount: trades.length,
    totalNotional,
    totalQuantity,
    avgArrivalBps,
    avgVwapBps,
    totalArrivalCostUsd,
    totalVwapCostUsd,
    pctPriceImprovement,
    worstSymbol: bySymbol[0] ?? null,
    bestSymbol: bySymbol[bySymbol.length - 1] ?? null,
  };
}

export function histogram(values: number[], binCount = 12): { bin: string; from: number; to: number; count: number }[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const width = span / binCount;
  const bins = Array.from({ length: binCount }, (_, i) => ({
    bin: "",
    from: min + i * width,
    to: min + (i + 1) * width,
    count: 0,
  }));
  for (const v of values) {
    let idx = Math.floor((v - min) / width);
    if (idx >= binCount) idx = binCount - 1;
    if (idx < 0) idx = 0;
    bins[idx].count += 1;
  }
  for (const b of bins) {
    b.bin = `${b.from.toFixed(0)}`;
  }
  return bins;
}
