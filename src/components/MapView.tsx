import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Star, ShieldAlert, BadgeCheck, Footprints, Bookmark, MapPin, Trophy,
  Navigation, Flag, Mountain, X, ChevronUp, ChevronDown, CircleCheck as CheckCircle2, Lock,
} from 'lucide-react';
import { ProtectedPhoto } from './ProtectedPhoto';
import { PlaceBreadcrumb } from './PlaceBreadcrumb';
import type { Spot } from '@/lib/types';
import { useApp } from '@/lib/app-context';
import { useSpots, type SpotWithRelations } from '@/lib/data';
import { categoryColor, basqueName, getLocalizedCountry } from '@/lib/utils';
import { SpotDrawer } from './SpotDrawer';
import { Ikurrina } from './Ikurrina';
import { flagPinHtml } from './FlagIcon';
import { CategoryIcon, categoryPinSvg } from './CategoryIcon';

try {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
} catch { /* leaflet icon fix — safe to ignore */ }

const INITIAL_CENTER: [number, number] = [46.5, 6.5];
const INITIAL_ZOOM = 5;

type PinMode = 'flags' | 'icons';
type SheetSnap = 'collapsed' | 'half' | 'full';

const SNAP_PCT: Record<SheetSnap, number> = {
  collapsed: 11,
  half: 48,
  full: 88,
};

const CAT_COLORS: Record<string, string> = {
  nature: '#16a34a',
  village: '#92400e',
  city: '#64748b',
};


function rankBadgeClass(rank: number): string {
  if (rank === 1) return 'bg-gradient-to-br from-amber-400 to-amber-600 text-white';
  if (rank === 2) return 'bg-gradient-to-br from-slate-300 to-slate-500 text-white';
  if (rank === 3) return 'bg-gradient-to-br from-orange-400 to-orange-600 text-white';
  return 'bg-forest-100 dark:bg-slate2-800 text-forest-700 dark:text-sand-300';
}

