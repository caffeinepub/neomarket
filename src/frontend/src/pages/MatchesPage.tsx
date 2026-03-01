import { CompatibilityMeter } from "@/components/dating/CompatibilityMeter";
import { useApp } from "@/context/AppContext";
import { CheckCircle, Heart, MapPin, MessageCircle } from "lucide-react";

interface Props {
  onChatWith: (userId: string) => void;
}

export function MatchesPage({ onChatWith }: Props) {
  const { matches, currentUser, getCompatibilityScore } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2
          className="text-3xl font-black font-display mb-2"
          style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
        >
          Your Matches
        </h2>
        <p style={{ color: "rgba(240,230,255,0.45)", fontSize: 14 }}>
          {matches.length} people liked you back
        </p>
      </div>

      {matches.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-24 rounded-3xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,45,120,0.12)",
          }}
        >
          <Heart
            size={56}
            style={{ color: "rgba(255,45,120,0.35)", marginBottom: 16 }}
          />
          <p
            className="text-xl font-bold mb-2"
            style={{ color: "rgba(240,230,255,0.5)" }}
          >
            No matches yet
          </p>
          <p
            className="text-sm text-center max-w-xs"
            style={{ color: "rgba(240,230,255,0.3)" }}
          >
            Start swiping on the Discover page to find your perfect match!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((user) => {
            const score = currentUser
              ? getCompatibilityScore(currentUser, user)
              : 50;
            return (
              <div
                key={user.id}
                className="glass-panel glass-panel-hover p-4 flex flex-col gap-4 transition-all duration-300"
                style={{
                  cursor: "default",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 12px 40px rgba(255,45,120,0.15), 0 0 20px rgba(255,45,120,0.05)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 4px 20px rgba(0,0,0,0.3)";
                }}
              >
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    loading="lazy"
                    className="w-full rounded-2xl object-cover"
                    style={{
                      height: 200,
                      background: "#1a0a1f",
                    }}
                  />
                  {user.isOnline && (
                    <div
                      className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(0,0,0,0.65)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      <span
                        className="online-dot"
                        style={{ width: 6, height: 6 }}
                      />
                      <span
                        style={{
                          color: "#00f5d4",
                          fontSize: 9,
                          fontWeight: 700,
                        }}
                      >
                        ONLINE
                      </span>
                    </div>
                  )}
                  {/* Match badge */}
                  <div
                    className="absolute -bottom-3 left-1/2 flex items-center gap-1 px-3 py-1 rounded-full"
                    style={{
                      transform: "translateX(-50%)",
                      background: "linear-gradient(135deg, #ff2d78, #9b5de5)",
                      boxShadow: "0 0 16px rgba(255,45,120,0.4)",
                    }}
                  >
                    <Heart size={10} fill="white" style={{ color: "white" }} />
                    <span
                      style={{ color: "white", fontSize: 10, fontWeight: 700 }}
                    >
                      MATCH
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className="font-bold text-base font-display"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {user.name}, {user.age}
                    </h3>
                    {user.isVerified && (
                      <CheckCircle size={14} style={{ color: "#00f5d4" }} />
                    )}
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    <MapPin
                      size={11}
                      style={{ color: "rgba(240,230,255,0.4)" }}
                    />
                    <span
                      style={{ color: "rgba(240,230,255,0.4)", fontSize: 12 }}
                    >
                      {user.location}
                    </span>
                  </div>

                  {/* Hobbies */}
                  <div className="flex gap-1.5 flex-wrap mb-3">
                    {user.hobbies.slice(0, 3).map((h) => (
                      <span
                        key={h}
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{
                          background: "rgba(255,45,120,0.1)",
                          border: "1px solid rgba(255,45,120,0.2)",
                          color: "rgba(240,230,255,0.65)",
                        }}
                      >
                        {h}
                      </span>
                    ))}
                  </div>

                  <CompatibilityMeter score={score} />

                  <button
                    type="button"
                    onClick={() => onChatWith(user.id)}
                    className="neon-btn-primary w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-3"
                  >
                    <MessageCircle size={15} />
                    Start Chat
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
