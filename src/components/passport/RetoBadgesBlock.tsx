import { Home, Building, Mountain, MapPin, Camera, Compass } from 'lucide-react';
import { AnimatedBar } from './AnimatedBar';
import { RETOS, type RetoId, type Tier } from '@/lib/passport-progress';
import { type PassportKey, type PassportT } from '@/lib/passport-strings';

interface RetoBadgesBlockProps {
  t: PassportT;
  values: Record<RetoId, number>;
  tiers: Record<RetoId, Tier>;
}

const ICONS: Record<RetoId, typeof Home> = {
  alma: Home,
  hiritarra: Building,
  naturazalea: Mountain,
  kartografoa: MapPin,
  ojo: Camera,
  guia: Compass,
};

const COPY_KEYS: Record<RetoId, { name: PassportKey; desc: PassportKey }> = {
  alma: { name: 'retoName_alma', desc: 'retoDesc_alma' },
  hiritarra: { name: 'retoName_hiritarra', desc: 'retoDesc_hiritarra' },
  naturazalea: { name: 'retoName_naturazalea', desc: 'retoDesc_naturazalea' },
  kartografoa: { name: 'retoName_kartografoa', desc: 'retoDesc_kartografoa' },
  ojo: { name: 'retoName_ojo', desc: 'retoDesc_ojo' },
  guia: { name: 'retoName_guia', desc: 'retoDesc_guia' },
};

const TIER_EMOJI: Record<Tier, string> = {
  0: '·',
  1: '🥉',
  2: '🥈',
  3: '🥇',
  4: '💎',
  5: '👑',
};

const TIER_NAME_KEY: Record<Tier, PassportKey> = {
  0: 'tierNone',
  1: 'tierBronze',
  2: 'tierSilver',
  3: 'tierGold',
  4: 'tierPlatinum',
  5: 'tierLegend',
};

const TIER_TEXT_COLOR: Record<Tier, string> = {
  0: 'text-forest-700/50 dark:text-sand-300/50',
  1: 'text-amber-700 dark:text-amber-500',
  2: 'text-slate-500 dark:text-slate-400',
  3: 'text-yellow-600 dark:text-yellow-400',
  4: 'text-cyan-600 dark:text-cyan-400',
  5: 'text-terracotta-600 dark:text-terracotta-400',
};

const MAX_TIER: Tier = 5;

export function RetoBadgesBlock({ t, values, tiers }: RetoBadgesBlockProps) {
  return (
    <section className="mb-8">
      <h2 className="font-display text-2xl font-700 text-forest-800 dark:text-sand-100 mb-4">{t('retosTitle')}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {RETOS.map((reto) => {
          const Icon = ICONS[reto.id];
          const tier = tiers[reto.id];
          const value = values[reto.id];
          const base = tier > 0 ? reto.thresholds[tier - 1] : 0;
          const target = tier < MAX_TIER ? reto.thresholds[tier] : reto.thresholds[MAX_TIER - 1];
          const pct = tier >= MAX_TIER ? 100 : Math.min(100, Math.max(0, ((value - base) / (target - base)) * 100));
          const tierName = t(TIER_NAME_KEY[tier]);
          const nextTierName = tier < MAX_TIER ? t(TIER_NAME_KEY[tier + 1]) : '';
          return (
            <div key={reto.id} className="p-5 rounded-2xl bg-white dark:bg-slate2-850 border border-forest-100 dark:border-slate2-800 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="grid place-items-center w-11 h-11 rounded-2xl bg-forest-50 dark:bg-slate2-900 text-forest-600 dark:text-forest-300">
                  <Icon className="w-5 h-5" />
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-600 ${TIER_TEXT_COLOR[tier]}`}>
                  <span className="text-base">{TIER_EMOJI[tier]}</span>
                  {tierName}
                </div>
              </div>
              <h3 className="font-600 text-forest-800 dark:text-sand-100 mt-3">{t(COPY_KEYS[reto.id].name)}</h3>
              <p className="text-xs text-forest-700/60 dark:text-sand-300/60 mt-0.5">{t(COPY_KEYS[reto.id].desc)}</p>
              <AnimatedBar pct={pct} className="mt-4 h-2 rounded-full bg-forest-100 dark:bg-slate2-800 overflow-hidden" fillClassName="h-full rounded-full bg-gradient-to-r from-forest-500 to-terracotta-500" />
              <p className="mt-2 text-xs text-forest-700/70 dark:text-sand-300/70">
                {tier >= MAX_TIER
                  ? t('tierDone')
                  : t('nextTier', { value, total: target, tier: nextTierName })}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
