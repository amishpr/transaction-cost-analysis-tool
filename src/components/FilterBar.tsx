import type { Filters } from "../types";
import "./FilterBar.css";

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onClear: () => void;
  symbols: string[];
  strategies: string[];
}

export function FilterBar({ filters, onChange, onClear, symbols, strategies }: FilterBarProps) {
  const active = filters.symbol !== "ALL" || filters.side !== "ALL" || filters.strategy !== "ALL";

  return (
    <div className="filter-bar" role="group" aria-label="Filters">
      <label className="filter-field">
        <span className="field-label">Symbol</span>
        <select
          value={filters.symbol}
          onChange={(e) => onChange({ ...filters, symbol: e.target.value })}
        >
          <option value="ALL">All symbols</option>
          {symbols.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-field">
        <span className="field-label">Side</span>
        <select
          value={filters.side}
          onChange={(e) => onChange({ ...filters, side: e.target.value as Filters["side"] })}
        >
          <option value="ALL">All sides</option>
          <option value="BUY">Buy</option>
          <option value="SELL">Sell</option>
        </select>
      </label>

      <label className="filter-field">
        <span className="field-label">Strategy</span>
        <select
          value={filters.strategy}
          onChange={(e) => onChange({ ...filters, strategy: e.target.value })}
        >
          <option value="ALL">All strategies</option>
          {strategies.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      {active && (
        <button type="button" className="btn-link filter-clear" onClick={onClear}>
          Clear
        </button>
      )}
    </div>
  );
}
