import React from 'react';
import CountUp from 'react-countup';
import { useIntersectionObserver } from '../../../hooks/useIntersectionObserver';

/**
 * Animated number counter that triggers when scrolled into view.
 */
export default function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 2,
  separator = ',',
  className,
}) {
  const [ref, isInView] = useIntersectionObserver({ threshold: 0.3 });

  return (
    <span ref={ref} className={className}>
      {isInView ? (
        <CountUp
          end={value}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          duration={duration}
          separator={separator}
          useEasing
        />
      ) : (
        `${prefix}0${suffix}`
      )}
    </span>
  );
}
