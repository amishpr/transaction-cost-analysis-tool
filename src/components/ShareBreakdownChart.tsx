import { fmtUsd, fmtUsdCompact } from "../lib/format";
import type { GroupStats } from "../types";
import { ChartCard } from "./ChartCard";
import "./ShareBreakdownChart.css";

interface ShareBreakdownChartProps {
  title: string;
  subtitle?: string;
  data: GroupStats[];
}

/**
 * Ranked share of notional as a plain HTML bar list. Every value is printed, so nothing
 * hides behind a hover, and long names get a full row instead of wrapping under an axis.
 */
export function ShareBreakdownChart({ title, subtitle, data }: ShareBreakdownChartProps) {
  const totalNotional = data.reduce((s, d) => s + d.notional, 0);
  const rows = data
    .map((d) => ({ ...d, pct: totalNotional === 0 ? 0 : (100 * d.notional) / totalNotional }))
    .sort((a, b) => b.pct - a.pct);
  const maxPct = Math.max(1e-9, ...rows.map((r) => r.pct));

  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ol className="share-list">
        {rows.map((r) => (
          <li
            className="share-row"
            key={r.key}
            title={`${r.key}: ${r.pct.toFixed(1)}% of notional, ${fmtUsd(r.notional)}, ${r.count} trades`}
          >
            <span className="share-label">{r.key}</span>
            <span className="share-track" aria-hidden="true">
              <span className="share-bar" style={{ width: `${(100 * r.pct) / maxPct}%` }} />
            </span>
            <span className="share-pct tabular">{r.pct.toFixed(1)}%</span>
            <span className="share-notional tabular">{fmtUsdCompact(r.notional)}</span>
          </li>
        ))}
      </ol>
    </ChartCard>
  );
}
