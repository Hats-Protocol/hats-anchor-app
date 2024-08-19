import Link from 'next/link';

import CmdkButton from './CmdkButton';
import ConnectWallet from './ConnectWallet';
import NavLinks from './NavLinks';
import ReturnToTreeList from './ReturnToTreeList';

const Navbar = () => (
  <div className='flex w-full justify-between bg-white fixed z-[20] h-[58px] md:h-[75px] px-4 md:px-6 shadow-md border-b-1 border-gray-500'>
    <div className='flex gap-2 md:gap-6 py-1'>
      <Link href='/' className='w-[50px] md:w-[67px]'>
        <img src='/icon.jpeg' className='h-full' alt='Hats Logo' />
      </Link>

      <div className='hidden md:flex gap-5 items-center'>
        <NavLinks />
      </div>

      <div className='mt-1 md:hidden'>
        <ReturnToTreeList />
      </div>
    </div>

    <div className='flex gap-2 items-center'>
      <div className='hidden md:block'>
        <CmdkButton />
      </div>

      <ConnectWallet />
    </div>
  </div>
);

export default Navbar;
