// import { useQuery } from '@tanstack/react-query';
import { filter, find, flatten, map, reject, size, uniqBy } from 'lodash';
import { useMemo } from 'react';
import { AppHat, HatWearer, SupportedChains } from 'types';

// TODO move to utils/wearers
// const fetchAdminWearers = async (
//   wearers: HatWearer[],
//   orgChartWearers: HatWearer[] | undefined,
//   chainId: SupportedChains | undefined,
// ): Promise<HatWearer[] | undefined> => {
//   const extendedWearers = map(wearers, (w: HatWearer) =>
//     extendWearerDetails(w.id, chainId),
//   );

//   // TODO better way to get this from the Hats API
//   const extendedWearersPromises = extendedWearers.map(
//     async (promise: Promise<unknown>, index: number) => {
//       if (index % 2 === 0 && index !== 0) {
//         await delay(1000); // Delay 1 second every 2 promises
//       }
//       return promise;
//     },
//   );

//   if (!chainId) return [];

//   return Promise.allSettled(extendedWearersPromises)
//     .then(async (results) => {
//       const adminWearers = results.map((result) =>
//         result.status === 'fulfilled' ? result.value : null,
//       ) as HatWearer[];

//       const contractWearers = filter(adminWearers, 'isContract');

//       return batchFetchContractData(map(contractWearers, 'id'), chainId).then(
//         (contractData) => {
//           return adminWearers.map((wearer) => {
//             const contractWearer = find(contractData, { id: wearer.id });
//             if (get(contractWearer, 'error')) return wearer;

//             return { ...wearer, ...contractWearer };
//           });
//         },
//       );
//     })
//     .catch((err) => {
//       logger.error(err);
//       return [];
//     });
// };

const useHatAdminWearers = ({
  selectedHat,
  treeToDisplay,
  orgChartWearers,
  chainId,
}: {
  selectedHat: AppHat | undefined;
  treeToDisplay: AppHat[] | undefined;
  orgChartWearers: HatWearer[] | undefined;
  chainId: SupportedChains | undefined;
}) => {
  const adminHats = useMemo(() => {
    if (!selectedHat?.id || !selectedHat?.prettyId) return [];

    const filteredList = filter(treeToDisplay, (h: AppHat) => h.prettyId && selectedHat.prettyId?.includes(h.prettyId));
    // exclude current hat
    return reject(filteredList, { id: selectedHat.id });
  }, [treeToDisplay, selectedHat?.prettyId, selectedHat?.id]);

  const adminWearers: HatWearer[] = useMemo(() => {
    return uniqBy(flatten(map(adminHats, 'wearers')), 'id');
  }, [adminHats]);

  // TODO handle this case with an additional query
  // const adminsNotInOrgChartWearers: HatWearer[] = useMemo(() => {
  //   return reject(adminWearers, (w: HatWearer) =>
  //     find(orgChartWearers, { id: w.id }),
  //   ) as HatWearer[];
  // }, [adminWearers, orgChartWearers]);

  const data: HatWearer[] = useMemo(() => {
    return map(adminWearers, (w: HatWearer) => {
      const wearerDetails = find(orgChartWearers, { id: w.id });
      return { ...w, ...wearerDetails };
    });
  }, [adminWearers, orgChartWearers]);

  // const { data, isLoading, status, error } = useQuery({
  //   queryKey: ['adminWearers', adminWearers, chainId],
  //   queryFn: () => {
  //     return {
  //       code: 0,
  //       groups: 0,
  //       human: 0,
  //     };
  //   },
  //   enabled: !isEmpty(adminWearers) && !!chainId,
  //   refetchInterval: 1000 * 60 * 15, // 15 minutes
  // });

  const adminCount = useMemo(() => {
    if (!data) return { code: 0, groups: 0, human: 0 };

    const contracts = filter(data, 'isContract');
    const groups = filter(contracts, (w: HatWearer) => w?.contractName?.includes('GnosisSafeProxy'));

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
    // isLoading: status === 'pending' || isLoading,
    // error,
  };
};

export { useHatAdminWearers };
