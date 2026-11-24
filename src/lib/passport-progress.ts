export type PassportLang = 'es' | 'eu' | 'en' | 'pt' | 'fr' | 'it' | 'de';

export interface XpInput {
  visits: number;
  reviews: number;
  photos: number;
  photoLikes: number;
  pioneerSpots: number;
}

export const XP_WEIGHTS = { visit: 15, review: 30, photo: 60, photoLike: 3, pioneer: 100 } as const;

export function computeXp(input: XpInput): number {
  return input.visits * XP_WEIGHTS.visit
    + input.reviews * XP_WEIGHTS.review
    + input.photos * XP_WEIGHTS.photo
    + input.photoLikes * XP_WEIGHTS.photoLike
    + input.pioneerSpots * XP_WEIGHTS.pioneer;
}

export interface LevelDef {
  level: number;
  minXp: number;
  names: Record<PassportLang, string>;
}

export const LEVELS: LevelDef[] = [
  { level: 1, minXp: 0, names: { es: 'Turista de Sofá', eu: 'Besaulkiko turista', en: 'Couch Tourist', pt: 'Turista de Sofá', fr: 'Touriste de canapé', it: 'Turista da divano', de: 'Sofa-Tourist' } },
  { level: 2, minXp: 301, names: { es: 'Escapista', eu: 'Noizbehinkako ibiltaria', en: 'Weekender', pt: 'Viajante de Fim de Semana', fr: 'Voyageur du week-end', it: 'Escursionista', de: 'Wochenend-Trip' } },
  { level: 3, minXp: 1201, names: { es: 'Explorador', eu: 'Esploratzailea', en: 'Explorer', pt: 'Explorador', fr: 'Explorateur', it: 'Esploratore', de: 'Entdecker' } },
  { level: 4, minXp: 3001, names: { es: 'Trotamundos', eu: 'Mundubirazalea', en: 'Globetrotter', pt: 'Trotamundos', fr: 'Globe-trotter', it: 'Giramondo', de: 'Weltenbummler' } },
  { level: 5, minXp: 7000, names: { es: 'Leyenda de la Tierra', eu: 'Lurreko mito bizia', en: 'Earth Legend', pt: 'Lenda da Terra', fr: 'Légende terrestre', it: 'Leggenda della Terra', de: 'Legende der Erde' } },
];

export interface LevelProgress {
  level: LevelDef;
  nextLevel: LevelDef | null;
  xp: number;
  xpToNext: number;
  pct: number;
}

export function levelProgress(xp: number): LevelProgress {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].minXp) idx = i;
  const level = LEVELS[idx];
  const nextLevel = LEVELS[idx + 1] ?? null;
  if (!nextLevel) return { level, nextLevel, xp, xpToNext: 0, pct: 100 };
  const span = nextLevel.minXp - level.minXp;
  const into = xp - level.minXp;
  return {
    level,
    nextLevel,
    xp,
    xpToNext: nextLevel.minXp - xp,
    pct: Math.min(100, Math.max(0, (into / span) * 100)),
  };
}

export type RetoId = 'alma' | 'hiritarra' | 'naturazalea' | 'kartografoa' | 'ojo' | 'guia';
export type RetoTier = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'legend';
export type Tier = 0 | 1 | 2 | 3 | 4 | 5;

export const TIER_KEYS: RetoTier[] = ['none', 'bronze', 'silver', 'gold', 'platinum', 'legend'];

export interface RetoDef {
  id: RetoId;
  thresholds: [number, number, number, number, number];
}

export const RETOS: RetoDef[] = [
  { id: 'alma', thresholds: [15, 60, 200, 500, 1000] },
  { id: 'hiritarra', thresholds: [5, 20, 75, 200, 500] },
  { id: 'naturazalea', thresholds: [10, 40, 150, 400, 1000] },
  { id: 'kartografoa', thresholds: [3, 15, 50, 150, 300] },
  { id: 'ojo', thresholds: [10, 50, 150, 450, 1000] },
  { id: 'guia', thresholds: [10, 50, 200, 600, 1500] },
];

const TIERS_KEY = 'ezetu_passport_tiers';

export function tierFor(value: number, thresholds: readonly number[]): Tier {
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (value >= thresholds[i]) return (i + 1) as Tier;
  }
  return 0;
}

export function loadEarnedTiers(): Partial<Record<RetoId, Tier>> {
  try {
    const raw = localStorage.getItem(TIERS_KEY);
    return raw ? (JSON.parse(raw) as Partial<Record<RetoId, Tier>>) : {};
  } catch { return {}; }
}

export function mergeEarnedTiers(current: Record<RetoId, number>): Record<RetoId, Tier> {
  const stored = loadEarnedTiers();
  const merged = {} as Record<RetoId, Tier>;
  for (const reto of RETOS) {
    const computed = tierFor(current[reto.id], reto.thresholds);
    merged[reto.id] = Math.max(computed, stored[reto.id] ?? 0) as Tier;
  }
  try { localStorage.setItem(TIERS_KEY, JSON.stringify(merged)); } catch { /* ignore */ }
  return merged;
}
