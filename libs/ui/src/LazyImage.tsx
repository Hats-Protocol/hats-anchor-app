'use client';

/* eslint-disable react/jsx-props-no-spreading */
import { Image as ChakraImage, ImageProps, Skeleton } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

interface LazyImageProps extends ImageProps {
  alt: string;
  src: string | undefined;
  boxSize?: string;
}

const LazyImage = ({ alt, src, boxSize, ...props }: LazyImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    if (!src) return;
    img.src = src;
    img.onload = () => setImageLoaded(true);
  }, [src]);

  if (!src) return null;

  return (
    <Skeleton boxSize={boxSize} minW='72px' isLoaded={imageLoaded}>
      <ChakraImage
        src={src || '/icon.jpeg'}
        boxSize={boxSize}
        alt={alt}
        onLoad={() => setImageLoaded(true)}
        {...props}
      />
    </Skeleton>
  );
};

export default LazyImage;
