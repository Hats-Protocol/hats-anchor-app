/* eslint-disable react/jsx-props-no-spreading */
import { ChakraProvider } from '@chakra-ui/react';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DefaultSeo } from 'next-seo';
import { WagmiConfig } from 'wagmi';
import theme from '../theme';
import SEO from '@/constants/next-seo.config';
import { OverlayContextProvider } from '@/contexts/OverlayContext';
import { wagmiConfig, chains } from '@/lib/web3';
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
