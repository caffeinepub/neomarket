import { useApp } from "@/context/AppContext";
import {
  Heart,
  Home,
  Menu,
  MessageCircle,
  Moon,
  Shield,
  Star,
  Sun,
  User,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { NotificationBell } from "./NotificationBell";

type Page = "discover" | "matches" | "chat" | "stories" | "profile" | "admin";

interface Props {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const NAV_ITEMS: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: "discover", label: "Discover", icon: <Home size={16} /> },
  { id: "matches", label: "Matches", icon: <Heart size={16} /> },
  { id: "chat", label: "Chat", icon: <MessageCircle size={16} /> },
  { id: "stories", label: "Stories", icon: <Star size={16} /> },
  { id: "profile", label: "Profile", icon: <User size={16} /> },
];

export function Navbar({ currentPage, onNavigate }: Props) {
  const { currentUser, logout, darkMode, toggleDarkMode, onlineCount } =
    useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleNav(page: Page) {
    onNavigate(page);
    setMobileOpen(false);
  }

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="dating-navbar sticky top-0 z-50 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          {/* Logo */}
          <button
            type="button"
            onClick={() => handleNav("discover")}
            className="flex items-center gap-2 mr-4"
          >
            <Heart
              size={22}
              style={{
                color: "#ff2d78",
                filter: "drop-shadow(0 0 6px rgba(255,45,120,0.6))",
              }}
              fill="#ff2d78"
            />
            <span
              className="text-xl font-black font-display neon-title-dating"
              style={{ letterSpacing: "-0.02em" }}
            >
              NeoDate
            </span>
          </button>

          {/* Online counter */}
          <div
            className="hidden md:flex items-center gap-2 text-xs px-3 py-1 rounded-full"
            style={{
              background: "rgba(0,245,212,0.08)",
              border: "1px solid rgba(0,245,212,0.2)",
              color: "rgba(240,230,255,0.6)",
            }}
          >
            <Users size={12} style={{ color: "#00f5d4" }} />
            <span>
              <span style={{ color: "#00f5d4", fontWeight: 700 }}>
                {onlineCount}
              </span>{" "}
              online
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 ml-2">
            {NAV_ITEMS.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => handleNav(item.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background:
                    currentPage === item.id
                      ? "linear-gradient(135deg, rgba(255,45,120,0.2), rgba(155,93,229,0.15))"
                      : "transparent",
                  color:
                    currentPage === item.id
                      ? "#ff2d78"
                      : "rgba(240,230,255,0.55)",
                  border:
                    currentPage === item.id
                      ? "1px solid rgba(255,45,120,0.3)"
                      : "1px solid transparent",
                  boxShadow:
                    currentPage === item.id
                      ? "0 0 12px rgba(255,45,120,0.15)"
                      : "none",
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            {currentUser?.isAdmin && (
              <button
                type="button"
                onClick={() => handleNav("admin")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background:
                    currentPage === "admin"
                      ? "linear-gradient(135deg, rgba(0,245,212,0.2), rgba(155,93,229,0.15))"
                      : "transparent",
                  color:
                    currentPage === "admin"
                      ? "#00f5d4"
                      : "rgba(240,230,255,0.55)",
                  border:
                    currentPage === "admin"
                      ? "1px solid rgba(0,245,212,0.3)"
                      : "1px solid transparent",
                }}
              >
                <Shield size={16} />
                Admin
              </button>
            )}
          </div>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-2 rounded-xl transition-all duration-200 hidden md:flex"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,45,120,0.15)",
                color: "rgba(240,230,255,0.7)",
              }}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <NotificationBell />

            {/* User avatar */}
            {currentUser && (
              <button
                type="button"
                onClick={() => handleNav("profile")}
                className="relative"
              >
                <img
                  src={currentUser.profileImage ?? currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover"
                  style={{
                    border: "2px solid rgba(255,45,120,0.5)",
                    boxShadow: "0 0 8px rgba(255,45,120,0.3)",
                  }}
                />
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[#0a0a0f]"
                  style={{ background: "#00f5d4" }}
                />
              </button>
            )}

            {/* Logout */}
            <button
              type="button"
              onClick={logout}
              className="hidden md:flex text-xs px-3 py-1.5 rounded-xl font-medium transition-all duration-200"
              style={{
                background: "rgba(255,45,120,0.08)",
                border: "1px solid rgba(255,45,120,0.2)",
                color: "rgba(240,230,255,0.5)",
              }}
            >
              Logout
            </button>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="md:hidden p-2 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,45,120,0.15)",
                color: "rgba(240,230,255,0.7)",
              }}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileOpen && (
          <div
            className="md:hidden absolute top-full left-0 right-0 p-4 flex flex-col gap-2"
            style={{
              background: "rgba(10,10,15,0.98)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(255,45,120,0.15)",
              zIndex: 100,
            }}
          >
            {NAV_ITEMS.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => handleNav(item.id)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left"
                style={{
                  background:
                    currentPage === item.id
                      ? "linear-gradient(135deg, rgba(255,45,120,0.2), rgba(155,93,229,0.15))"
                      : "rgba(255,255,255,0.03)",
                  color:
                    currentPage === item.id
                      ? "#ff2d78"
                      : "rgba(240,230,255,0.7)",
                  border: "1px solid rgba(255,45,120,0.1)",
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            {currentUser?.isAdmin && (
              <button
                type="button"
                onClick={() => handleNav("admin")}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full text-left"
                style={{
                  background: "rgba(0,245,212,0.08)",
                  border: "1px solid rgba(0,245,212,0.2)",
                  color: "#00f5d4",
                }}
              >
                <Shield size={16} />
                Admin Panel
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                logout();
                setMobileOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full text-left"
              style={{
                background: "rgba(255,45,120,0.08)",
                border: "1px solid rgba(255,45,120,0.15)",
                color: "rgba(240,230,255,0.6)",
              }}
            >
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden bottom-nav fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2 safe-bottom">
        {NAV_ITEMS.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => handleNav(item.id)}
            className="flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all duration-200 flex-1"
            style={{
              color:
                currentPage === item.id ? "#ff2d78" : "rgba(240,230,255,0.4)",
            }}
          >
            {item.icon}
            <span
              className="text-[9px] font-semibold"
              style={{ letterSpacing: "0.05em" }}
            >
              {item.label.toUpperCase()}
            </span>
          </button>
        ))}
      </nav>
    </>
  );
}
