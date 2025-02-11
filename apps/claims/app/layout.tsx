import { MetadataConfig } from '@hatsprotocol/config';
import { TxHistoryModal } from 'molecules';
import { Toaster } from 'molecules';
import { Metadata } from 'next';
import Script from 'next/script';
import { StandaloneNavbar as Navbar } from 'organisms';
import { ReactNode } from 'react';

import Providers from './providers';

const INTERCOM_APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:${process.env.PORT || 3000}`;

export const metadata: Metadata = {
  ...MetadataConfig,
  metadataBase: new URL(baseUrl),
};

const RootLayout = ({ children }: RootLayoutProps) => (
  <html lang='en'>
    <head>
      <Script id='intercom' src={`https://widget.intercom.io/widget/${INTERCOM_APP_ID}`} />
      <meta name='viewport' content='width=device-width, initial-scale=1' />
    </head>

    <body className='font-light'>
      <div className='relative'>
        <Providers>
          <Navbar />

          <div className='w-screen'>{children}</div>

          <TxHistoryModal />

          <Toaster />
        </Providers>

        <div className='bg-functional-link-primary/10 fixed left-0 top-0 z-[-5] size-full' />
      </div>
    </body>
  </html>
);

export default RootLayout;

interface RootLayoutProps {
  children: ReactNode;
}
