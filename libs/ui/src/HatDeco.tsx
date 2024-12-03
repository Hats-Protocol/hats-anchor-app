import { cn } from './lib/utils';

const HatDeco = ({
  height,
  hideOnDesktop,
}: {
  height?: string | number;
  hideOnDesktop?: boolean;
}) => (
  <div
    className={cn(
      'flex min-h-[150px] items-center justify-center',
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

export default HatDeco;
