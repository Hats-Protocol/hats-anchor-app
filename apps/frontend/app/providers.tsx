'use client';

import '../public/styles/style.css';
import './global.css';
import '@rainbow-me/rainbowkit/styles.css';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-cmdk/dist/cmdk.css';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';

import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BetaFeaturesProvider, OverlayContextProvider, TreeFormContextProvider } from 'contexts';
import { Toaster } from 'molecules';
import { ReactNode, useState } from 'react';
import { wagmiConfig } from 'utils';
import { WagmiProvider } from 'wagmi';
import { useAccount } from 'wagmi';

// const INTERCOM_APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;
// if (!INTERCOM_APP_ID) {
//   throw new Error('INTERCOM_APP_ID is required');
// }

declare global {
  interface Window {
    Intercom: (action: string, options: object) => void;
  }

  interface BigInt {
    toJSON: () => string;
  }
}

const queryClientOptions = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 60 * 1000,
      staleTime: 30 * 60 * 1000,
    },
  },
};

BigInt.prototype['toJSON'] = function () {
  return this.toString();
};

const BetaFeaturesWrapper = ({ children }: { children: ReactNode }) => {
  const { address } = useAccount();

  return <BetaFeaturesProvider address={address}>{children}</BetaFeaturesProvider>;
};

const Providers = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient(queryClientOptions));

  return (
    <WagmiProvider config={wagmiConfig()}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ReactQueryDevtools initialIsOpen={false} />
          <OverlayContextProvider>
            <TreeFormContextProvider>
              <BetaFeaturesWrapper>{children}</BetaFeaturesWrapper>
            </TreeFormContextProvider>
            <Toaster />
          </OverlayContextProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Providers;
