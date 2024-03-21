import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useMemo } from 'react';
import { AppHat, HatWearer } from 'types';
import { extendWearerDetails } from 'utils';

// eslint-disable-next-line no-promise-executor-return
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// TODO move to utils/wearers
const fetchAdminWearers = async (wearers: HatWearer[], chainId: number) => {
  const extendedWearers = _.map(wearers, (w: HatWearer) =>
    extendWearerDetails(w.id, chainId),
  );

  const extendedWearersPromises = extendedWearers.map(
    async (promise: Promise<unknown>, index: number) => {
      if (index % 2 === 0 && index !== 0) {
        await delay(1000); // Delay 1 second every 2 promises
      }
      return promise;
    },
  );

  return Promise.allSettled(extendedWearersPromises)
    .then((results) =>
      results.map((result) =>
        result.status === 'fulfilled' ? result.value : null,
      ),
    )
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      return [];
    });
};

const useHatAdminWearers = (
  selectedHat: AppHat,
  treeToDisplay: AppHat[],
  chainId: number,
) => {
  const adminHats = useMemo(() => {
    if (!selectedHat?.prettyId) return [];

    const filteredList = _.filter(
      treeToDisplay,
      (h: AppHat) => h.prettyId && selectedHat.prettyId?.includes(h.prettyId),
    );
    // exclude current hat
    return _.reject(filteredList, { id: selectedHat.id });
  }, [treeToDisplay, selectedHat?.prettyId, selectedHat.id]);
  const adminWearers = useMemo(() => {
    return _.uniqBy(_.flatten(_.map(adminHats, 'wearers')), 'id');
  }, [adminHats]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminWearers', adminWearers, chainId],
    queryFn: () => fetchAdminWearers(adminWearers, chainId),
    enabled: !_.isEmpty(adminWearers),
  });

  const adminCount = useMemo(() => {
    if (!data) return { code: 0, human: 0 };

    return {
      code: _.size(_.filter(data, 'isContract')) || 0,
      human: _.size(_.reject(data, 'isContract')) || 0,
    };
  }, [data]);

  return { data, adminCount, isLoading, error };
};

export default useHatAdminWearers;
