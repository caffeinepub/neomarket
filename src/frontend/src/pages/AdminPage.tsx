import { useApp } from "@/context/AppContext";
import { formatLastActive } from "@/context/AppContext";
import {
  Ban,
  CheckCircle,
  Heart,
  MessageCircle,
  Shield,
  Users,
  Wifi,
} from "lucide-react";
import { useEffect, useState } from "react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / 40);
    const interval = setInterval(() => {
      start = Math.min(start + step, value);
      setDisplayed(start);
      if (start >= value) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [value]);

  return (
    <div
      className="stat-card glass-panel p-5 flex flex-col gap-3"
      style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
    >
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{
          width: 48,
          height: 48,
          background: `${color}18`,
          border: `1px solid ${color}30`,
        }}
      >
        <div style={{ color }}>{icon}</div>
      </div>
      <div>
        <p
          className="text-3xl font-black font-display"
          style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
        >
          {displayed.toLocaleString()}
        </p>
        <p
          style={{
            color: "rgba(240,230,255,0.45)",
            fontSize: 13,
            marginTop: 2,
          }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

export function AdminPage() {
  const {
    currentUser,
    banUser,
    unbanUser,
    bannedUserIds,
    matches,
    onlineCount,
    users,
    messages,
  } = useApp();
  const [search, setSearch] = useState("");

  if (!currentUser?.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Shield size={48} style={{ color: "rgba(255,45,120,0.4)" }} />
        <p
          className="text-xl font-bold"
          style={{ color: "rgba(240,230,255,0.5)" }}
        >
          Unauthorized
        </p>
        <p style={{ color: "rgba(240,230,255,0.3)", fontSize: 14 }}>
          You need admin access to view this page.
        </p>
      </div>
    );
  }

  // Active chats = matches that have messages
  const activeChats = matches.filter(
    (m) => (messages[m.id] ?? []).length > 0,
  ).length;

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.location.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="flex items-center justify-center rounded-2xl"
          style={{
            width: 48,
            height: 48,
            background:
              "linear-gradient(135deg, rgba(0,245,212,0.2), rgba(155,93,229,0.2))",
            border: "1px solid rgba(0,245,212,0.3)",
          }}
        >
          <Shield size={22} style={{ color: "#00f5d4" }} />
        </div>
        <div>
          <h2
            className="text-2xl font-black font-display"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            Admin Dashboard
          </h2>
          <p style={{ color: "rgba(240,230,255,0.4)", fontSize: 13 }}>
            NeoDate platform overview
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Users size={22} />}
          label="Total Users"
          value={users.length}
          color="#ff2d78"
        />
        <StatCard
          icon={<Heart size={22} />}
          label="Total Matches"
          value={matches.length}
          color="#9b5de5"
        />
        <StatCard
          icon={<MessageCircle size={22} />}
          label="Active Chats"
          value={activeChats}
          color="#00f5d4"
        />
        <StatCard
          icon={<Wifi size={22} />}
          label="Online Now"
          value={onlineCount}
          color="#ffd60a"
        />
      </div>

      {/* Users table */}
      <div
        className="glass-panel overflow-hidden"
        style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.3)" }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,45,120,0.1)" }}
        >
          <h3
            className="font-bold text-base"
            style={{ color: "var(--text-primary)" }}
          >
            All Users ({users.length})
          </h3>
          <input
            type="text"
            className="dating-input"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 220, padding: "8px 12px", fontSize: 13 }}
          />
        </div>

        {/* Table header */}
        <div
          className="hidden md:grid px-6 py-3 text-xs font-bold"
          style={{
            gridTemplateColumns: "auto 1fr 1fr auto auto auto",
            color: "rgba(240,230,255,0.35)",
            letterSpacing: "0.08em",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <span className="w-10" />
          <span>NAME</span>
          <span>LOCATION</span>
          <span>LAST ACTIVE</span>
          <span>STATUS</span>
          <span>ACTION</span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Users size={32} style={{ color: "rgba(255,255,255,0.15)" }} />
            <p style={{ color: "rgba(240,230,255,0.3)", fontSize: 14 }}>
              {search
                ? "No users match your search"
                : "No registered users yet"}
            </p>
          </div>
        ) : (
          <div
            className="divide-y"
            style={{ borderColor: "rgba(255,255,255,0.04)" }}
          >
            {filtered.map((user) => {
              const isBanned = bannedUserIds.includes(user.id);
              const lastActiveStr = user.lastActive
                ? formatLastActive(user.lastActive)
                : "Unknown";
              return (
                <div
                  key={user.id}
                  className="flex md:grid items-center gap-4 px-6 py-4"
                  style={{
                    gridTemplateColumns: "auto 1fr 1fr auto auto auto",
                    background: isBanned
                      ? "rgba(255,50,50,0.04)"
                      : "transparent",
                  }}
                >
                  {/* Avatar */}
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    loading="lazy"
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    style={{
                      border: "1.5px solid rgba(255,45,120,0.25)",
                      opacity: isBanned ? 0.5 : 1,
                      filter: isBanned ? "grayscale(1)" : "none",
                    }}
                  />

                  {/* Name */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="font-semibold text-sm"
                        style={{
                          color: isBanned
                            ? "rgba(240,230,255,0.3)"
                            : "var(--text-primary)",
                          textDecoration: isBanned ? "line-through" : "none",
                        }}
                      >
                        {user.name}, {user.age}
                      </span>
                      {isBanned && (
                        <span
                          className="px-2 py-0.5 rounded-full text-[9px] font-black"
                          style={{
                            background: "rgba(255,50,50,0.2)",
                            border: "1px solid rgba(255,50,50,0.4)",
                            color: "#ff5050",
                          }}
                        >
                          BANNED
                        </span>
                      )}
                      {user.isVerified && !isBanned && (
                        <CheckCircle size={12} style={{ color: "#00f5d4" }} />
                      )}
                    </div>
                    <p style={{ color: "rgba(240,230,255,0.3)", fontSize: 11 }}>
                      {user.lifestyle}
                    </p>
                  </div>

                  {/* Location */}
                  <span
                    className="hidden md:block text-sm"
                    style={{ color: "rgba(240,230,255,0.45)" }}
                  >
                    {user.location}
                  </span>

                  {/* Last active */}
                  <span
                    className="hidden md:block text-xs"
                    style={{
                      color:
                        lastActiveStr === "Online"
                          ? "#00f5d4"
                          : "rgba(240,230,255,0.35)",
                    }}
                  >
                    {lastActiveStr}
                  </span>

                  {/* Online status */}
                  <div className="hidden md:flex items-center gap-1.5">
                    <span
                      className="rounded-full"
                      style={{
                        width: 7,
                        height: 7,
                        background:
                          user.isOnline && !isBanned
                            ? "#00f5d4"
                            : "rgba(255,255,255,0.2)",
                        boxShadow:
                          user.isOnline && !isBanned
                            ? "0 0 6px rgba(0,245,212,0.6)"
                            : "none",
                      }}
                    />
                    <span
                      style={{ color: "rgba(240,230,255,0.4)", fontSize: 11 }}
                    >
                      {isBanned
                        ? "Banned"
                        : user.isOnline
                          ? "Online"
                          : "Offline"}
                    </span>
                  </div>

                  {/* Ban/unban */}
                  <button
                    type="button"
                    onClick={() =>
                      isBanned ? unbanUser(user.id) : banUser(user.id)
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex-shrink-0"
                    style={{
                      background: isBanned
                        ? "rgba(0,245,212,0.1)"
                        : "rgba(255,50,50,0.1)",
                      border: isBanned
                        ? "1px solid rgba(0,245,212,0.3)"
                        : "1px solid rgba(255,50,50,0.3)",
                      color: isBanned ? "#00f5d4" : "#ff5050",
                    }}
                  >
                    {isBanned ? (
                      <>
                        <CheckCircle size={12} />
                        <span className="hidden sm:inline">Unban</span>
                      </>
                    ) : (
                      <>
                        <Ban size={12} />
                        <span className="hidden sm:inline">Ban</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
