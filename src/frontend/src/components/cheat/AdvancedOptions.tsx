import { ChevronDown, ChevronUp, QrCode } from "lucide-react";
import { useState } from "react";

interface AdvancedOptionsProps {
  shuffle: boolean;
  onShuffleChange: (v: boolean) => void;
  studentName: string;
  onStudentNameChange: (v: string) => void;
  footerText: string;
  onFooterTextChange: (v: string) => void;
  watermark: string;
  onWatermarkChange: (v: string) => void;
}

export function AdvancedOptions({
  shuffle,
  onShuffleChange,
  studentName,
  onStudentNameChange,
  footerText,
  onFooterTextChange,
  watermark,
  onWatermarkChange,
}: AdvancedOptionsProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-panel overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        aria-expanded={expanded}
      >
        <span
          className="text-sm font-semibold"
          style={{ color: "rgba(191,0,255,0.9)" }}
        >
          ⚙️ Advanced Options
        </span>
        {expanded ? (
          <ChevronUp size={14} style={{ color: "rgba(191,0,255,0.6)" }} />
        ) : (
          <ChevronDown size={14} style={{ color: "rgba(191,0,255,0.6)" }} />
        )}
      </button>

      <div className={`advanced-panel ${expanded ? "expanded" : "collapsed"}`}>
        <div className="px-4 pb-4 flex flex-col gap-4">
          {/* Shuffle toggle */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <div
                className="text-xs font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Shuffle Q&A Order
              </div>
              <div
                className="text-xs mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                Randomize order in preview & PDF
              </div>
            </div>
            <input
              type="checkbox"
              className="neon-toggle"
              checked={shuffle}
              onChange={(e) => onShuffleChange(e.target.checked)}
              aria-label="Shuffle Q&A order"
            />
          </div>

          {/* Student name for QR */}
          <div>
            <label
              className="text-xs font-semibold block mb-1.5 flex items-center gap-1.5"
              style={{ color: "var(--text-primary)" }}
              htmlFor="student-name"
            >
              <QrCode size={11} style={{ color: "#00ffff" }} />
              Student Name (for QR code)
            </label>
            <input
              id="student-name"
              type="text"
              className="cheat-input-title text-sm"
              style={{ fontSize: 13, padding: "7px 10px" }}
              placeholder="Enter student name..."
              value={studentName}
              onChange={(e) => onStudentNameChange(e.target.value)}
            />
            {studentName.trim() && (
              <p
                className="text-xs mt-1"
                style={{ color: "rgba(0,255,255,0.5)" }}
              >
                ✓ QR will include name, date, time
              </p>
            )}
          </div>

          {/* Custom footer */}
          <div>
            <label
              className="text-xs font-semibold block mb-1.5"
              style={{ color: "var(--text-primary)" }}
              htmlFor="footer-text"
            >
              Custom Footer Text
            </label>
            <input
              id="footer-text"
              type="text"
              className="cheat-input-title text-sm"
              style={{ fontSize: 13, padding: "7px 10px" }}
              placeholder="E.g. Physics — Chapter 3 | Class 12"
              value={footerText}
              onChange={(e) => onFooterTextChange(e.target.value)}
            />
          </div>

          {/* Watermark */}
          <div>
            <label
              className="text-xs font-semibold block mb-1.5"
              style={{ color: "var(--text-primary)" }}
              htmlFor="watermark"
            >
              Watermark Text
            </label>
            <input
              id="watermark"
              type="text"
              className="cheat-input-title text-sm"
              style={{ fontSize: 13, padding: "7px 10px" }}
              placeholder="E.g. CONFIDENTIAL or your name"
              value={watermark}
              onChange={(e) => onWatermarkChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
