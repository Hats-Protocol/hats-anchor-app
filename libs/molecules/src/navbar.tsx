import Link from 'next/link';

import { CommandPaletteButton } from './cmdk-button';
import { ConnectWallet } from './connect-wallet';
import { NavLinks } from './nav-links';
import { ReturnToTreeList } from './return-to-tree-list';

const Navbar = () => (
  <div className='border-b-1 fixed z-[20] flex h-[58px] w-full justify-between border-gray-500 bg-white px-4 shadow-md md:h-[75px] md:px-6'>
    <div className='flex gap-2 py-1 md:gap-6'>
      <Link href='/' className='w-[50px] md:w-[67px]'>
        <img src='/icon.jpeg' className='h-full' alt='Hats Logo' />
      </Link>

      <div className='hidden items-center gap-5 md:flex'>
        <NavLinks />
      </div>

      <div className='mt-1 md:hidden'>
        <ReturnToTreeList />
      </div>
    </div>

    <div className='flex items-center gap-2'>
      <div className='hidden md:block'>
        <CommandPaletteButton />
      </div>

      <ConnectWallet />
    </div>
  </div>
);

export { Navbar };
