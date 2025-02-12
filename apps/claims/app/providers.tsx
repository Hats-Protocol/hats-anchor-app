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
import posthog from 'posthog-js';
import { ReactNode, useEffect } from 'react';
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

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
if (!POSTHOG_KEY) {
  throw new Error('POSTHOG_KEY is required');
}

const INTERCOM_APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;
if (!INTERCOM_APP_ID) {
  throw new Error('INTERCOM_APP_ID is required');
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

BigInt.prototype['toJSON'] = function () {
  return this.toString();
};

const Providers = ({ children }: ProvidersProps) => {
  useEffect(() => {
    // if (INTERCOM_APP_ID && typeof window.Intercom !== 'undefined') {
    //   window.Intercom('boot', { app_id: INTERCOM_APP_ID });
    // }
  }, []);

  return (
    <WagmiProvider config={wagmiConfig()}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ReactQueryDevtools initialIsOpen={false} />
          <OverlayContextProvider>{children}</OverlayContextProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

interface ProvidersProps {
  children: ReactNode;
}

export default Providers;
