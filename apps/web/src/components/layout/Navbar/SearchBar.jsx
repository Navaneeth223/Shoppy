import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Clock } from 'lucide-react';
import { productAPI } from '../../../services/api/productAPI';
import { useDebounce } from '../../../hooks/useDebounce';
import clsx from 'clsx';

const RECENT_SEARCHES_KEY = 'nexus_recent_searches';

export default function SearchBar({ className, autoFocus = false, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debouncedQuery = useDebounce(query, 300);

  // Load popular searches on mount
  useEffect(() => {
    productAPI.popularSearches().then((res) => {
      setPopularSearches(res.data.data?.slice(0, 6) || []);
    }).catch(() => {});

    // Load recent searches from localStorage
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) setRecentSearches(JSON.parse(stored).slice(0, 5));
    } catch {}
  }, []);

  // Fetch suggestions when query changes
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    productAPI.autocomplete(debouncedQuery)
      .then((res) => setSuggestions(res.data.data || []))
      .catch(() => setSuggestions([]))
      .finally(() => setIsLoading(false));
  }, [debouncedQuery]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const handleSearch = useCallback((searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    // Save to recent searches
    try {
      const recent = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
      const updated = [q, ...recent.filter((s) => s !== q)].slice(0, 5);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch {}

    setIsOpen(false);
    setQuery(q);
    navigate(`/search?q=${encodeURIComponent(q)}`);
    onClose?.();
  }, [query, navigate, onClose]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') {
      setIsOpen(false);
      onClose?.();
    }
  };

  const clearQuery = () => {
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const showDropdown = isOpen && (query.length >= 2 ? suggestions.length > 0 : recentSearches.length > 0 || popularSearches.length > 0);

  return (
    <div ref={containerRef} className={clsx('relative w-full', className)}>
      <div className={clsx(
        'flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200',
        'bg-surface-2 border',
        isOpen ? 'border-accent-cyan shadow-[0_0_0_3px_rgba(0,229,255,0.1)]' : 'border-border hover:border-text-muted'
      )}>
        <Search size={16} className="text-text-muted shrink-0" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search products, brands..."
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
          aria-label="Search"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          role="combobox"
        />
        {query && (
          <button onClick={clearQuery} className="text-text-muted hover:text-text-primary transition-colors" aria-label="Clear search">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-surface border border-border shadow-modal overflow-hidden z-dropdown"
            role="listbox"
          >
            {query.length >= 2 ? (
              /* Suggestions */
              <div className="py-2">
                {isLoading ? (
                  <div className="px-4 py-3 text-sm text-text-muted">Searching...</div>
                ) : (
                  suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(suggestion)}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors text-left"
                      role="option"
                    >
                      <Search size={14} className="text-text-muted shrink-0" />
                      <span dangerouslySetInnerHTML={{
                        __html: suggestion.replace(
                          new RegExp(`(${query})`, 'gi'),
                          '<strong class="text-text-primary">$1</strong>'
                        ),
                      }} />
                    </button>
                  ))
                )}
                <button
                  onClick={() => handleSearch()}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-accent-cyan hover:bg-accent-cyan/10 transition-colors border-t border-border mt-1"
                >
                  <Search size={14} />
                  Search for "<strong>{query}</strong>"
                </button>
              </div>
            ) : (
              /* Recent + Popular */
              <div className="py-2">
                {recentSearches.length > 0 && (
                  <>
                    <div className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Recent</div>
                    {recentSearches.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleSearch(s)}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors"
                      >
                        <Clock size={14} className="text-text-muted" />
                        {s}
                      </button>
                    ))}
                  </>
                )}
                {popularSearches.length > 0 && (
                  <>
                    <div className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider mt-1">Trending</div>
                    {popularSearches.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleSearch(s)}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors"
                      >
                        <TrendingUp size={14} className="text-accent-gold" />
                        {s}
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
