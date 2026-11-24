import { useMemo, useState } from 'react';
import { Map as MapIcon, Star } from 'lucide-react';
import { CategoryIcon } from '../CategoryIcon';
import { type PassportT } from '@/lib/passport-strings';
import { getOverride } from '@/lib/rating-overrides';
import type { Category, Spot, SpotWithPhoto } from '@/lib/types';

export interface RankedSpotItem {
  spot: SpotWithPhoto;
  rank: number;
  name: string;
  place: string;
}

type CatFilter = 'all' | Category;

interface VisitedRankingBlockProps {
  t: PassportT;
  items: RankedSpotItem[];
  onViewOnMap: (spot: Spot) => void;
}

const FILTERS: { id: CatFilter; labelKey: 'filterAll' | 'filterCities' | 'filterVillages' | 'filterNature' }[] = [
  { id: 'all', labelKey: 'filterAll' },
  { id: 'city', labelKey: 'filterCities' },
  { id: 'village', labelKey: 'filterVillages' },
  { id: 'nature', labelKey: 'filterNature' },
];

export function VisitedRankingBlock({ t, items, onViewOnMap }: VisitedRankingBlockProps) {
  const [filter, setFilter] = useState<CatFilter>('all');
  const visible = useMemo(
    () => (filter === 'all' ? items : items.filter((i) => i.spot.category === filter)),
    [items, filter],
  );

  return (
    <section className="mb-8">
      <h2 className="font-display text-2xl font-700 text-forest-800 dark:text-sand-100 mb-4">{t('rankingTitle')}</h2>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-600 whitespace-nowrap transition-colors ${
                active
                  ? 'bg-forest-600 text-white shadow-soft'
                  : 'bg-forest-50 dark:bg-slate2-900 border border-forest-100 dark:border-slate2-800 text-forest-700/70 dark:text-sand-300/70 hover:border-forest-300 dark:hover:border-slate2-700'
              }`}
            >
              <CategoryIcon category={f.id} variant={active ? 'mono' : 'duotone'} className="w-3.5 h-3.5" />
              <span>{t(f.labelKey)}</span>
            </button>
          );
        })}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-forest-700/60 dark:text-sand-300/60 py-8 text-center">{t('emptySpots')}</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-forest-700/60 dark:text-sand-300/60 py-8 text-center">{t('noMatches')}</p>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map((item) => (
            <li
              key={item.spot.id}
              className="flex gap-3 p-3 rounded-2xl bg-white dark:bg-slate2-850 border border-forest-100 dark:border-slate2-800 hover:border-forest-300 dark:hover:border-slate2-700 hover:shadow-soft transition-all"
            >
              <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-forest-100 dark:bg-slate2-800">
                {item.spot.cover_photo && (
                  <img src={item.spot.cover_photo.image_url} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
                )}
                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[11px] font-700">#{item.rank}</span>
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <h3 className="font-600 text-sm text-forest-800 dark:text-sand-100 truncate">{item.name}</h3>
                <p className="text-xs text-forest-700/60 dark:text-sand-300/60 truncate">{item.place}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-xs font-600 text-terracotta-600 dark:text-terracotta-300">
                  <Star className="w-3 h-3 fill-current" />
                  {(getOverride(item.spot.id)?.rating ?? item.spot.bayesian_rating).toFixed(1)}
                </p>
                <button
                  onClick={() => onViewOnMap(item.spot)}
                  className="mt-auto self-start inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-forest-100 dark:bg-slate2-800 text-forest-700 dark:text-sand-200 text-[11px] font-600 hover:bg-forest-200 dark:hover:bg-slate2-700 transition-colors"
                >
                  <MapIcon className="w-3 h-3" />
                  {t('viewOnMapBtn')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
