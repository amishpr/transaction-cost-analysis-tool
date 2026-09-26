import { useEffect, useRef, useState } from "react";
import "./FileDropOverlay.css";

interface FileDropOverlayProps {
  onFile: (file: File) => void;
}

const carriesFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");

/**
 * Lets a file be dropped anywhere on the page. dragenter and dragleave fire for every
 * child element crossed, so a depth counter tracks when the drag really leaves the window.
 */
export function FileDropOverlay({ onFile }: FileDropOverlayProps) {
  const [active, setActive] = useState(false);
  const depth = useRef(0);
  const onFileRef = useRef(onFile);

  useEffect(() => {
    onFileRef.current = onFile;
  });

  useEffect(() => {
    const onEnter = (e: DragEvent) => {
      if (!carriesFiles(e)) return;
      e.preventDefault();
      depth.current += 1;
      setActive(true);
    };
    const onOver = (e: DragEvent) => {
      if (carriesFiles(e)) e.preventDefault();
    };
    const onLeave = (e: DragEvent) => {
      if (!carriesFiles(e)) return;
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setActive(false);
    };
    const onDrop = (e: DragEvent) => {
      if (!carriesFiles(e)) return;
      e.preventDefault();
      depth.current = 0;
      setActive(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) onFileRef.current(file);
    };

    window.addEventListener("dragenter", onEnter);
    window.addEventListener("dragover", onOver);
    window.addEventListener("dragleave", onLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onEnter);
      window.removeEventListener("dragover", onOver);
      window.removeEventListener("dragleave", onLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, []);

  if (!active) return null;
  return (
    <div className="drop-overlay" aria-hidden="true">
      <div className="drop-overlay-frame">
        <span className="drop-overlay-title">Drop to load trades</span>
        <span className="drop-overlay-sub">CSV, XLSX, or XLS</span>
      </div>
    </div>
  );
}
