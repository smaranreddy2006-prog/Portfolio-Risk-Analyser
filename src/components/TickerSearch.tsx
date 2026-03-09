'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Loader2, X, TrendingUp } from 'lucide-react';

interface TickerSuggestion {
    symbol: string;
    name: string;
    exchange: string;
    flag: string;
    type: string;
}

interface TickerSearchProps {
    value: string;
    onChange: (ticker: string) => void;
    placeholder?: string;
    className?: string;
}

export default function TickerSearch({ value, onChange, placeholder = 'Apple, Reliance, AAPL...', className = '' }: TickerSearchProps) {
    const [query, setQuery] = useState(value);
    const [suggestions, setSuggestions] = useState<TickerSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(false); // true when a suggestion was chosen
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync external value changes (e.g. clear button)
    useEffect(() => {
        if (value !== query && !selected) setQuery(value);
    }, [value]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const fetchSuggestions = useCallback(async (q: string) => {
        if (!q || q.length < 2) {
            setSuggestions([]);
            setOpen(false);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`/api/ticker/search?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            setSuggestions(data.results || []);
            setOpen((data.results || []).length > 0);
        } catch {
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        setSelected(false);
        onChange(val.toUpperCase()); // pass raw input as provisional ticker

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchSuggestions(val), 320);
    };

    const handleSelect = (s: TickerSuggestion) => {
        setQuery(s.symbol);
        onChange(s.symbol);
        setSelected(true);
        setOpen(false);
        setSuggestions([]);
    };

    const handleClear = () => {
        setQuery('');
        onChange('');
        setSelected(false);
        setSuggestions([]);
        setOpen(false);
    };

    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>
            {/* Input */}
            <div className="relative flex items-center">
                {loading
                    ? <Loader2 size={15} className="absolute left-3.5 text-indigo-400 animate-spin pointer-events-none" />
                    : <Search size={15} className="absolute left-3.5 text-zinc-500 pointer-events-none" />
                }
                <input
                    type="text"
                    value={query}
                    onChange={handleInput}
                    onFocus={() => suggestions.length > 0 && setOpen(true)}
                    placeholder={placeholder}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-9 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-semibold uppercase shadow-inner"
                    autoComplete="off"
                    spellCheck={false}
                />
                {query && (
                    <button onClick={handleClear} className="absolute right-3 text-zinc-500 hover:text-zinc-300 transition-colors">
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {open && suggestions.length > 0 && (
                <div className="absolute z-50 bottom-full mb-1.5 md:bottom-full md:mb-1.5 w-full bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 duration-150">
                    <div className="px-3 py-2 border-b border-white/5 flex items-center gap-1.5">
                        <TrendingUp size={12} className="text-indigo-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Suggestions</span>
                    </div>
                    <ul className="max-h-64 overflow-y-auto divide-y divide-white/5">
                        {suggestions.map((s) => (
                            <li key={s.symbol}>
                                <button
                                    onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                                >
                                    {/* Flag + exchange */}
                                    <span className="text-lg leading-none shrink-0">{s.flag}</span>
                                    {/* Main content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-sm font-bold text-white font-mono">{s.symbol}</span>
                                            <span className="text-[10px] text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded font-medium">{s.type}</span>
                                        </div>
                                        <div className="text-xs text-zinc-400 truncate mt-0.5">{s.name}</div>
                                    </div>
                                    {/* Exchange */}
                                    <span className="text-[10px] text-zinc-600 shrink-0">{s.exchange}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
