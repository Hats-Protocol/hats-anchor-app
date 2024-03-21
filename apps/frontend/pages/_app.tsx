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
import { DefaultSeo } from 'next-seo';
import { ErrorBoundary, theme } from 'ui';
import { chains, wagmiConfig } from 'utils';
import { WagmiConfig } from 'wagmi';

const INTERCOM_APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;

declare global {
  interface Window {
    Intercom: (action: string, options: object) => void;
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
  if (typeof window !== 'undefined' && INTERCOM_APP_ID) {
    window.Intercom('boot', {
      app_id: INTERCOM_APP_ID,
      // user_id: hatData?.user?.id,
    });
  }

  return (
    <>
      <DefaultSeo {...SEO} />

      <ChakraBaseProvider theme={theme}>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains}>
            <QueryClientProvider client={queryClient}>
              <ReactQueryDevtools initialIsOpen={false} />
              <Analytics />
              <OverlayContextProvider>
                <ErrorBoundary>
                  <Component {...pageProps} />
                </ErrorBoundary>
              </OverlayContextProvider>
            </QueryClientProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </ChakraBaseProvider>
    </>
  );
};

export default MyApp;
