import { Play, Star, Users } from "lucide-react";
import type { LocalGame } from "./gameData";
import { formatPlayCount } from "./gameData";

interface GameCardProps {
  game: LocalGame;
  onPlay: (game: LocalGame) => void;
  compact?: boolean;
  delay?: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  Action: "rgba(255, 99, 99, 0.15)",
  Racing: "rgba(255, 165, 0, 0.15)",
  Puzzle: "rgba(100, 200, 255, 0.15)",
  Multiplayer: "rgba(0, 212, 255, 0.15)",
  Adventure: "rgba(100, 255, 150, 0.15)",
  Sports: "rgba(255, 200, 50, 0.15)",
};

const CATEGORY_TEXT_COLORS: Record<string, string> = {
  Action: "#ff6363",
  Racing: "#ffaa44",
  Puzzle: "#64c8ff",
  Multiplayer: "var(--neon-cyan)",
  Adventure: "#64ff96",
  Sports: "#ffc832",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`Rating: ${rating} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={10}
          className={i <= Math.round(rating) ? "star-filled" : "star-empty"}
          fill={i <= Math.round(rating) ? "currentColor" : "none"}
        />
      ))}
      <span
        className="ml-1 text-xs font-medium"
        style={{ color: "var(--text-secondary)" }}
      >
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export function GameCard({
  game,
  onPlay,
  compact = false,
  delay = 0,
}: GameCardProps) {
  const delayClass = delay > 0 ? `delay-${Math.min(delay, 6)}` : "";

  return (
    <article
      className={`game-card rounded-2xl overflow-hidden group fade-in-view ${delayClass}`}
      style={{ cursor: "pointer" }}
    >
      {/* Thumbnail */}
      <button
        type="button"
        className="relative overflow-hidden w-full block border-0 p-0"
        style={{ aspectRatio: "16/9" }}
        onClick={() => onPlay(game)}
        aria-label={`Play ${game.title}`}
      >
        <img
          src={game.thumbnailUrl}
          alt={`${game.title} thumbnail`}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent) {
              parent.style.background =
                "linear-gradient(135deg, rgba(0,212,255,0.08), rgba(155,89,255,0.08))";
            }
          }}
        />

        {/* Overlay on hover */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: "rgba(0,0,0,0.55)" }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,212,255,0.9), rgba(155,89,255,0.9))",
              boxShadow: "0 0 20px rgba(0,212,255,0.5)",
            }}
          >
            <Play size={20} fill="white" color="white" />
          </div>
        </div>

        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              background:
                CATEGORY_COLORS[game.category] ?? "rgba(155,89,255,0.15)",
              color:
                CATEGORY_TEXT_COLORS[game.category] ?? "var(--neon-purple)",
              border: `1px solid ${CATEGORY_TEXT_COLORS[game.category] ?? "var(--neon-purple)"}22`,
              backdropFilter: "blur(8px)",
            }}
          >
            {game.category}
          </span>
        </div>
      </button>

      {/* Card body */}
      <div className={compact ? "p-3" : "p-4"}>
        <h3
          className={`font-display font-bold truncate mb-1 ${compact ? "text-sm" : "text-base"}`}
          style={{ color: "var(--text-primary)" }}
        >
          {game.title}
        </h3>

        {!compact && (
          <p
            className="text-xs mb-3 line-clamp-2 leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            {game.description}
          </p>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <StarRating rating={game.rating} />
            <div className="flex items-center gap-1">
              <Users size={10} style={{ color: "var(--text-muted)" }} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {formatPlayCount(game.playCount)} plays
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onPlay(game)}
            className={`play-btn flex items-center gap-1.5 rounded-xl font-bold ${
              compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
            }`}
            style={{ background: "linear-gradient(135deg, #00d4ff, #9b59ff)" }}
            aria-label={`Play ${game.title}`}
          >
            <Play size={compact ? 10 : 12} fill="white" />
            Play
          </button>
        </div>
      </div>
    </article>
  );
}
