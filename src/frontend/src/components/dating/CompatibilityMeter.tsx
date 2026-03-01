import { useEffect, useState } from "react";

interface Props {
  score: number;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function CompatibilityMeter({
  score,
  showLabel = true,
  size = "md",
}: Props) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDisplayed(score), 200);
    return () => clearTimeout(timer);
  }, [score]);

  const color =
    score >= 70
      ? "from-[#00f5d4] via-[#9b5de5] to-[#ff2d78]"
      : score >= 40
        ? "from-[#9b5de5] to-[#ff2d78]"
        : "from-[#ff2d78] to-[#ff6b6b]";

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-xs font-semibold"
            style={{
              color: "rgba(240,230,255,0.5)",
              fontSize: size === "sm" ? 10 : 11,
            }}
          >
            Match
          </span>
          <span
            className="text-xs font-bold font-mono"
            style={{
              color:
                score >= 70 ? "#00f5d4" : score >= 40 ? "#9b5de5" : "#ff2d78",
              fontSize: size === "sm" ? 10 : 12,
            }}
          >
            {score}%
          </span>
        </div>
      )}
      <div className="compat-bar">
        <div
          className={`compat-fill bg-gradient-to-r ${color}`}
          style={{ width: `${displayed}%` }}
        />
      </div>
    </div>
  );
}
