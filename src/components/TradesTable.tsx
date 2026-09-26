import { useMemo, useState } from "react";
import { fmtSigned, fmtUsd, polarity } from "../lib/format";
import type { TradeMetrics } from "../types";
import "./TradesTable.css";

interface TradesTableProps {
  trades: TradeMetrics[];
}

type SortKey =
  | "date"
  | "symbol"
  | "quantity"
  | "notional"
  | "arrivalSlippageBps"
  | "vwapSlippageBps"
  | "strategy"
  | "venue";

interface Column {
  label: string;
  sort?: SortKey;
  num?: boolean;
}

const COLUMNS: Column[] = [
  { label: "Date", sort: "date" },
  { label: "Symbol", sort: "symbol" },
  { label: "Side" },
  { label: "Qty", sort: "quantity", num: true },
  { label: "Arrival", num: true },
  { label: "Exec", num: true },
  { label: "VWAP", num: true },
  { label: "Notional", sort: "notional", num: true },
  { label: "Vs arrival", sort: "arrivalSlippageBps", num: true },
  { label: "Vs VWAP", sort: "vwapSlippageBps", num: true },
  { label: "Status" },
  { label: "Strategy", sort: "strategy" },
  { label: "Venue", sort: "venue" },
];

// Only unusual fills get a badge, so the rows worth a look stand out from the rest.
function costBadge(bps: number): { label: string; icon: string; className: string } | null {
  if (bps <= -3) return { label: "Improved", icon: "▼", className: "badge-good" };
  if (bps >= 15) return { label: "High", icon: "▲", className: "badge-critical" };
  if (bps >= 6) return { label: "Elevated", icon: "▲", className: "badge-warning" };
  return null;
}

const POLARITY_CLASS = { cost: "cost-bad", improve: "cost-good", neutral: "" } as const;

export function TradesTable({ trades }: TradesTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);

  const sorted = useMemo(() => {
    const copy = [...trades];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * sortDir;
      return String(av).localeCompare(String(bv)) * sortDir;
    });
    return copy;
  }, [trades, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSortKey(key);
      setSortDir(-1);
    }
  };

  return (
    <div className="trades-table-wrap" tabIndex={0} aria-label="Trade blotter, scrollable">
      <table className="trades-table">
        <thead>
          <tr>
            {COLUMNS.map((col) => {
              const active = col.sort !== undefined && col.sort === sortKey;
              return (
                <th
                  key={col.label}
                  scope="col"
                  className={col.num ? "num" : undefined}
                  aria-sort={active ? (sortDir === 1 ? "ascending" : "descending") : undefined}
                >
                  {col.sort ? (
                    <button
                      type="button"
                      className={`th-sort${active ? " th-sort-active" : ""}`}
                      onClick={() => toggleSort(col.sort!)}
                    >
                      {col.label}
                      <span className="th-sort-arrow" aria-hidden="true">
                        {active ? (sortDir === 1 ? "↑" : "↓") : "↕"}
                      </span>
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((t) => {
            const badge = costBadge(t.arrivalSlippageBps);
            return (
              <tr key={t.id}>
                <td className="tabular">{t.date}</td>
                <td className="cell-symbol">{t.symbol}</td>
                <td>
                  <span className={`side-tag side-${t.side.toLowerCase()}`}>{t.side}</span>
                </td>
                <td className="num tabular">{t.quantity.toLocaleString()}</td>
                <td className="num tabular">{t.arrivalPrice.toFixed(2)}</td>
                <td className="num tabular">{t.execPrice.toFixed(2)}</td>
                <td className="num tabular">{t.vwapPrice.toFixed(2)}</td>
                <td className="num tabular">{fmtUsd(t.notional)}</td>
                <td className={`num tabular ${POLARITY_CLASS[polarity(t.arrivalSlippageBps)]}`}>
                  {fmtSigned(t.arrivalSlippageBps)}
                </td>
                <td className={`num tabular ${POLARITY_CLASS[polarity(t.vwapSlippageBps)]}`}>
                  {fmtSigned(t.vwapSlippageBps)}
                </td>
                <td>
                  {badge ? (
                    <span className={`badge ${badge.className}`}>
                      <span aria-hidden="true">{badge.icon}</span> {badge.label}
                    </span>
                  ) : (
                    <span className="status-normal">Normal</span>
                  )}
                </td>
                <td>{t.strategy}</td>
                <td>{t.venue}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
