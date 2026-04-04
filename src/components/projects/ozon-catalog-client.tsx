'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp, ChevronDown, Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { encodeGBK } from '@/lib/ozon/gbk';
import { getCategoryIcon } from '@/lib/ozon/category-icon';
import { getEnglishKeyword } from '@/lib/ozon/english-keyword';
import { countCategoryStats, filterCategoryTree } from '@/lib/ozon/filter-tree';
import type { OzonCategoryData, OzonCategoryLeaf, OzonCategoryLevel1 } from '@/types';

const DATA_URL = '/data/ozon-category-data.json';
const MOBILE_MAX = 768;
const POPOVER_GAP = 12;
const POPOVER_W = 300;

function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isMobile;
}

function Highlight({ text, term }: { text: string; term: string }) {
  if (!term) return <>{text}</>;
  const esc = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${esc})`, 'gi');
  const parts = text.split(re);
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === term.toLowerCase() ? (
          <mark
            key={i}
            className="bg-neutral-200 dark:bg-neutral-800 rounded-[2px] px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function buildLeafUrls(leaf: OzonCategoryLeaf) {
  const zh = leaf.zhName;
  const en = getEnglishKeyword(leaf.enName, leaf.zhName);
  const ru = leaf.ruName;
  const ruEnc = encodeURIComponent(ru);
  const enEnc = encodeURIComponent(en);
  const zhEnc = encodeGBK(zh);
  const ozonId = leaf.ozonId || '';
  return {
    yandex: `https://wordstat.yandex.com/?region=all&view=graph&words=${ruEnc}`,
    ozon: `https://www.ozon.ru/category/${ozonId}`,
    wildberries: `https://www.wildberries.ru/catalog/0/search.aspx?search=${ruEnc}`,
    vk: `https://vk.com/search?q=${ruEnc}`,
    google: `https://www.google.com/search?q=${enEnc}`,
    tiktok: `https://www.tiktok.com/search?q=${enEnc}`,
    etsy: `https://www.etsy.com/search?q=${enEnc}`,
    amazon: `https://www.amazon.com/s?k=${enEnc}`,
    b1688: `https://s.1688.com/selloffer/offer_search.htm?keywords=${zhEnc}`,
    yiwugo: `https://www.yiwugo.com/search?q=${encodeURIComponent(zh)}`,
  };
}

function PlatformActions({
  leaf,
  onCopyRu,
  onCopyEn,
}: {
  leaf: OzonCategoryLeaf;
  onCopyRu: () => void;
  onCopyEn: () => void;
}) {
  const t = useTranslations('ozonCatalog');
  const u = buildLeafUrls(leaf);
  const linkClass =
    'flex items-center justify-center gap-1.5 py-2.5 px-2 border border-neutral-200 dark:border-neutral-800 rounded-[2px] text-[11px] font-sans uppercase tracking-wider text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-center';

  return (
    <div className="grid grid-cols-2 gap-2">
      <a href={u.yandex} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {t('platform.yandex')}
      </a>
      <a href={u.ozon} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {t('platform.ozon')}
      </a>
      <a href={u.wildberries} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {t('platform.wildberries')}
      </a>
      <a href={u.vk} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {t('platform.vk')}
      </a>
      <a href={u.google} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {t('platform.google')}
      </a>
      <a href={u.tiktok} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {t('platform.tiktok')}
      </a>
      <a href={u.etsy} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {t('platform.etsy')}
      </a>
      <a href={u.amazon} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {t('platform.amazon')}
      </a>
      <a href={u.b1688} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {t('platform.b1688')}
      </a>
      <a href={u.yiwugo} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {t('platform.yiwugo')}
      </a>
      <button type="button" onClick={onCopyRu} className={`${linkClass} col-span-1`}>
        {t('copyRu')}
      </button>
      <button type="button" onClick={onCopyEn} className={`${linkClass} col-span-1`}>
        {t('copyEn')}
      </button>
    </div>
  );
}

