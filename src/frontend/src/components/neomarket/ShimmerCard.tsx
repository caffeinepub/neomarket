/**
 * Shimmer skeleton that matches MarketCard dimensions.
 */
export function ShimmerCard() {
  return (
    <div className="market-card rounded-2xl p-4 space-y-3 overflow-hidden relative">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="shimmer-block w-8 h-8 rounded-full" />
          <div className="space-y-1.5">
            <div className="shimmer-block w-12 h-3 rounded" />
            <div className="shimmer-block w-20 h-2.5 rounded" />
          </div>
        </div>
        <div className="shimmer-block w-5 h-5 rounded-full" />
      </div>

      {/* Sparkline placeholder */}
      <div className="shimmer-block w-full h-9 rounded-lg" />

      {/* Price + change */}
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <div className="shimmer-block w-28 h-5 rounded" />
          <div className="shimmer-block w-16 h-3 rounded" />
        </div>
        <div className="shimmer-block w-14 h-6 rounded-full" />
      </div>
    </div>
  );
}
