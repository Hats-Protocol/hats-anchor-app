import { cn } from './lib/utils';

// TODO handle other sizes
const Spinner = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        'inline-block size-10 animate-spin rounded-full border-[3px] border-current border-t-transparent text-gray-800 dark:text-white',
        className,
      )}
      role='status'
      aria-label='loading'
    >
      <span className='sr-only'>Loading...</span>
    </div>
  );
};

export { Spinner };
