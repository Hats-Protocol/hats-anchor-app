import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { AppHat, HatWearer, SupportedChains } from 'types';
import { createSubgraphClient } from 'utils';
import { Hex } from 'viem';

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

const useAllWearers = ({
  selectedHat,
  chainId,
  enabled = true,
}: {
  selectedHat: AppHat;
  chainId: SupportedChains;
  enabled?: boolean;
}) => {
  const supply = _.toNumber(selectedHat?.currentSupply);

  const fetchAllWearers = async () => {
    if (!chainId || !selectedHat || !supply) return [];
    const pages = Math.ceil(supply / 1000);
    const promises = _.map(_.range(pages), (page: number) => {
      return fetchHatWearersPage({ hatId: selectedHat?.id, chainId, page });
    });

    const result = await Promise.all(promises);

    return _.flatten(result) as HatWearer[];
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ['allWearers', selectedHat?.id],
    queryFn: fetchAllWearers,
    enabled: enabled && !!selectedHat?.id && !!chainId,
    staleTime: 1000 * 60 * 60 * 6, // 6 hours
  });

  return { wearers: data, error, isLoading };
};

export default useAllWearers;
