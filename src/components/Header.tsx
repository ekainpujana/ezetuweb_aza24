import { useState } from 'react';
import { Menu, X, MapPinPlus } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import type { ViewTab } from '@/lib/types';
import { UserMenu } from './UserMenu';
import { UniversalSearch } from './UniversalSearch';
import { GalleryNavIcon, RankingNavIcon, MapNavIcon, PassportNavIcon } from './NavIcons';

export function Header() {
const { t, tab, setTab, setContributeOpen, isAuthenticated, setAuthOpen } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const tabs = [
    { id: 'gallery' as ViewTab, Icon: GalleryNavIcon, label: t('gallery') },
    { id: 'rankings' as ViewTab, Icon: RankingNavIcon, label: t('rankings') },
    { id: 'map' as ViewTab, Icon: MapNavIcon, label: t('mapExplorer') },
    ...(isAuthenticated ? [{ id: 'passport' as ViewTab, Icon: PassportNavIcon, label: t('myPassport') }] : []),
  ];

  const onTabClick = (id: ViewTab) => {
    if (id === 'passport' && !isAuthenticated) {
      setAuthOpen(true);
      return;
    }
    setTab(id);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-[2000] bg-white/85 dark:bg-slate2-950/85 backdrop-blur-xl border-b border-forest-100/80 dark:border-slate2-800/80">
      <div className="flex items-center justify-between h-14 px-3 sm:px-4 max-w-[1600px] mx-auto gap-2 lg:gap-3">
        {/* LEFT: Logo — versión claro/oscuro automática */}
        <button
          onClick={() => setTab('gallery')}
          aria-label="Ezetu"
          className="flex items-center shrink-0 group focus:outline-none"
        >
          <img
            src="/logo-light.svg"
            alt="Ezetu"
            draggable={false}
            className="block dark:hidden h-8 sm:h-9 w-auto max-w-[150px] sm:max-w-[180px] object-contain group-hover:scale-[1.03] transition-transform"
          />
          <img
            src="/logo-dark.svg"
            alt="Ezetu"
            draggable={false}
            className="hidden dark:block h-8 sm:h-9 w-auto max-w-[150px] sm:max-w-[180px] object-contain group-hover:scale-[1.03] transition-transform"
          />
        </button>

        {/* CENTER: Segmented Control pill bar (tablet & desktop, nunca se corta) */}
        <nav className="hidden md:flex items-center gap-0.5 p-1 rounded-2xl bg-forest-50 dark:bg-slate2-900/60 border border-forest-100 dark:border-slate2-800 shrink-0">
          {tabs.map((tb) => (
            <button
              key={tb.id}
              onClick={() => onTabClick(tb.id)}
              className={`px-2.5 lg:px-3.5 py-1.5 rounded-xl text-xs lg:text-[13px] font-600 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                tab === tb.id
                  ? 'bg-forest-600 text-white shadow-soft'
                  : 'text-forest-700/70 dark:text-sand-300/70 hover:text-forest-800 dark:hover:text-sand-100'
              }`}
            >
              <tb.Icon className="w-4 h-4 shrink-0" />
              <span>{tb.label}</span>
            </button>
          ))}
        </nav>

        {/* RIGHT: Universal Search (lupa en <1024px, barra en >=1024px) + + Añadir + User */}
        <div className="flex items-center gap-1.5 lg:flex-1 lg:justify-end min-w-0 shrink-0 lg:shrink">
          <UniversalSearch />

          <button
            onClick={() => {
              if (!isAuthenticated) {
                setAuthOpen(true);
                return;
              }
              setContributeOpen(true);
            }}
            aria-label={t('contributePlace')}
            title={t('contributePlace')}
            className="shrink-0 flex items-center justify-center gap-1.5 h-9 px-2.5 xl:px-3 rounded-lg bg-forest-600 hover:bg-forest-700 text-white font-600 text-sm shadow-soft transition-colors whitespace-nowrap"
          >
            <MapPinPlus className="w-4 h-4 shrink-0" />
            <span className="hidden xl:inline">{t('contributePlace').replace(/^\+\s*/, '')}</span>
          </button>

          <UserMenu />

          {/* Mobile menu — acciones secundarias en móvil */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden shrink-0 grid place-items-center w-9 h-9 rounded-lg border border-forest-100 dark:border-slate2-800 bg-white dark:bg-slate2-900 text-forest-800 dark:text-sand-100"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

     {/* Mobile dropdown — navegación principal + acciones rápidas */}
      {mobileOpen && (
        <nav className="md:hidden flex flex-col gap-2 px-4 pb-3 pt-2.5 border-t border-forest-100/60 dark:border-slate2-800/60 animate-riseIn">
         <div className="grid grid-cols-2 gap-1.5">
            {tabs.map((tb) => {
              const active = tab === tb.id;
              return (
                <button
                  key={tb.id}
                  onClick={() => onTabClick(tb.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-600 transition-all ${
                    active
                      ? 'bg-forest-600 text-white shadow-soft'
                      : 'bg-forest-50 dark:bg-slate2-900 text-forest-800 dark:text-sand-100 border border-forest-100 dark:border-slate2-800'
                  }`}
                >
                  <tb.Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tb.label}</span>
                </button>
              );
            })}
          </div>

       </nav>
      )}
    </header>
  );
}