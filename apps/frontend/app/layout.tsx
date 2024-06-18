import './global.css';
import '@rainbow-me/rainbowkit/styles.css';

import { ReactNode } from 'react';
import { CommandPalette, Navbar, TxHistoryModal } from 'ui';

import Providers from './providers';

const RootLayout = ({ children }: RootLayoutProps) => (
  <html lang='en'>
    <head />
    <body>
      <div className='relative'>
        <Providers>
          <Navbar />

          <div className='w-screen'>{children}</div>

          <TxHistoryModal />

          <CommandPalette />
        </Providers>

        <div className='fixed h-full w-full z-[-5] bg-[url("/bg-topography.svg")] top-0 left-0' />
      </div>
    </body>
  </html>
);

export default RootLayout;

interface RootLayoutProps {
  children: ReactNode;
}
