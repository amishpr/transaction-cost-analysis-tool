import type { Filters } from "../types";
import "./FilterBar.css";

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  symbols: string[];
  strategies: string[];
}

export function FilterBar({ filters, onChange, symbols, strategies }: FilterBarProps) {
  return (
    <div className="filter-bar">
      <label className="filter-field">
        <span>Symbol</span>
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
        <span>Side</span>
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
        <span>Strategy</span>
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
    </div>
  );
}
