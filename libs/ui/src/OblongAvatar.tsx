'use client';

import { Avatar } from '@chakra-ui/react';

/**
 * OblongAvatar is an Avatar that is taller than it is wide.
 *
 * @param src - The image URL to display
 * @param height - The height of the image
 * @returns The OblongAvatar component
 */
const OblongAvatar = ({ src, height = 96 }: OblongAvatarProps) => {
  if (!src) return null;
  return <Avatar src={src} h={`${height}px`} w={`${height * 0.75}px`} borderRadius={height < 20 ? 'sm' : 'md'} />;
};

interface OblongAvatarProps {
  src: string;
  height?: number;
}

export default OblongAvatar;
