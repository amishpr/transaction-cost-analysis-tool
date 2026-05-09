import "./StatTile.css";

interface StatTileProps {
  label: string;
  value: string;
  sublabel?: string;
  tone?: "neutral" | "good" | "bad";
}

export function StatTile({ label, value, sublabel, tone = "neutral" }: StatTileProps) {
  return (
    <div className="stat-tile">
      <div className="stat-tile-label">{label}</div>
      <div className={`stat-tile-value tabular tone-${tone}`}>{value}</div>
      {sublabel && <div className="stat-tile-sublabel">{sublabel}</div>}
    </div>
  );
}
