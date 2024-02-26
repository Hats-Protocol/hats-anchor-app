/* eslint-disable import/prefer-default-export */
import _ from 'lodash';

import { chainsMap } from '../web3';

export const jokeRaceUrl = ({
  chainId,
  address,
}: {
  chainId: number;
  address: string;
}) => {
  const chain = chainsMap(chainId);
  if (!chain || !address) return '';
  return `https://jokerace.xyz/contest/${_.toLower(chain.name)}/${address}`;
};
