import { useApp } from "@/context/AppContext";
import { Eye, EyeOff, Heart } from "lucide-react";
import { type FormEvent, useState } from "react";

interface Props {
  onSuccess: () => void;
}

function getPasswordStrength(pw: string): {
  level: 0 | 1 | 2 | 3;
  label: string;
  color: string;
} {
  if (pw.length === 0) return { level: 0, label: "", color: "" };
  if (pw.length < 6) return { level: 1, label: "Weak", color: "#ff4444" };
  if (pw.length < 10 || !/[A-Z]/u.test(pw) || !/[0-9]/u.test(pw))
    return { level: 2, label: "Medium", color: "#ffd60a" };
  return { level: 3, label: "Strong", color: "#00f5d4" };
}

export function AuthPage({ onSuccess }: Props) {
  const { login, signup } = useApp();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  // Login fields
  const [loginName, setLoginName] = useState("");
  const [loginPw, setLoginPw] = useState("");

  // Signup fields
  const [signupName, setSignupName] = useState("");
  const [signupAge, setSignupAge] = useState("");
  const [signupLocation, setSignupLocation] = useState("");
  const [signupPw, setSignupPw] = useState("");

  const pwStrength = getPasswordStrength(tab === "signup" ? signupPw : loginPw);

  function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!loginName.trim()) {
      setError("Please enter your username.");
      return;
    }
    const ok = login(loginName.trim(), loginPw);
    if (ok) onSuccess();
    else setError("Invalid credentials.");
  }

  function handleSignup(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!signupName.trim()) {
      setError("Name is required.");
      return;
    }
    if (signupPw.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    signup({
      name: signupName.trim(),
      age: Number.parseInt(signupAge) || 25,
      location: signupLocation.trim() || "Earth",
      password: signupPw,
    });
    onSuccess();
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "#0a0a0f" }}
    >
      {/* Animated gradient blobs */}
      <div
        className="absolute"
        style={{
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,45,120,0.12) 0%, transparent 70%)",
          top: -150,
          left: -150,
          animation: "bgGradientWave 8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute"
        style={{
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(155,93,229,0.1) 0%, transparent 70%)",
          bottom: -100,
          right: -100,
          animation: "bgGradientWave 10s ease-in-out infinite reverse",
        }}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-sm mx-4"
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,45,120,0.2)",
          borderRadius: 24,
          padding: 32,
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.6), 0 0 40px rgba(255,45,120,0.08)",
          animation: "fadeScaleIn 0.4s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="flex items-center justify-center mb-3"
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, rgba(255,45,120,0.2), rgba(155,93,229,0.2))",
              border: "1px solid rgba(255,45,120,0.3)",
              boxShadow: "0 0 20px rgba(255,45,120,0.2)",
            }}
          >
            <Heart size={26} fill="#ff2d78" style={{ color: "#ff2d78" }} />
          </div>
          <h1
            className="text-2xl font-black font-display neon-title-dating"
            style={{ letterSpacing: "-0.02em" }}
          >
            NeoDate
          </h1>
          <p
            style={{
              color: "rgba(240,230,255,0.45)",
              fontSize: 13,
              marginTop: 4,
            }}
          >
            Find your perfect connection
          </p>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 mb-6 p-1 rounded-xl"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {(["login", "signup"] as const).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => {
                setTab(t);
                setError("");
              }}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                background:
                  tab === t
                    ? "linear-gradient(135deg, rgba(255,45,120,0.25), rgba(155,93,229,0.2))"
                    : "transparent",
                color: tab === t ? "#ff2d78" : "rgba(240,230,255,0.4)",
                border:
                  tab === t
                    ? "1px solid rgba(255,45,120,0.3)"
                    : "1px solid transparent",
                boxShadow:
                  tab === t ? "0 0 12px rgba(255,45,120,0.12)" : "none",
              }}
            >
              {t === "login" ? "Login" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Login form */}
        {tab === "login" && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="login-username"
                className="block text-xs font-semibold mb-1.5"
                style={{ color: "rgba(240,230,255,0.5)" }}
              >
                USERNAME
              </label>
              <input
                id="login-username"
                type="text"
                className="dating-input"
                placeholder="Your name or 'admin'"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="relative">
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold mb-1.5"
                style={{ color: "rgba(240,230,255,0.5)" }}
              >
                PASSWORD
              </label>
              <input
                id="login-password"
                type={showPw ? "text" : "password"}
                className="dating-input pr-10"
                placeholder="Enter password"
                value={loginPw}
                onChange={(e) => setLoginPw(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 bottom-3"
                style={{ color: "rgba(240,230,255,0.4)" }}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Admin tip */}
            <p style={{ color: "rgba(240,230,255,0.3)", fontSize: 11 }}>
              Tip: username <span style={{ color: "#00f5d4" }}>admin</span> /
              password <span style={{ color: "#00f5d4" }}>admin123</span> for
              admin panel
            </p>

            {error && (
              <p role="alert" style={{ color: "#ff4444", fontSize: 13 }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="neon-btn-primary w-full py-3 rounded-xl font-bold text-sm mt-1"
              style={{ borderRadius: 12 }}
            >
              Login to NeoDate
            </button>
          </form>
        )}

        {/* Signup form */}
        {tab === "signup" && (
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="signup-name"
                className="block text-xs font-semibold mb-1.5"
                style={{ color: "rgba(240,230,255,0.5)" }}
              >
                YOUR NAME
              </label>
              <input
                id="signup-name"
                type="text"
                className="dating-input"
                placeholder="Full name"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label
                  htmlFor="signup-age"
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: "rgba(240,230,255,0.5)" }}
                >
                  AGE
                </label>
                <input
                  id="signup-age"
                  type="number"
                  className="dating-input"
                  placeholder="25"
                  min={18}
                  max={99}
                  value={signupAge}
                  onChange={(e) => setSignupAge(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="signup-location"
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: "rgba(240,230,255,0.5)" }}
                >
                  LOCATION
                </label>
                <input
                  id="signup-location"
                  type="text"
                  className="dating-input"
                  placeholder="City, Country"
                  value={signupLocation}
                  onChange={(e) => setSignupLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="relative">
              <label
                htmlFor="signup-password"
                className="block text-xs font-semibold mb-1.5"
                style={{ color: "rgba(240,230,255,0.5)" }}
              >
                PASSWORD
              </label>
              <input
                id="signup-password"
                type={showPw ? "text" : "password"}
                className="dating-input pr-10"
                placeholder="Create a password"
                value={signupPw}
                onChange={(e) => setSignupPw(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 bottom-3"
                style={{ color: "rgba(240,230,255,0.4)" }}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>

              {/* Password strength */}
              {signupPw.length > 0 && (
                <div className="mt-2">
                  <div
                    style={{
                      height: 3,
                      borderRadius: 2,
                      background: "rgba(255,255,255,0.08)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      className="pw-bar"
                      style={{
                        width: `${(pwStrength.level / 3) * 100}%`,
                        background: pwStrength.color,
                      }}
                    />
                  </div>
                  <span
                    className="text-xs mt-1 block font-medium"
                    style={{ color: pwStrength.color }}
                  >
                    {pwStrength.label}
                  </span>
                </div>
              )}
            </div>

            {error && (
              <p role="alert" style={{ color: "#ff4444", fontSize: 13 }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="neon-btn-primary w-full py-3 rounded-xl font-bold text-sm mt-1"
              style={{ borderRadius: 12 }}
            >
              Create Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
