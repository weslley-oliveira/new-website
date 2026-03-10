import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Locale = 'en' | 'pt';

const STORAGE_KEY = 'portfolio-locale';

type Translations = Record<string, unknown>;

function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'pt' || stored === 'en') return stored;
  } catch {
    // ignore
  }
  return 'en';
}

function getNestedValue(obj: unknown, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  get: <T = unknown>(key: string) => T | undefined;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

interface LocaleProviderProps {
  children: ReactNode;
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [translations, setTranslations] = useState<Translations>({});

  useEffect(() => {
    setLocaleState(getStoredLocale());
  }, []);

  useEffect(() => {
    let cancelled = false;
    import(`../locales/${locale}.json`)
      .then((mod) => {
        if (!cancelled) setTranslations(mod.default as Translations);
      })
      .catch(() => {
        if (!cancelled) setTranslations({});
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key: string): string => {
      const value = getNestedValue(translations, key);
      return typeof value === 'string' ? value : key;
    },
    [translations]
  );

  const get = useCallback(
    <T = unknown>(key: string): T | undefined => {
      const value = getNestedValue(translations, key);
      return value as T | undefined;
    },
    [translations]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, get }),
    [locale, setLocale, t, get]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return ctx;
}
