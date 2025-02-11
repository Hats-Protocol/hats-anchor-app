'use client';

import { useEffect, useState } from 'react';

import { cn } from '../lib/utils';
import { Skeleton } from '../skeleton';

interface LazyImageProps {
  alt: string;
  src: string | undefined;
  // style props
  imageClassName?: string;
  containerClassName?: string;
  skeletonClassName?: string;
}

export const LazyImage = ({
  src,
  alt,
  // style props
  imageClassName,
  containerClassName,
  skeletonClassName,
}: LazyImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    if (!src || imageLoaded) return;
    if (src === '/icon.jpeg' || src === '') {
      setUseFallback(true);
      setImageLoaded(true);
      return;
    }

    const img = new Image();
    img.src = src;

    img.onerror = () => {
      setUseFallback(true);
      setImageLoaded(true);
    };
    img.onload = () => {
      setTimeout(() => {
        setImageLoaded(true);
        setUseFallback(false);
      }, 500);
    };
  }, [src, imageLoaded]);

  if (!imageLoaded && !useFallback) {
    return <Skeleton className={cn('h-full min-h-full w-full', skeletonClassName)} />;
  }

  return (
    <div
      className={cn(
        'relative min-h-10 min-w-10 overflow-hidden border border-slate-200 bg-white object-contain shadow-sm',
        containerClassName,
      )}
    >
      <div
        className={cn('absolute -left-1 -top-1 h-[110%] w-[110%] bg-cover bg-center', imageClassName)}
        style={{ backgroundImage: `url(${useFallback ? '/icon.jpeg' : src})` }}
      />
    </div>
  );
};
