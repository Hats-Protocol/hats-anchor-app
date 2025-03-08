'use client';

import { ConnectWallet } from 'molecules';
import { AppHat } from 'types';
import { cn, Link } from 'ui';

export const StandaloneNavbar = ({ heading, hatData }: StandaloneNavbarProps) => {
  return (
    <div
      className={cn(
        'fixed z-10 flex min-h-14 w-full items-center justify-between px-2',
        hatData ? 'bg-whiteAlpha-900' : 'bg-transparent',
      )}
    >
      <div className='flex items-center gap-2'>
        <Link href='/'>
          <img src='/hats.png' className='h-10 w-10' alt='Hats Logo' />
        </Link>

        {heading && <h1 className='text-2xl font-medium'>{heading}</h1>}
      </div>

      <ConnectWallet hideProfileButton />
    </div>
  );
};

interface StandaloneNavbarProps {
  heading?: string;
  hatData?: AppHat;
}
