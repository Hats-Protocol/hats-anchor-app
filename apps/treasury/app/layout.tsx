import './global.css';
import '@rainbow-me/rainbowkit/styles.css';

import { MetadataConfig } from '@hatsprotocol/constants';
import { StandaloneNavbar as Navbar } from 'molecules';
import { Metadata } from 'next';
// import Script from 'next/script';
import { ReactNode } from 'react';

import Providers from './providers';

// const INTERCOM_APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;

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
      {/* <Script id='intercom'>
        {`// Set your APP_ID
        var APP_ID = "${INTERCOM_APP_ID}";(function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/' + APP_ID;var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s, x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})()`}
      </Script> */}
    </head>

    <body>
      <div className='relative'>
        <Providers>
          <Navbar heading='Budgets' />

          <div className='w-screen'>{children}</div>
        </Providers>

        {/* <div className='fixed left-0 top-0 z-[-5] size-full bg-[url("/bg-topography.svg")]' /> */}
      </div>
    </body>
  </html>
);

export default RootLayout;

interface RootLayoutProps {
  children: ReactNode;
}
