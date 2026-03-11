// ── Study Notes Generator ────────────────────────────────────────────────────
// Tries Google Custom Search first; falls back to structured mock data.

const SEARCH_API_KEY = "AIzaSyCNkWe3rJzEyH8abzSavOeXYlpQ3vDojFw";
const SEARCH_CX = "017576662512468239146:omuauf_lfve";

export interface StudyNotes {
  topic: string;
  summary: string;
  keyPoints: string[];
  explanation: string;
  example: string;
  mermaidDiagram: string;
  cheatNotes: string[];
}

function buildMermaid(topic: string, keyPoints: string[]): string {
  const safe = (s: string) => s.replace(/["\[\]]/g, "").substring(0, 40);
  const t = safe(topic);
  const lines = keyPoints.slice(0, 5).map((kp, i) => {
    const id = String.fromCharCode(66 + i); // B, C, D, E, F
    return `  A --> ${id}[${safe(kp)}]`;
  });
  if (lines.length >= 2) {
    lines.push(
      `  B --> ${String.fromCharCode(66 + keyPoints.length)}[Applications]`,
    );
  }
  return `flowchart TD\n  A[${t}]\n${lines.join("\n")}`;
}

function buildMockNotes(
  topic: string,
  difficulty: "short" | "detailed",
): StudyNotes {
  const t = topic.charAt(0).toUpperCase() + topic.slice(1);
  const keyPoints = [
    `Definition and core principles of ${t}`,
    "Historical development and origin",
    "Key components and structure",
    "Real-world applications and use cases",
    "Common challenges and how to overcome them",
    "Future trends and advancements",
  ];
  const cheatNotes = [
    `Define ${t} clearly`,
    "Know all key components",
    "Remember historical context",
    "Apply in real scenarios",
    "Review common errors",
    "Understand core formula/model",
    "Link to related concepts",
  ];
  const detailedExtra =
    difficulty === "detailed"
      ? ` At its core, ${t} involves a set of principles that govern how systems behave. These principles can be applied across multiple domains, making it a versatile and important area of knowledge. Mastery requires both theoretical understanding and hands-on practice.`
      : "";
  return {
    topic,
    summary: `${t} is a fundamental concept that involves understanding its core principles and practical applications. It forms the basis of many real-world systems and academic disciplines.`,
    keyPoints: difficulty === "short" ? keyPoints.slice(0, 4) : keyPoints,
    explanation: `Understanding ${t} requires examining its foundational elements. It encompasses various aspects that work together systematically. The study of ${t} has evolved significantly over time, with researchers and practitioners contributing new insights.${detailedExtra}`,
    example: `For example, in everyday life, ${t} can be observed when we analyze how systems adapt and respond to changing conditions. A classic illustration is how ${t.toLowerCase()} principles are applied in modern technology and scientific research.`,
    mermaidDiagram: buildMermaid(t, keyPoints),
    cheatNotes: difficulty === "short" ? cheatNotes.slice(0, 5) : cheatNotes,
  };
}

function buildNotesFromSnippets(
  topic: string,
  snippets: string[],
  difficulty: "short" | "detailed",
): StudyNotes {
  const t = topic.charAt(0).toUpperCase() + topic.slice(1);

  const summary = snippets[0]
    ? `${snippets[0].replace(/\.\.\.$/, "").trim()}.`
    : `${t} is a key concept with wide-ranging applications across multiple fields.`;

  const allText = snippets.join(" ");
  const sentences = allText
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.length < 120);

  const rawKeyPoints = sentences.slice(0, difficulty === "short" ? 4 : 6);
  const keyPoints =
    rawKeyPoints.length >= 3
      ? rawKeyPoints
      : [
          `${t} involves core structural principles`,
          "Widely applied across academic and professional domains",
          "Has evolved through continuous research and development",
          "Foundational to understanding related fields",
        ];

  const explanation = snippets
    .slice(0, difficulty === "detailed" ? 3 : 2)
    .join(" ")
    .replace(/\.\.\./g, "")
    .trim();

  const example =
    snippets[snippets.length - 1] ||
    `For instance, ${t.toLowerCase()} principles are applied when building scalable systems that need to handle real-world complexity efficiently.`;

  const cheatNotes = [
    `${t}: ${snippets[0]?.split(" ").slice(0, 6).join(" ") || "core concept"}`,
    `Key: ${keyPoints[0]?.split(" ").slice(0, 6).join(" ") || "understand fundamentals"}`,
    "Apply: real-world scenarios",
    "Remember: core formula/model",
    "Contrast: benefits vs. limitations",
    "Link: adjacent topics and fields",
    "Exam tip: explain with example",
  ].slice(0, difficulty === "short" ? 5 : 7);

  return {
    topic,
    summary,
    keyPoints,
    explanation,
    example,
    mermaidDiagram: buildMermaid(t, keyPoints),
    cheatNotes,
  };
}

export async function generateNotes(
  topic: string,
  difficulty: "short" | "detailed" = "detailed",
): Promise<StudyNotes> {
  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${SEARCH_API_KEY}&cx=${SEARCH_CX}&q=${encodeURIComponent(topic)}&num=5`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    if (!data.items?.length) throw new Error("No results");
    const snippets: string[] = data.items
      .map((item: { snippet?: string }) => item.snippet || "")
      .filter(Boolean);
    return buildNotesFromSnippets(topic, snippets, difficulty);
  } catch {
    return buildMockNotes(topic, difficulty);
  }
}
