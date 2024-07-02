'use client';

import { ChakraBaseProvider } from '@chakra-ui/react';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { OverlayContextProvider } from 'contexts';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { ReactNode, useEffect, useState } from 'react';
import { theme } from 'ui';
import { wagmiConfig } from 'utils';
import { WagmiProvider } from 'wagmi';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
if (!POSTHOG_KEY) {
  throw new Error('POSTHOG_KEY is required');
}
const INTERCOM_APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;
if (!INTERCOM_APP_ID) {
  throw new Error('INTERCOM_APP_ID is required');
}

declare global {
  interface Window {
    Intercom: (action: string, options: object) => void;
  }
}

// Check that PostHog is client-side (used to handle Next.js SSR)
if (typeof window !== 'undefined') {
  posthog.init(POSTHOG_KEY, {
    api_host: `/ingest` || 'https://app.posthog.com',
    // Enable debug mode in development
    loaded: (p: { debug: () => void }) => {
      if (process.env.NODE_ENV === 'development') p.debug();
    },
    ui_host: 'https://app.posthog.com',
  });
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

const Providers = ({ children }: Props) => {
  const [queryClient] = useState(() => new QueryClient(queryClientOptions));
  useEffect(() => {
    if (INTERCOM_APP_ID) {
      window.Intercom('boot', { app_id: INTERCOM_APP_ID });
    }
  }, []);

  return (
    <ChakraBaseProvider theme={theme}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <ReactQueryDevtools initialIsOpen={false} />
            <PostHogProvider client={posthog}>
              <OverlayContextProvider>{children}</OverlayContextProvider>
            </PostHogProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ChakraBaseProvider>
  );
};

interface Props {
  children: ReactNode;
}

export default Providers;
