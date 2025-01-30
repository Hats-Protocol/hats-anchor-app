import { cn } from '../lib/utils';

export interface HatDecoProps {
  /** Height of the decoration container */
  height?: string | number;
  /** Whether to hide the decoration on desktop */
  hideOnDesktop?: boolean;
}

// TODO height not getting picked up
const HatDeco = ({ height, hideOnDesktop }: HatDecoProps) => (
  <div
    className={cn(
      'flex items-center justify-center',
      height ? `min-h-[${height}]` : 'min-h-[150px]',
      hideOnDesktop && 'hidden md:flex',
    )}
  >
    <p className='md:text-md text-sm'>
      <span aria-label='Ball cap' role='img'>
        🧢
      </span>
      <span aria-label='Top hat' role='img'>
        🎩
      </span>
      <span aria-label='Hat with bow' role='img'>
        👒
      </span>
    </p>
  </div>
);

export { HatDeco };
