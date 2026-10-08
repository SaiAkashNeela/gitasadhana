import { storage } from "./storage";

/**
 * Picks one item per day without repeats until the pool is exhausted — the rotation the
 * original app used for Verse of the Day and Daily Wisdom. (The original keyed the
 * rotation by minute; it is keyed by calendar day here, as the labels promise.)
 */
export function pickDaily<T extends { id: string }>(kind: "verse" | "wisdom", items: T[]): T | null {
  if (items.length === 0) return null;
  const key = kind === "verse" ? "gita_verse_of_the_day" : "gita_daily_wisdom";
  const poolKey = `${key}_pool`;
  const today = new Date().toDateString();

  const cached = storage.get<{ date: string; id: string } | null>(key, null);
  if (cached?.date === today) {
    const hit = items.find((i) => i.id === cached.id);
    if (hit) return hit;
  }

  let pool = storage.get<string[]>(poolKey, []);
  let unseen = items.filter((i) => !pool.includes(i.id));
  if (unseen.length === 0) {
    pool = [];
    unseen = items;
  }
  const chosen = unseen[Math.floor(Math.random() * unseen.length)];
  storage.set(poolKey, [...pool, chosen.id]);
  storage.set(key, { date: today, id: chosen.id });
  return chosen;
}
