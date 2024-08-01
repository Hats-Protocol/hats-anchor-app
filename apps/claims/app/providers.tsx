'use client';

import '../public/style.css';
import '@fontsource-variable/inter';
import 'react-datepicker/dist/react-datepicker.css';

import { ChakraBaseProvider } from '@chakra-ui/react';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Analytics } from '@vercel/analytics/react';
//  use standalone & fix exporting of waitForTransaction
import { OverlayContextProvider } from 'contexts';
import { ReactNode } from 'react';
import { theme } from 'ui';
import { wagmiConfig } from 'utils';
import { WagmiProvider } from 'wagmi';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 60 * 1000,
      staleTime: 30 * 60 * 1000,
    },
  },
});

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
