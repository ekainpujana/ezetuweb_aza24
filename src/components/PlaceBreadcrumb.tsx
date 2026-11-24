import { Fragment, type ReactNode } from 'react';
import { useApp, type RankingsFilter } from '@/lib/app-context';
import { continentOf } from '@/lib/data';
import { geoLabel } from '@/lib/geo';
import type { Spot } from '@/lib/types';
import { getLocalizedCountry } from '@/lib/utils';
import { FlagIcon } from './FlagIcon';

interface Props {
  spot: Spot;
  tone?: 'onDark' | 'onLight';
  className?: string;
}

const TONE = {
  onDark: 'text-white/85',
  onLight: 'text-forest-700 dark:text-sand-300',
};

const CHIP_TONE = {
  onDark: 'hover:text-white hover:underline',
  onLight: 'hover:text-forest-900 dark:hover:text-sand-100 hover:underline',
};

function toRankingContinent(raw: string | null): string {
  if (!raw) return 'all';
  const k = raw.toLowerCase();
  if (k === 'north america' || k === 'south america') return 'americas';
  return k;
}

export function PlaceBreadcrumb({ spot, tone = 'onLight', className = '' }: Props) {
  const { lang, navigateToRankings } = useApp();
  const country = getLocalizedCountry(spot, lang);
  const countryCode = lang === 'EUS' && spot.euskal_herria ? 'EUS' : spot.country_code;
  const continent = toRankingContinent(continentOf(spot.country_code));

  const base: RankingsFilter = {
    continent,
    country: countryCode,
    province: 'all',
  };

  const provinces = spot.provinces && spot.provinces.length > 0
    ? spot.provinces
    : (spot.province ? [spot.province] : []);

  const countryChip: { key: string; label: string; icon?: ReactNode; filter: RankingsFilter } = {
    key: 'country',
    label: country.name,
    icon: <FlagIcon code={spot.country_code} isEH={country.isEH} label={country.name} className="w-4 h-2.5" />,
    filter: base,
  };

  return (
    <span className={`inline-flex flex-wrap items-center gap-1.5 w-fit bg-transparent p-0 text-xs ${TONE[tone]} ${className}`}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); navigateToRankings(countryChip.filter); }}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full cursor-pointer underline-offset-2 transition-colors ${CHIP_TONE[tone]}`}
      >
        {countryChip.icon}
        {countryChip.label}
      </button>

      {provinces.length > 0 && <span aria-hidden="true" className="opacity-50 px-0.5">›</span>}
      {provinces.map((prov, i) => (
        <Fragment key={prov}>
          {i > 0 && <span aria-hidden="true" className="opacity-50 px-0.5">&</span>}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); navigateToRankings({ ...base, province: prov }); }}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full cursor-pointer underline-offset-2 transition-colors ${CHIP_TONE[tone]}`}
          >
            <span aria-hidden="true">📍</span>
            {geoLabel(prov, lang)}
          </button>
        </Fragment>
      ))}

    </span>
  );
}
