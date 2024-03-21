import { ERC721_ABI, ERC1155_ABI } from '@hatsprotocol/constants';
import _ from 'lodash';
import { ModuleDetails } from 'types';
import { Abi, Hex } from 'viem';
import { readContract, readContracts } from 'wagmi/actions';

const defaultTokenId = BigInt(0);

export const fetchErc1155Details = async ({
  address,
  tokenId,
  chainId,
}: {
  moduleDetails?: ModuleDetails;
  address: Hex;
  tokenId: Hex | bigint | undefined;
  chainId: number | undefined;
}): Promise<object | undefined> => {
  if (!address || !chainId || !tokenId) return Promise.resolve(undefined);
  return readContract({
    address,
    chainId,
    abi: ERC1155_ABI,
    functionName: 'uri',
    args: [tokenId],
  }).then(async (uri: unknown) => {
    const localUri = uri as string;
    return fetch(localUri)
      .then((data) => Promise.resolve(data.json()))
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Error fetching ERC1155 details', error);
        return Promise.resolve(undefined);
      });
  });
};

export const fetch1155BalanceWithId = async ({
  address,
  token,
  tokenId,
  chainId,
}: {
  address: Hex;
  token: Hex;
  tokenId: Hex | bigint | undefined;
  chainId: number | undefined;
}): Promise<bigint | undefined> => {
  if (!address || !token || !chainId || !tokenId)
    return Promise.resolve(undefined);
  return readContract({
    address: token,
    chainId,
    abi: ERC1155_ABI,
    functionName: 'balanceOf',
    args: [address, tokenId],
  })
    .then((balance: unknown) => {
      return Promise.resolve(balance as bigint);
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Error fetching ERC1155 balance', error);
      return Promise.resolve(undefined);
    });
};

export type Fetch721MetadataResult = {
  name: string;
  symbol: string;
  totalSupply: bigint;
  tokenUri: string;
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
  const data = await readContracts({
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

  return readContract({
    address: token,
    chainId,
    abi: ERC721_ABI,
    functionName: 'balanceOf',
    args: [address],
  }) as Promise<bigint | undefined>;
};
