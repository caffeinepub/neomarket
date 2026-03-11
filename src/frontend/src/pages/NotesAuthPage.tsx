import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { BookOpen, Loader2, LogIn, Shield } from "lucide-react";

interface NotesAuthPageProps {
  onNavigate: (path: string) => void;
}

export function NotesAuthPage({ onNavigate }: NotesAuthPageProps) {
  const { login, clear, isLoginError, identity, isLoggingIn } =
    useInternetIdentity();

  if (identity) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card rounded-2xl p-10 max-w-md w-full text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h2 className="font-display font-bold text-2xl">You're logged in</h2>
          <p className="text-muted-foreground text-sm">
            Principal:{" "}
            <span className="font-mono text-xs text-primary/80">
              {identity.getPrincipal().toString().slice(0, 20)}…
            </span>
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={() => onNavigate("/dashboard")}
              className="w-full bg-primary text-primary-foreground"
            >
              View My Notes
            </Button>
            <Button
              variant="ghost"
              onClick={clear}
              className="w-full text-muted-foreground"
            >
              Logout
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card rounded-2xl p-10 max-w-md w-full text-center space-y-5">
        <BookOpen className="h-12 w-12 text-primary mx-auto" />
        <div>
          <h2 className="font-display font-bold text-2xl mb-2">
            Login to AJITO Notes
          </h2>
          <p className="text-muted-foreground text-sm">
            Use Internet Identity to securely save and access your notes from
            any device.
          </p>
        </div>

        <div className="bg-muted/20 rounded-lg p-4 text-xs text-muted-foreground text-left space-y-1">
          <p className="flex items-start gap-1.5">
            <span className="text-primary mt-0.5">✓</span>
            <span>
              Passwords are never stored or emailed — we use ICP Internet
              Identity
            </span>
          </p>
          <p className="flex items-start gap-1.5">
            <span className="text-primary mt-0.5">✓</span>
            <span>
              Notes are encrypted on the blockchain and only you can access them
            </span>
          </p>
          <p className="flex items-start gap-1.5">
            <span className="text-primary mt-0.5">✓</span>
            <span>
              Notes generation works without login — login only needed for
              saving
            </span>
          </p>
        </div>

        {isLoginError && (
          <p className="text-destructive text-sm">
            Login failed. Please try again.
          </p>
        )}

        <Button
          data-ocid="auth.primary_button"
          onClick={login}
          disabled={isLoggingIn}
          className="w-full bg-primary text-primary-foreground font-semibold h-11"
        >
          {isLoggingIn ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <LogIn className="h-4 w-4 mr-2" />
          )}
          Login with Internet Identity
        </Button>

        <Button
          variant="ghost"
          onClick={() => onNavigate("/")}
          className="text-muted-foreground text-sm"
        >
          Continue as guest
        </Button>
      </div>
    </main>
  );
}
