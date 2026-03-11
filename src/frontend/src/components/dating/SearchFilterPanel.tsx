import type { SearchFilters } from "@/context/AppContext";
import { Filter, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

interface Props {
  filters: SearchFilters;
  onChange: (filters: Partial<SearchFilters>) => void;
  onApply: () => void;
}

const DEFAULT_FILTERS: SearchFilters = {
  nameSearch: "",
  minAge: 18,
  maxAge: 99,
  locationFilter: "",
  hobbyFilter: "",
  lifestyleFilter: "",
  onlineOnly: false,
  sortBy: "newest",
};

function countActiveFilters(filters: SearchFilters): number {
  let count = 0;
  if (filters.nameSearch.trim()) count++;
  if (filters.minAge > 18) count++;
  if (filters.maxAge < 99) count++;
  if (filters.locationFilter.trim()) count++;
  if (filters.hobbyFilter.trim()) count++;
  if (filters.lifestyleFilter && filters.lifestyleFilter !== "all") count++;
  if (filters.onlineOnly) count++;
  if (filters.sortBy !== "newest") count++;
  return count;
}

const inputStyle: React.CSSProperties = {
  background: "rgba(15,10,26,0.8)",
  border: "1px solid rgba(255,45,120,0.2)",
  borderRadius: 10,
  color: "#f0e6ff",
  fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif",
  fontSize: 13,
  padding: "8px 12px",
  width: "100%",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.08em",
  color: "rgba(240,230,255,0.4)",
  marginBottom: 4,
};

export function SearchFilterPanel({ filters, onChange, onApply }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const activeCount = countActiveFilters(filters);

  function handleReset() {
    onChange(DEFAULT_FILTERS);
    onApply();
  }

  function handleApply() {
    onApply();
    setIsOpen(false);
  }

  return (
    <div className="w-full max-w-sm">
      {/* Toggle button */}
      <div className="flex items-center gap-2 mb-2">
        {/* Name search (always visible) */}
        <div className="flex-1 relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "rgba(240,230,255,0.35)" }}
          />
          <input
            type="text"
            className="dating-input"
            placeholder="Search by name..."
            aria-label="Search users by name"
            value={filters.nameSearch}
            onChange={(e) => {
              onChange({ nameSearch: e.target.value });
              onApply();
            }}
            style={{
              paddingLeft: 32,
              fontSize: 13,
              padding: "8px 12px 8px 32px",
            }}
          />
        </div>

        {/* Filter toggle */}
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="relative flex items-center justify-center rounded-xl transition-all duration-300"
          style={{
            width: 40,
            height: 40,
            background: isOpen
              ? "linear-gradient(135deg, rgba(255,45,120,0.25), rgba(155,93,229,0.2))"
              : "rgba(255,255,255,0.05)",
            border: isOpen
              ? "1px solid rgba(255,45,120,0.4)"
              : "1px solid rgba(255,255,255,0.1)",
            color: isOpen ? "#ff2d78" : "rgba(240,230,255,0.6)",
            boxShadow: isOpen ? "0 0 12px rgba(255,45,120,0.2)" : "none",
            flexShrink: 0,
          }}
          aria-label="Toggle filters"
          aria-expanded={isOpen}
        >
          <SlidersHorizontal size={15} />
          {activeCount > 0 && (
            <span
              className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-[9px] font-black"
              style={{
                width: 16,
                height: 16,
                background: "linear-gradient(135deg, #ff2d78, #9b5de5)",
                color: "white",
              }}
            >
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Collapsible filter panel */}
      {isOpen && (
        <div
          className="rounded-2xl p-4 mb-4"
          style={{
            background: "rgba(15,10,26,0.95)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,45,120,0.2)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
            animation: "fadeScaleIn 0.2s ease both",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter size={14} style={{ color: "#ff2d78" }} />
              <span
                className="text-xs font-bold"
                style={{
                  color: "rgba(240,230,255,0.7)",
                  letterSpacing: "0.08em",
                }}
              >
                FILTERS
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{ color: "rgba(240,230,255,0.35)" }}
              aria-label="Close filters"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {/* Age range */}
            <div>
              <p style={labelStyle}>AGE RANGE</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  aria-label="Minimum age"
                  value={filters.minAge}
                  onChange={(e) =>
                    onChange({ minAge: Number(e.target.value) || 18 })
                  }
                  min={18}
                  max={99}
                  style={{ ...inputStyle, width: 70 }}
                  placeholder="18"
                />
                <span style={{ color: "rgba(240,230,255,0.3)", fontSize: 12 }}>
                  to
                </span>
                <input
                  type="number"
                  aria-label="Maximum age"
                  value={filters.maxAge}
                  onChange={(e) =>
                    onChange({ maxAge: Number(e.target.value) || 99 })
                  }
                  min={18}
                  max={99}
                  style={{ ...inputStyle, width: 70 }}
                  placeholder="99"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="filter-location" style={labelStyle}>
                LOCATION
              </label>
              <input
                id="filter-location"
                type="text"
                value={filters.locationFilter}
                onChange={(e) => onChange({ locationFilter: e.target.value })}
                placeholder="City or country..."
                style={inputStyle}
              />
            </div>

            {/* Hobby */}
            <div>
              <label htmlFor="filter-hobby" style={labelStyle}>
                HOBBY
              </label>
              <input
                id="filter-hobby"
                type="text"
                value={filters.hobbyFilter}
                onChange={(e) => onChange({ hobbyFilter: e.target.value })}
                placeholder="e.g. Photography"
                style={inputStyle}
              />
            </div>

            {/* Lifestyle */}
            <div>
              <label htmlFor="filter-lifestyle" style={labelStyle}>
                LIFESTYLE
              </label>
              <select
                id="filter-lifestyle"
                value={filters.lifestyleFilter || "all"}
                onChange={(e) =>
                  onChange({
                    lifestyleFilter:
                      e.target.value === "all" ? "" : e.target.value,
                  })
                }
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="all">All lifestyles</option>
                <option value="active">🏃 Active</option>
                <option value="homebody">🏠 Homebody</option>
                <option value="adventurer">🌏 Adventurer</option>
                <option value="creative">🎨 Creative</option>
              </select>
            </div>

            {/* Sort by */}
            <div>
              <label htmlFor="filter-sort" style={labelStyle}>
                SORT BY
              </label>
              <select
                id="filter-sort"
                value={filters.sortBy}
                onChange={(e) =>
                  onChange({
                    sortBy: e.target.value as SearchFilters["sortBy"],
                  })
                }
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="newest">Recently Joined</option>
                <option value="mostActive">Most Active</option>
                <option value="bestMatch">Best Hobby Match</option>
              </select>
            </div>

            {/* Online now toggle */}
            <div className="flex items-center justify-between">
              <p style={{ ...labelStyle, marginBottom: 0 }}>ONLINE NOW</p>
              <button
                type="button"
                onClick={() => onChange({ onlineOnly: !filters.onlineOnly })}
                className="relative rounded-full transition-all duration-200"
                style={{
                  width: 42,
                  height: 22,
                  background: filters.onlineOnly
                    ? "rgba(0,245,212,0.2)"
                    : "rgba(255,255,255,0.08)",
                  border: filters.onlineOnly
                    ? "1px solid rgba(0,245,212,0.6)"
                    : "1px solid rgba(255,255,255,0.15)",
                  boxShadow: filters.onlineOnly
                    ? "0 0 8px rgba(0,245,212,0.3)"
                    : "none",
                }}
                role="switch"
                aria-checked={filters.onlineOnly}
                aria-label="Online only filter"
              >
                <span
                  className="absolute top-0.5 rounded-full transition-all duration-200"
                  style={{
                    width: 16,
                    height: 16,
                    left: filters.onlineOnly ? "calc(100% - 18px)" : 2,
                    background: filters.onlineOnly
                      ? "#00f5d4"
                      : "rgba(255,45,120,0.5)",
                    boxShadow: filters.onlineOnly
                      ? "0 0 6px rgba(0,245,212,0.6)"
                      : "none",
                  }}
                />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(240,230,255,0.5)",
              }}
            >
              <RotateCcw size={11} />
              Reset
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 neon-btn-primary py-2 rounded-xl text-xs font-bold"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
