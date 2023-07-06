import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

import { fetchWearerDetails } from '@/gql/helpers';
import { chainsList } from '@/lib/web3';
import { IHat } from '@/types';

const chains = _.keys(chainsList);

const useWearerDetails = ({
  wearerAddress,
  initialData,
}: UseWearerDetailsProps) => {
  const fetchWearerDetailsForAllChains = async (
    address: string | undefined,
  ) => {
    if (!address) return [];
    const promises = _.map(chains, (cId: string) =>
      fetchWearerDetails(address, Number(cId)),
    );

    const data: { currentHats: IHat[] }[] = await Promise.all(promises);

    return _.flatten(_.map(data, 'currentHats'));
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['wearerDetails', wearerAddress],
    queryFn: () => fetchWearerDetailsForAllChains(wearerAddress),
    enabled: !!wearerAddress,
    initialData,
  });

  return { data, isLoading, error };
};

export default useWearerDetails;

interface UseWearerDetailsProps {
  wearerAddress: `0x${string}` | undefined;
  initialData?: IHat[];
}
