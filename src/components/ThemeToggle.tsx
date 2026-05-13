import type { Theme } from "../lib/useTheme";
import "./ThemeToggle.css";

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

function SunIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="3" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6L13 13M3 13l1.4-1.4M11.6 4.4L13 3" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
      <path d="M13.5 9.6A6 6 0 0 1 6.4 2.5a6 6 0 1 0 7.1 7.1z" fill="currentColor" />
    </svg>
  );
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const goingLight = theme === "dark";
  const label = goingLight ? "Light" : "Dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={`Switch to ${label.toLowerCase()} theme`}
      title={`Switch to ${label.toLowerCase()} theme`}
    >
      {goingLight ? <SunIcon /> : <MoonIcon />}
      <span>{label}</span>
    </button>
  );
}
