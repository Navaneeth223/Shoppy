import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

/**
 * Lazy-loading image component with blur-up placeholder.
 */
export default function LazyImage({
  src,
  alt,
  className,
  containerClassName,
  aspectRatio,
  objectFit = 'cover',
  placeholder,
  onLoad,
  onError,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const fallbackSrc = placeholder || `https://picsum.photos/seed/fallback/400/400`;

  return (
    <div
      ref={imgRef}
      className={clsx(
        'overflow-hidden bg-surface-2',
        aspectRatio && `aspect-[${aspectRatio}]`,
        containerClassName
      )}
    >
      {isInView && (
        <img
          src={hasError ? fallbackSrc : src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={clsx(
            'w-full h-full transition-opacity duration-300',
            `object-${objectFit}`,
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          loading="lazy"
          decoding="async"
          {...props}
        />
      )}
      {!isLoaded && !hasError && (
        <div className="w-full h-full shimmer" aria-hidden="true" />
      )}
    </div>
  );
}
