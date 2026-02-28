import { CURRENCIES, type CurrencyCode } from "@/utils/types";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CurrencySelectorProps {
  value: CurrencyCode;
  onChange: (currency: CurrencyCode) => void;
}

/**
 * Custom currency dropdown with flags/symbols.
 * Keyboard navigable.
 */
export function CurrencySelector({ value, onChange }: CurrencySelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = CURRENCIES.find((c) => c.code === value) ?? CURRENCIES[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="currency-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all"
        aria-label={`Currency: ${selected.name}`}
        aria-expanded={open}
      >
        <span className="text-base leading-none">{selected.flag}</span>
        <span
          className="font-mono text-xs font-bold"
          style={{ color: "var(--neon-cyan)" }}
        >
          {selected.code}
        </span>
        <ChevronDown
          size={12}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          style={{ color: "var(--text-muted)" }}
        />
      </button>

      {open && (
        <div className="currency-dropdown absolute right-0 top-full mt-1 w-52 rounded-xl py-1 z-50">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => {
                onChange(c.code);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                c.code === value ? "currency-option-active" : "currency-option"
              }`}
            >
              <span className="text-base w-5 text-center leading-none">
                {c.flag}
              </span>
              <span
                className="font-mono font-bold text-xs w-8"
                style={{
                  color:
                    c.code === value
                      ? "var(--neon-cyan)"
                      : "var(--text-secondary)",
                }}
              >
                {c.code}
              </span>
              <span
                className="text-xs truncate"
                style={{ color: "var(--text-muted)" }}
              >
                {c.name}
              </span>
              {c.code === value && (
                <span
                  className="ml-auto text-xs"
                  style={{ color: "var(--neon-cyan)" }}
                >
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
