import type { RawTrade, Side } from "../types";

export const REQUIRED_COLUMNS = [
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

/** Shared by the CSV and Excel importers: turns header + row objects into validated trades. */
export function rowsToRawTrades(
  headers: string[],
  rows: Array<Record<string, unknown>>,
): RawTrade[] {
  const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
  if (missing.length > 0) {
    throw new Error(`Missing required columns: ${missing.join(", ")}`);
  }
  return rows.map((row, i) => rowToRawTrade(row, `Row ${i + 2}`));
}
