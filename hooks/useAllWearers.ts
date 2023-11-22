import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { Hex } from 'viem';

import { useTreeForm } from '@/contexts/TreeFormContext';
import { createSubgraphClient } from '@/lib/web3';
import { HatWearer } from '@/types';

// hats-hooks
const fetchHatWearersPage = async ({
  hatId,
  chainId,
  page,
}: {
  hatId: Hex;
  chainId: number;
  page: number;
}) => {
  const subgraphClient = createSubgraphClient();

  const res = await subgraphClient.getWearersOfHatPaginated({
    chainId,
    hatId: BigInt(hatId),
    props: {},
    page,
    perPage: 1000,
  });

  return res;
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

    return _.flatten(result) as HatWearer[];
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ['allWearers', selectedHat?.id],
    queryFn: fetchAllWearers,
    enabled: !!selectedHat?.id && !!chainId,
  });

  return { wearers: data, error, isLoading };
};

export default useAllWearers;
