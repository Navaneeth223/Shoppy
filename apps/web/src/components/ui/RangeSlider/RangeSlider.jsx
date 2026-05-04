import React, { useState, useCallback } from 'react';
import clsx from 'clsx';

/**
 * Dual-handle range slider for price filtering.
 */
export default function RangeSlider({
  min = 0,
  max = 1000,
  value = [0, 1000],
  onChange,
  step = 1,
  formatValue = (v) => `$${v}`,
  label,
  className,
}) {
  const [localValue, setLocalValue] = useState(value);

  const handleMinChange = useCallback(
    (e) => {
      const newMin = Math.min(Number(e.target.value), localValue[1] - step);
      const newValue = [newMin, localValue[1]];
      setLocalValue(newValue);
      onChange?.(newValue);
    },
    [localValue, step, onChange]
  );

  const handleMaxChange = useCallback(
    (e) => {
      const newMax = Math.max(Number(e.target.value), localValue[0] + step);
      const newValue = [localValue[0], newMax];
      setLocalValue(newValue);
      onChange?.(newValue);
    },
    [localValue, step, onChange]
  );

  const minPercent = ((localValue[0] - min) / (max - min)) * 100;
  const maxPercent = ((localValue[1] - min) / (max - min)) * 100;

  return (
    <div className={clsx('space-y-3', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-secondary">{label}</span>
          <span className="text-sm text-text-primary font-semibold">
            {formatValue(localValue[0])} — {formatValue(localValue[1])}
          </span>
        </div>
      )}

      <div className="relative h-5 flex items-center">
        {/* Track */}
        <div className="absolute w-full h-1.5 bg-surface-2 rounded-full">
          {/* Active range */}
          <div
            className="absolute h-full bg-accent-gold rounded-full"
            style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
          />
        </div>

        {/* Min handle */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[0]}
          onChange={handleMinChange}
          className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer range-slider"
          aria-label={`Minimum ${label || 'value'}: ${formatValue(localValue[0])}`}
          style={{ zIndex: localValue[0] > max - 100 ? 5 : 3 }}
        />

        {/* Max handle */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[1]}
          onChange={handleMaxChange}
          className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer range-slider"
          aria-label={`Maximum ${label || 'value'}: ${formatValue(localValue[1])}`}
          style={{ zIndex: 4 }}
        />
      </div>

      {/* Min/max labels */}
      <div className="flex justify-between text-xs text-text-muted">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>

      <style>{`
        .range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #C9A84C;
          border: 2px solid #0A0A0B;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(201,168,76,0.4);
          transition: box-shadow 0.15s;
        }
        .range-slider::-webkit-slider-thumb:hover {
          box-shadow: 0 0 16px rgba(201,168,76,0.6);
        }
        .range-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #C9A84C;
          border: 2px solid #0A0A0B;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
