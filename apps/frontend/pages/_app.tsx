/* eslint-disable react/jsx-props-no-spreading */
import '../public/styles/style.css';
import '../public/styles/OrgChart.css';
import 'react-datepicker/dist/react-datepicker.css';

import { ChakraBaseProvider } from '@chakra-ui/react';
import { SEO } from '@hatsprotocol/constants';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Analytics } from '@vercel/analytics/react';
import { OverlayContextProvider } from 'contexts';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { DefaultSeo } from 'next-seo';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect } from 'react';
import { ErrorBoundary, theme } from 'ui';
import { chains, wagmiConfig } from 'utils';
import { WagmiConfig } from 'wagmi';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const INTERCOM_APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;

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

  if (INTERCOM_APP_ID) {
    window.Intercom('boot', {
      app_id: INTERCOM_APP_ID,
      // user_id: hatData?.user?.id,
    });
  }
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

const MyApp = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();

  useEffect(() => {
    // Track page views
    const handleRouteChange = () => posthog?.capture('$pageview');
    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <DefaultSeo {...SEO} />

      <ChakraBaseProvider theme={theme}>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains}>
            <QueryClientProvider client={queryClient}>
              <ReactQueryDevtools initialIsOpen={false} />
              <PostHogProvider client={posthog}>
                <Analytics />
                <OverlayContextProvider>
                  <ErrorBoundary>
                    <Component {...pageProps} />
                  </ErrorBoundary>
                </OverlayContextProvider>
              </PostHogProvider>
            </QueryClientProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </ChakraBaseProvider>
    </>
  );
};

export default MyApp;
