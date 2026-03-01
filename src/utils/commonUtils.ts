import { RECENT_KEY, MAX_RECENT } from "../lib/constants";
import type { RecentMedia } from "../types/movieTypes";

export const formatRuntime = (runtime: number | null) => {
  if (!runtime) return "—";
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

export const writeInRecentViewToLocalStorage = (payload: RecentMedia) => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const list: RecentMedia[] = Array.isArray(parsed) ? parsed : [];
    const filtered = list.filter((item) => item.movie_id !== payload.movie_id);
    const updated = [payload, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {
    // do nothing
  }
};

export const readRecentViewFromLocalStorage = (): RecentMedia[] => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_RECENT);
  } catch {
    return [];
  }
};
