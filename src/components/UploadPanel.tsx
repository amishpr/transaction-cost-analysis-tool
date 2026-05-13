import { useRef, useState } from "react";
import "./UploadPanel.css";

interface UploadPanelProps {
  onFile: (file: File) => void;
  onLoadSample: () => void;
  onExport: () => void;
  error: string | null;
}

export function UploadPanel({ onFile, onLoadSample, onExport, error }: UploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  return (
    <div className="upload-panel">
      <div
        className={`dropzone ${dragActive ? "dropzone-active" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          const file = e.dataTransfer.files?.[0];
          if (file) onFile(file);
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <span className="dropzone-title">Drop a trades CSV or Excel file, or click to browse</span>
        <span className="dropzone-subtitle">
          Columns: id, date, symbol, side, quantity, arrivalPrice, execPrice, vwapPrice, venue,
          strategy
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = "";
          }}
        />
      </div>

      <div className="upload-actions">
        <button type="button" className="btn btn-secondary" onClick={onLoadSample}>
          Load sample data
        </button>
        <button type="button" className="btn btn-secondary" onClick={onExport}>
          Export CSV
        </button>
      </div>

      {error && <div className="upload-error">{error}</div>}
    </div>
  );
}
