import { formatPrice, generateHistoricalData } from "@/utils/marketData";
import type { MarketAsset, TimePeriod } from "@/utils/types";
import { X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const PERIODS: TimePeriod[] = ["1D", "7D", "1M", "3M", "1Y", "MAX"];

interface LineChartProps {
  asset: MarketAsset;
  currency: string;
  onClose: () => void;
}

interface TooltipState {
  x: number;
  y: number;
  value: number;
  label: string;
  visible: boolean;
}

/**
 * Full interactive SVG line chart modal.
 * No charting libraries — pure SVG.
 */
export function LineChart({ asset, currency, onClose }: LineChartProps) {
  const [period, setPeriod] = useState<TimePeriod>("7D");
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    x: 0,
    y: 0,
    value: 0,
    label: "",
    visible: false,
  });

  const SVG_W = 620;
  const SVG_H = 220;
  const PAD = { top: 20, right: 20, bottom: 40, left: 70 };
  const plotW = SVG_W - PAD.left - PAD.right;
  const plotH = SVG_H - PAD.top - PAD.bottom;

  const { labels, values } = useMemo(
    () =>
      generateHistoricalData(
        asset.symbol.charCodeAt(0) * 17,
        asset.change24h >= 0 ? "up" : "down",
        period,
      ),
    [asset.symbol, asset.change24h, period],
  );

  // Scale values to actual price range based on current price
  const scaledValues = useMemo(() => {
    const ratio = asset.price / 100;
    return values.map((v) => v * ratio);
  }, [values, asset.price]);

  const minVal = Math.min(...scaledValues);
  const maxVal = Math.max(...scaledValues);
  const valRange = maxVal - minVal || 1;

  const toSVGX = useCallback(
    (i: number) => PAD.left + (i / (scaledValues.length - 1)) * plotW,
    [scaledValues.length, plotW],
  );
  const toSVGY = useCallback(
    (v: number) => PAD.top + (1 - (v - minVal) / valRange) * plotH,
    [minVal, valRange, plotH],
  );

  // Build smooth bezier path
  const buildPath = useCallback(
    (vals: number[]): string => {
      if (vals.length < 2) return "";
      const pts = vals.map((v, i) => ({ x: toSVGX(i), y: toSVGY(v) }));
      let d = `M ${pts[0].x},${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const curr = pts[i];
        const cpx = (prev.x + curr.x) / 2;
        d += ` C ${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
      }
      return d;
    },
    [toSVGX, toSVGY],
  );

  const isPositive =
    scaledValues.length > 1 &&
    scaledValues[scaledValues.length - 1] >= scaledValues[0];
  const lineColor = isPositive ? "#10b981" : "#ef4444";
  const linePath = useMemo(
    () => buildPath(scaledValues),
    [buildPath, scaledValues],
  );
  const lastPt =
    scaledValues.length > 0
      ? {
          x: toSVGX(scaledValues.length - 1),
          y: toSVGY(scaledValues[scaledValues.length - 1]),
        }
      : null;
  const firstPt =
    scaledValues.length > 0
      ? { x: PAD.left, y: toSVGY(scaledValues[0]) }
      : null;
  const areaPath =
    lastPt && firstPt
      ? `${linePath} L ${lastPt.x},${PAD.top + plotH} L ${firstPt.x},${PAD.top + plotH} Z`
      : "";

  // Animate path draw on period change
  // biome-ignore lint/correctness/useExhaustiveDependencies: animate on linePath/period change
  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const length = el.getTotalLength();
    el.style.strokeDasharray = `${length}`;
    el.style.strokeDashoffset = `${length}`;
    el.style.transition = "none";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition =
          "stroke-dashoffset 0.9s cubic-bezier(0.4, 0, 0.2, 1)";
        el.style.strokeDashoffset = "0";
      });
    });
  }, [linePath]);

  // Y-axis labels (5 ticks)
  const yTicks = useMemo((): Array<{ value: number; y: number }> => {
    const ticks: Array<{ value: number; y: number }> = [];
    for (let i = 0; i <= 4; i++) {
      const v = minVal + (valRange / 4) * i;
      ticks.push({ value: v, y: toSVGY(v) });
    }
    return ticks;
  }, [minVal, valRange, toSVGY]);

  // X-axis labels (show subset)
  const xLabels = useMemo(() => {
    const step = Math.max(1, Math.floor(labels.length / 5));
    return labels
      .map((l, i) => ({ label: l, x: toSVGX(i), show: i % step === 0 }))
      .filter((l) => l.show);
  }, [labels, toSVGX]);

  // Mouse hover handler
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svgEl = svgRef.current;
      if (!svgEl) return;
      const rect = svgEl.getBoundingClientRect();
      const scaleX = SVG_W / rect.width;
      const svgX = (e.clientX - rect.left) * scaleX;

      const relX = svgX - PAD.left;
      const idx = Math.round((relX / plotW) * (scaledValues.length - 1));
      const clampedIdx = Math.max(0, Math.min(scaledValues.length - 1, idx));
      const ptX = toSVGX(clampedIdx);
      const ptY = toSVGY(scaledValues[clampedIdx]);

      setTooltip({
        x: ptX,
        y: ptY,
        value: scaledValues[clampedIdx],
        label: labels[clampedIdx],
        visible: relX >= 0 && relX <= plotW,
      });
    },
    [scaledValues, labels, plotW, toSVGX, toSVGY],
  );

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.currentTarget as HTMLImageElement).style.display = "none";
  };

  const pctChange =
    scaledValues.length > 1
      ? ((scaledValues[scaledValues.length - 1] - scaledValues[0]) /
          scaledValues[0]) *
        100
      : 0;

  const handleOverlayKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      onKeyDown={handleOverlayKeyDown}
      aria-hidden="true"
    >
      <div
        className="market-modal w-full max-w-2xl rounded-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {asset.iconUrl && (
              <img
                src={asset.iconUrl}
                alt={asset.symbol}
                className="w-10 h-10 rounded-full"
                onError={handleImgError}
              />
            )}
            <div>
              <h2
                className="text-xl font-bold font-display tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {asset.name}
                <span
                  className="text-sm font-normal ml-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  {asset.symbol}
                </span>
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="text-2xl font-bold font-mono"
                  style={{ color: "var(--text-primary)" }}
                >
                  {formatPrice(asset.price, currency)}
                </span>
                <span
                  className={`text-sm font-semibold px-2 py-0.5 rounded-full ${isPositive ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"}`}
                >
                  {pctChange >= 0 ? "+" : ""}
                  {pctChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-white/10"
            aria-label="Close chart"
          >
            <X size={18} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        {/* Period filter */}
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                period === p
                  ? "period-active"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
              aria-pressed={period === p}
            >
              {p}
            </button>
          ))}
        </div>

        {/* SVG Chart */}
        <div
          className="relative overflow-hidden rounded-xl"
          style={{ background: "rgba(0,0,0,0.2)" }}
        >
          <svg
            ref={svgRef}
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            width="100%"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setTooltip((t) => ({ ...t, visible: false }))}
            style={{ display: "block" }}
            aria-label={`${asset.name} price chart`}
            role="img"
          >
            <title>
              {asset.name} price chart for {period}
            </title>
            <defs>
              <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.2} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {yTicks.map((tick) => (
              <line
                key={`grid-${tick.y}`}
                x1={PAD.left}
                y1={tick.y}
                x2={SVG_W - PAD.right}
                y2={tick.y}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={1}
              />
            ))}

            {/* Y-axis labels */}
            {yTicks.map((tick) => (
              <text
                key={`ytick-${tick.value}`}
                x={PAD.left - 8}
                y={tick.y + 4}
                textAnchor="end"
                fontSize={9}
                fill="rgba(255,255,255,0.35)"
                fontFamily="JetBrains Mono, monospace"
              >
                {tick.value >= 1000
                  ? `${(tick.value / 1000).toFixed(1)}k`
                  : tick.value >= 1
                    ? tick.value.toFixed(1)
                    : tick.value.toFixed(4)}
              </text>
            ))}

            {/* X-axis labels */}
            {xLabels.map((lb) => (
              <text
                key={`xlabel-${lb.label}-${lb.x}`}
                x={lb.x}
                y={SVG_H - 6}
                textAnchor="middle"
                fontSize={8.5}
                fill="rgba(255,255,255,0.35)"
                fontFamily="JetBrains Mono, monospace"
              >
                {lb.label}
              </text>
            ))}

            {/* Area fill */}
            {areaPath && <path d={areaPath} fill="url(#chartAreaGrad)" />}

            {/* Main line */}
            <path
              ref={pathRef}
              d={linePath}
              fill="none"
              stroke={lineColor}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Tooltip vertical line + dot */}
            {tooltip.visible && (
              <>
                <line
                  x1={tooltip.x}
                  y1={PAD.top}
                  x2={tooltip.x}
                  y2={PAD.top + plotH}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth={1}
                  strokeDasharray="4 2"
                />
                <circle
                  cx={tooltip.x}
                  cy={tooltip.y}
                  r={4}
                  fill={lineColor}
                  stroke="#0a0a0a"
                  strokeWidth={2}
                />
                <g>
                  <rect
                    x={Math.min(tooltip.x + 8, SVG_W - PAD.right - 85)}
                    y={tooltip.y - 24}
                    width={80}
                    height={22}
                    rx={4}
                    fill="rgba(10,10,20,0.9)"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={1}
                  />
                  <text
                    x={Math.min(tooltip.x + 12, SVG_W - PAD.right - 81)}
                    y={tooltip.y - 8}
                    fontSize={9}
                    fill={lineColor}
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {tooltip.value >= 1000
                      ? `${(tooltip.value / 1000).toFixed(2)}k`
                      : tooltip.value >= 1
                        ? tooltip.value.toFixed(2)
                        : tooltip.value.toFixed(4)}
                  </text>
                </g>
              </>
            )}
          </svg>
        </div>

        {/* Footer info */}
        {asset.marketCap && (
          <div
            className="flex gap-6 mt-4 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            <span>
              Market Cap:{" "}
              <span style={{ color: "var(--text-secondary)" }}>
                {asset.marketCap}
              </span>
            </span>
            {asset.volume24h && (
              <span>
                24h Volume:{" "}
                <span style={{ color: "var(--text-secondary)" }}>
                  {asset.volume24h}
                </span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
