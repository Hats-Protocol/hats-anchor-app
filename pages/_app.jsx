/* eslint-disable react/jsx-props-no-spreading */
import { ChakraProvider } from '@chakra-ui/react';
import { WagmiConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { DefaultSeo } from 'next-seo';
import theme from '../theme';
import { wagmiConfig, chains } from '../lib/web3';
import { OverlayContextProvider } from '../contexts/OverlayContext';
import SEO from '../constants/next-seo.config';
import '../public/style.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchInterval: 120_000,
    },
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <>
      <DefaultSeo {...SEO} />

      <ChakraProvider theme={theme}>
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
