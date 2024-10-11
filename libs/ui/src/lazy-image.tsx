'use client';

import {
  BorderProps,
  Box,
  ImageProps,
  Skeleton,
  SkeletonProps,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

interface LazyImageProps extends ImageProps {
  alt: string;
  src: string | undefined;
  boxSize?: number;
  withBorder?: boolean;
  noMobileRadius?: boolean;
  // pass extra props
  borderProps?: BorderProps;
  skeletonProps?: SkeletonProps;
}

export const LazyImage = ({
  src,
  alt,
  // style props
  withBorder = true,
  borderRadius,
  // size props
  boxSize,
  h,
  height,
  maxH,
  maxHeight,
  minH,
  minHeight,
  w,
  width,
  noMobileRadius = false,
  borderProps,
  skeletonProps,
  ...props
}: LazyImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  let imageSize = undefined;
  if (boxSize) {
    imageSize = `${boxSize + 2}px`;
  }

  useEffect(() => {
    if (!src) return;
    if (src === '/icon.jpeg') {
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
      }, 500);
    };
  }, [src]);

  return (
    <Skeleton
      isLoaded={imageLoaded || useFallback}
      boxSize={boxSize ? `${boxSize}px` : undefined}
      minH={minH || minHeight}
      w={w || width}
      {...skeletonProps}
    >
      <Box
        overflow='hidden'
        objectFit='contain'
        background='white'
        position='relative'
        border={withBorder ? '1px solid' : undefined}
        borderColor={withBorder ? 'blackAlpha.200' : undefined}
        boxSize={imageSize}
        borderRadius={noMobileRadius ? undefined : { base: 'md', md: 'lg' }}
        h={h || height}
        maxW='100%'
        maxH={maxH || maxHeight}
        minH={
          !maxH && !maxHeight && !h && !height && !boxSize
            ? { base: '100vw', md: `${boxSize || 400}px` }
            : undefined
        }
        {...borderProps}
      >
        <Box
          backgroundImage={`url(${useFallback ? '/icon.jpeg' : src})`}
          backgroundSize='cover'
          backgroundPosition='center'
          h='105%'
          w='105%'
          position='absolute'
          top={boxSize && boxSize < 200 ? (boxSize < 100 ? '-2px' : -1) : -2}
          left={boxSize && boxSize < 200 ? (boxSize < 100 ? '-2px' : -1) : -2}
          {...props}
        />
      </Box>
    </Skeleton>
  );
};
