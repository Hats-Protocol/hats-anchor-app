'use client';

import '../public/style.css';
import '@fontsource-variable/inter';
import 'react-datepicker/dist/react-datepicker.css';

import { ChakraBaseProvider } from '@chakra-ui/react';
import { councilsChainsList } from '@hatsprotocol/constants';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { OverlayContextProvider } from 'contexts';
import { values } from 'lodash';
import posthog from 'posthog-js';
import { ReactNode, useEffect } from 'react';
import { theme } from 'ui';
import { wagmiConfig } from 'utils';

// TODO use standalone & fix exporting of waitForTransaction
declare global {
  interface BigInt {
    toJSON: () => string;
  }

  interface Window {
    Intercom: (action: string, options: object) => void;
  }
}

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
if (!POSTHOG_KEY) {
  throw new Error('POSTHOG_KEY is required');
}
const INTERCOM_APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;
if (!INTERCOM_APP_ID) {
  throw new Error('INTERCOM_APP_ID is required');
}

// Check that PostHog is client-side (used to handle Next.js SSR)
if (typeof window !== 'undefined') {
  posthog.init(POSTHOG_KEY, {
    api_host: `/ingest` || 'https://app.posthog.com',
    // Enable debug mode in development
    loaded: (p: { debug: () => void }) => {
      // if (process.env.NODE_ENV === 'development') p.debug();
    },
    ui_host: 'https://app.posthog.com',
  });
}

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
  useEffect(() => {
    if (INTERCOM_APP_ID && typeof window.Intercom !== 'undefined') {
      window.Intercom('boot', { app_id: INTERCOM_APP_ID });
    }
  }, []);

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
      config={{
        loginMethods: ['wallet'],
        supportedChains: values(councilsChainsList),
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          logo: 'https://ipfs.io/ipfs/bafkreiflezpk3kjz6zsv23pbvowtatnd5hmqfkdro33x5mh2azlhne3ah4',
        },
      }}
    >
      <ChakraBaseProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={wagmiConfig(values(councilsChainsList))}>
            <ReactQueryDevtools initialIsOpen={false} />
            <OverlayContextProvider>{children}</OverlayContextProvider>
          </WagmiProvider>
        </QueryClientProvider>
      </ChakraBaseProvider>
    </PrivyProvider>
  );
};

interface ProvidersProps {
  children: ReactNode;
}

export default Providers;
