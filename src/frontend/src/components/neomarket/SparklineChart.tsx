import { useEffect, useRef } from "react";

interface SparklineChartProps {
  data: number[];
  isPositive: boolean;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Pure SVG sparkline with smooth bezier curve.
 * Animated path draw on mount.
 */
export function SparklineChart({
  data,
  isPositive,
  width = 100,
  height = 36,
  className = "",
}: SparklineChartProps) {
  const pathRef = useRef<SVGPathElement>(null);

  const strokeColor = isPositive ? "#10b981" : "#ef4444";
  const fillId = `sparkfill-${isPositive ? "pos" : "neg"}`;

  // Normalize data to SVG coordinates
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 2;

  const points = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (width - pad * 2),
    y: pad + (1 - (v - min) / range) * (height - pad * 2),
  }));

  // Build smooth bezier path
  function buildPath(pts: { x: number; y: number }[]): string {
    if (pts.length < 2) return "";
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpx = (prev.x + curr.x) / 2;
      d += ` C ${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
    }
    return d;
  }

  const linePath = buildPath(points);
  const lastPt = points[points.length - 1];
  const firstPt = points[0];
  const areaPath = `${linePath} L ${lastPt.x},${height + pad} L ${firstPt.x},${height + pad} Z`;

  // Animate path draw on mount (no deps needed — runs once per render, pathRef is stable)
  // biome-ignore lint/correctness/useExhaustiveDependencies: animate on linePath change
  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const length = el.getTotalLength();
    el.style.strokeDasharray = `${length}`;
    el.style.strokeDashoffset = `${length}`;
    el.style.transition = "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
    requestAnimationFrame(() => {
      el.style.strokeDashoffset = "0";
    });
  }, [linePath]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor={strokeColor}
            stopOpacity={isPositive ? 0.25 : 0.2}
          />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <path d={areaPath} fill={`url(#${fillId})`} />
      {/* Line */}
      <path
        ref={pathRef}
        d={linePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
