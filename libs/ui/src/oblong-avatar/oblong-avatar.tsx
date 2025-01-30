'use client';

import { Avatar, AvatarImage } from '../avatar';
import { cn } from '../lib/utils';

export interface OblongAvatarProps {
  /** The image URL to display */
  src: string;
  /** Additional CSS classes to apply */
  className?: string;
}

/**
 * OblongAvatar is an Avatar that is taller than it is wide.
 */
const OblongAvatar = ({ src, className }: OblongAvatarProps) => {
  if (!src) return null;
  return (
    <Avatar className={cn('h-36 w-24 rounded-md', className)}>
      <AvatarImage src={src} className='object-cover' />
    </Avatar>
  );
};

export { OblongAvatar };
