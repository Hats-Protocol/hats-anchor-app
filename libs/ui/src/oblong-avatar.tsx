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
const OblongAvatar = ({ src, className }: OblongAvatarProps) => {
  if (!src) return null;
  return (
    <Avatar className={cn('h-36 w-24 rounded-md', className)}>
      <AvatarImage src={src} className='object-cover' />
    </Avatar>
  );
};

interface OblongAvatarProps {
  src: string;
  className?: string;
}

export { OblongAvatar };
