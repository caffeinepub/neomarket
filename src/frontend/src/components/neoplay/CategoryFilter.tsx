import { CATEGORIES, type Category } from "./gameData";

interface CategoryFilterProps {
  active: Category;
  onChange: (cat: Category) => void;
}

const CATEGORY_ICONS: Record<Category, string> = {
  All: "🎮",
  Action: "⚡",
  Racing: "🏎️",
  Puzzle: "🧩",
  Multiplayer: "👥",
  Adventure: "🗺️",
  Sports: "⚽",
};

export function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <fieldset
      id="categories"
      className="horizontal-scroll flex gap-2 py-2 border-0 p-0 m-0"
    >
      <legend className="sr-only">Filter games by category</legend>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(cat)}
          className="category-pill flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border flex-shrink-0"
          style={
            active === cat
              ? {
                  background:
                    "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(155,89,255,0.15))",
                  borderColor: "rgba(0,212,255,0.45)",
                  color: "var(--neon-cyan)",
                  boxShadow: "0 0 14px rgba(0,212,255,0.18)",
                }
              : {
                  background: "var(--glass-bg)",
                  borderColor: "var(--glass-border)",
                  color: "var(--text-secondary)",
                  backdropFilter: "blur(12px)",
                }
          }
          aria-pressed={active === cat}
        >
          <span aria-hidden="true">{CATEGORY_ICONS[cat]}</span>
          {cat}
        </button>
      ))}
    </fieldset>
  );
}
