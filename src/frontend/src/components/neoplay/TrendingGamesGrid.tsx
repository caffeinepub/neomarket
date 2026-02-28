import { TrendingUp } from "lucide-react";
import { GameCard } from "./GameCard";
import type { LocalGame } from "./gameData";

interface TrendingGamesGridProps {
  games: LocalGame[];
  onPlay: (game: LocalGame) => void;
  searchQuery: string;
}

export function TrendingGamesGrid({
  games,
  onPlay,
  searchQuery,
}: TrendingGamesGridProps) {
  const isEmpty = games.length === 0;

  return (
    <section id="trending" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8 fade-in-view">
          <h2
            className="section-title-accent font-display font-bold text-2xl sm:text-3xl"
            style={{ color: "var(--text-primary)" }}
          >
            <span className="flex items-center gap-2">
              <TrendingUp size={24} style={{ color: "var(--neon-cyan)" }} />
              {searchQuery ? `Results for "${searchQuery}"` : "Trending Games"}
            </span>
          </h2>
          {!searchQuery && (
            <span
              className="text-sm font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              {games.length} game{games.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Empty state */}
        {isEmpty && (
          <div
            className="flex flex-col items-center justify-center py-20 rounded-2xl fade-in-view visible"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <div
              className="text-5xl mb-4"
              role="img"
              aria-label="Game controller"
            >
              🎮
            </div>
            <p
              className="font-display font-bold text-lg mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              {searchQuery ? "No games found" : "No games available"}
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {searchQuery
                ? "Try a different search term"
                : "Check back later for new games"}
            </p>
          </div>
        )}

        {/* Grid */}
        {!isEmpty && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {games.map((game, i) => (
              <GameCard
                key={game.id}
                game={game}
                onPlay={onPlay}
                delay={(i % 6) + 1}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
