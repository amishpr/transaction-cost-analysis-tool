import type { RawTrade, Side, TradeMetrics } from "../types";

const REQUIRED_COLUMNS = [
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
] as const;

function cellToString(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).trim();
}

function rowToRawTrade(row: Record<string, unknown>, rowLabel: string): RawTrade {
  const get = (col: string) => cellToString(row[col]);

  const side = get("side").toUpperCase();
  if (side !== "BUY" && side !== "SELL") {
    throw new Error(`${rowLabel}: side must be BUY or SELL, got "${get("side")}"`);
  }

  const quantity = Number(get("quantity"));
  const arrivalPrice = Number(get("arrivalPrice"));
  const execPrice = Number(get("execPrice"));
  const vwapPrice = Number(get("vwapPrice"));
  if ([quantity, arrivalPrice, execPrice, vwapPrice].some((n) => Number.isNaN(n))) {
    throw new Error(`${rowLabel}: quantity/arrivalPrice/execPrice/vwapPrice must be numeric.`);
  }

  return {
    id: get("id") || rowLabel,
    date: get("date"),
    symbol: get("symbol"),
    side: side as Side,
    quantity,
    arrivalPrice,
    execPrice,
    vwapPrice,
    venue: get("venue") || "N/A",
    strategy: get("strategy") || "N/A",
  };
}

function rowsToRawTrades(
  headers: string[],
  rows: Array<Record<string, unknown>>,
): RawTrade[] {
  const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
  if (missing.length > 0) {
    throw new Error(`Missing required columns: ${missing.join(", ")}`);
  }
  return rows.map((row, i) => rowToRawTrade(row, `Row ${i + 2}`));
}

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
