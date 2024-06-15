import './global.css';
import '@rainbow-me/rainbowkit/styles.css';

import { ReactNode } from 'react';
import { AppHat } from 'types';
import { Navbar } from 'ui';

import Providers from './providers';
import TxHistoryModal from './TxHistoryModal';

const RootLayout = ({
  editMode,
  hatData,
  hideBackLink,
  children,
}: RootLayoutProps) => {
  return (
    <html lang='en'>
      <head />
      <body>
        <div className='relative'>
          <div
            className='fixed h-full w-full -z-1 bg-[url("/bg-topography.svg")]'
            // bgColor={editMode ? 'cyan.100' : 'gray.100'}
          />

          {/* <CommandPalette /> */}
          {/* {isMobile ? (
          <StandaloneNavbar hatData={hatData} showLink={!hideBackLink} />
        ) : ( */}
          <Providers>
            <Navbar tabName='test' chainId={10} />

            <div className='h-screen w-screen'>{children}</div>
            <TxHistoryModal />
          </Providers>
        </div>
      </body>
    </html>
  );
};

export default RootLayout;

interface RootLayoutProps {
  editMode?: boolean;
  hatData?: AppHat;
  hideBackLink?: boolean;
  children: ReactNode;
}
