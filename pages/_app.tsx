/* eslint-disable react/jsx-props-no-spreading */
import '../public/style.css';

import { ChakraBaseProvider } from '@chakra-ui/react';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Analytics } from '@vercel/analytics/react';
import { DefaultSeo } from 'next-seo';
import { WagmiConfig } from 'wagmi';

import SEO from '@/constants/next-seo.config';
import { OverlayContextProvider } from '@/contexts/OverlayContext';
import { chains, wagmiConfig } from '@/lib/web3';

import theme from '../theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchInterval: 2 * 60 * 1000,
      staleTime: 2 * 60 * 1000,
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

interface AppProps {
  Component: any;
  pageProps: any;
}
