import { useMemo, useState } from "react";
import type { TradeMetrics } from "../types";
import "./TradesTable.css";

interface TradesTableProps {
  trades: TradeMetrics[];
}

type SortKey = "date" | "symbol" | "notional" | "arrivalSlippageBps" | "vwapSlippageBps";

function costBadge(bps: number): { label: string; icon: string; className: string } {
  if (bps <= -3) return { label: "Improved", icon: "▼", className: "badge-good" };
  if (bps >= 15) return { label: "High", icon: "▲", className: "badge-critical" };
  if (bps >= 6) return { label: "Elevated", icon: "▲", className: "badge-warning" };
  return { label: "Normal", icon: "•", className: "badge-neutral" };
}

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

  const arrow = (key: SortKey) => (key === sortKey ? (sortDir === 1 ? "↑" : "↓") : "");

  return (
    <div className="trades-table-wrap">
      <table className="trades-table">
        <thead>
          <tr>
            <th onClick={() => toggleSort("date")}>Date {arrow("date")}</th>
            <th onClick={() => toggleSort("symbol")}>Symbol {arrow("symbol")}</th>
            <th>Side</th>
            <th className="num">Qty</th>
            <th className="num">Arrival</th>
            <th className="num">Exec</th>
            <th className="num">VWAP</th>
            <th className="num" onClick={() => toggleSort("notional")}>
              Notional {arrow("notional")}
            </th>
            <th className="num" onClick={() => toggleSort("arrivalSlippageBps")}>
              vs Arrival (bps) {arrow("arrivalSlippageBps")}
            </th>
            <th className="num" onClick={() => toggleSort("vwapSlippageBps")}>
              vs VWAP (bps) {arrow("vwapSlippageBps")}
            </th>
            <th>Status</th>
            <th>Strategy</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((t) => {
            const badge = costBadge(t.arrivalSlippageBps);
            return (
              <tr key={t.id}>
                <td className="tabular">{t.date}</td>
                <td>{t.symbol}</td>
                <td>
                  <span className={`side-tag side-${t.side.toLowerCase()}`}>{t.side}</span>
                </td>
                <td className="num tabular">{t.quantity.toLocaleString()}</td>
                <td className="num tabular">{t.arrivalPrice.toFixed(2)}</td>
                <td className="num tabular">{t.execPrice.toFixed(2)}</td>
                <td className="num tabular">{t.vwapPrice.toFixed(2)}</td>
                <td className="num tabular">
                  {t.notional.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
                </td>
                <td className={`num tabular ${t.arrivalSlippageBps >= 0 ? "cost-bad" : "cost-good"}`}>
                  {t.arrivalSlippageBps >= 0 ? "+" : ""}
                  {t.arrivalSlippageBps.toFixed(1)}
                </td>
                <td className={`num tabular ${t.vwapSlippageBps >= 0 ? "cost-bad" : "cost-good"}`}>
                  {t.vwapSlippageBps >= 0 ? "+" : ""}
                  {t.vwapSlippageBps.toFixed(1)}
                </td>
                <td>
                  <span className={`badge ${badge.className}`}>
                    <span aria-hidden="true">{badge.icon}</span> {badge.label}
                  </span>
                </td>
                <td>{t.strategy}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {sorted.length === 0 && <div className="trades-table-empty">No trades match the current filters.</div>}
    </div>
  );
}
