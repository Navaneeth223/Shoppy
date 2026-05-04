import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

/**
 * Countdown timer component with flip-clock style digits.
 */
export default function CountdownTimer({ endTime, onExpire, className, compact = false }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft(endTime);
      setTimeLeft(remaining);
      if (remaining.total <= 0) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onExpire]);

  if (timeLeft.total <= 0) {
    return (
      <span className={clsx('text-error text-sm font-semibold', className)}>
        Expired
      </span>
    );
  }

  if (compact) {
    return (
      <span className={clsx('font-mono font-bold text-accent-gold', className)}>
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    );
  }

  return (
    <div className={clsx('flex items-center gap-2', className)} aria-live="polite" aria-label={`Time remaining: ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, ${timeLeft.seconds} seconds`}>
      {timeLeft.days > 0 && (
        <>
          <TimeUnit value={timeLeft.days} label="Days" />
          <Separator />
        </>
      )}
      <TimeUnit value={timeLeft.hours} label="Hrs" />
      <Separator />
      <TimeUnit value={timeLeft.minutes} label="Min" />
      <Separator />
      <TimeUnit value={timeLeft.seconds} label="Sec" />
    </div>
  );
}

function TimeUnit({ value, label }) {
  const display = String(value).padStart(2, '0');

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-10 h-10 bg-surface-2 border border-border rounded-lg flex items-center justify-center overflow-hidden">
        <motion.span
          key={display}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="font-mono font-bold text-lg text-accent-gold"
        >
          {display}
        </motion.span>
      </div>
      <span className="text-[9px] text-text-muted mt-1 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function Separator() {
  return (
    <span className="text-accent-gold font-bold text-lg mb-4 select-none">:</span>
  );
}

function calculateTimeLeft(endTime) {
  const difference = new Date(endTime) - new Date();

  if (difference <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    total: difference,
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}
