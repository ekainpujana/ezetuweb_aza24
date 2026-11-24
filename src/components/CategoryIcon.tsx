import type { Category } from '@/lib/types';

export type EzetuCategory = Category | 'all';

interface CategoryIconProps {
  category: EzetuCategory;
  className?: string;
  variant?: 'duotone' | 'mono';
}

export function CategoryIcon({ category, className = 'w-4 h-4', variant = 'duotone' }: CategoryIconProps) {
  const isMono = variant === 'mono';
  const fillOpacity = isMono ? 0 : 0.14;
  const brandDot = isMono ? 'currentColor' : '#0284C7';

  if (category === 'city') {
    const colorCls = isMono ? '' : 'text-[#475569] dark:text-slate-400';
    return (
      <svg viewBox="0 0 24 24" fill="none" className={`${colorCls} ${className} shrink-0`.trim()} aria-hidden="true">
        <path d="M2.5 21h19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path
          d="M3.5 21V11h5M8.5 21V4.5h7V21M15.5 9h5v12"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="7.8" r="1.6" fill={brandDot} />
        <path
          d="M5.2 14.5h1.6M5.2 17.5h1.6M11 12h2M11 15.2h2M11 18.4h2M17.2 12.5h1.6M17.2 15.5h1.6M17.2 18.5h1.6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (category === 'village') {
    const colorCls = isMono ? '' : 'text-[#D97706] dark:text-amber-500';
    return (
      <svg viewBox="0 0 24 24" fill="none" className={`${colorCls} ${className} shrink-0`.trim()} aria-hidden="true">
        <path d="M4.5 9 12 4l7.5 5v10.85Q12 16.95 4.5 19.85V9Z" fill="currentColor" fillOpacity={fillOpacity} />
        <path
          d="M3 10 12 4l9 6M15 6V3.5h2.4v4.1"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M4.5 9v10.85M19.5 9v10.85M2 21Q12 15.8 22 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M10 18.5v-3.7a2 2 0 1 1 4 0v3.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="8.5" r="1.6" fill={brandDot} />
      </svg>
    );
  }

  if (category === 'nature') {
    const colorCls = isMono ? '' : 'text-[#059669] dark:text-emerald-400';
    return (
      <svg viewBox="0 0 24 24" fill="none" className={`${colorCls} ${className} shrink-0`.trim()} aria-hidden="true">
        <path
          d="M3 13.5 8.5 5.5l4.5 5.5 2.5-3 5.5 5.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M3 17Q6 15 9 17T15 17T21 17M3 20Q6 18 9 20T15 20T21 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="19.2" cy="5.2" r="1.6" fill={brandDot} />
      </svg>
    );
  }

  const colorCls = isMono ? '' : 'text-[#0284C7] dark:text-sky-400';
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`${colorCls} ${className} shrink-0`.trim()} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <ellipse cx="12" cy="12" rx="4" ry="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 12h17" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1.8" fill={brandDot} />
    </svg>
  );
}

export function categoryPinSvg(category: Category, sizePx: number): string {
  if (category === 'city') {
    return `<svg viewBox="0 0 24 24" width="${sizePx}" height="${sizePx}" fill="none" stroke="white" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 21h19M3.5 21V11h5M8.5 21V4.5h7V21M15.5 9h5v12"/><circle cx="12" cy="7.8" r="1.6" fill="white" stroke="none"/><path d="M5.2 14.5h1.6M5.2 17.5h1.6M11 12h2M11 15.2h2M11 18.4h2M17.2 12.5h1.6M17.2 15.5h1.6M17.2 18.5h1.6" stroke-width="1.6"/></svg>`;
  }
  if (category === 'village') {
    return `<svg viewBox="0 0 24 24" width="${sizePx}" height="${sizePx}" fill="none" stroke="white" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 9 12 4l7.5 5v10.85Q12 16.95 4.5 19.85V9Z" fill="white" fill-opacity="0.18" stroke="none"/><path d="M3 10 12 4l9 6M15 6V3.5h2.4v4.1M4.5 9v10.85M19.5 9v10.85M2 21Q12 15.8 22 21M10 18.5v-3.7a2 2 0 1 1 4 0v3.7"/><circle cx="12" cy="8.5" r="1.6" fill="white" stroke="none"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" width="${sizePx}" height="${sizePx}" fill="none" stroke="white" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13.5 8.5 5.5l4.5 5.5 2.5-3 5.5 5.5M3 17Q6 15 9 17T15 17T21 17M3 20Q6 18 9 20T15 20T21 20"/><circle cx="19.2" cy="5.2" r="1.6" fill="white" stroke="none"/></svg>`;
}