import type { ReactNode } from "react";
import "./ChartCard.css";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  legend?: ReactNode;
  headingLevel?: 2 | 3;
  children: ReactNode;
}

export function ChartCard({ title, subtitle, legend, headingLevel = 3, children }: ChartCardProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <Heading className="chart-card-title">{title}</Heading>
          {subtitle && <div className="chart-card-subtitle">{subtitle}</div>}
        </div>
        {legend && <div className="chart-card-legend">{legend}</div>}
      </div>
      <div className="chart-card-body">{children}</div>
    </div>
  );
}
