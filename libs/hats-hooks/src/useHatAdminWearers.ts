import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useMemo } from 'react';
import { AppHat, HatWearer } from 'types';
import { extendWearerDetails } from 'utils';

const fetchAdminWearers = async (wearers: HatWearer[], chainId: number) => {
  const extendedWearers = _.map(wearers, (w: HatWearer) =>
    extendWearerDetails(w.id, chainId),
  );
  return Promise.all(extendedWearers)
    .then((data) => data as HatWearer[])
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err);
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

    return _.filter(
      treeToDisplay,
      (h: AppHat) => h.prettyId && selectedHat.prettyId?.includes(h.prettyId),
    );
  }, [treeToDisplay, selectedHat?.prettyId]);
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
