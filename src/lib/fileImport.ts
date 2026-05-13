import type { RawTrade } from "../types";
import { parseTradesCsv } from "./csv";

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsText(file);
  });
}

export async function parseTradesFile(file: File): Promise<RawTrade[]> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "xlsx" || ext === "xls") {
    // Loaded on demand so visitors who never upload a spreadsheet don't download the parser.
    const { parseTradesExcel } = await import("./excel");
    return parseTradesExcel(file);
  }
  const text = await readAsText(file);
  return parseTradesCsv(text);
}
