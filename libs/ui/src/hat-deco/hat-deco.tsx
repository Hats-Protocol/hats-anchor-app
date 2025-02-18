import { cn } from '../lib/utils';

const HatDeco = ({ height = '150px', hideOnDesktop }: { height?: string | number; hideOnDesktop?: boolean }) => {
  // Convert height to a string if it's a number
  const heightValue = typeof height === 'number' ? `${height}px` : height;
  // Remove 'px' if present and add bracket syntax for Tailwind
  const heightClass = `min-h-[${heightValue.replace('px', '')}px]`;

  return (
    <div
      className={cn(
        'flex min-h-[150px] w-full items-center justify-center',
        heightClass,
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
};

export { HatDeco };
