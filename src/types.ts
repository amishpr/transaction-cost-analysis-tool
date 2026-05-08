export type Side = "BUY" | "SELL";

export interface RawTrade {
  id: string;
  date: string; // ISO date, e.g. 2026-09-10
  symbol: string;
  side: Side;
  quantity: number;
  arrivalPrice: number;
  execPrice: number;
  vwapPrice: number;
  venue: string;
  strategy: string;
}

export interface TradeMetrics extends RawTrade {
  notional: number;
  arrivalSlippageBps: number;
  arrivalCostUsd: number;
  vwapSlippageBps: number;
  vwapCostUsd: number;
}

export interface GroupStats {
  key: string;
  count: number;
  notional: number;
  quantity: number;
  avgArrivalBps: number;
  avgVwapBps: number;
  totalArrivalCostUsd: number;
}

export interface Filters {
  symbol: string; // "ALL" or symbol
  side: "ALL" | Side;
  strategy: string; // "ALL" or strategy
}