export function OzonCatalogClient() {
  const t = useTranslations('ozonCatalog');
  const searchRef = useRef<HTMLInputElement>(null);
  const portalInnerRef = useRef<HTMLDivElement>(null);
  const [rawData, setRawData] = useState<OzonCategoryData | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput.trim().toLowerCase(), 150);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [visibleCat1Count, setVisibleCat1Count] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const [scrollTopVisible, setScrollTopVisible] = useState(false);
  const [popover, setPopover] = useState<{
    leaf: OzonCategoryLeaf;
    rect: DOMRect;
  } | null>(null);
  const [sheetLeaf, setSheetLeaf] = useState<OzonCategoryLeaf | null>(null);
  const [portalStyle, setPortalStyle] = useState<{
    left: number;
    top: number;
    above: boolean;
    arrowLeft: number;
  } | null>(null);
  const hidePopoverTimer = useRef<number | undefined>(undefined);
  const resizeCloseTimer = useRef<number | undefined>(undefined);
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(DATA_URL)
      .then((r) => {
        if (!r.ok) throw new Error('fetch');
        return r.json() as Promise<OzonCategoryData>;
      })
      .then((d) => {
        if (!cancelled) {
          setRawData(d);
          setLoadError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true);
          setRawData(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(
    () => (rawData ? countCategoryStats(rawData) : { level1: 25, level2: 286, level3: 1799 }),
    [rawData],
  );

  const displayData = useMemo(
    () => (rawData ? filterCategoryTree(rawData, debouncedSearch) : []),
    [rawData, debouncedSearch],
  );

  const effectiveExpanded = useMemo(() => {
    if (debouncedSearch) {
      return new Set(displayData.map((_, i) => `cat1-${i}`));
    }
    return expanded;
  }, [debouncedSearch, displayData, expanded]);

  useEffect(() => {
    if (!rawData?.length) return;
    setExpanded((prev) => {
      if (prev.size > 0) return prev;
      return new Set(['cat1-0']);
    });
  }, [rawData]);

  useEffect(() => {
    if (!displayData.length) {
      setVisibleCat1Count(0);
      return;
    }
    let cancelled = false;
    let idx = 0;
    const batch = 5;
    const step = () => {
      if (cancelled) return;
      idx = Math.min(idx + batch, displayData.length);
      setVisibleCat1Count(idx);
      if (idx < displayData.length) {
        const ric =
          window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 50));
        ric(() => step());
      }
    };
    setVisibleCat1Count(0);
    step();
    return () => {
      cancelled = true;
    };
  }, [displayData]);

  useEffect(() => {
    const onScroll = () => setScrollTopVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        if (document.activeElement === searchRef.current) {
          searchRef.current?.blur();
        }
        setSheetLeaf(null);
        setPopover(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const showToast = useCallback((message: string) => {
    window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2500);
  }, []);

  const copyText = useCallback(
    async (text: string, successKey: string) => {
      try {
        await navigator.clipboard.writeText(text);
        showToast(t(successKey, { text }));
      } catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
          showToast(t(successKey, { text }));
        } catch {
          showToast(t('copyFailed'));
        }
        document.body.removeChild(ta);
      }
    },
    [showToast, t],
  );

  const toggleCat1 = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const positionPopover = useCallback((rect: DOMRect) => {
    const el = portalInnerRef.current;
    const ph = el?.offsetHeight ?? 240;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = rect.left;
    if (left + POPOVER_W > vw - 12) {
      left = Math.max(8, rect.right - POPOVER_W);
    }
    const spaceBelow = vh - rect.bottom - POPOVER_GAP;
    const spaceAbove = rect.top - POPOVER_GAP;
    let top: number;
    let above = false;
    if (spaceBelow >= ph || spaceBelow >= spaceAbove) {
      top = rect.bottom + POPOVER_GAP;
    } else {
      top = rect.top - POPOVER_GAP - ph;
      above = true;
    }
    const arrowLeft = Math.min(rect.left - left + rect.width / 2 - 8, POPOVER_W - 24);
    setPortalStyle({
      left,
      top,
      above,
      arrowLeft: Math.max(8, arrowLeft),
    });
  }, []);

  useLayoutEffect(() => {
    if (!popover || isMobile || !mounted) {
      setPortalStyle(null);
      return;
    }
    let cancelled = false;
    const r = popover.rect;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) positionPopover(r);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [popover, isMobile, mounted, positionPopover]);

  const onCat3Enter = useCallback(
    (leaf: OzonCategoryLeaf, el: HTMLElement) => {
      if (isMobile) return;
      window.clearTimeout(hidePopoverTimer.current);
      const btn = el.querySelector('button') ?? el;
      const rect = btn.getBoundingClientRect();
      setPopover({ leaf, rect });
    },
    [isMobile],
  );

  const scheduleHidePopover = useCallback(() => {
    if (isMobile) return;
    window.clearTimeout(hidePopoverTimer.current);
    hidePopoverTimer.current = window.setTimeout(() => setPopover(null), 150);
  }, [isMobile]);

  const onCat3Click = useCallback(
    (leaf: OzonCategoryLeaf, e: React.MouseEvent) => {
      if (!isMobile) return;
      e.stopPropagation();
      setSheetLeaf((prev) => (prev === leaf ? null : leaf));
    },
    [isMobile],
  );

  useEffect(() => {
    if (isMobile) {
      setPopover(null);
      return;
    }
    const onScroll = () => setPopover(null);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isMobile]);

  useEffect(() => {
    const onResize = () => {
      setPopover(null);
      setSheetLeaf(null);
    };
    const debounced = () => {
      window.clearTimeout(resizeCloseTimer.current);
      resizeCloseTimer.current = window.setTimeout(onResize, 250);
    };
    window.addEventListener('resize', debounced);
    return () => {
      window.removeEventListener('resize', debounced);
      window.clearTimeout(resizeCloseTimer.current);
    };
  }, []);

  const visibleSlice = displayData.slice(0, visibleCat1Count);
  const noResults = debouncedSearch && displayData.length === 0 && rawData;

  const desktopPopover =
    mounted &&
    popover &&
    !isMobile &&
    portalStyle &&
    createPortal(
      <div
        className="fixed z-[100] pointer-events-auto"
        style={{ left: portalStyle.left, top: portalStyle.top }}
        onMouseEnter={() => window.clearTimeout(hidePopoverTimer.current)}
        onMouseLeave={scheduleHidePopover}
        role="dialog"
        aria-label={t('panelTitle')}
      >
        <div
          ref={portalInnerRef}
          className="relative border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] rounded-[2px] p-4 shadow-lg"
          style={{ width: Math.min(typeof window !== 'undefined' ? window.innerWidth - 32 : POPOVER_W, POPOVER_W) }}
        >
          <h3 className="text-[15px] font-medium text-neutral-900 dark:text-neutral-100 pb-3 border-b border-neutral-100 dark:border-neutral-900">
            {popover.leaf.zhName}
          </h3>
          <p className="text-[12px] text-neutral-500 dark:text-neutral-500 mt-2 mb-3">
            {getEnglishKeyword(popover.leaf.enName, popover.leaf.zhName)} · {popover.leaf.ruName}
          </p>
          <PlatformActions
            leaf={popover.leaf}
            onCopyRu={() => copyText(popover.leaf.ruName, 'copiedRu')}
            onCopyEn={() =>
              copyText(
                getEnglishKeyword(popover.leaf.enName, popover.leaf.zhName),
                'copiedEn',
              )
            }
          />
        </div>
      </div>,
      document.body,
    );

  return (
    <div className="pb-8">
      <header className="sticky top-0 z-30 -mx-6 px-6 py-4 mb-6 bg-white/95 dark:bg-[#050505]/95 border-b border-neutral-100 dark:border-neutral-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="relative min-w-0 flex-1 lg:max-w-none">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-neutral-400 dark:text-neutral-600"
              strokeWidth={1.5}
              aria-hidden
            />
            <input
              ref={searchRef}
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('searchPlaceholder')}
              autoComplete="off"
              className="w-full bg-white dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-[2px] py-3 pl-11 pr-10 text-[14px] focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
            />
            {searchInput ? (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  searchRef.current?.focus();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors rounded-[2px]"
                aria-label={t('clearSearch')}
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            ) : null}
          </div>

          <dl className="hidden lg:flex gap-8 shrink-0">
            <div>
              <dd className="text-[18px] font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
                {stats.level1}
              </dd>
              <dt className="text-[11px] font-sans uppercase tracking-wider text-neutral-400 dark:text-neutral-600">
                {t('stat.level1')}
              </dt>
            </div>
            <div>
              <dd className="text-[18px] font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
                {stats.level2}
              </dd>
              <dt className="text-[11px] font-sans uppercase tracking-wider text-neutral-400 dark:text-neutral-600">
                {t('stat.level2')}
              </dt>
            </div>
            <div>
              <dd className="text-[18px] font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
                {stats.level3}
              </dd>
              <dt className="text-[11px] font-sans uppercase tracking-wider text-neutral-400 dark:text-neutral-600">
                {t('stat.level3')}
              </dt>
            </div>
          </dl>
        </div>
      </header>

      {loadError && (
        <p className="text-copy text-neutral-500 dark:text-neutral-500 py-12 text-center">
          {t('loadError')}
        </p>
      )}

      {!rawData && !loadError && (
        <div className="flex justify-center py-20" role="status" aria-label={t('loading')}>
          <div className="h-10 w-10 rounded-full border-2 border-neutral-200 border-t-neutral-600 dark:border-neutral-800 dark:border-t-neutral-400 animate-spin" />
        </div>
      )}

      {noResults && (
        <div className="py-16 text-center text-neutral-500 dark:text-neutral-500">
          <p className="text-[16px] font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            {t('noResultsTitle')}
          </p>
          <p className="text-copy">{t('noResultsHint')}</p>
        </div>
      )}

      <div className="space-y-4">
        {visibleSlice.map((cat1: OzonCategoryLevel1, idx: number) => {
          const id = `cat1-${idx}`;
          const isOpen = effectiveExpanded.has(id);
          const icon = getCategoryIcon(cat1.zhName);
          const c1En = getEnglishKeyword(cat1.enName, cat1.zhName);
          return (
            <section
              key={`${cat1.zhName}-${idx}`}
              className="border border-neutral-100 dark:border-neutral-900 rounded-[2px] overflow-hidden bg-white dark:bg-[#0a0a0a]"
            >
              <button
                type="button"
                onClick={() => toggleCat1(id)}
                className="flex w-full items-center justify-between gap-3 p-4 md:p-5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[2px] border border-neutral-200 dark:border-neutral-800 text-xl"
                    aria-hidden
                  >
                    {icon}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[15px] md:text-[17px] font-medium text-neutral-900 dark:text-neutral-100">
                      <Highlight text={cat1.zhName} term={debouncedSearch} />
                    </h3>
                    <p className="text-[13px] text-neutral-500 dark:text-neutral-500 truncate">
                      {c1En} · {cat1.ruName}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  strokeWidth={1.5}
                  aria-hidden
                />
              </button>
              {isOpen && (
                <div className="border-t border-neutral-100 dark:border-neutral-900 px-4 pb-4 pt-2 md:px-5 md:pb-5">
                  <div className="lg:grid lg:grid-cols-2 lg:gap-4 lg:items-start">
                  {cat1.children.map((cat2) => {
                    const c2En = getEnglishKeyword(cat2.enName, cat2.zhName);
                    return (
                      <div
                        key={`${cat2.zhName}-${cat2.ruName}`}
                        className="mt-4 first:mt-0 p-4 rounded-[2px] border border-neutral-100 dark:border-neutral-900 bg-neutral-50/80 dark:bg-neutral-900/20 lg:mt-0"
                      >
                        <div className="mb-3">
                          <h4 className="text-[14px] md:text-[15px] font-medium text-neutral-900 dark:text-neutral-100">
                            <Highlight text={cat2.zhName} term={debouncedSearch} />
                          </h4>
                          <p className="text-[12px] text-neutral-500 dark:text-neutral-500">
                            {c2En} · {cat2.ruName}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(cat2.children || []).map((cat3) => (
                            <div
                              key={`${cat3.ozonId}-${cat3.zhName}`}
                              className="inline-block"
                              onMouseEnter={(e) => onCat3Enter(cat3, e.currentTarget)}
                              onMouseLeave={scheduleHidePopover}
                            >
                              <button
                                type="button"
                                onClick={(e) => onCat3Click(cat3, e)}
                                className="inline-flex items-center border border-neutral-200 dark:border-neutral-800 rounded-[2px] bg-white dark:bg-[#050505] px-3 py-1.5 text-[13px] text-neutral-600 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                              >
                                <Highlight text={cat3.zhName} term={debouncedSearch} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <AnimatePresence>
        {isMobile && sheetLeaf && (
          <>
            <motion.button
              type="button"
              aria-label={t('closePanel')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 bg-black/30"
              onClick={() => setSheetLeaf(null)}
            />
            <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-auto w-full max-h-[85vh] overflow-y-auto bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 border-b-0 rounded-t-[4px] px-6 pt-4 pb-8 shadow-2xl"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-10 h-[3px] bg-neutral-200 dark:bg-neutral-800 rounded-full" />
                </div>
                <div className="flex justify-between items-start gap-3 mb-4">
                  <div className="min-w-0">
                    <h3 className="text-[16px] font-medium text-neutral-900 dark:text-neutral-100">
                      {sheetLeaf.zhName}
                    </h3>
                    <p className="text-[13px] text-neutral-500 dark:text-neutral-500 mt-1">
                      {getEnglishKeyword(sheetLeaf.enName, sheetLeaf.zhName)} · {sheetLeaf.ruName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSheetLeaf(null)}
                    className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors shrink-0"
                    aria-label={t('closePanel')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <PlatformActions
                  leaf={sheetLeaf}
                  onCopyRu={() => copyText(sheetLeaf.ruName, 'copiedRu')}
                  onCopyEn={() =>
                    copyText(
                      getEnglishKeyword(sheetLeaf.enName, sheetLeaf.zhName),
                      'copiedEn',
                    )
                  }
                />
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {desktopPopover}

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 z-20 flex h-11 w-11 items-center justify-center border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-all rounded-[2px] shadow-sm active:scale-95 ${
          scrollTopVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-label={t('scrollTop')}
      >
        <ArrowUp className="h-[17px] w-[17px]" strokeWidth={1.5} />
      </button>

      <div
        className={`fixed bottom-6 left-1/2 z-[45] max-w-[90vw] -translate-x-1/2 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] px-4 py-3 text-[14px] text-neutral-900 dark:text-neutral-100 rounded-[2px] shadow-lg transition-opacity duration-200 ${
          toast ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        role="status"
      >
        {toast}
      </div>
    </div>
  );
}
