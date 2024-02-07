/* eslint-disable react/jsx-props-no-spreading */
import '../public/style.css';
import 'react-datepicker/dist/react-datepicker.css';

import { ChakraBaseProvider } from '@chakra-ui/react';
import { SEO } from '@hatsprotocol/constants';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Analytics } from '@vercel/analytics/react';
import { chains, wagmiConfig } from 'app-utils';
import { StandaloneOverlayContextProvider as OverlayContextProvider } from 'contexts';
import type { AppProps } from 'next/app';
import { DefaultSeo } from 'next-seo';
import { theme } from 'ui';
import { WagmiConfig } from 'wagmi';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 60 * 1000,
      staleTime: 30 * 60 * 1000,
    },
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MyApp = ({ Component, pageProps }: AppProps) => (
  <>
    <DefaultSeo {...SEO} />

    <ChakraBaseProvider theme={theme}>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains}>
          <QueryClientProvider client={queryClient}>
            <ReactQueryDevtools initialIsOpen={false} />
            <Analytics />
            <OverlayContextProvider>
              <Component {...pageProps} />
            </OverlayContextProvider>
          </QueryClientProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </ChakraBaseProvider>
  </>
);

export default MyApp;
