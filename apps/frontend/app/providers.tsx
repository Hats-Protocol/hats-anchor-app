'use client';

/* eslint-disable react/jsx-props-no-spreading */
import { ChakraBaseProvider } from '@chakra-ui/react';
import { chainsList } from '@hatsprotocol/constants';
import {
  Chain,
  connectorsForWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {
  argentWallet,
  braveWallet,
  coinbaseWallet,
  dawnWallet,
  frameWallet,
  injectedWallet,
  ledgerWallet,
  rabbyWallet,
  rainbowWallet,
  safeWallet,
  uniswapWallet,
  walletConnectWallet,
  zerionWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { OverlayContextProvider } from 'contexts';
import _ from 'lodash';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { ReactNode, useState } from 'react';
import { theme } from 'ui';
import { getRpcUrl } from 'utils';
import { Transport } from 'viem';
import { createConfig, http, WagmiProvider } from 'wagmi';

const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID;
if (!WC_PROJECT_ID) {
  throw new Error('NEXT_PUBLIC_WC_PROJECT_ID is not set');
}
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
if (!POSTHOG_KEY) {
  throw new Error('POSTHOG_KEY is required');
}
const INTERCOM_APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;
if (!INTERCOM_APP_ID) {
  throw new Error('INTERCOM_APP_ID is required');
}

declare global {
  interface Window {
    Intercom: (action: string, options: object) => void;
  }
}

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [rainbowWallet, walletConnectWallet],
    },
    {
      groupName: 'All',
      wallets: [
        injectedWallet,
        safeWallet,
        argentWallet,
        braveWallet,
        coinbaseWallet,
        dawnWallet,
        frameWallet,
        ledgerWallet,
        // metaMaskWallet,
        rabbyWallet,
        uniswapWallet,
        zerionWallet,
      ],
    },
  ],
  {
    appName: 'Hats App',
    projectId: WC_PROJECT_ID,
  },
);

const transports = () => {
  const localTransports: { [key: string]: Transport } = {};
  _.each(chainsList, (chain, chainId) => {
    localTransports[chainId as keyof typeof localTransports] = http(
      getRpcUrl(_.toNumber(chainId)),
    );
  });

  return localTransports;
};

export const wagmiConfig = createConfig({
  connectors: _.concat(connectors),
  chains: _.map(
    _.keys(chainsList),
    (c) => chainsList[_.toNumber(c) as keyof typeof chainsList],
  ) as unknown as readonly [Chain, ...Chain[]], // TODO any better way to do this?
  transports: transports(),
  ssr: true,
});

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

  // if (INTERCOM_APP_ID) {
  //   window.Intercom('boot', {
  //     app_id: INTERCOM_APP_ID,
  //     // user_id: hatData?.user?.id,
  //   });
  // }
}

const queryClientOptions = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 60 * 1000,
      staleTime: 30 * 60 * 1000,
    },
  },
};

const Providers = ({ children }: Props) => {
  const [queryClient] = useState(() => new QueryClient(queryClientOptions));
  // useEffect(() => {
  //   // setTimeout(() => {
  //   //   reconnect(wagmiConfig);
  //   // });
  // }, []);

  return (
    <ChakraBaseProvider theme={theme}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <ReactQueryDevtools initialIsOpen={false} />
            <PostHogProvider client={posthog}>
              <OverlayContextProvider>{children}</OverlayContextProvider>
            </PostHogProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ChakraBaseProvider>
  );
};

interface Props {
  children: ReactNode;
}

export default Providers;
