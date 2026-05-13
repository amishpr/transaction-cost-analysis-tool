import type { RawTrade, TradeMetrics } from "../types";
import { rowsToRawTrades } from "./tradeRows";

export function parseTradesCsv(text: string): RawTrade[] {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    throw new Error("CSV needs a header row and at least one data row.");
  }

  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    return Object.fromEntries(headers.map((h, i) => [h, cells[i]]));
  });

  return rowsToRawTrades(headers, rows);
}

export function tradesToCsv(trades: TradeMetrics[]): string {
  const cols = [
    "id",
    "date",
    "symbol",
    "side",
    "quantity",
    "arrivalPrice",
    "execPrice",
    "vwapPrice",
    "venue",
    "strategy",
    "arrivalSlippageBps",
    "vwapSlippageBps",
    "arrivalCostUsd",
    "vwapCostUsd",
  ];
  const rows = trades.map((t) =>
    cols
      .map((c) => {
        const v = (t as unknown as Record<string, unknown>)[c];
        return typeof v === "number" ? v.toFixed(4) : String(v);
      })
      .join(","),
  );
  return [cols.join(","), ...rows].join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
