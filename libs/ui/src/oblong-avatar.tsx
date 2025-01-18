'use client';

import { Avatar, AvatarImage } from './avatar';
import { cn } from './lib/utils';

/**
 * OblongAvatar is an Avatar that is taller than it is wide.
 *
 * @param src - The image URL to display
 * @param height - The height of the image
 * @returns The OblongAvatar component
 */
const OblongAvatar = ({ src, height = 96 }: OblongAvatarProps) => {
  if (!src) return null;
  return (
    <Avatar className={cn(height ? `h-[${height}px] w-[${height * 0.75}px]` : 'h-24 w-36', height < 20 ? 'sm' : 'md')}>
      <AvatarImage src={src} />
    </Avatar>
  );
};

interface OblongAvatarProps {
  src: string;
  height?: number;
}

export { OblongAvatar };
