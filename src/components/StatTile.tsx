import "./StatTile.css";

interface StatTileProps {
  label: string;
  value: string;
  sublabel?: string;
  tone?: "neutral" | "good" | "bad";
  /** The headline metric: spans two columns and prints larger. */
  hero?: boolean;
  /** Full-precision value for the hover title when `value` is abbreviated. */
  title?: string;
}

export function StatTile({ label, value, sublabel, tone = "neutral", hero = false, title }: StatTileProps) {
  return (
    <div className={`stat-tile${hero ? " stat-tile-hero" : ""}`}>
      <dt className="stat-tile-label">{label}</dt>
      <dd className={`stat-tile-value tabular tone-${tone}`} title={title}>
        {value}
      </dd>
      {sublabel && <dd className="stat-tile-sublabel">{sublabel}</dd>}
    </div>
  );
}
