/* eslint-disable import/prefer-default-export */
import _ from 'lodash';

import { chainsMap } from '../web3';

export const jokeRaceUrl = ({
  chainId,
  address,
}: {
  chainId: number | undefined;
  address: string;
}) => {
  if (!chainId || !address) return '';
  const chain = chainsMap(chainId);
  if (!chain) return '';
  return `https://jokerace.xyz/contest/${_.toLower(chain.name)}/${_.toLower(
    address,
  )}`;
};
