import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { Hex } from 'viem';

import { fetchWearerDetails } from '@/gql/helpers';
import { chainsList } from '@/lib/web3';
import { IHat } from '@/types';

const chains = _.keys(chainsList);

const fetchWearerDetailsForChain = async (
  address: string | undefined,
  chainId: number,
) => {
  if (!address) return [];
  const data: { currentHats: IHat[] } = await fetchWearerDetails(
    address,
    chainId,
  );

  return data.currentHats;
};

const fetchWearerDetailsForAllChains = async (address: string | undefined) => {
  if (!address) return [];
  const promises = _.map(chains, (cId: string) =>
    fetchWearerDetails(address, Number(cId)),
  );

  const data: { currentHats: IHat[] }[] = await Promise.all(promises);

  return _.flatten(_.map(data, 'currentHats'));
};

// ? separate useWearerDetailsForAllChains ?

const useWearerDetails = ({
  wearerAddress,
  chainId,
  initialData,
}: UseWearerDetailsProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['wearerDetails', wearerAddress, { chainId }],
    queryFn: () =>
      chainId && chainId !== 'all'
        ? fetchWearerDetailsForChain(wearerAddress, chainId)
        : fetchWearerDetailsForAllChains(wearerAddress),
    enabled: !!wearerAddress && !!chainId,
    initialData,
  });

  return { data, isLoading, error };
};

export default useWearerDetails;

interface UseWearerDetailsProps {
  wearerAddress: Hex | undefined;
  initialData?: IHat[];
  chainId?: number | 'all' | undefined;
}
