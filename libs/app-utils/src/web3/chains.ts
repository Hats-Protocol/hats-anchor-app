import { chainsList } from 'app-constants';
import { SupportedChains } from 'hats-types';
import _ from 'lodash';
import { configureChains } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

const ALCHEMY_ID = process.env.NEXT_PUBLIC_ALCHEMY_ID;

export const chainsMap = (chainId?: number) =>
  chainId ? chainsList[chainId as SupportedChains] : chainsList[5];

export const explorerUrl = (chainId?: number) =>
  chainId &&
  _.get(
    chainsMap(chainId),
    'blockExplorers.etherscan.url',
    _.get(chainsMap(chainId), 'blockExplorers.default.url'),
  );

const configuredChains: any = configureChains(_.values(chainsList), [
  alchemyProvider({ apiKey: ALCHEMY_ID || '' }),
  publicProvider(),
]);

const { chains, publicClient } = configuredChains;

export { chains, publicClient };
