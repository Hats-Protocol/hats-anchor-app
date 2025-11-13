'use client';

import '../public/style.css';
import './global.css';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import 'react-datepicker/dist/react-datepicker.css';
import '@uiw/react-md-editor/markdown-editor.css';

import { chainsList } from '@hatsprotocol/config';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { OverlayContextProvider } from 'contexts';
import { values } from 'lodash';
import { Toaster } from 'molecules';
import { ReactNode } from 'react';
import { privyConfig } from 'utils';

// TODO use standalone & fix exporting of waitForTransaction
declare global {
  interface BigInt {
    toJSON: () => string;
  }

  interface Window {
    Intercom: (action: string, options: object) => void;
  }
}

// const INTERCOM_APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;
// if (!INTERCOM_APP_ID) {
//   throw new Error('INTERCOM_APP_ID is required');
// }

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 60 * 1000,
      staleTime: 30 * 60 * 1000,
    },
  },
});

BigInt.prototype['toJSON'] = function () {
  return this.toString();
};

const Providers = ({ children }: ProvidersProps) => {
  // useEffect(() => {
  //   if (INTERCOM_APP_ID && typeof window.Intercom !== 'undefined') {
  //     window.Intercom('boot', { app_id: INTERCOM_APP_ID });
  //   }
  // }, []);

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
      config={{
        loginMethods: ['wallet'],
        supportedChains: values(chainsList),
        // appearance: {
        //   theme: 'light',
        //   accentColor: '#676FFF',
        //   logo: 'https://ipfs.io/ipfs/bafkreiflezpk3kjz6zsv23pbvowtatnd5hmqfkdro33x5mh2azlhne3ah4',
        // },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={privyConfig()}>
          <ReactQueryDevtools initialIsOpen={false} position='left' />
          <OverlayContextProvider>
            {children}

            <Toaster />
          </OverlayContextProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
};

interface ProvidersProps {
  children: ReactNode;
}

export default Providers;
