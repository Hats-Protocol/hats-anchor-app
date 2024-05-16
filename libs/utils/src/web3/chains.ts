import { chainsList, orderedChains } from '@hatsprotocol/constants';
import _ from 'lodash';
import { SupportedChains } from 'types';
import { Chain, configureChains } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

const ALCHEMY_ID = process.env.NEXT_PUBLIC_ALCHEMY_ID;

export const chainsMap = (chainId?: number) =>
  chainId
    ? chainsList[chainId as SupportedChains]
    : (_.first(_.values(chainsList)) as Chain);

export const explorerUrl = (chainId?: number) =>
  chainId &&
  _.get(
    chainsMap(chainId),
    'blockExplorers.etherscan.url',
    _.get(chainsMap(chainId), 'blockExplorers.default.url'),
  );

const configuredChains = configureChains(
  _.map(orderedChains, (c: SupportedChains) => chainsMap(c)),
  [alchemyProvider({ apiKey: ALCHEMY_ID || '' }), publicProvider()],
);

const { chains, publicClient } = configuredChains;

export { chains, publicClient };
