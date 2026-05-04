import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import {
  selectFilters,
  selectActiveFilterCount,
  toggleBrand,
  setPriceRange,
  setRating,
  toggleColor,
  toggleSize,
  setInStock,
  clearFilters,
} from '../../../store/slices/filterSlice';
import RangeSlider from '../../ui/RangeSlider/RangeSlider';
import Rating from '../../ui/Rating/Rating';
import clsx from 'clsx';

const COLORS = [
  { value: 'black', label: 'Black', hex: '#000000' },
  { value: 'white', label: 'White', hex: '#FFFFFF' },
  { value: 'red', label: 'Red', hex: '#EF4444' },
  { value: 'blue', label: 'Blue', hex: '#3B82F6' },
  { value: 'green', label: 'Green', hex: '#22C55E' },
  { value: 'yellow', label: 'Yellow', hex: '#EAB308' },
  { value: 'purple', label: 'Purple', hex: '#A855F7' },
  { value: 'pink', label: 'Pink', hex: '#EC4899' },
  { value: 'orange', label: 'Orange', hex: '#F97316' },
  { value: 'gray', label: 'Gray', hex: '#6B7280' },
  { value: 'brown', label: 'Brown', hex: '#92400E' },
  { value: 'navy', label: 'Navy', hex: '#1E3A5F' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

function FilterSection({ title, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full mb-3"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold text-text-primary">{title}</span>
        <ChevronDown
          size={14}
          className={clsx('text-text-muted transition-transform duration-200', isOpen && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FilterPanel({ brands = [], className }) {
  const dispatch = useDispatch();
  const filters = useSelector(selectFilters);
  const activeCount = useSelector(selectActiveFilterCount);

  return (
    <div className={clsx('space-y-0', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-accent-gold" />
          <span className="font-display font-semibold text-text-primary">Filters</span>
          {activeCount > 0 && (
            <span className="badge-gold text-[10px] px-1.5 py-0.5">{activeCount}</span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={() => dispatch(clearFilters())}
            className="text-xs text-accent-cyan hover:text-cyan-300 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <RangeSlider
          min={0}
          max={10000}
          value={filters.priceRange}
          onChange={(val) => dispatch(setPriceRange(val))}
          formatValue={(v) => `$${v.toLocaleString()}`}
          step={10}
        />
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Customer Rating">
        <div className="space-y-2">
          {[4, 3, 2, 1].map((star) => (
            <button
              key={star}
              onClick={() => dispatch(setRating(filters.rating === star ? null : star))}
              className={clsx(
                'flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm transition-all',
                filters.rating === star
                  ? 'bg-accent-gold/10 border border-accent-gold/20'
                  : 'hover:bg-surface-2'
              )}
              aria-pressed={filters.rating === star}
            >
              <Rating value={star} showCount={false} size="sm" />
              <span className="text-text-secondary text-xs">& above</span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Brands */}
      {brands.length > 0 && (
        <FilterSection title="Brand">
          <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
            {brands.map((brand) => (
              <label
                key={brand._id || brand.value}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <div
                  className={clsx(
                    'w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
                    filters.brands.includes(brand._id || brand.value)
                      ? 'bg-accent-gold border-accent-gold'
                      : 'border-border group-hover:border-text-muted'
                  )}
                >
                  {filters.brands.includes(brand._id || brand.value) && (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1 4L3 6L7 2" stroke="#0A0A0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={filters.brands.includes(brand._id || brand.value)}
                  onChange={() => dispatch(toggleBrand(brand._id || brand.value))}
                  aria-label={brand.name}
                />
                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors flex-1">
                  {brand.name}
                </span>
                {brand.count !== undefined && (
                  <span className="text-xs text-text-muted">{brand.count}</span>
                )}
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Colors */}
      <FilterSection title="Color">
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => dispatch(toggleColor(color.value))}
              className={clsx(
                'w-7 h-7 rounded-full border-2 transition-all',
                filters.colors.includes(color.value)
                  ? 'border-accent-gold scale-110 shadow-gold-glow'
                  : 'border-border hover:border-text-muted hover:scale-105'
              )}
              style={{ backgroundColor: color.hex }}
              title={color.label}
              aria-label={color.label}
              aria-pressed={filters.colors.includes(color.value)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Sizes */}
      <FilterSection title="Size">
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => dispatch(toggleSize(size))}
              className={clsx(
                'px-2.5 py-1 rounded-md text-xs font-medium border transition-all',
                filters.sizes.includes(size)
                  ? 'bg-accent-gold/10 border-accent-gold text-accent-gold'
                  : 'border-border text-text-muted hover:border-text-muted hover:text-text-secondary'
              )}
              aria-pressed={filters.sizes.includes(size)}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability" defaultOpen={false}>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            className={clsx(
              'w-10 h-5 rounded-full border-2 relative transition-all cursor-pointer',
              filters.inStock
                ? 'bg-accent-gold border-accent-gold'
                : 'bg-surface-2 border-border'
            )}
            onClick={() => dispatch(setInStock(!filters.inStock))}
          >
            <div
              className={clsx(
                'absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform duration-200',
                filters.inStock ? 'translate-x-4' : 'translate-x-0.5'
              )}
            />
          </div>
          <span className="text-sm text-text-secondary">In Stock Only</span>
        </label>
      </FilterSection>
    </div>
  );
}
