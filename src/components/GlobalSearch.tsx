import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Users, HardHat, Calendar, X, CornerDownLeft } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useCrews } from '@/hooks/useCrews';
import { useJobs } from '@/hooks/useJobs';
import { SERVICE_TYPES } from '@/lib/constants';
import type { Customer, Crew, Job } from '@/types';

export interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

type ResultKind = 'customer' | 'crew' | 'job';

interface SearchResult {
  kind: ResultKind;
  id: string;
  title: string;
  subtitle: string;
  to: string;
}

const MAX_PER_GROUP = 6;

const groupMeta: Record<
  ResultKind,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  customer: { label: 'Customers', icon: Users },
  crew: { label: 'Crews', icon: HardHat },
  job: { label: 'Jobs', icon: Calendar },
};

function includesCI(haystack: string | undefined | null, needle: string): boolean {
  if (!haystack) return false;
  return haystack.toLowerCase().includes(needle);
}

function matchCustomers(customers: Customer[], q: string): SearchResult[] {
  return customers
    .filter(
      (c) =>
        includesCI(c.name, q) ||
        includesCI(c.email, q) ||
        includesCI(c.address, q) ||
        includesCI(c.city, q) ||
        includesCI(c.zip, q),
    )
    .slice(0, MAX_PER_GROUP)
    .map((c) => ({
      kind: 'customer' as const,
      id: c.id,
      title: c.name,
      subtitle: [c.address, c.city].filter(Boolean).join(', ') || c.email,
      to: `/customers/${c.id}`,
    }));
}

function matchCrews(crews: Crew[], q: string): SearchResult[] {
  return crews
    .filter(
      (cr) =>
        includesCI(cr.name, q) ||
        includesCI(cr.serviceZone, q) ||
        cr.specialties.some((s) => includesCI(s, q) || includesCI(SERVICE_TYPES[s]?.label, q)) ||
        cr.members.some((m) => includesCI(m.name, q)),
    )
    .slice(0, MAX_PER_GROUP)
    .map((cr) => ({
      kind: 'crew' as const,
      id: cr.id,
      title: cr.name,
      subtitle: cr.serviceZone ? `Zone: ${cr.serviceZone}` : `${cr.members.length} members`,
      to: '/crews',
    }));
}

function matchJobs(jobs: Job[], q: string): SearchResult[] {
  return jobs
    .filter(
      (j) =>
        includesCI(j.customerName, q) ||
        includesCI(j.propertyAddress, q) ||
        includesCI(j.serviceType, q) ||
        includesCI(SERVICE_TYPES[j.serviceType]?.label, q) ||
        includesCI(j.crewName, q),
    )
    .slice(0, MAX_PER_GROUP)
    .map((j) => ({
      kind: 'job' as const,
      id: j.id,
      title: `${SERVICE_TYPES[j.serviceType]?.label ?? j.serviceType} — ${j.customerName}`,
      subtitle: [j.propertyAddress, j.scheduledDate].filter(Boolean).join(' · '),
      to: '/schedule',
    }));
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  // --- Hooks: ALL declared unconditionally, before any early return (Rules of Hooks) ---
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { data: customers } = useCustomers();
  const { data: crews } = useCrews();
  const { data: jobs } = useJobs();

  const q = query.trim().toLowerCase();

  const results = useMemo<SearchResult[]>(() => {
    if (!q) return [];
    return [
      ...matchCustomers(customers ?? [], q),
      ...matchCrews(crews ?? [], q),
      ...matchJobs(jobs ?? [], q),
    ];
  }, [q, customers, crews, jobs]);

  // Reset query + selection whenever the palette opens, and focus the input.
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      // Focus after the open animation paints.
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Keep the active index in range as results change.
  useEffect(() => {
    setActiveIndex((i) => (results.length === 0 ? 0 : Math.min(i, results.length - 1)));
  }, [results.length]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Scroll the active row into view.
  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-result-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, isOpen]);

  function handleSelect(result: SearchResult) {
    navigate(result.to);
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (results.length === 0 ? 0 : (i + 1) % results.length));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (results.length === 0 ? 0 : (i - 1 + results.length) % results.length));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const selected = results[activeIndex];
      if (selected) handleSelect(selected);
    }
  }

  // Build grouped view while preserving each result's flat index for keyboard nav.
  const groups = useMemo(() => {
    const order: ResultKind[] = ['customer', 'crew', 'job'];
    let flatIndex = 0;
    return order
      .map((kind) => {
        const items = results
          .filter((r) => r.kind === kind)
          .map((r) => ({ result: r, index: flatIndex++ }));
        return { kind, items };
      })
      .filter((g) => g.items.length > 0);
  }, [results]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Global search"
          onKeyDown={handleKeyDown}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-slate-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 border-b border-slate-200 dark:border-gray-700">
              <Search className="w-5 h-5 text-slate-400 dark:text-gray-500 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search customers, crews, jobs…"
                aria-label="Search query"
                className="flex-1 bg-transparent py-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none"
              />
              <button
                onClick={onClose}
                aria-label="Close search"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-2">
              {!q && (
                <p className="px-4 py-8 text-center text-sm text-slate-500 dark:text-gray-500">
                  Type to search across customers, crews, and jobs.
                </p>
              )}

              {q && results.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-slate-500 dark:text-gray-500">
                  No results for “{query.trim()}”.
                </p>
              )}

              {groups.map((group) => {
                const GroupIcon = groupMeta[group.kind].icon;
                return (
                  <div key={group.kind} className="mb-1 last:mb-0">
                    <div className="px-4 pt-2 pb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-gray-500">
                      <GroupIcon className="w-3.5 h-3.5" />
                      {groupMeta[group.kind].label}
                    </div>
                    {group.items.map(({ result, index }) => {
                      const isActive = index === activeIndex;
                      return (
                        <button
                          key={result.id}
                          data-result-index={index}
                          onClick={() => handleSelect(result)}
                          onMouseEnter={() => setActiveIndex(index)}
                          className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors ${
                            isActive
                              ? 'bg-accent-light dark:bg-primary/20'
                              : 'hover:bg-slate-50 dark:hover:bg-gray-700/60'
                          }`}
                        >
                          <span className="min-w-0">
                            <span
                              className={`block text-sm font-medium truncate ${
                                isActive
                                  ? 'text-primary dark:text-primary-light'
                                  : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {result.title}
                            </span>
                            <span className="block text-xs text-slate-500 dark:text-gray-400 truncate">
                              {result.subtitle}
                            </span>
                          </span>
                          {isActive && (
                            <CornerDownLeft className="w-4 h-4 flex-shrink-0 text-primary dark:text-primary-light" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Footer hint */}
            <div className="hidden sm:flex items-center gap-4 px-4 py-2 border-t border-slate-200 dark:border-gray-700 text-xs text-slate-400 dark:text-gray-500">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-gray-700 font-sans">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-gray-700 font-sans">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-gray-700 font-sans">↵</kbd>
                to select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-gray-700 font-sans">esc</kbd>
                to close
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
