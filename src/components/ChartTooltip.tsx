import { fmtBps, fmtUsd } from "../lib/format";
import type { TradeMetrics } from "../types";
import "./ChartTooltip.css";

interface ChartTooltipRow {
  label: string;
  value: string;
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  title?: string;
  rows?: ChartTooltipRow[];
}

export function ChartTooltip({ active, title, rows }: ChartTooltipProps) {
  if (!active || !rows || rows.length === 0) return null;
  return (
    <div className="chart-tooltip">
      {title && <div className="chart-tooltip-title">{title}</div>}
      {rows.map((r) => (
        <div className="chart-tooltip-row" key={r.label}>
          {r.color && <span className="chart-tooltip-swatch" style={{ background: r.color }} />}
          <span className="chart-tooltip-label">{r.label}</span>
          <span className="chart-tooltip-value tabular">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

/** Tooltip for a single trade, shared by the per-trade scatter charts. */
export function TradeTooltip({ active, trade }: { active?: boolean; trade?: TradeMetrics }) {
  if (!trade) return null;
  return (
    <ChartTooltip
      active={active}
      title={`${trade.symbol}, ${trade.date}`}
      rows={[
        {
          label: "Side",
          value: trade.side,
          color: trade.side === "BUY" ? "var(--buy)" : "var(--sell)",
        },
        { label: "Vs arrival", value: fmtBps(trade.arrivalSlippageBps) },
        { label: "Notional", value: fmtUsd(trade.notional) },
        { label: "Strategy", value: trade.strategy },
        { label: "Venue", value: trade.venue },
      ]}
    />
  );
}
