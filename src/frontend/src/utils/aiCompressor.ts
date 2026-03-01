/**
 * Client-side AI answer compressor.
 * Strips stop/filler words to compress text by ~40–60%.
 * Preserves important keywords and academic tone.
 */

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "shall",
  "must",
  "can",
  "need",
  "dare",
  "ought",
  "used",
  "to",
  "of",
  "in",
  "on",
  "at",
  "by",
  "for",
  "with",
  "about",
  "against",
  "between",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "from",
  "up",
  "down",
  "out",
  "off",
  "over",
  "under",
  "again",
  "further",
  "then",
  "once",
  "here",
  "there",
  "when",
  "where",
  "why",
  "how",
  "all",
  "both",
  "each",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "so",
  "yet",
  "or",
  "because",
  "as",
  "until",
  "while",
  "although",
  "if",
  "since",
  "unless",
  "however",
  "therefore",
  "thus",
  "hence",
  "moreover",
  "furthermore",
  "also",
  "too",
  "very",
  "just",
  "quite",
  "rather",
  "really",
  "still",
  "even",
  "only",
  "already",
  "now",
  "well",
  "back",
  "thing",
  "things",
  "way",
  "ways",
  "that",
  "this",
  "these",
  "those",
  "it",
  "its",
  "they",
  "them",
  "their",
  "we",
  "our",
  "you",
  "your",
  "i",
  "my",
  "me",
  "he",
  "she",
  "him",
  "her",
  "his",
  "and",
  "but",
  "so",
  "which",
  "who",
  "what",
]);

/**
 * Compress a single answer by removing stop words and cleaning up spacing.
 */
export function compressAnswer(text: string): string {
  if (!text.trim()) return text;

  // Split into words, filter stop words, rejoin
  const words = text.split(/\s+/);
  const compressed = words.filter((word) => {
    const clean = word.toLowerCase().replace(/[^a-z0-9]/g, "");
    return clean.length === 0 || !STOP_WORDS.has(clean);
  });

  return compressed
    .join(" ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Convert a compressed answer to bullet-point format.
 * Splits on sentence boundaries and prefixes with •
 */
export function toBulletFormat(text: string): string {
  if (!text.trim()) return text;

  // Split on sentence endings or semicolons or "and" conjunctions
  const sentences = text
    .split(/[.!?;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);

  if (sentences.length <= 1) {
    // Try splitting on commas for short answers
    const parts = text
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 2);
    if (parts.length > 1) {
      return parts.map((p) => `• ${p}`).join("\n");
    }
    return `• ${text.trim()}`;
  }

  return sentences.map((s) => `• ${s}`).join("\n");
}

/**
 * Full compression pipeline: strip stop words + optional bullet format.
 */
export function aiCompress(text: string, bulletMode = false): string {
  const compressed = compressAnswer(text);
  if (bulletMode) {
    return toBulletFormat(compressed);
  }
  return compressed;
}
