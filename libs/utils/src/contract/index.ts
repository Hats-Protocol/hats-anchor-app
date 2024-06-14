import _ from 'lodash';
import { ContractData, HatWearer, SupportedChains, Transaction } from 'types';
import { Hex, zeroAddress } from 'viem';

import { viemPublicClient } from '../web3';

export * from './ecosystem';

export const checkAddressIsContract = async (
  address?: Hex,
  chainId?: number,
) => {
  if (!address || address === zeroAddress || !chainId) {
    return Promise.resolve(false);
  }

  const publicClient = viemPublicClient(chainId);
  if (!publicClient) return Promise.resolve(false);

  return publicClient
    .getBytecode({
      address,
    })
    .then((bytecode: string | undefined) => {
      if (bytecode) {
        return Promise.resolve(true);
      }
      return Promise.resolve(false);
    })
    .catch(() => {
      // throw away error here
      return Promise.resolve(false);
    });
};

export const checkTransactionStatus = async (transactions: Transaction[]) => {
  // don't recheck transactions that are already confirmed
  const pendingTransactions = _.filter(transactions, {
    status: 'pending',
  });
  // handle the client with tx so chain is relative to tx
  const transactionPromises = pendingTransactions.map(
    async (tx: Transaction) => {
      if (!tx.hash || !tx.txChainId) return null;
      const publicClient = viemPublicClient(tx.txChainId);
      try {
        const transactionData = await publicClient.getTransaction({
          hash: tx.hash as Hex,
        });
        if (transactionData && transactionData.blockHash) {
          return transactionData;
        }
        return null;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching transaction data:', error);
        return null;
      }
    },
  );

  const results = await Promise.all(transactionPromises);

  return results;
};

export const extendWearers = (
  wearers: HatWearer[] | undefined,
  wearersInfo: HatWearer[] | undefined,
): HatWearer[] =>
  _.compact(
    _.map(wearers, (wearer: HatWearer) => {
      const wearerInfo = _.find(wearersInfo, { id: _.toLower(wearer.id) });
      return wearerInfo || wearer;
    }) as HatWearer[],
  );

export const extendControllers = (
  controller: Hex | undefined,
  controllersInfo: HatWearer[] | undefined,
) => {
  const controllerInfo = _.find(controllersInfo, { id: _.toLower(controller) });

  return controllerInfo as HatWearer;
};

export const fetchContractData = async (
  chainId: SupportedChains | undefined,
  address: Hex | undefined,
) => {
  try {
    const result = await fetch('/api/contract-name', {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chainId,
        address,
      }),
    });

    const data = await result.json();
    return data as ContractData;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
    return undefined;
  }
};
