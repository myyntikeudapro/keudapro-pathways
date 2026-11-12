import type { SearchEntry } from "@/data/searchIndex";

export type SearchMatch = SearchEntry & { reason?: string };

const normalize = (value: string) => value.toLocaleLowerCase("fi-FI").trim().replace(/\s+/g, " ");

/** Keep exact catalog matches even when semantic ranking returns an empty list. */
export function mergeSearchMatches(query: string, index: SearchEntry[], semanticMatches: SearchMatch[]): SearchMatch[] {
  const term = normalize(query);
  if (term.length < 2) return [];
  const tokens = term.split(" ");
  const direct = index.filter(entry => {
    const keywords = entry.keywords.map(normalize);
    const words = normalize([entry.title, ...entry.keywords].join(" ")).split(/[\s–—,]+/);
    return normalize(entry.title) === term || keywords.includes(term) || (tokens.length > 1 && tokens.every(token => words.includes(token)));
  });
  direct.sort((a, b) => Number(normalize(b.title) === term) - Number(normalize(a.title) === term));
  const byId = new Map(index.map(entry => [entry.id, entry]));
  const merged = new Map<string, SearchMatch>();
  for (const match of [...direct, ...semanticMatches]) {
    const entry = byId.get(match.id);
    if (entry && !merged.has(entry.id)) merged.set(entry.id, { ...entry, reason: "reason" in match && typeof match.reason === "string" ? match.reason : undefined });
  }
  return [...merged.values()].slice(0, 5);
}