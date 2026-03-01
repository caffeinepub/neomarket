import { CursorGlow } from "@/components/dating/CursorGlow";
import { Navbar } from "@/components/dating/Navbar";
import { ParticleBackground } from "@/components/dating/ParticleBackground";
import { Toaster } from "@/components/ui/sonner";
import { AppProvider, useApp } from "@/context/AppContext";
import { AdminPage } from "@/pages/AdminPage";
import { AuthPage } from "@/pages/AuthPage";
import { ChatPage } from "@/pages/ChatPage";
import { DiscoverPage } from "@/pages/DiscoverPage";
import { MatchesPage } from "@/pages/MatchesPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { StoriesPage } from "@/pages/StoriesPage";
import { useState } from "react";

type Page = "discover" | "matches" | "chat" | "stories" | "profile" | "admin";

function InnerApp() {
  const { isAuthenticated } = useApp();
  const [page, setPage] = useState<Page>("discover");
  const [chatUserId, setChatUserId] = useState<string | null>(null);

  if (!isAuthenticated) {
    return <AuthPage onSuccess={() => setPage("discover")} />;
  }

  function navigateTo(target: Page) {
    setPage(target);
    if (target !== "chat") setChatUserId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openChatWith(userId: string) {
    setChatUserId(userId);
    setPage("chat");
  }

  return (
    <div className="dating-bg min-h-screen relative">
      {/* Particle canvas background */}
      <ParticleBackground />

      {/* Cursor glow */}
      <CursorGlow />

      {/* Scroll progress bar */}
      <ScrollProgress />

      {/* Content */}
      <div
        className="relative flex flex-col min-h-screen"
        style={{ zIndex: 10 }}
      >
        <Navbar currentPage={page} onNavigate={navigateTo} />

        <main className="flex-1 pb-20 md:pb-6">
          {page === "discover" && <DiscoverPage />}
          {page === "matches" && <MatchesPage onChatWith={openChatWith} />}
          {page === "chat" && <ChatPage initialUserId={chatUserId} />}
          {page === "stories" && <StoriesPage />}
          {page === "profile" && <ProfilePage />}
          {page === "admin" && <AdminPage />}
        </main>

        <footer
          className="py-4 text-center border-t"
          style={{
            borderColor: "rgba(255,45,120,0.08)",
            color: "rgba(240,230,255,0.25)",
            fontSize: 12,
          }}
        >
          © {new Date().getFullYear()}{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "rgba(240,230,255,0.35)" }}
            className="hover:underline"
          >
            Built with ♥ using caffeine.ai
          </a>
        </footer>
      </div>

      <Toaster
        toastOptions={{
          style: {
            background: "rgba(10,10,15,0.95)",
            border: "1px solid rgba(255,45,120,0.2)",
            color: "#f0e6ff",
          },
        }}
      />
    </div>
  );
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  if (typeof window !== "undefined") {
    window.onscroll = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      if (scrollHeight > 0) {
        setProgress((scrollTop / scrollHeight) * 100);
      }
    };
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100]"
      style={{ height: 2, background: "rgba(255,45,120,0.1)" }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background: "linear-gradient(90deg, #ff2d78, #9b5de5, #00f5d4)",
          transition: "width 0.1s ease",
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <InnerApp />
    </AppProvider>
  );
}
