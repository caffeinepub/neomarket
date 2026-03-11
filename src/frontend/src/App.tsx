import { Navbar } from "@/components/notes/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { DashboardPage } from "@/pages/DashboardPage";
import { GeneratorPage } from "@/pages/GeneratorPage";
import { LandingPage } from "@/pages/LandingPage";
import { NotesAuthPage } from "@/pages/NotesAuthPage";
import { useEffect, useState } from "react";

// ── Simple hash-based router ──────────────────────────────────────────────────
function getHashRoute() {
  const raw = window.location.hash.slice(1) || "/";
  const idx = raw.indexOf("?");
  return {
    path: idx === -1 ? raw : raw.slice(0, idx),
    search: idx === -1 ? "" : raw.slice(idx),
  };
}

export default function App() {
  const [route, setRoute] = useState(getHashRoute);
  const [lowResource, setLowResource] = useState(
    () => localStorage.getItem("ajito_low_resource") === "1",
  );

  useEffect(() => {
    const handler = () => setRoute(getHashRoute());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  useEffect(() => {
    if (lowResource) {
      document.body.classList.add("low-resource");
    } else {
      document.body.classList.remove("low-resource");
    }
    localStorage.setItem("ajito_low_resource", lowResource ? "1" : "0");
  }, [lowResource]);

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  const searchParams = new URLSearchParams(route.search);
  const topic = searchParams.get("topic") || "";

  const renderPage = () => {
    switch (route.path) {
      case "/generate":
        return <GeneratorPage topic={topic} onNavigate={navigate} />;
      case "/dashboard":
        return <DashboardPage onNavigate={navigate} />;
      case "/auth":
        return <NotesAuthPage onNavigate={navigate} />;
      default:
        return <LandingPage onNavigate={navigate} />;
    }
  };

  return (
    <>
      <Navbar
        lowResource={lowResource}
        onToggleLowResource={() => setLowResource((p) => !p)}
        onNavigate={navigate}
        currentPath={route.path}
      />
      {renderPage()}
      <Toaster
        toastOptions={{
          style: {
            background: "oklch(0.09 0 0 / 0.95)",
            border: "1px solid oklch(0.77 0.19 195 / 0.2)",
            color: "oklch(0.93 0.015 210)",
          },
        }}
      />
    </>
  );
}
