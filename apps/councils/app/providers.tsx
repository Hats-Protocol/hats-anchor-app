'use client';

import '../public/style.css';
import '@fontsource-variable/inter';
import 'react-datepicker/dist/react-datepicker.css';

import { ChakraBaseProvider } from '@chakra-ui/react';
import { PrivyProvider } from '@privy-io/react-auth';
import { createConfig, WagmiProvider } from '@privy-io/wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Analytics } from '@vercel/analytics/react';
import { OverlayContextProvider } from 'contexts';
import posthog from 'posthog-js';
import { ReactNode } from 'react';
import { theme } from 'ui';
import {
  arbitrum,
  base,
  celo,
  gnosis,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'viem/chains';
import { http } from 'wagmi';

// TODO use standalone & fix exporting of waitForTransaction
declare global {
  interface BigInt {
    toJSON: () => string;
  }
}

// const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
// if (!POSTHOG_KEY) {
//   throw new Error('POSTHOG_KEY is required');
// }
//
// // Check that PostHog is client-side (used to handle Next.js SSR)
// if (typeof window !== 'undefined') {
//   posthog.init(POSTHOG_KEY, {
//     api_host: `/ingest` || 'https://app.posthog.com',
//     // Enable debug mode in development
//     loaded: (p: { debug: () => void }) => {
//       if (process.env.NODE_ENV === 'development') p.debug();
//     },
//     ui_host: 'https://app.posthog.com',
//   });
// }

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 60 * 1000,
      staleTime: 30 * 60 * 1000,
    },
  },
});

const wagmiConfig = createConfig({
  chains: [mainnet, optimism, arbitrum, base, gnosis, polygon, celo, sepolia],
  transports: {
    [mainnet.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [gnosis.id]: http(),
    [polygon.id]: http(),
    [celo.id]: http(),
    [sepolia.id]: http(),
  },
});

BigInt.prototype['toJSON'] = function () {
  return this.toString();
};

const Providers = ({ children }: ProvidersProps) => (
  <PrivyProvider
    appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
    config={{
      loginMethods: ['email', 'wallet', 'google', 'apple'],
      supportedChains: [
        mainnet,
        optimism,
        arbitrum,
        base,
        gnosis,
        polygon,
        celo,
        sepolia,
      ],
      appearance: {
        theme: 'light',
        accentColor: '#676FFF',
        logo: 'https://ipfs.io/ipfs/bafkreiflezpk3kjz6zsv23pbvowtatnd5hmqfkdro33x5mh2azlhne3ah4',
      },
    }}
  >
    <ChakraBaseProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <ReactQueryDevtools initialIsOpen={false} />
          <Analytics />
          <OverlayContextProvider>{children}</OverlayContextProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </ChakraBaseProvider>
  </PrivyProvider>
);

interface ProvidersProps {
  children: ReactNode;
}

export default Providers;
