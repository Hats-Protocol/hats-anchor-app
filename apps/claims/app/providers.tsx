'use client';

import '../public/style.css';
import './global.css';
import '@rainbow-me/rainbowkit/styles.css';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import 'react-datepicker/dist/react-datepicker.css';

import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { OverlayContextProvider } from 'contexts';
import { Toaster } from 'molecules';
import { ReactNode } from 'react';
import { wagmiConfig } from 'utils';
import { WagmiProvider } from 'wagmi';

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
    <WagmiProvider config={wagmiConfig()}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ReactQueryDevtools initialIsOpen={false} />
          <OverlayContextProvider>
            {children}

            <Toaster />
          </OverlayContextProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

interface ProvidersProps {
  children: ReactNode;
}

export default Providers;
