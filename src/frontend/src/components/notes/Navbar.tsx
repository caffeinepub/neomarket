import { Button } from "@/components/ui/button";
import { BookOpen, LayoutDashboard, Zap, ZapOff } from "lucide-react";

interface NavbarProps {
  lowResource: boolean;
  onToggleLowResource: () => void;
  onNavigate: (path: string) => void;
  currentPath: string;
}

export function Navbar({
  lowResource,
  onToggleLowResource,
  onNavigate,
  currentPath,
}: NavbarProps) {
  const links = [
    { label: "Home", path: "/" },
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-card border-b border-border/50 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate("/")}
          className="flex items-center gap-2 font-display font-bold text-lg text-primary hover:opacity-80 transition-opacity"
          aria-label="Study Notes Maker home"
        >
          <BookOpen className="h-5 w-5" />
          <span className="hidden sm:inline">AJITO Notes</span>
        </button>

        <nav className="flex items-center gap-1">
          {links.map((link) => (
            <button
              type="button"
              key={link.path}
              data-ocid={`nav.${link.label.toLowerCase()}.link`}
              onClick={() => onNavigate(link.path)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                currentPath === link.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {link.icon}
              {link.label}
            </button>
          ))}
        </nav>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-ocid="landing.toggle"
          onClick={onToggleLowResource}
          className="gap-1.5 text-xs"
          title={lowResource ? "Low-resource mode ON" : "Low-resource mode OFF"}
        >
          {lowResource ? (
            <ZapOff className="h-4 w-4 text-yellow-400" />
          ) : (
            <Zap className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">
            {lowResource ? "Low-Res" : "Full"}
          </span>
        </Button>
      </div>
    </header>
  );
}
