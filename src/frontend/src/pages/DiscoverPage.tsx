import { SearchFilterPanel } from "@/components/dating/SearchFilterPanel";
import { SwipeCard } from "@/components/dating/SwipeCard";
import { useApp } from "@/context/AppContext";
import { formatLastActive } from "@/context/AppContext";
import { ChevronDown, Heart, Users, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
}

const CONFETTI_COLORS = ["#ff2d78", "#9b5de5", "#00f5d4", "#ffd60a", "#ff6b6b"];

function createConfetti(): ConfettiPiece[] {
  return Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: Math.random() * 8 + 4,
    delay: Math.random() * 0.5,
    duration: Math.random() * 1.5 + 1.5,
  }));
}

export function DiscoverPage() {
  const {
    swipeQueue,
    filteredUsers,
    currentUser,
    swipe,
    getCompatibilityScore,
    onlineCount,
    searchFilters,
    setSearchFilters,
    loadMoreUsers,
    currentPage,
  } = useApp();
  const [matchUser, setMatchUser] = useState<{
    name: string;
    score: number;
  } | null>(null);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const matchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const topUsers = swipeQueue.slice(0, 3);
  const hasMoreUsers = filteredUsers.length > swipeQueue.length;
  const PAGE_SIZE = 10;

  const handleSwipe = useCallback(
    (userId: string, direction: "like" | "pass") => {
      const result = swipe(userId, direction);
      if (result === "match" && direction === "like") {
        const user = swipeQueue.find((u) => u.id === userId);
        if (user) {
          const score = currentUser
            ? getCompatibilityScore(currentUser, user)
            : 50;
          setMatchUser({ name: user.name, score });
          setConfetti(createConfetti());
          if (matchTimerRef.current) clearTimeout(matchTimerRef.current);
          matchTimerRef.current = setTimeout(() => {
            setMatchUser(null);
            setConfetti([]);
          }, 3500);
        }
      }
    },
    [swipe, swipeQueue, currentUser, getCompatibilityScore],
  );

  const isFirstUser = filteredUsers.length === 0 && !searchFilters.nameSearch;

  return (
    <div className="flex flex-col items-center px-4 py-8">
      {/* Header */}
      <div className="w-full max-w-sm mb-4 flex items-center justify-between">
        <div>
          <h2
            className="text-2xl font-black font-display"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            Discover
          </h2>
          <p style={{ color: "rgba(240,230,255,0.45)", fontSize: 13 }}>
            Swipe to find your match
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{
            background: "rgba(0,245,212,0.08)",
            border: "1px solid rgba(0,245,212,0.2)",
            color: "#00f5d4",
          }}
        >
          <Users size={12} />
          {onlineCount} online
        </div>
      </div>

      {/* Search & Filter panel */}
      <div className="w-full max-w-sm mb-4">
        <SearchFilterPanel
          filters={searchFilters}
          onChange={setSearchFilters}
          onApply={() => {}}
        />
      </div>

      {/* Card deck */}
      <div className="relative" style={{ width: 360, height: 480 }}>
        {isFirstUser ? (
          <div
            className="flex flex-col items-center justify-center w-full h-full rounded-3xl"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,45,120,0.15)",
            }}
          >
            <Heart
              size={48}
              style={{ color: "rgba(255,45,120,0.4)", marginBottom: 16 }}
            />
            <p
              className="text-lg font-bold text-center px-6"
              style={{ color: "rgba(240,230,255,0.6)" }}
            >
              You're the first one here!
            </p>
            <p
              className="text-sm text-center mt-2 px-8"
              style={{ color: "rgba(240,230,255,0.35)" }}
            >
              Share the app to find matches. More people join every day! 💕
            </p>
          </div>
        ) : topUsers.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center w-full h-full rounded-3xl"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,45,120,0.15)",
            }}
          >
            <Heart
              size={48}
              style={{ color: "rgba(255,45,120,0.4)", marginBottom: 16 }}
            />
            <p
              className="text-lg font-bold text-center"
              style={{ color: "rgba(240,230,255,0.6)" }}
            >
              {searchFilters.nameSearch ||
              searchFilters.locationFilter ||
              searchFilters.hobbyFilter
                ? "No results found"
                : "You've seen everyone!"}
            </p>
            <p
              className="text-sm text-center mt-2"
              style={{ color: "rgba(240,230,255,0.35)" }}
            >
              {searchFilters.nameSearch ||
              searchFilters.locationFilter ||
              searchFilters.hobbyFilter
                ? "Try different filters"
                : "Check your matches and start chatting"}
            </p>
          </div>
        ) : (
          topUsers
            .slice()
            .reverse()
            .map((user, revIdx) => {
              const stackIndex = topUsers.length - 1 - revIdx;
              const score = currentUser
                ? getCompatibilityScore(currentUser, user)
                : 50;
              const regUser = user as { lastActive?: number };
              const lastActiveStr = regUser.lastActive
                ? formatLastActive(regUser.lastActive)
                : undefined;
              return (
                <SwipeCard
                  key={user.id}
                  user={user}
                  compatScore={score}
                  onSwipe={(dir) => handleSwipe(user.id, dir)}
                  stackIndex={stackIndex}
                  lastActiveStr={lastActiveStr}
                />
              );
            })
        )}
      </div>

      {/* Action buttons */}
      {topUsers.length > 0 && (
        <div className="flex items-center gap-6 mt-8">
          <button
            type="button"
            onClick={() => handleSwipe(topUsers[0].id, "pass")}
            className="flex items-center justify-center rounded-full transition-all duration-300"
            style={{
              width: 60,
              height: 60,
              background: "rgba(255,80,80,0.1)",
              border: "2px solid rgba(255,80,80,0.4)",
              color: "#ff5050",
              boxShadow: "0 4px 20px rgba(255,80,80,0.15)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 25px rgba(255,80,80,0.5)";
              (e.currentTarget as HTMLElement).style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 4px 20px rgba(255,80,80,0.15)";
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
            aria-label="Pass"
          >
            <X size={26} />
          </button>

          <button
            type="button"
            onClick={() => handleSwipe(topUsers[0].id, "like")}
            className="flex items-center justify-center rounded-full transition-all duration-300"
            style={{
              width: 72,
              height: 72,
              background: "linear-gradient(135deg, #ff2d78, #9b5de5)",
              border: "none",
              color: "white",
              boxShadow: "0 4px 25px rgba(255,45,120,0.4)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 35px rgba(255,45,120,0.7)";
              (e.currentTarget as HTMLElement).style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 4px 25px rgba(255,45,120,0.4)";
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
            aria-label="Like"
          >
            <Heart size={30} fill="white" />
          </button>
        </div>
      )}

      {/* Load more */}
      {hasMoreUsers && topUsers.length > 0 && (
        <button
          type="button"
          onClick={loadMoreUsers}
          className="flex items-center gap-2 mt-6 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
          style={{
            background: "rgba(155,93,229,0.1)",
            border: "1px solid rgba(155,93,229,0.3)",
            color: "#9b5de5",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 0 16px rgba(155,93,229,0.3)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}
        >
          <ChevronDown size={15} />
          Load More ({filteredUsers.length - currentPage * PAGE_SIZE} more)
        </button>
      )}

      {/* Match popup */}
      {matchUser && (
        <div className="match-popup">
          {confetti.map((c) => (
            <div
              key={c.id}
              className="confetti-piece"
              style={{
                left: `${c.x}%`,
                top: 0,
                width: c.size,
                height: c.size,
                background: c.color,
                animationDuration: `${c.duration}s`,
                animationDelay: `${c.delay}s`,
              }}
            />
          ))}
          <div className="flex flex-col items-center gap-4 px-8">
            <p className="match-popup-text">IT'S A MATCH! 💕</p>
            <p
              className="text-lg text-center font-semibold"
              style={{ color: "rgba(240,230,255,0.75)" }}
            >
              You and{" "}
              <span style={{ color: "#ff2d78", fontWeight: 800 }}>
                {matchUser.name}
              </span>{" "}
              liked each other!
            </p>
            {matchUser.score > 0 && (
              <div
                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold"
                style={{
                  background: "rgba(155,93,229,0.2)",
                  border: "1px solid rgba(155,93,229,0.4)",
                  color: "#9b5de5",
                }}
              >
                ✨ {matchUser.score}% compatibility
              </div>
            )}
            <div
              className="flex gap-3 mt-2"
              style={{ animation: "celebrationIn 0.5s 0.3s both" }}
            >
              <Heart
                size={40}
                fill="#ff2d78"
                style={{
                  color: "#ff2d78",
                  filter: "drop-shadow(0 0 12px rgba(255,45,120,0.7))",
                  animation: "heartbeat 0.8s ease-in-out infinite",
                }}
              />
              <Heart
                size={40}
                fill="#9b5de5"
                style={{
                  color: "#9b5de5",
                  filter: "drop-shadow(0 0 12px rgba(155,93,229,0.7))",
                  animation: "heartbeat 0.8s 0.2s ease-in-out infinite",
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setMatchUser(null);
                setConfetti([]);
              }}
              className="px-8 py-3 rounded-2xl font-bold text-sm neon-btn-primary mt-2"
            >
              Keep Swiping 🔥
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
