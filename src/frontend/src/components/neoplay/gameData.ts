/**
 * Local game catalog for NeoPlay.
 * Rich mock data so the portal is fully populated on first load.
 */

export interface LocalGame {
  id: number;
  title: string;
  category: string;
  embedUrl: string;
  thumbnailUrl: string;
  description: string;
  rating: number;
  playCount: number;
}

export const GAMES: LocalGame[] = [
  {
    id: 1,
    title: "Subway Surfers",
    category: "Action",
    embedUrl: "https://www.crazygames.com/embed/subway-surfers",
    thumbnailUrl: "https://picsum.photos/seed/subway/400/225",
    description:
      "Run, jump, and surf across the city in this endless runner classic.",
    rating: 4.8,
    playCount: 125000,
  },
  {
    id: 2,
    title: "Moto X3M",
    category: "Racing",
    embedUrl: "https://www.crazygames.com/embed/moto-x3m",
    thumbnailUrl: "https://picsum.photos/seed/moto/400/225",
    description:
      "Insane motorcycle stunts across death-defying obstacle tracks.",
    rating: 4.7,
    playCount: 98000,
  },
  {
    id: 3,
    title: "2048",
    category: "Puzzle",
    embedUrl: "https://www.crazygames.com/embed/2048",
    thumbnailUrl: "https://picsum.photos/seed/2048game/400/225",
    description:
      "Merge tiles and reach the legendary 2048 in this brain-bending puzzle.",
    rating: 4.6,
    playCount: 87000,
  },
  {
    id: 4,
    title: "Among Us",
    category: "Multiplayer",
    embedUrl: "https://www.crazygames.com/embed/among-us-online",
    thumbnailUrl: "https://picsum.photos/seed/amongus/400/225",
    description: "Find the impostor before it's too late. Trust no one.",
    rating: 4.9,
    playCount: 210000,
  },
  {
    id: 5,
    title: "Hill Climb Racing",
    category: "Racing",
    embedUrl: "https://www.crazygames.com/embed/hill-climb-racing",
    thumbnailUrl: "https://picsum.photos/seed/hillclimb/400/225",
    description:
      "Conquer wild hills and mountains with your physics-based vehicle.",
    rating: 4.5,
    playCount: 76000,
  },
  {
    id: 6,
    title: "Cut the Rope",
    category: "Puzzle",
    embedUrl: "https://www.crazygames.com/embed/cut-the-rope-remastered",
    thumbnailUrl: "https://picsum.photos/seed/cuttherope/400/225",
    description:
      "Feed Om Nom candy by cutting ropes in clever and tricky ways.",
    rating: 4.7,
    playCount: 65000,
  },
  {
    id: 7,
    title: "Stickman Hook",
    category: "Action",
    embedUrl: "https://www.crazygames.com/embed/stickman-hook",
    thumbnailUrl: "https://picsum.photos/seed/stickman/400/225",
    description:
      "Swing through levels like a spider. Precision and momentum rule.",
    rating: 4.4,
    playCount: 54000,
  },
  {
    id: 8,
    title: "8 Ball Pool",
    category: "Sports",
    embedUrl: "https://www.crazygames.com/embed/8-ball-pool",
    thumbnailUrl: "https://picsum.photos/seed/billiards/400/225",
    description:
      "The ultimate online billiards experience. Line up the perfect shot.",
    rating: 4.6,
    playCount: 143000,
  },
  {
    id: 9,
    title: "Fireboy and Watergirl",
    category: "Multiplayer",
    embedUrl: "https://www.crazygames.com/embed/fireboy-and-watergirl-1",
    thumbnailUrl: "https://picsum.photos/seed/fireboy/400/225",
    description:
      "Co-op puzzle adventure — fire and water together unlock every door.",
    rating: 4.8,
    playCount: 189000,
  },
  {
    id: 10,
    title: "Slope",
    category: "Action",
    embedUrl: "https://www.crazygames.com/embed/slope",
    thumbnailUrl: "https://picsum.photos/seed/slopegame/400/225",
    description:
      "Guide a ball down an infinite slope at terrifying speeds. Survive.",
    rating: 4.5,
    playCount: 92000,
  },
  {
    id: 11,
    title: "Temple Run 2",
    category: "Adventure",
    embedUrl: "https://www.crazygames.com/embed/temple-run-2",
    thumbnailUrl: "https://picsum.photos/seed/templerun/400/225",
    description:
      "Flee the demon monkeys across ancient temple ruins. Run forever.",
    rating: 4.6,
    playCount: 167000,
  },
  {
    id: 12,
    title: "Penalty Shooters",
    category: "Sports",
    embedUrl: "https://www.crazygames.com/embed/penalty-shooters-2",
    thumbnailUrl: "https://picsum.photos/seed/penalty/400/225",
    description:
      "Nail the perfect penalty kick. Nerve-wracking football action.",
    rating: 4.3,
    playCount: 45000,
  },
];

export const CATEGORIES = [
  "All",
  "Action",
  "Racing",
  "Puzzle",
  "Multiplayer",
  "Adventure",
  "Sports",
] as const;
export type Category = (typeof CATEGORIES)[number];

/** Format play count to human readable string */
export function formatPlayCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(0)}K`;
  return String(count);
}

/** Get recently played games from localStorage */
export function getRecentlyPlayedIds(): number[] {
  try {
    const stored = localStorage.getItem("neoplay-recently-played");
    return stored ? (JSON.parse(stored) as number[]) : [];
  } catch {
    return [];
  }
}

/** Save a game play to localStorage (max 10) */
export function saveRecentlyPlayed(gameId: number): void {
  try {
    const existing = getRecentlyPlayedIds();
    const filtered = existing.filter((id) => id !== gameId);
    const updated = [gameId, ...filtered].slice(0, 10);
    localStorage.setItem("neoplay-recently-played", JSON.stringify(updated));
  } catch {
    // ignore
  }
}
