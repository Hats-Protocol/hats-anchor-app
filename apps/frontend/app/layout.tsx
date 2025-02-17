import { MetadataConfig } from '@hatsprotocol/config';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import { ReactNode } from 'react';

import Providers from './providers';

const CommandPalette = dynamic(() => import('molecules').then((mod) => mod.CommandPalette), { ssr: false });
const Navbar = dynamic(() => import('molecules').then((mod) => mod.Navbar));
const TxHistoryModal = dynamic(() => import('molecules').then((mod) => mod.TxHistoryModal), { ssr: false });

const INTERCOM_APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;

export const metadata: Metadata = { ...MetadataConfig };

const RootLayout = ({ children }: RootLayoutProps) => (
  <html lang='en'>
    <head>
      <Script id='intercom'>
        {`var APP_ID = "${INTERCOM_APP_ID}";(function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/' + APP_ID;var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s, x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})()`}
      </Script>

      <meta name='viewport' content='width=device-width, initial-scale=1' />
    </head>

    <body className='font-light'>
      <div className='relative'>
        <Providers>
          <Navbar />

          {children}

          <TxHistoryModal />

          <CommandPalette />
        </Providers>
      </div>
    </body>
  </html>
);

export default RootLayout;

interface RootLayoutProps {
  children: ReactNode;
}
