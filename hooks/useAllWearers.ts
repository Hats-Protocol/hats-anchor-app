import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { Hex } from 'viem';

import { useTreeForm } from '@/contexts/TreeFormContext';
import client from '@/gql/client';
import { GET_HAT_WEARERS_PAGE } from '@/gql/queries';
import { HatWearer } from '@/types';

const fetchHatWearersPage = async ({
  hatId,
  chainId,
  page,
}: {
  hatId: Hex;
  chainId: number;
  page: number;
}) => {
  const result = await client(chainId).request(GET_HAT_WEARERS_PAGE, {
    hatId,
    page: page * 1000 || 0,
  });

  return result;
};

const useAllWearers = () => {
  const { selectedHat, chainId } = useTreeForm();
  const supply = _.toNumber(selectedHat?.currentSupply);

  const fetchAllWearers = async () => {
    if (!chainId || !selectedHat || !supply) return [];
    const pages = Math.ceil(supply / 1000);
    const promises = _.map(_.range(pages), (page) => {
      return fetchHatWearersPage({ hatId: selectedHat?.id, chainId, page });
    });

    const result = await Promise.all(promises);

    return _.flatten(_.map(result, 'hat.wearers')) as HatWearer[];
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ['allWearers', selectedHat?.id],
    queryFn: fetchAllWearers,
    enabled: !!selectedHat?.id && !!chainId,
  });

  return { wearers: data, error, isLoading };
};

export default useAllWearers;
