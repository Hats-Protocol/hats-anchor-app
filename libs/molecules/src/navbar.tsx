import Link from 'next/link';

import { CommandPaletteButton } from './cmdk-button';
import { ConnectWallet } from './connect-wallet';
import { NavLinks } from './nav-links';
import { ReturnToTreeList } from './return-to-tree-list';

const Navbar = () => (
  <div className='border-b-1 fixed z-[9] flex h-[58px] w-full justify-between border-gray-500 bg-white px-4 shadow-md md:h-[75px] md:px-6'>
    <div className='flex items-center gap-2 md:gap-6'>
      <div className='my-2 w-16'>
        <Link href='/'>
          <img src='/icon.jpeg' className='w-[50px] md:w-[67px]' alt='Hats Logo' />
        </Link>
      </div>

      <div className='hidden items-center gap-5 md:flex'>
        <NavLinks />
      </div>

      <div className='md:hidden'>
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
