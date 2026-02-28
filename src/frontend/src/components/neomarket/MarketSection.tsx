import type { MarketAsset } from "@/utils/types";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { MarketCard } from "./MarketCard";
import { ShimmerCard } from "./ShimmerCard";

interface MarketSectionProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  assets: MarketAsset[];
  currency: string;
  watchlist: string[];
  isLoading: boolean;
  onFavoriteToggle: (symbol: string) => void;
  onCardClick: (asset: MarketAsset) => void;
  defaultExpanded?: boolean;
  initialVisibleCount?: number;
}

/**
 * Section wrapper with title, icon, fade-in, and "View All" expand toggle.
 */
export function MarketSection({
  title,
  subtitle,
  icon,
  assets,
  currency,
  watchlist,
  isLoading,
  onFavoriteToggle,
  onCardClick,
  defaultExpanded = false,
  initialVisibleCount = 6,
}: MarketSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const visibleAssets = expanded
    ? assets
    : assets.slice(0, initialVisibleCount);
  const hasMore = assets.length > initialVisibleCount;

  // Skeleton count while loading
  const skeletonCount = Math.min(initialVisibleCount, 6);

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 fade-in-view">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="section-title-accent">
              <span
                className="text-xl font-bold font-display"
                style={{ color: "var(--text-primary)" }}
              >
                {title}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="section-icon">{icon}</span>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {subtitle}
              </p>
            </div>
          </div>

          {hasMore && !isLoading && (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all view-all-btn"
              aria-expanded={expanded}
            >
              {expanded ? (
                <>
                  <ChevronUp size={13} />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown size={13} />
                  View All {assets.length}
                </>
              )}
            </button>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: skeletonCount }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders have no identity
                <ShimmerCard key={i} />
              ))
            : visibleAssets.map((asset, i) => (
                <div
                  key={asset.symbol}
                  className="fade-in-view"
                  style={{ transitionDelay: `${i * 40}ms` }}
                >
                  <MarketCard
                    asset={asset}
                    currency={currency}
                    isFavorite={watchlist.includes(asset.symbol)}
                    onFavoriteToggle={onFavoriteToggle}
                    onClick={onCardClick}
                  />
                </div>
              ))}
        </div>

        {assets.length === 0 && !isLoading && (
          <div
            className="text-center py-12 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            No data available
          </div>
        )}
      </div>
    </section>
  );
}
