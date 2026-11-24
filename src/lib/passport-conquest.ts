import type { Spot } from '@/lib/types';
import { passportLocale, type PassportLang } from '@/lib/passport-strings';
import { continentOf } from '@/lib/data';
import { CONTINENT_ORDER, countriesForLang, type ContinentId, type WorldCountry } from '@/lib/world-countries';

export interface ConquestRow {
  id: string;
  continent: ContinentId;
  name: string;
  sub: string;
  visited: boolean;
  ikurrina: boolean;
}

export interface ConquestSnapshot {
  continents: { id: ContinentId; visited: boolean }[];
  capitals: ConquestRow[];
  countries: ConquestRow[];
  countriesVisited: number;
  countriesTotal: number;
}

const norm = (s: string) => s.trim().toLowerCase();

function spotInCountry(spot: Spot, country: WorldCountry): boolean {
  return country.code === 'EH' ? Boolean(spot.euskal_herria) : spot.country_code === country.code;
}

function capitalVisited(country: WorldCountry, visitedSpots: Spot[]): boolean {
  const capitalNames = new Set(Object.values(country.capitals).map(norm));
  return visitedSpots.some((s) => spotInCountry(s, country) && capitalNames.has(norm(s.name)));
}

export function buildConquest(lang: PassportLang, visitedSpots: Spot[]): ConquestSnapshot {
  const countries = countriesForLang(lang);
  const locale = passportLocale(lang);
  const byName = (a: ConquestRow, b: ConquestRow) =>
    a.name.localeCompare(b.name, locale, { sensitivity: 'base' });

  const countryRows: ConquestRow[] = countries
    .map((c) => ({
      id: c.code,
      continent: c.continent,
      name: c.names[lang] ?? c.names.es,
      sub: c.capitals[lang] ?? c.capitals.es,
      visited: visitedSpots.some((s) => spotInCountry(s, c)),
      ikurrina: c.code === 'EH',
    }))
    .sort(byName);

  const capitalRows: ConquestRow[] = countries
    .map((c) => ({
      id: c.code,
      continent: c.continent,
      name: c.capitals[lang] ?? c.capitals.es,
      sub: c.names[lang] ?? c.names.es,
      visited: capitalVisited(c, visitedSpots),
      ikurrina: c.code === 'EH',
    }))
    .sort(byName);

  const antarcticaVisited = visitedSpots.some((s) => continentOf(s.country_code) === 'Antarctica');
  const visitedContinents = new Set<ContinentId>(
    countryRows.filter((r) => r.visited).map((r) => r.continent),
  );
  if (antarcticaVisited) visitedContinents.add('antarctica');

  return {
    continents: CONTINENT_ORDER.map((id) => ({ id, visited: visitedContinents.has(id) })),
    capitals: capitalRows,
    countries: countryRows,
    countriesVisited: countryRows.filter((r) => r.visited).length,
    countriesTotal: countries.length,
  };
}
