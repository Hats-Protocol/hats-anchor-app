import { toLower } from 'lodash';

import { chainsMap } from '../web3';

export const jokeRaceUrl = ({ chainId, address }: { chainId: number | undefined; address: string }) => {
  if (!chainId || !address) return '';
  const chain = chainsMap(chainId);
  if (!chain) return '';
  return `https://jokerace.xyz/contest/${toLower(chain.name)}/${toLower(address)}`;
};
