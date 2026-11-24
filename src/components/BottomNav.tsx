import { useApp } from '@/lib/app-context';
import type { ViewTab } from '@/lib/types';
import { GalleryNavIcon, RankingNavIcon, MapNavIcon, PassportNavIcon } from './NavIcons';

export function BottomNav() {
  const { t, tab, setTab, isAuthenticated, setAuthOpen } = useApp();

  const items = [
    { id: 'gallery' as ViewTab, icon: GalleryNavIcon, label: t('gallery') },
    { id: 'rankings' as ViewTab, icon: RankingNavIcon, label: t('rankings') },
    { id: 'map' as ViewTab, icon: MapNavIcon, label: t('mapExplorer') },
    { id: 'passport' as ViewTab, icon: PassportNavIcon, label: t('myPassport') },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-[1900] bg-white/95 dark:bg-slate2-950/95 backdrop-blur-xl border-t border-forest-100/80 dark:border-slate2-800/80 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="grid grid-cols-4 max-w-[480px] mx-auto px-2 pt-1 pb-[env(safe-area-inset-bottom)]">
        {items.map((it) => {
          const Icon = it.icon;
          const active = tab === it.id;
          return (
            <button
              key={it.id}
              onClick={() => {
                if (it.id === 'passport' && !isAuthenticated) {
                  setAuthOpen(true);
                  return;
                }
                setTab(it.id);
              }}
              className="flex flex-col items-center gap-0.5 py-2 px-1 min-w-0 transition-colors"
            >
              <span className={`grid place-items-center w-8 h-8 rounded-xl transition-all ${active ? 'bg-forest-600 text-white scale-105 shadow-soft' : 'text-forest-700/60 dark:text-sand-300/60'}`}>
                <Icon className="w-4 h-4" />
              </span>
              <span className={`text-[10px] font-600 truncate max-w-full leading-none ${active ? 'text-forest-700 dark:text-sand-100' : 'text-forest-700/60 dark:text-sand-300/60'}`}>
                {it.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}