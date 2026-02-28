import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="search-glass relative flex items-center rounded-2xl overflow-hidden">
      <Search
        size={16}
        className="absolute left-4 pointer-events-none flex-shrink-0"
        style={{ color: "var(--text-muted)" }}
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search games..."
        className="w-full bg-transparent py-3 pl-11 pr-10 text-sm outline-none"
        style={{ color: "var(--text-primary)" }}
        aria-label="Search games"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 flex items-center justify-center w-6 h-6 rounded-full transition-all duration-150 hover:scale-110"
          style={{
            background: "rgba(255,255,255,0.08)",
            color: "var(--text-muted)",
          }}
          aria-label="Clear search"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
