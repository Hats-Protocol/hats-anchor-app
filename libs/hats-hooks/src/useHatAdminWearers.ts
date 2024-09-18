'use client';

import { useQuery } from '@tanstack/react-query';
import {
  filter,
  find,
  flatten,
  get,
  isEmpty,
  map,
  reject,
  size,
  uniqBy,
} from 'lodash';
import { useMemo } from 'react';
import { AppHat, HatWearer, SupportedChains } from 'types';
import { batchFetchContractData, extendWearerDetails } from 'utils';

// eslint-disable-next-line no-promise-executor-return
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// TODO move to utils/wearers
const fetchAdminWearers = async (
  wearers: HatWearer[],
  chainId: SupportedChains | undefined,
): Promise<HatWearer[] | undefined> => {
  const extendedWearers = map(wearers, (w: HatWearer) =>
    extendWearerDetails(w.id, chainId),
  );

  // TODO better way to get this from the Hats API
  const extendedWearersPromises = extendedWearers.map(
    async (promise: Promise<unknown>, index: number) => {
      if (index % 2 === 0 && index !== 0) {
        await delay(1000); // Delay 1 second every 2 promises
      }
      return promise;
    },
  );

  if (!chainId) return [];

  return Promise.allSettled(extendedWearersPromises)
    .then(async (results) => {
      const adminWearers = results.map((result) =>
        result.status === 'fulfilled' ? result.value : null,
      ) as HatWearer[];

      const contractWearers = filter(adminWearers, 'isContract');

      return batchFetchContractData(map(contractWearers, 'id'), chainId).then(
        (contractData) => {
          return adminWearers.map((wearer) => {
            const contractWearer = find(contractData, { id: wearer.id });
            if (get(contractWearer, 'error')) return wearer;

            return { ...wearer, ...contractWearer };
          });
        },
      );
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      return [];
    });
};

const useHatAdminWearers = (
  selectedHat: AppHat | undefined,
  treeToDisplay: AppHat[] | undefined,
  chainId: SupportedChains | undefined,
) => {
  const adminHats = useMemo(() => {
    if (!selectedHat?.id || !selectedHat?.prettyId) return [];

    const filteredList = filter(
      treeToDisplay,
      (h: AppHat) => h.prettyId && selectedHat.prettyId?.includes(h.prettyId),
    );
    // exclude current hat
    return reject(filteredList, { id: selectedHat.id });
  }, [treeToDisplay, selectedHat?.prettyId, selectedHat?.id]);
  const adminWearers = useMemo(() => {
    return uniqBy(flatten(map(adminHats, 'wearers')), 'id');
  }, [adminHats]);

  const { data, isLoading, status, error } = useQuery({
    queryKey: ['adminWearers', adminWearers, chainId],
    queryFn: () => fetchAdminWearers(adminWearers, chainId),
    enabled: !isEmpty(adminWearers) && !!chainId,
  });

  const adminCount = useMemo(() => {
    if (!data) return { code: 0, groups: 0, human: 0 };

    const contracts = filter(data, 'isContract');
    const groups = filter(contracts, (w: HatWearer) =>
      w?.contractName?.includes('GnosisSafeProxy'),
    );

    return {
      code: size(contracts) - size(groups) || 0,
      groups: size(groups) || 0,
      human: size(reject(data, 'isContract')) || 0,
    };
  }, [data]);

  return {
    data,
    adminHats,
    adminCount,
    isLoading: status === 'pending' || isLoading,
    error,
  };
};

export default useHatAdminWearers;
