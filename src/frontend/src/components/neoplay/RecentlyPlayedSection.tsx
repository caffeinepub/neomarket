import { Clock } from "lucide-react";
import { GameCard } from "./GameCard";
import type { LocalGame } from "./gameData";

interface RecentlyPlayedSectionProps {
  games: LocalGame[];
  onPlay: (game: LocalGame) => void;
}

export function RecentlyPlayedSection({
  games,
  onPlay,
}: RecentlyPlayedSectionProps) {
  // Hidden when no recently played history
  if (games.length === 0) return null;

  return (
    <section
      className="py-12 px-4 sm:px-6 lg:px-8"
      aria-labelledby="recently-played-heading"
    >
      {/* Divider */}
      <div
        className="max-w-7xl mx-auto mb-8 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(0,212,255,0.2), rgba(155,89,255,0.2), transparent)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 fade-in-view">
          <h2
            id="recently-played-heading"
            className="section-title-accent font-display font-bold text-xl sm:text-2xl"
            style={{ color: "var(--text-primary)" }}
          >
            <span className="flex items-center gap-2">
              <Clock size={20} style={{ color: "var(--neon-purple)" }} />
              Recently Played
            </span>
          </h2>
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            {games.length} game{games.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Horizontal scroll row */}
        <div className="horizontal-scroll flex gap-4 pb-2">
          {games.map((game, i) => (
            <div key={game.id} className="flex-shrink-0 w-64 sm:w-72">
              <GameCard
                game={game}
                onPlay={onPlay}
                compact
                delay={(i % 5) + 1}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
