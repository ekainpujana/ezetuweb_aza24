import { Ikurrina } from './Ikurrina';

export function flagSvgUrl(code: string): string {
  return `https://flagcdn.com/${code.trim().toLowerCase()}.svg`;
}

export function flagPinHtml(code: string, sizePx: number): string {
  const cc = code.trim().toLowerCase();
  if (!cc || cc.length !== 2) {
    return `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:${Math.round(sizePx * 0.45)}px;color:white;font-weight:700">?</div>`;
  }
  return `<img src="${flagSvgUrl(cc)}" alt="${cc.toUpperCase()}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;pointer-events:none;" />`;
}

interface FlagIconProps {
  code?: string | null;
  isEH?: boolean;
  label?: string;
  className?: string;
  rounded?: 'sm' | 'full';
}

export function FlagIcon({ code, isEH = false, label = '', className = 'w-4 h-3', rounded = 'sm' }: FlagIconProps) {
  if (isEH || code?.toUpperCase() === 'EH') {
    return <Ikurrina className={`${className} ${rounded === 'full' ? 'rounded-full object-cover' : 'rounded-[2px]'} shrink-0 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]`} />;
  }

  const cc = code?.trim().toLowerCase() ?? '';
  if (cc.length !== 2) return null;

  return (
    <img
      src={flagSvgUrl(cc)}
      alt={label || cc.toUpperCase()}
      loading="lazy"
      draggable={false}
      className={`${className} object-cover ${rounded === 'full' ? 'rounded-full' : 'rounded-[2px]'} shrink-0 shadow-[0_0_0_1px_rgba(0,0,0,0.1)] pointer-events-none select-none inline-block align-middle`}
    />
  );
}