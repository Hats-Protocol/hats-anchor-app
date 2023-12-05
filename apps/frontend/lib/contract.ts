import { ZERO_ADDRESS } from 'app-utils';
import { HatWearer, Transaction } from 'hats-types';
import _ from 'lodash';
import { createPublicClient, custom, Hex, http } from 'viem';

import { chainsMap } from './chains';

// app-utils

export const checkAddressIsContract = async (
  address?: Hex,
  chainId?: number,
) => {
  if (!address || address === ZERO_ADDRESS || !chainId) {
    return false;
  }

  const publicClient = createPublicClient({
    chain: chainsMap(chainId),
    // ideally could use window.ethereum here, but result is cached also
    //    custom((window as any).ethereum) ||
    transport: http(),
  });

  if (!publicClient) return false;

  try {
    const bytecode = await publicClient.getBytecode({
      address,
    });

    if (bytecode) {
      return true;
    }
  } catch (err) {
    return false;
  }
  return false;
};

export const checkTransactionStatus = async (transactions: Transaction[]) => {
  // don't recheck transactions that are already confirmed
  const pendingTransactions = _.filter(transactions, {
    status: 'pending',
  });
  // handle the client with tx so chain is relative to tx
  const transactionPromises = pendingTransactions.map(async (tx: any) => {
    const publicClient = createPublicClient({
      chain: chainsMap(tx.txChainId),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transport: custom((window as any).ethereum) || http(),
    });
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
  });

  const results = await Promise.all(transactionPromises);

  return results;
};

export const extendWearers = (
  wearers: HatWearer[],
  wearersInfo: HatWearer[] | undefined,
): HatWearer[] =>
  _.compact(
    _.map(wearers, (wearer: HatWearer) => {
      const wearerInfo = _.find(wearersInfo, { id: _.toLower(wearer.id) });
      return wearerInfo || wearer;
    }),
  );

export const extendControllers = (
  controller: Hex,
  controllersInfo: HatWearer[] | undefined,
) => {
  const controllerInfo = _.find(controllersInfo, { id: _.toLower(controller) });

  return controllerInfo as HatWearer;
};

export const checkENSNames = async (wearers: HatWearer[]) => {
  const publicClient = createPublicClient({
    chain: chainsMap(1),
    transport: http(),
  });

  const ensNamePromises = wearers?.map(async (wearer: HatWearer) => {
    const ensName = await publicClient.getEnsName({
      address: wearer.id,
    });

    return { id: wearer.id, ensName };
  });

  if (ensNamePromises) return {};

  const ensNamesList: { id: string; ensName: string }[] = await Promise.all(
    ensNamePromises,
  );

  const newEnsNames = ensNamesList.reduce(
    (acc: { [key: string]: string }, { id, ensName }) => {
      if (ensName) {
        acc[id] = ensName;
      }
      return acc;
    },
    {},
  );
  return newEnsNames;
};
