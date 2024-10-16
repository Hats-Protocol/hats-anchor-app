import { ERC721_ABI } from '@hatsprotocol/constants';
import _ from 'lodash';
import { Abi, Hex } from 'viem';

import { viemPublicClient } from '../web3';

const defaultTokenId = BigInt(0);

export type Fetch721MetadataResult = {
  name: string | undefined;
  symbol: string | undefined;
  totalSupply: bigint | undefined;
  tokenUri: string | undefined;
};

export const fetch721Metadata = async ({
  address,
  chainId,
}: {
  address: Hex | undefined;
  chainId: number | undefined;
}): Promise<Fetch721MetadataResult | undefined> => {
  if (!address || !chainId) return Promise.resolve(undefined);
  const contractData = { address, chainId, abi: ERC721_ABI as Abi };
  const contracts = [
    { ...contractData, functionName: 'name' },
    { ...contractData, functionName: 'symbol' },
    { ...contractData, functionName: 'totalSupply' },
    {
      ...contractData,
      functionName: 'tokenURI',
      args: [defaultTokenId],
    },
  ];
  const data = await viemPublicClient(chainId).multicall({
    contracts,
  });

  // TODO could fetch the data from tokenURI and image from there
  return {
    name: _.get(_.first(data), 'result') as string,
    symbol: _.get(_.nth(data, 1), 'result') as string,
    totalSupply: _.get(_.nth(data, 2), 'result') as bigint,
    tokenUri: _.get(_.nth(data, 3), 'result') as string,
  };
};

export const fetch721Balance = ({
  token,
  chainId,
  address,
}: {
  token: Hex | undefined;
  chainId: number | undefined;
  address: Hex;
}) => {
  if (!token || !chainId || !address) return Promise.resolve(undefined);

  return viemPublicClient(chainId).readContract({
    address: token,
    abi: ERC721_ABI,
    functionName: 'balanceOf',
    args: [address],
  }) as Promise<bigint | undefined>;
};
