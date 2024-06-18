import Link from 'next/link';
import { Suspense } from 'react';

import { Skeleton } from '../atoms';
import CmdkButton from './CmdkButton';
import ConnectWallet from './ConnectWallet';
import NavLinks from './NavLinks';

const Navbar = () => (
  <div className='flex w-full justify-between bg-white fixed z-[10] h-[75px] px-6 shadow-md border-b-1 border-gray-500'>
    <div className='flex gap-6 py-1'>
      <Link href='/'>
        <img src='/icon.jpeg' className='h-full' alt='Hats Logo' />
      </Link>
      <div className='flex gap-5 items-center'>
        <NavLinks />
      </div>
    </div>

    <div className='flex gap-2 items-center'>
      <CmdkButton />

      <Suspense fallback={<Skeleton className='h-10 w-[250px]' />}>
        <ConnectWallet />
      </Suspense>
    </div>
  </div>
);

export default Navbar;
