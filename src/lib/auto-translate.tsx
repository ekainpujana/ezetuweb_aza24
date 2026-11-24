import { useEffect, useState } from 'react';
import { supabase, hasSupabase } from './supabase';
import { translatedText } from './utils';
import type { Translations } from './types';

const memCache = new Map<string, string>();
const inflight = new Map<string, Promise<string | null>>();

export async function requestTranslation(
  table: 'spots' | 'tips',
  id: string,
  targetLang: string,
): Promise<string | null> {
  const cacheKey = `${table}:${id}:${targetLang}`;
  const cached = memCache.get(cacheKey);
  if (cached) return cached;
  if (!hasSupabase || !id || !targetLang) return null;

  const existing = inflight.get(cacheKey);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const { data, error } = await supabase.functions.invoke('translate', {
        body: { table, id, targetLang },
      });
      if (error || !data?.translated) return null;
      const text = String(data.translated);
      memCache.set(cacheKey, text);
      return text;
    } catch {
      return null;
    } finally {
      inflight.delete(cacheKey);
    }
  })();

  inflight.set(cacheKey, promise);
  return promise;
}

export function useAutoTranslatedText(
  table: 'spots' | 'tips',
  id: string | null | undefined,
  translations: Translations | string | null | undefined,
  langKey: string,
  fallback: string | null | undefined,
): string | null {
  const cacheKey = id ? `${table}:${id}:${langKey}` : '';
  const [autoText, setAutoText] = useState<string | null>(() =>
    cacheKey ? (memCache.get(cacheKey) ?? null) : null,
  );

  const direct =
    translations && typeof translations === 'object' ? translations[langKey] : undefined;

  useEffect(() => {
    setAutoText(cacheKey ? (memCache.get(cacheKey) ?? null) : null);
    if (!id || !hasSupabase || direct) return;
    const hasAnySource =
      !!fallback ||
      (!!translations && typeof translations === 'object' && Object.keys(translations).length > 0);
    if (!hasAnySource) return;

    let cancelled = false;
    requestTranslation(table, id, langKey).then((res) => {
      if (!cancelled && res) setAutoText(res);
    });
    return () => {
      cancelled = true;
    };
  }, [table, id, langKey, direct, cacheKey, fallback, translations]);

  if (direct) return direct;
  if (autoText) return autoText;
  return translatedText(translations, langKey, fallback);
}

export function AutoTranslatedText({
  table,
  id,
  translations,
  langKey,
  fallback,
}: {
  table: 'spots' | 'tips';
  id: string;
  translations: Translations | string | null | undefined;
  langKey: string;
  fallback: string | null | undefined;
}) {
  const text = useAutoTranslatedText(table, id, translations, langKey, fallback);
  return <>{text}</>;
}