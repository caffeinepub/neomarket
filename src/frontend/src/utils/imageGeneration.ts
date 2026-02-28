/**
 * NeoGen AI - Image Generation Module
 *
 * PLACEHOLDER IMPLEMENTATION
 * ──────────────────────────────────────────────────────────────────────────
 * Currently returns a random image from Picsum Photos to simulate the API.
 *
 * TO SWAP IN REAL API:
 * ──────────────────────────────────────────────────────────────────────────
 *
 * === OpenAI DALL-E 3 ===
 * const response = await fetch("https://api.openai.com/v1/images/generations", {
 *   method: "POST",
 *   headers: {
 *     "Content-Type": "application/json",
 *     "Authorization": `Bearer ${OPENAI_API_KEY}`,  // <-- set your key
 *   },
 *   body: JSON.stringify({
 *     model: "dall-e-3",
 *     prompt: `${style} style: ${prompt}`,
 *     n: 1,
 *     size: "1024x1024",
 *   }),
 * });
 * const data = await response.json();
 * return data.data[0].url;
 *
 * === Stability AI (Stable Diffusion XL) ===
 * const response = await fetch(
 *   "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
 *   {
 *     method: "POST",
 *     headers: {
 *       "Content-Type": "application/json",
 *       "Authorization": `Bearer ${STABILITY_API_KEY}`,  // <-- set your key
 *     },
 *     body: JSON.stringify({
 *       text_prompts: [{ text: `${style} style: ${prompt}`, weight: 1 }],
 *       cfg_scale: 7,
 *       steps: 30,
 *       width: 1024,
 *       height: 1024,
 *     }),
 *   }
 * );
 * const data = await response.json();
 * const base64 = data.artifacts[0].base64;
 * return `data:image/png;base64,${base64}`;
 */

// Style seed offsets to vary images per style
const STYLE_SEEDS: Record<string, number> = {
  Realistic: 100,
  Anime: 200,
  "Digital Art": 300,
  Abstract: 400,
  Cyberpunk: 500,
};

/**
 * Generate an image for the given prompt and style.
 * Currently uses Picsum as a placeholder; replace with real API above.
 */
export async function generateImageFromAPI(
  prompt: string,
  style: string,
): Promise<string> {
  // Simulate API processing delay (2–3 seconds)
  const delay = 2000 + Math.random() * 1000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Deterministic seed from prompt + style for consistent results
  const styleSeed = STYLE_SEEDS[style] ?? 0;
  const promptHash = [...prompt].reduce(
    (acc, ch) => (acc * 31 + ch.charCodeAt(0)) & 0xffffff,
    styleSeed,
  );

  // Return a 800x600 placeholder image
  const imageUrl = `https://picsum.photos/seed/${promptHash}/800/600`;
  return imageUrl;
}
