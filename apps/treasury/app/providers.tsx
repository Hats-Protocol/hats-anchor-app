'use client';

import '../public/style.css';
import '@fontsource-variable/inter';
import 'react-datepicker/dist/react-datepicker.css';

import { ChakraBaseProvider } from '@chakra-ui/react';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Analytics } from '@vercel/analytics/react';
import { OverlayContextProvider } from 'contexts';
import posthog from 'posthog-js';
import { ReactNode } from 'react';
import { theme } from 'ui';
import { wagmiConfig } from 'utils';
import { WagmiProvider } from 'wagmi';

// TODO use standalone & fix exporting of waitForTransaction
declare global {
  interface BigInt {
    toJSON: () => string;
  }
}

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
if (!POSTHOG_KEY) {
  throw new Error('POSTHOG_KEY is required');
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

const Providers = ({ children }: ProvidersProps) => (
  <ChakraBaseProvider theme={theme}>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ReactQueryDevtools initialIsOpen={false} />
          <Analytics />
          <OverlayContextProvider>{children}</OverlayContextProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </ChakraBaseProvider>
);

interface ProvidersProps {
  children: ReactNode;
}

export default Providers;