function isValidCoord(lat: unknown, lng: unknown): boolean {
  return typeof lat === 'number' && typeof lng === 'number'
    && !Number.isNaN(lat) && !Number.isNaN(lng)
    && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

const IKURRINA_BODY = '<rect width="280" height="140" fill="#D52B1E"/><path d="M0,0 L14,0 L280,126 L280,140 L266,140 L0,14 Z" fill="#009B48"/><path d="M266,0 L280,0 L280,14 L14,140 L0,140 L0,126 Z" fill="#009B48"/><rect x="130" width="20" height="140" fill="#FFFFFF"/><rect y="60" width="280" height="20" fill="#FFFFFF"/>';

const ikurrinaSvg = (attrs: string) => `<svg viewBox="0 0 280 140" ${attrs} preserveAspectRatio="xMidYMid meet" shape-rendering="geometricPrecision">${IKURRINA_BODY}</svg>`;

function buildPinHtml(spot: Spot, mode: PinMode, size: number, isActive: boolean, lang: string): string {
  const color = CAT_COLORS[spot.category] ?? '#64748b';
  const ringSize = isActive ? 4 : 2;
  const innerSize = size - ringSize * 2 - 4;

  if (mode === 'icons') {
    const iconSvg = categoryPinSvg(spot.category, innerSize - 2);
    return `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:${ringSize}px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,.35);
      display:flex;align-items:center;justify-content:center;
      ${isActive ? 'outline:2px solid ' + color + ';outline-offset:1px' : ''}
    ">${iconSvg}</div>`;
  }

  const isEusSpot = lang === 'EUS' && spot.euskal_herria;
  const flagSvg = isEusSpot
    ? ikurrinaSvg('width="100%" height="100%" style="border-radius:2px;overflow:hidden;display:block"')
    : flagPinHtml(spot.country_code, innerSize);

  return `<div style="
    width:${size}px;height:${size}px;border-radius:50%;
    background:${color};border:${ringSize}px solid white;
    box-shadow:0 2px 6px rgba(0,0,0,.35);
    display:flex;align-items:center;justify-content:center;
    overflow:hidden;padding:3px;
    ${isActive ? 'outline:2px solid ' + color + ';outline-offset:1px' : ''}
  ">${flagSvg}</div>`;
}

const PROXIMITY_THRESHOLD_PX = 55;

function weightedCentroid(coords: [number, number][]): [number, number] {
  if (coords.length === 0) return [0, 0];
  const lat = coords.reduce((a, c) => a + c[0], 0) / coords.length;
  const lng = coords.reduce((a, c) => a + c[1], 0) / coords.length;
  return [lat, lng];
}

interface ProximityCluster {
  spots: Spot[];
  centroid: [number, number];
  bounds: L.LatLngBounds;
}

function buildProximityClusters(
  spots: Spot[],
  mapInstance: L.Map,
  thresholdPx: number,
  excludeId?: string | null,
): { clusters: ProximityCluster[]; singletons: Spot[] } {
  const singletons: Spot[] = [];
  const clusterable = excludeId
    ? spots.filter((s) => {
        if (s.id === excludeId) {
          singletons.push(s);
          return false;
        }
        return true;
      })
    : spots;

  const points = clusterable.map((s) => ({
    spot: s,
    px: mapInstance.latLngToContainerPoint(L.latLng(s.latitude, s.longitude)),
  }));

  const visited = new Set<number>();
  const clusters: ProximityCluster[] = [];

  for (let i = 0; i < points.length; i++) {
    if (visited.has(i)) continue;
    visited.add(i);
    const group = [points[i]];

    let changed = true;
    while (changed) {
      changed = false;
      for (let j = 0; j < points.length; j++) {
        if (visited.has(j)) continue;
        const closeToGroup = group.some((g) =>
          Math.hypot(g.px.x - points[j].px.x, g.px.y - points[j].px.y) < thresholdPx,
        );
        if (closeToGroup) {
          visited.add(j);
          group.push(points[j]);
          changed = true;
        }
      }
    }

    if (group.length >= 2) {
      const coords = group.map((g) => [g.spot.latitude, g.spot.longitude] as [number, number]);
      clusters.push({
        spots: group.map((g) => g.spot),
        centroid: weightedCentroid(coords),
        bounds: L.latLngBounds(coords),
      });
    } else {
      singletons.push(group[0].spot);
    }
  }

  return { clusters, singletons };
}

function numericBubbleHtml(count: number): string {
  const size = count > 30 ? 50 : count >= 10 ? 44 : 38;
  const fontSize = count > 30 ? 18 : count >= 10 ? 16 : 14;
  return `<div style="background-color:#10b981;color:#0f172a;border:3px solid #0f172a;border-radius:50%;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:${fontSize}px;box-shadow:0 6px 18px rgba(16,185,129,0.5);cursor:pointer;transition:transform 0.15s ease;user-select:none;">${count}</div>`;
}

export function MapView({ refreshKey }: { refreshKey?: number }) {
  const { t, lang, focusedSpotId, setFocusedSpotId, focusedAreaBounds, setFocusedAreaBounds, mapLayer, setMapLayer, visitedSpotIds, savedSpotIds, isAuthenticated, setAuthOpen } = useApp();
  const { spots, loading } = useSpots(refreshKey);

  const savedIds = useMemo(() => new Set(savedSpotIds), [savedSpotIds]);

  const [selected, setSelected] = useState<SpotWithRelations | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'city' | 'village' | 'nature'>('all');
  const [boundsVersion, setBoundsVersion] = useState(0);
  const [pinMode, setPinMode] = useState<PinMode>('flags');
  const [visibleMapCount, setVisibleMapCount] = useState(12);

  // Responsive mobile bottom sheet state (starts in Vista Mixta 'half')
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  );
  const [sheetSnap, setSheetSnap] = useState<SheetSnap>('half');
  const [dragHeight, setDragHeight] = useState<number | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const cardRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const boundsVersionRef = useRef(0);
  const panelScrollRef = useRef<HTMLDivElement>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const numericClusterMarkersRef = useRef<L.Marker[]>([]);
  const sheetSnapRef = useRef<SheetSnap>(sheetSnap);
  sheetSnapRef.current = sheetSnap;
  const lastNonFullSnapRef = useRef<'collapsed' | 'half'>('half');
  if (sheetSnap !== 'full') lastNonFullSnapRef.current = sheetSnap;

  // Listen to breakpoint changes cleanly
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Init Leaflet map
  useEffect(() => {
    if (!mapRef.current || map.current) return;
    let m: L.Map;
    try {
      m = L.map(mapRef.current, {
        center: INITIAL_CENTER,
        zoom: INITIAL_ZOOM,
        minZoom: 2,
        worldCopyJump: true,
        scrollWheelZoom: true,
        zoomControl: false,
      });
    } catch (e) {
      console.error('[MapView] Failed to init Leaflet', e);
      return;
    }
    L.control.zoom({ position: 'bottomright' }).addTo(m);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(m);
    map.current = m;
    markersGroupRef.current = L.layerGroup().addTo(m);

    requestAnimationFrame(() => {
      m.invalidateSize();
      boundsVersionRef.current++;
      setBoundsVersion(boundsVersionRef.current);
    });
    const resizeTimer = setTimeout(() => m.invalidateSize(), 250);

    const onMove = () => {
      boundsVersionRef.current++;
      setBoundsVersion(boundsVersionRef.current);
    };
    m.on('moveend', onMove);
    m.on('zoomend', onMove);
    m.on('click', () => { setSelected(null); setFocusedSpotId(null); });

    return () => {
      clearTimeout(resizeTimer);
      m.remove();
      map.current = null;
    };
  }, [setFocusedSpotId]);

  useEffect(() => {
    const timer = setTimeout(() => map.current?.invalidateSize(), 120);
    return () => clearTimeout(timer);
  }, [isMobile]);

  const validSpots = useMemo(
    () => spots.filter((s) => isValidCoord(s.latitude, s.longitude)),
    [spots],
  );

  const visitedIds = useMemo(() => {
    if (visitedSpotIds.size > 0) return visitedSpotIds;
    return new Set([
      '11111111-1111-4111-8111-111111111101',
      '11111111-1111-4111-8111-111111111102',
      '11111111-1111-4111-8111-111111111103',
      '11111111-1111-4111-8111-111111111108',
    ]);
  }, [visitedSpotIds]);

  const visitedSpots = useMemo(
    () => validSpots.filter((s) => visitedIds.has(s.id)),
    [validSpots, visitedIds],
  );
  const savedSpots = useMemo(
    () => validSpots.filter((s) => savedIds.has(s.id)),
    [validSpots, savedIds],
  );

  const pinSpots = useMemo(() => {
    if (loading) return [];
    const byCat = (s: Spot) => categoryFilter === 'all' || s.category === categoryFilter;
    if (mapLayer === 'visited') {
      return validSpots.filter((s) => visitedIds.has(s.id) && byCat(s)).sort((a, b) => b.bayesian_rating - a.bayesian_rating);
    }
    if (mapLayer === 'saved') {
      return validSpots.filter((s) => savedIds.has(s.id) && byCat(s)).sort((a, b) => b.bayesian_rating - a.bayesian_rating);
    }
    if (!map.current) return validSpots.filter(byCat).slice().sort((a, b) => b.bayesian_rating - a.bayesian_rating);
    const b = map.current.getBounds();
    return validSpots
      .filter((s) => byCat(s) && b.contains(L.latLng(s.latitude, s.longitude)))
      .sort((a, b) => b.bayesian_rating - a.bayesian_rating);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validSpots, categoryFilter, loading, boundsVersion, mapLayer, visitedIds, savedIds]);

  const visibleRankedSpots = useMemo(() => {
    if (loading) return [];
    const m = map.current;
    if (!m || !isMobile || mapLayer !== 'all') return pinSpots;
    const size = m.getSize();
    if (size.x === 0 || size.y === 0) return pinSpots;
    const activeSnap = sheetSnap === 'full' ? lastNonFullSnapRef.current : sheetSnap;
    const visibleH = Math.max(80, size.y * (1 - SNAP_PCT[activeSnap] / 100) - 14);
    return pinSpots.filter((s) => {
      const px = m.latLngToContainerPoint(L.latLng(s.latitude, s.longitude));
      return px.x >= 8 && px.x <= size.x - 8 && px.y >= 8 && px.y <= visibleH;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinSpots, loading, isMobile, sheetSnap, boundsVersion, mapLayer]);

  useEffect(() => {
    setVisibleMapCount(12);
  }, [boundsVersion]);

  const topSpots = useMemo(() => visibleRankedSpots.slice(0, visibleMapCount), [visibleRankedSpots, visibleMapCount]);
  const totalVisible = visibleRankedSpots.length;

  // Smart flyTo: zooms close enough to separate the spot from nearby pins and centers it in visible area
  const flyToSpot = useCallback((s: Spot) => {
    const m = map.current;
    if (!m) return;
    let zoom = Math.max(m.getZoom(), 12);
    while (zoom < 15) {
      const targetPt = m.project([s.latitude, s.longitude], zoom);
      const hasCloseNeighbor = validSpots.some((other) => {
        if (other.id === s.id) return false;
        const otherPt = m.project([other.latitude, other.longitude], zoom);
        return targetPt.distanceTo(otherPt) < PROXIMITY_THRESHOLD_PX + 10;
      });
      if (!hasCloseNeighbor) break;
      zoom++;
    }
    if (window.innerWidth < 768 && sheetSnapRef.current === 'half') {
      const containerH = m.getSize().y;
      const targetPx = m.project([s.latitude, s.longitude], zoom);
      const offsetLatLng = m.unproject(L.point(targetPx.x, targetPx.y + containerH * 0.24), zoom);
      m.flyTo(offsetLatLng, zoom, { duration: 0.6 });
    } else {
      m.flyTo([s.latitude, s.longitude], zoom, { duration: 0.6 });
    }
  }, [validSpots]);

  // Proximity clustering + pins
  useEffect(() => {
    const group = markersGroupRef.current;
    const m = map.current;
    if (!group) return;

    numericClusterMarkersRef.current.forEach((mk) => group.removeLayer(mk));
    numericClusterMarkersRef.current = [];

    const activeSpotId = selected?.id ?? focusedSpotId;
    const { clusters: proxClusters, singletons } = m
      ? buildProximityClusters(pinSpots, m, PROXIMITY_THRESHOLD_PX, activeSpotId)
      : { clusters: [], singletons: pinSpots };

    const singletonIds = new Set(singletons.map((s) => s.id));

    markersRef.current.forEach((mk, id) => {
      if (!singletonIds.has(id)) { group.removeLayer(mk); markersRef.current.delete(id); }
    });

    for (const cluster of proxClusters) {
      const count = cluster.spots.length;
      const bubbleSize = count > 30 ? 50 : count >= 10 ? 44 : 38;
      const icon = L.divIcon({
        className: '',
        html: numericBubbleHtml(count),
        iconSize: [bubbleSize, bubbleSize],
        iconAnchor: [bubbleSize / 2, bubbleSize / 2],
      });
      const mk = L.marker(cluster.centroid, { icon }).addTo(group);
      mk.on('click', () => {
        if (m) m.fitBounds(cluster.bounds.pad(0.35), { duration: 0.8 });
      });
      numericClusterMarkersRef.current.push(mk);
    }

    singletons.forEach((s) => {
      const existing = markersRef.current.get(s.id);
      const isActive = hovered === s.id || focusedSpotId === s.id;
      const isVisited = visitedIds.has(s.id);
      const isSaved = savedIds.has(s.id);
      const size = isActive ? 40 : 30;
      const pinHtml = buildPinHtml(s, pinMode, size, isActive, lang);
      const visitedBadge = isVisited
        ? `<span style="position:absolute;top:-5px;right:-5px;width:16px;height:16px;border-radius:50%;background:#16a34a;border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,.35);pointer-events:none;z-index:2"><svg viewBox=\"0 0 24 24\" width=\"9\" height=\"9\" fill=\"none\" stroke=\"white\" stroke-width=\"3.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"20 6 9 17 4 12\"/></svg></span>` : '';
      const savedBadge = isSaved
        ? `<span style="position:absolute;top:-5px;left:-5px;width:16px;height:16px;border-radius:50%;background:#ef4444;border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,.35);pointer-events:none;z-index:2"><svg viewBox=\"0 0 24 24\" width=\"8.5\" height=\"8.5\" fill=\"white\"><path d=\"M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z\"/></svg></span>` : '';
      const html = `<div style="position:relative">${pinHtml}${visitedBadge}${savedBadge}</div>`;
      const icon = L.divIcon({
        className: '',
        html: `<div class="ezetu-pin ${s.category} ${isActive ? 'active' : ''} ${isVisited ? 'visited' : ''}" style="width:${size}px;height:${size}px">${html}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
      if (existing) {
        existing.setIcon(icon);
      } else {
        const mk = L.marker([s.latitude, s.longitude], { icon }).addTo(group);
        const label = lang === 'EUS' && s.euskal_herria ? basqueName(s.id, s.name) : s.name;
        mk.bindPopup(`<div style="font-weight:600;font-size:13px">${label}<br/><span style="font-weight:400;font-size:11px;opacity:.7">${getLocalizedCountry(s, lang).name}</span></div>`);
        mk.on('click', () => {
          setSelected(s);
          setFocusedSpotId(s.id);
          if (window.innerWidth < 768) {
            setSheetSnap((prev) => (prev === 'collapsed' ? 'half' : prev));
          }
        });
        mk.on('mouseover', () => setHovered(s.id));
        mk.on('mouseout', () => setHovered((h) => (h === s.id ? null : h)));
        markersRef.current.set(s.id, mk);
      }
    });
  }, [pinSpots, hovered, focusedSpotId, selected?.id, visitedIds, savedIds, setFocusedSpotId, lang, pinMode, boundsVersion]);

  useEffect(() => {
    if (mapLayer === 'all' || !map.current) return;
    const targetSpots = mapLayer === 'visited' ? visitedSpots : savedSpots;
    if (targetSpots.length === 0) return;
    const bounds = L.latLngBounds(targetSpots.map((s) => [s.latitude, s.longitude] as [number, number]));
    map.current.fitBounds(bounds.pad(0.3), { duration: 0.6 });
  }, [mapLayer, visitedSpots, savedSpots]);

  useEffect(() => {
    if (!focusedSpotId || !map.current) return;
    const s = spots.find((x) => x.id === focusedSpotId);
    if (!s) return;
    if (window.innerWidth < 768) {
      setSheetSnap((prev) => (prev === 'collapsed' ? 'half' : prev));
    }
    flyToSpot(s);
    setSelected(s);
    const timer = setTimeout(() => {
      const el = cardRefs.current.get(focusedSpotId);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
    return () => clearTimeout(timer);
  }, [focusedSpotId, spots, flyToSpot]);

  useEffect(() => {
    const m = map.current;
    if (!focusedAreaBounds || !m) return;
    setSelected(null);
    const mobileHalf = window.innerWidth < 768 && sheetSnapRef.current === 'half';
    const sheetH = mobileHalf ? Math.round((m.getSize().y || window.innerHeight * 0.7) * (SNAP_PCT.half / 100)) : 0;
    m.flyToBounds(focusedAreaBounds, {
      duration: 0.8,
      maxZoom: 12,
      paddingTopLeft: mobileHalf ? [24, 52] : [40, 56],
      paddingBottomRight: mobileHalf ? [24, sheetH + 20] : [40, 40],
    });
    const timer = setTimeout(() => {
      boundsVersionRef.current++;
      setBoundsVersion(boundsVersionRef.current);
      setFocusedAreaBounds(null);
    }, 900);
    return () => clearTimeout(timer);
  }, [focusedAreaBounds, setFocusedAreaBounds]);

  useEffect(() => {
    panelScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selected?.id]);

  useEffect(() => {
    if (!hovered) return;
    const el = cardRefs.current.get(hovered);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [hovered]);

  const onCardHover = useCallback((id: string | null) => setHovered(id), []);
  const onCardClick = useCallback((s: Spot) => {
    setSelected(s);
    setFocusedSpotId(s.id);
    if (window.innerWidth < 768 && sheetSnapRef.current === 'collapsed') {
      setSheetSnap('half');
    }
    flyToSpot(s);
  }, [setFocusedSpotId, flyToSpot]);

  const backToList = useCallback(() => {
    setSelected(null);
    setFocusedSpotId(null);
  }, [setFocusedSpotId]);

  const stepUp = () => setSheetSnap((s) => (s === 'collapsed' ? 'half' : 'full'));
  const stepDown = () => setSheetSnap((s) => (s === 'full' ? 'half' : 'collapsed'));

  // Smooth touch & mouse dragging on the mobile sheet handle
  const onSheetPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const containerH = rootRef.current?.clientHeight ?? window.innerHeight * 0.8;
    const startY = e.clientY;
    const startSnap = sheetSnapRef.current;
    const startH = (SNAP_PCT[startSnap] / 100) * containerH;
    let moved = false;
    let lastH = startH;

    const onMove = (ev: PointerEvent) => {
      const dy = startY - ev.clientY;
      if (Math.abs(dy) > 4) moved = true;
      const minH = 72;
      const maxH = containerH * 0.92;
      lastH = Math.max(minH, Math.min(maxH, startH + dy));
      setDragHeight(lastH);
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      setDragHeight(null);

      if (!moved) {
        // Simple tap on collapsed bar opens half view
        if (startSnap === 'collapsed') setSheetSnap('half');
        return;
      }

      const delta = lastH - startH;
      if (delta > 45) {
        setSheetSnap(startSnap === 'collapsed' ? 'half' : 'full');
      } else if (delta < -45) {
        setSheetSnap(startSnap === 'full' ? 'half' : 'collapsed');
      } else {
        const pct = (lastH / containerH) * 100;
        const snaps: SheetSnap[] = ['collapsed', 'half', 'full'];
        const nearest = snaps.reduce((best, s) =>
          Math.abs(SNAP_PCT[s] - pct) < Math.abs(SNAP_PCT[best] - pct) ? s : best,
        );
        setSheetSnap(nearest);
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  const isEus = (s: Spot) => lang === 'EUS' && s.euskal_herria;

  const placesWord =
    String(lang).toLowerCase().startsWith('eu') ? 'leku' :
    String(lang).toLowerCase().startsWith('es') ? 'lugares' :
    String(lang).toLowerCase().startsWith('pt') ? 'locais' :
    String(lang).toLowerCase().startsWith('fr') ? 'lieux' :
    String(lang).toLowerCase().startsWith('it') ? 'luoghi' :
    String(lang).toLowerCase().startsWith('de') ? 'Orte' : 'places';

  const renderRankedList = () => (
    <>
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 shadow-soft">
        <div className="px-3 md:px-4 py-2 md:py-3">
          {/* Desktop & Tablet full header */}
          <h2 className="hidden md:flex font-display text-lg font-700 text-forest-800 dark:text-sand-100 items-center gap-2 truncate">
            <Trophy className="w-4 h-4 text-terracotta-500 shrink-0" />
            <span className="truncate">{t('zoneRanking')}</span>
          </h2>
          <p className="hidden md:flex text-xs text-forest-700/70 dark:text-sand-300/70 mt-1 items-center gap-1.5">
            <MapPin className="w-3 h-3 text-forest-500" />
            {totalVisible > 0 ? (
              <>{totalVisible} {placesWord} · {t('ranking').toLowerCase()}</>
            ) : (
              <span className="text-forest-700/50 dark:text-sand-300/50">{t('panHint')}</span>
            )}
          </p>

          {/* Categories + Quick layer toggles (wrap cleanly on mobile & desktop) */}
          <div className="flex flex-col gap-1.5 md:mt-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {(['all', 'city', 'village', 'nature'] as const).map((c) => {
                const active = categoryFilter === c;
                return (
                  <button
                    key={c}
                    onClick={() => setCategoryFilter(c)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-600 whitespace-nowrap shrink-0 transition-colors ${
                      active ? 'bg-forest-600 text-white' : 'bg-forest-50 dark:bg-slate2-900 border border-forest-100 dark:border-slate2-800 text-forest-700/70 dark:text-sand-300/70'
                    }`}
                  >
                    <CategoryIcon category={c} variant={active ? 'mono' : 'duotone'} className="w-3.5 h-3.5" />
                    <span>{c === 'all' ? t('all') : c === 'city' ? t('cities') : c === 'village' ? t('villages') : t('nature')}</span>
                  </button>
                );
              })}

              {/* Mobile compact layer toggles */}
              <div className="flex md:hidden items-center gap-1 ml-auto">
                <button
                  onClick={() => setMapLayer(mapLayer === 'visited' ? 'all' : 'visited')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-600 whitespace-nowrap transition-all ${
                    mapLayer === 'visited'
                      ? 'bg-terracotta-500 text-white shadow-soft'
                      : 'bg-forest-50 dark:bg-slate2-900 border border-forest-100 dark:border-slate2-800 text-forest-700/70 dark:text-sand-300/70'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {visitedSpots.length}
                </button>
                <button
                  onClick={() => setMapLayer(mapLayer === 'saved' ? 'all' : 'saved')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-600 whitespace-nowrap transition-all ${
                    mapLayer === 'saved'
                      ? 'bg-amber-500 text-white shadow-soft'
                      : 'bg-forest-50 dark:bg-slate2-900 border border-forest-100 dark:border-slate2-800 text-forest-700/70 dark:text-sand-300/70'
                  }`}
                >
                  <Bookmark className="w-3 h-3" />
                  {savedSpots.length}
                </button>
              </div>
            </div>

            {/* Desktop full 3-way Layer Switcher */}
            <div className="hidden md:flex gap-0.5 p-0.5 rounded-full bg-forest-50 dark:bg-slate2-800 w-fit max-w-full">
              <button
                onClick={() => setMapLayer('all')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-600 transition-all whitespace-nowrap ${
                  mapLayer === 'all'
                    ? 'bg-forest-600 text-white shadow-soft'
                    : 'text-forest-700/60 dark:text-sand-300/60 hover:text-forest-800 dark:hover:text-sand-100'
                }`}
              >
                <CategoryIcon category="all" variant={mapLayer === 'all' ? 'mono' : 'duotone'} className="w-3.5 h-3.5" />
                <span>{t('allLayer')}</span>
              </button>
              <button
                onClick={() => setMapLayer('visited')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-600 transition-all whitespace-nowrap ${
                  mapLayer === 'visited'
                    ? 'bg-terracotta-500 text-white shadow-soft'
                    : 'text-forest-700/60 dark:text-sand-300/60 hover:text-forest-800 dark:hover:text-sand-100'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                {t('visitedLayer')} ({visitedSpots.length})
              </button>
              <button
                onClick={() => setMapLayer('saved')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-600 transition-all whitespace-nowrap ${
                  mapLayer === 'saved'
                    ? 'bg-amber-500 text-white shadow-soft'
                    : 'text-forest-700/60 dark:text-sand-300/60 hover:text-forest-800 dark:hover:text-sand-100'
                }`}
              >
                <Bookmark className="w-3 h-3" />
                {t('savedLayer')} ({savedSpots.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3.5 px-3 pb-3 space-y-2.5">
        {loading && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shimmer-bg animate-shimmer" />
        ))}

        {!loading && totalVisible === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <Navigation className="w-10 h-10 text-forest-300 dark:text-slate2-700 mb-3" />
            <p className="text-sm text-forest-700/60 dark:text-sand-300/60">{t('noSpotsVisible')}</p>
          </div>
        )}

        {!loading && totalVisible > 0 && topSpots.map((s, idx) => {
          const cc = categoryColor(s.category);
          const eus = isEus(s);
          const isActive = hovered === s.id || focusedSpotId === s.id;
          const isVisited = visitedIds.has(s.id);
          const isSaved = savedIds.has(s.id);
          const rank = idx + 1;
          const isLocked = !isAuthenticated && idx >= 3;

          return (
            <div
              key={s.id}
              ref={(el) => { cardRefs.current.set(s.id, el); }}
              onMouseEnter={() => !isLocked && onCardHover(s.id)}
              onMouseLeave={() => !isLocked && onCardHover(null)}
              onClick={() => {
                if (isLocked) {
                  setAuthOpen(true);
                  return;
                }
                onCardClick(s);
              }}
              className={`group relative flex gap-3 p-2.5 sm:p-3 rounded-2xl border cursor-pointer transition-all shadow-sm hover:shadow-md ${
                isActive ? 'border-forest-500 dark:border-forest-400 shadow-lift scale-[1.01]' : 'border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800/95 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {isLocked && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-3 bg-slate-950/65 backdrop-blur-[3px] text-center rounded-2xl">
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 grid place-items-center mb-1 shadow-sm">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-[11px] font-600 text-white leading-tight max-w-[200px]">
                    {lang === 'EUS'
                      ? 'Erregistratu doan leku guztiak ikusteko'
                      : lang === 'ES'
                      ? 'Regístrate gratis para ver todos los lugares'
                      : lang === 'PT'
                      ? 'Regista-te grátis para ver todos os locais'
                      : 'Sign up free to see all places'}
                  </p>
                </div>
              )}

              <div className={`absolute -top-2 -left-2 z-10 grid place-items-center w-7 h-7 rounded-full text-[11px] font-700 shadow-soft ring-2 ring-white dark:ring-slate-900 ${rankBadgeClass(rank)}`}>
                {rank === 1 ? '★' : `#${rank}`}
              </div>

              <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800">
                {s.cover_photo && <ProtectedPhoto src={s.cover_photo.image_url} alt={s.name} loading="lazy" className="object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-full font-600 ${cc.bg} ${cc.text} ring-1 ${cc.ring}`}>
                    <CategoryIcon category={s.category} className="w-3.5 h-3.5" />
                  </span>
                  {s.verified && <BadgeCheck className="w-3.5 h-3.5 text-forest-500 dark:text-forest-300" />}
                  {eus && <Ikurrina className="w-3.5 h-2" />}
                  {s.protected_zone && <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />}
                </div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate mt-1">{eus ? basqueName(s.id, s.name) : s.name}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 truncate flex items-center gap-1">
                  <PlaceBreadcrumb spot={s} />
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                  <span className="flex items-center gap-0.5 text-slate-900 dark:text-white font-700">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {s.bayesian_rating.toFixed(1)}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">· {s.ratings_count} {t('bayesian').toLowerCase()}</span>
                  {isVisited && <span className="flex items-center gap-0.5 text-forest-600 dark:text-forest-300 font-600"><Footprints className="w-3 h-3" /></span>}
                  {isSaved && <span className="text-terracotta-500"><Bookmark className="w-3 h-3 fill-terracotta-500" /></span>}
                </div>
              </div>
            </div>
          );
        })}

        {!loading && totalVisible > visibleMapCount && (
          <div className="flex justify-center">
            {isAuthenticated ? (
              <button
                onClick={() => setVisibleMapCount((c) => c + 12)}
                className="px-6 py-3 my-4 mx-auto rounded-full bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-sm font-semibold shadow-lg flex items-center gap-2 transition-all"
              >
                ▾ {t('loadMore')} ({visibleMapCount} / {totalVisible})
              </button>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="px-6 py-3 my-4 mx-auto rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-sm font-semibold shadow-lg flex items-center gap-2 transition-all active:scale-95"
              >
                🔒 {lang === 'EUS' ? 'Erregistratu doan mapa osoa desblokeatzeko' : lang === 'ES' ? 'Regístrate gratis para desbloquear todo el mapa' : lang === 'PT' ? 'Regista-te grátis para desbloquear todo o mapa' : 'Sign up free to unlock the full map'}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );

  const renderMapControls = () => (
    <>
     <div className={`${isMobile && sheetSnap === 'full' ? 'hidden' : ''} absolute top-2.5 sm:top-3 inset-x-3 z-[500] flex flex-wrap items-center justify-center gap-2 pointer-events-none`}>
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 shadow-soft">
          <span className="text-[11px] font-600 text-forest-700/60 dark:text-sand-300/60 hidden sm:inline px-1">{t('pinStyle')}:</span>
          <div className="flex gap-0.5 rounded-full bg-forest-50 dark:bg-slate2-800 p-0.5">
            <button
              onClick={() => setPinMode('flags')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-600 transition-all whitespace-nowrap ${
                pinMode === 'flags'
                  ? 'bg-forest-600 text-white shadow-soft'
                  : 'text-forest-700/60 dark:text-sand-300/60 hover:text-forest-800 dark:hover:text-sand-100'
              }`}
            >
              <Flag className="w-3 h-3" />
              {t('flagsMode')}
            </button>
            <button
              onClick={() => setPinMode('icons')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-600 transition-all whitespace-nowrap ${
                pinMode === 'icons'
                  ? 'bg-forest-600 text-white shadow-soft'
                  : 'text-forest-700/60 dark:text-sand-300/60 hover:text-forest-800 dark:hover:text-sand-100'
              }`}
            >
              <Mountain className="w-3 h-3" />
              {t('iconsMode')}
            </button>
          </div>
        </div>

        {mapLayer !== 'all' && (
          <div className={`pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-white shadow-lift ${mapLayer === 'visited' ? 'bg-terracotta-500' : 'bg-amber-500'}`}>
            {mapLayer === 'visited' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-600">{mapLayer === 'visited' ? t('visitedLayer') : t('savedLayer')} ({mapLayer === 'visited' ? visitedSpots.length : savedSpots.length})</span>
            <button
              onClick={() => setMapLayer('all')}
              className="ml-1 grid place-items-center w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Legend — on mobile only visible when sheet is collapsed so the 45% map stays clean */}
      <div className={`${isMobile && sheetSnap !== 'collapsed' ? 'hidden' : ''} absolute bottom-20 left-3 md:bottom-4 md:left-4 z-[500] p-2.5 md:p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 shadow-soft text-[11px] md:text-xs space-y-1 md:space-y-1.5`}>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full" style={{ background: CAT_COLORS.nature }} /> {t('nature')}</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full" style={{ background: CAT_COLORS.village }} /> {t('villages')}</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full" style={{ background: CAT_COLORS.city }} /> {t('cities')}</div>
      </div>
    </>
  );

  const panelBody = selected ? (
    <SpotDrawer
      spot={selected}
      allSpots={spots}
      inline
      onClose={backToList}
      onVisitedChange={() => {}}
      onWishlistChange={() => {}}
      key={selected.id}
    />
  ) : renderRankedList();

  const collapsedSummary = selected
    ? `${isEus(selected) ? basqueName(selected.id, selected.name) : selected.name} · ★ ${selected.bayesian_rating.toFixed(1)}`
    : totalVisible > 0
      ? `${totalVisible} ${placesWord} · #1 ${isEus(topSpots[0]) ? basqueName(topSpots[0].id, topSpots[0].name) : topSpots[0].name} (${topSpots[0].bayesian_rating.toFixed(1)} ★)`
      : t('panHint');

  return (
    <div
      ref={rootRef}
      data-sheet={isMobile ? sheetSnap : 'desktop'}
      className="relative flex flex-col md:flex-row w-full h-[calc(100dvh-7.5rem)] md:h-[calc(100dvh-3.5rem)] overflow-hidden"
    >
      {/* ===== Desktop & Tablet Left Sidebar (>= 768px) ===== */}
      {!isMobile && (
        <div
          ref={panelScrollRef}
          className="w-[340px] lg:w-[420px] xl:w-[440px] h-full shrink-0 overflow-y-auto border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 z-10"
        >
          {panelBody}
        </div>
      )}

      {/* ===== Map Panel (always visible & mounted) ===== */}
      <div className="flex-1 h-full w-full relative">
        <div ref={mapRef} className="absolute inset-0" style={{ height: '100%', width: '100%' }} />
        {renderMapControls()}
      </div>

      {/* ===== Mobile 3-State Draggable Bottom Sheet (< 768px) ===== */}
      {isMobile && (
        <div
          style={{ height: dragHeight !== null ? `${dragHeight}px` : `${SNAP_PCT[sheetSnap]}%` }}
          className={`absolute bottom-0 inset-x-0 z-[1300] flex flex-col bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-8px_30px_rgba(0,0,0,0.22)] ${
            dragHeight === null ? 'transition-[height] duration-300 ease-out' : 'transition-none'
          }`}
        >
          {/* Draggable Handle + Quick Step Buttons */}
          <div
            onPointerDown={onSheetPointerDown}
            className="shrink-0 touch-none select-none cursor-grab active:cursor-grabbing px-4 pt-2 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 bg-white dark:bg-slate-900 rounded-t-3xl"
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <Trophy className="w-3.5 h-3.5 text-terracotta-500 shrink-0" />
              <span className="text-xs font-700 text-forest-800 dark:text-sand-100 truncate">
                {sheetSnap === 'collapsed'
                  ? collapsedSummary
                  : `${totalVisible} ${placesWord}`}
              </span>
            </div>

            {/* Center grab pill */}
            <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />

            {/* Right step arrows for effortless 1-tap switching */}
            <div className="flex items-center gap-1 flex-1 justify-end">
              {sheetSnap !== 'collapsed' && (
                <button
                  type="button"
                  onClick={stepDown}
                  aria-label="Reducir lista"
                  className="grid place-items-center w-7 h-7 rounded-full bg-forest-50 dark:bg-slate-800 text-forest-700 dark:text-sand-200 hover:bg-forest-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}
              {sheetSnap !== 'full' && (
                <button
                  type="button"
                  onClick={stepUp}
                  aria-label="Ampliar lista"
                  className="grid place-items-center w-7 h-7 rounded-full bg-forest-50 dark:bg-slate-800 text-forest-700 dark:text-sand-200 hover:bg-forest-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable List or Spot Detail */}
          <div
            ref={panelScrollRef}
            className={`flex-1 min-h-0 overflow-y-auto overscroll-contain ${
              sheetSnap === 'collapsed' ? 'hidden' : 'block'
            }`}
          >
            {panelBody}
          </div>
        </div>
      )}
    </div>
  );
}