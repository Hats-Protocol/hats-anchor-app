import { chainsList } from '@hatsprotocol/constants';
import _ from 'lodash';
import { SupportedChains } from 'types';
import { Chain } from 'viem';

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
