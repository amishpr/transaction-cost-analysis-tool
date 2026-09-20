import { useRef } from "react";
import "./UploadPanel.css";

export interface DataSource {
  kind: "sample" | "file";
  name: string;
}

interface UploadPanelProps {
  source: DataSource;
  tradeCount: number;
  /** Name of the file being read, while a parse is in flight. */
  loadingName: string | null;
  onFile: (file: File) => void;
  onLoadSample: () => void;
}

const ACCEPT =
  ".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel";

export function UploadPanel({ source, tradeCount, loadingName, onFile, onLoadSample }: UploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="source">
      <div className="source-info" aria-live="polite">
        <span className="field-label">Data</span>
        <span className="source-name" title={loadingName ?? source.name}>
          {loadingName ? `Reading ${loadingName}…` : source.name}
        </span>
        <span className="source-meta">
          {loadingName
            ? "Parsing file"
            : `${tradeCount.toLocaleString()} trades${source.kind === "sample" ? ", generated in the browser" : ""}`}
        </span>
      </div>

      <div className="source-actions">
        <button
          type="button"
          className="btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={loadingName !== null}
        >
          Upload file
        </button>
        {source.kind === "file" && (
          <button type="button" className="btn-link" onClick={onLoadSample}>
            Back to sample
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT}
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = "";
          }}
        />
      </div>
      <p className="source-hint">CSV or Excel. You can also drop a file anywhere on the page.</p>
    </div>
  );
}
