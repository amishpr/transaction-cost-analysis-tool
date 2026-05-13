import { readSheet } from "read-excel-file/browser";
import type { RawTrade } from "../types";
import { rowsToRawTrades } from "./tradeRows";

export async function parseTradesExcel(file: File): Promise<RawTrade[]> {
  const sheet = await readSheet(file);
  if (sheet.length < 2) {
    throw new Error("The spreadsheet needs a header row and at least one data row.");
  }

  const headers = sheet[0].map((cell) => (cell === null ? "" : String(cell).trim()));
  const rows = sheet
    .slice(1)
    .filter((row) => row.some((cell) => cell !== null && cell !== ""))
    .map((row) => Object.fromEntries(headers.map((h, i) => [h, row[i]])));

  return rowsToRawTrades(headers, rows);
}
