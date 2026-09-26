import type { ReactNode } from "react";
import { truncateLabel } from "../lib/scale";
import type { LegendItem } from "./chartTheme";
import "./ChartCard.css";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  legend?: ReactNode;
  headingLevel?: 2 | 3;
  /** Spans the full width of the chart grid. */
  wide?: boolean;
  children: ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  legend,
  headingLevel = 3,
  wide = false,
  children,
}: ChartCardProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className={`chart-card${wide ? " chart-card-wide" : ""}`}>
      <div className="chart-card-header">
        <div>
          <Heading className="chart-card-title">{title}</Heading>
          {subtitle && <p className="chart-card-subtitle">{subtitle}</p>}
        </div>
        {legend && <div className="chart-card-legend">{legend}</div>}
      </div>
      <div className="chart-card-body">{children}</div>
    </div>
  );
}

interface CategoryTickProps {
  x?: number | string;
  y?: number | string;
  payload?: { value?: unknown };
}

/**
 * Category axis label drawn as a single line. Recharts' own tick wraps any label that is
 * a pixel too wide, which splits names like "Implementation Shortfall" over two rows.
 */
export function CategoryTick({ x = 0, y = 0, payload }: CategoryTickProps) {
  const label = String(payload?.value ?? "");
  return (
    <text x={x} y={y} dy="0.35em" textAnchor="end" fill="var(--text-secondary)" fontSize={11}>
      <title>{label}</title>
      {truncateLabel(label)}
    </text>
  );
}

export function ChartLegend({ items }: { items: LegendItem[] }) {
  return (
    <>
      {items.map((item) => (
        <span className="legend-item" key={item.label}>
          <span className="legend-swatch" style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </>
  );
}
