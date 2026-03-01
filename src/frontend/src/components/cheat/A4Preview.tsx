import { Moon, Sun, ZoomIn, ZoomOut } from "lucide-react";
import { useMemo, useRef } from "react";
import type { CheatMode, QAPair } from "../../utils/cheatTypes";
import { generateQRContent, generateQRDataURL } from "../../utils/qrGenerator";

interface A4PreviewProps {
  title: string;
  pairs: QAPair[];
  mode: CheatMode;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  darkPreview: boolean;
  onToggleDarkPreview: () => void;
  watermark?: string;
  footerText?: string;
  studentName?: string;
  shuffle: boolean;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function A4Preview({
  title,
  pairs,
  mode,
  zoom,
  onZoomChange,
  darkPreview,
  onToggleDarkPreview,
  watermark,
  footerText,
  studentName,
  shuffle,
}: A4PreviewProps) {
  const a4Ref = useRef<HTMLDivElement>(null);

  const qrDataUrl = useMemo(() => {
    if (!studentName?.trim()) return null;
    const content = generateQRContent(studentName);
    return generateQRDataURL(content);
  }, [studentName]);

  const activePairs = useMemo(() => {
    const filtered = pairs.filter((p) => p.question.trim() || p.answer.trim());
    return shuffle ? shuffleArray(filtered) : filtered;
  }, [pairs, shuffle]);

  const modeClass =
    mode === "ultra-compact"
      ? "ultra-compact"
      : mode === "handwriting"
        ? "handwriting"
        : "";

  const scale = zoom / 100;

  // A4 is 210mm wide = 794px at 96dpi; we scale it down to fit the panel
  const A4_PX = 794;
  const A4_H_PX = 1123;

  return (
    <div className="flex flex-col gap-3">
      {/* Controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span
          className="text-xs font-mono"
          style={{ color: "rgba(0,255,255,0.6)" }}
        >
          Live A4 Preview
        </span>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <button
            type="button"
            className="neon-btn rounded p-1"
            onClick={() => onZoomChange(Math.max(30, zoom - 10))}
            aria-label="Zoom out"
          >
            <ZoomOut size={12} />
          </button>
          <span
            className="text-xs font-mono w-10 text-center"
            style={{ color: "#00ffff" }}
          >
            {zoom}%
          </span>
          <input
            type="range"
            className="zoom-slider w-24"
            min={30}
            max={150}
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            aria-label="Zoom level"
          />
          <button
            type="button"
            className="neon-btn rounded p-1"
            onClick={() => onZoomChange(Math.min(150, zoom + 10))}
            aria-label="Zoom in"
          >
            <ZoomIn size={12} />
          </button>

          {/* Dark/Light toggle */}
          <button
            type="button"
            className="neon-btn rounded p-1.5"
            onClick={onToggleDarkPreview}
            aria-label={
              darkPreview ? "Switch to light preview" : "Switch to dark preview"
            }
            title={darkPreview ? "Light preview" : "Dark preview"}
          >
            {darkPreview ? <Sun size={12} /> : <Moon size={12} />}
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="a4-preview-wrapper" style={{ minHeight: 300 }}>
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: A4_PX,
            height: A4_H_PX,
            flexShrink: 0,
          }}
        >
          <div
            ref={a4Ref}
            className={`a4-page ${darkPreview ? "dark-preview" : ""} ${modeClass}`}
            style={{ width: A4_PX, minHeight: A4_H_PX, padding: "19px" }}
            aria-label="A4 cheat sheet preview"
          >
            {/* Watermark */}
            {watermark?.trim() && (
              <div className="watermark-text">{watermark}</div>
            )}

            {/* QR code */}
            {qrDataUrl && (
              <div className="qr-corner">
                <img
                  src={qrDataUrl}
                  alt="QR code"
                  width={52}
                  height={52}
                  style={{ display: "block" }}
                />
              </div>
            )}

            {/* Title strip */}
            <div
              style={{
                background: darkPreview ? "#0a0a2e" : "#0a0a0a",
                color: darkPreview ? "#00ffff" : "#00e5ff",
                padding: "4px 8px",
                marginBottom: 6,
                borderRadius: 3,
                fontSize: 9,
                fontWeight: 700,
                fontFamily: "'Bricolage Grotesque', sans-serif",
              }}
            >
              {title || "Micro Cheat Sheet"}
              {studentName && (
                <span style={{ float: "right", opacity: 0.7 }}>
                  {studentName}
                </span>
              )}
            </div>

            {/* Q&A Grid */}
            <div className="cheat-grid">
              {activePairs.length === 0 ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    color: darkPreview
                      ? "rgba(200,200,255,0.3)"
                      : "rgba(100,100,150,0.4)",
                    fontSize: 9,
                    padding: "20px",
                  }}
                >
                  Enter questions & answers to see preview
                </div>
              ) : (
                activePairs.map((pair, i) => (
                  <div
                    key={`${i}-${pair.question.slice(0, 12)}`}
                    className="cheat-item"
                    style={
                      mode === "handwriting"
                        ? {
                            transform: `rotate(${((i % 7) - 3) * 0.5}deg)`,
                          }
                        : undefined
                    }
                  >
                    <div className="cheat-item-q">{pair.question || "—"}</div>
                    <div className="cheat-item-a">{pair.answer || "—"}</div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {footerText?.trim() && (
              <div
                style={{
                  position: "absolute",
                  bottom: 4,
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  fontSize: 6,
                  color: darkPreview
                    ? "rgba(200,200,255,0.4)"
                    : "rgba(80,80,120,0.5)",
                  borderTop: darkPreview
                    ? "0.2mm solid rgba(255,255,255,0.08)"
                    : "0.2mm solid rgba(0,0,0,0.08)",
                  paddingTop: 3,
                  margin: "0 19px",
                }}
              >
                {footerText}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
