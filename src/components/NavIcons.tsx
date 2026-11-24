import type { SVGProps } from 'react';

// 1. Galería (Doble foto polaroid con sol azul)
export function GalleryNavIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 3h11a3 3 0 0 1 3 3v11" stroke="currentColor" />
      <rect x="3" y="5" width="15" height="15" rx="3" stroke="currentColor" />
      <path d="m3 16 4.5-4.5a1.5 1.5 0 0 1 2.1 0L14 16" stroke="currentColor" />
      <path d="m12.5 14.5 1.4-1.4a1.5 1.5 0 0 1 2.1 0L18 15" stroke="currentColor" />
      <circle cx="13" cy="9" r="1.75" fill="#0284C7" stroke="none" />
    </svg>
  );
}

// 2. Ranking (Medalla hexagonal con estrella azul - Modelo 3)
export function RankingNavIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 3 L9.5 9 L12 3 L14.5 9 L17 3" stroke="currentColor" />
      <polygon points="12,9 18,12.5 18,19 12,22.5 6,19 6,12.5" stroke="currentColor" />
      <path d="M12 13.5 L13 16 L15.5 16 L13.5 17.5 L14.2 20 L12 18.5 L9.8 20 L10.5 17.5 L8.5 16 L11 16 Z" fill="#0284C7" stroke="#0284C7" strokeWidth="0.5" />
    </svg>
  );
}

// 3. Mapa (Mapa tríptico plegado con chincheta azul)
export function MapNavIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" stroke="currentColor" />
      <path d="M9 3v15M15 6v15" stroke="currentColor" />
      <circle cx="15" cy="10" r="2" fill="#0284C7" stroke="none" />
    </svg>
  );
}

// 4. Pasaporte (Cuaderno de campo con broche azul - Modelo 4)
export function PassportNavIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2.5" stroke="currentColor" />
      <path d="M8 3 v18" stroke="currentColor" />
      <path d="M13 3 v6 l2 -1.5 l2 1.5 v-6" stroke="currentColor" />
      <rect x="15" y="11" width="5" height="3" rx="1.5" stroke="currentColor" />
      <circle cx="17.5" cy="12.5" r="1" fill="#0284C7" stroke="#0284C7" />
    </svg>
  );
}

// 5. Miatu / Explorar (Foto única centrada con sol azul)
export function FeedPhotoNavIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" />
      <path d="m3 15.5 5.2-5.2a1.5 1.5 0 0 1 2.1 0L15 15" stroke="currentColor" />
      <path d="m13.5 13.5 1.8-1.8a1.5 1.5 0 0 1 2.1 0L21 15" stroke="currentColor" />
      <circle cx="15.5" cy="8.5" r="1.6" fill="#0284C7" stroke="none" />
    </svg>
  );
}

// 6. Sarituak / Premiados (Copa de certamen con estrella azul)
export function TrophyAwardsNavIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" stroke="currentColor" />
      <path d="M7 6H5a2 2 0 0 0-2 2v.5a2.5 2.5 0 0 0 2.5 2.5H7M17 6h2a2 2 0 0 1 2 2v.5a2.5 2.5 0 0 1-2.5 2.5H17" stroke="currentColor" />
      <path d="M12 13v4M8.5 19.5h7" stroke="currentColor" />
      <path d="m12 6 .5 1.1 1.2.2-.9.8.2 1.2-1-.6-1 .6.2-1.2-.9-.8 1.2-.2.5-1.1Z" fill="#0284C7" stroke="none" />
    </svg>
  );
}