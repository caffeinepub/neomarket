import { formatPrice } from "@/utils/marketData";
import type { MarketAsset } from "@/utils/types";
import { Star, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { SparklineChart } from "./SparklineChart";

interface MarketCardProps {
  asset: MarketAsset;
  currency: string;
  isFavorite: boolean;
  onFavoriteToggle: (symbol: string) => void;
  onClick: (asset: MarketAsset) => void;
  animateNumber?: boolean;
}

/**
 * Reusable market card for metals, crypto, and forex.
 * Hover: lift + neon glow. Favorite star top-right. Sparkline inline.
 */
export function MarketCard({
  asset,
  currency,
  isFavorite,
  onFavoriteToggle,
  onClick,
  animateNumber = false,
}: MarketCardProps) {
  const isPositive = asset.change24h >= 0;
  const [starHover, setStarHover] = useState(false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle(asset.symbol);
  };

  const categoryIcon =
    asset.category === "metal" ? "⬡" : asset.category === "crypto" ? "◈" : "⟳";

  return (
    <button
      type="button"
      className="market-card rounded-2xl p-4 cursor-pointer relative group w-full text-left"
      onClick={() => onClick(asset)}
      aria-label={`${asset.name} — ${formatPrice(asset.price, currency)}, ${asset.change24h >= 0 ? "up" : "down"} ${Math.abs(asset.change24h).toFixed(2)}% today`}
    >
      {/* Hover glow ring */}
      <div className="market-card-glow-ring" aria-hidden="true" />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Icon */}
          {asset.iconUrl ? (
            <img
              src={asset.iconUrl}
              alt={asset.symbol}
              className="w-8 h-8 rounded-full object-cover"
              loading="lazy"
              onError={(e) => {
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  (e.target as HTMLImageElement).style.display = "none";
                  const span = document.createElement("span");
                  span.className =
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold market-icon-fallback";
                  span.textContent = asset.symbol.slice(0, 2);
                  parent.prepend(span);
                }
              }}
            />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold market-icon-fallback">
              {categoryIcon}
            </div>
          )}

          <div>
            <div
              className="text-sm font-bold font-mono leading-tight tracking-wide"
              style={{ color: "var(--text-primary)" }}
            >
              {asset.symbol.length > 8
                ? asset.symbol.split("/")[1]
                : asset.symbol}
            </div>
            <div
              className="text-xs leading-tight truncate max-w-[90px]"
              style={{ color: "var(--text-muted)" }}
            >
              {asset.name}
            </div>
          </div>
        </div>

        {/* Favorite star */}
        <button
          type="button"
          onClick={handleFavorite}
          onMouseEnter={() => setStarHover(true)}
          onMouseLeave={() => setStarHover(false)}
          className="p-1 rounded-lg transition-all hover:scale-110"
          aria-label={
            isFavorite
              ? `Remove ${asset.symbol} from watchlist`
              : `Add ${asset.symbol} to watchlist`
          }
          aria-pressed={isFavorite}
        >
          <Star
            size={15}
            className="transition-colors"
            fill={isFavorite || starHover ? "#f59e0b" : "transparent"}
            stroke={isFavorite ? "#f59e0b" : "rgba(255,255,255,0.3)"}
          />
        </button>
      </div>

      {/* Sparkline */}
      <div className="my-2">
        <SparklineChart
          data={asset.sparkline}
          isPositive={isPositive}
          width={150}
          height={36}
          className="w-full"
        />
      </div>

      {/* Price + change */}
      <div className="flex items-end justify-between mt-3">
        <div>
          <div
            className={`text-base font-bold font-mono leading-tight ${animateNumber ? "price-flip" : ""}`}
            style={{ color: "var(--text-primary)" }}
          >
            {formatPrice(asset.price, currency)}
          </div>
          <div
            className="text-xs mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            {asset.marketCap && (
              <span className="mr-2">MCap: {asset.marketCap}</span>
            )}
          </div>
        </div>

        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
            isPositive
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          <span>
            {isPositive ? "+" : ""}
            {asset.change24h.toFixed(2)}%
          </span>
        </div>
      </div>
    </button>
  );
}
