/* eslint-disable react/jsx-props-no-spreading */
import { CSSReset, ChakraProvider } from '@chakra-ui/react';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DefaultSeo } from 'next-seo';
import { WagmiConfig } from 'wagmi';

import SEO from '@/constants/next-seo.config';
import { OverlayContextProvider } from '@/contexts/OverlayContext';
import { wagmiConfig, chains } from '@/lib/web3';

import theme from '../theme';
import '../public/style.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchInterval: 120_000,
    },
  },
});

function MyApp({ Component, pageProps }: { Component: any; pageProps: any }) {
  return (
    <>
      <DefaultSeo {...SEO} />

      <ChakraProvider theme={theme}>
        <CSSReset />
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains}>
            <QueryClientProvider client={queryClient}>
              <OverlayContextProvider>
                <Component {...pageProps} />
              </OverlayContextProvider>
            </QueryClientProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </ChakraProvider>
    </>
  );
}

export default MyApp;
