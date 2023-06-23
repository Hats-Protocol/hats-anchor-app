import _ from 'lodash';
import { useQuery } from '@tanstack/react-query';
import client from '@/gql/client';
import { chainsList } from '@/lib/web3';
import { GET_CONTROLLERS_FOR_USER } from '@/gql/queries';

const chains = _.keys(chainsList);

const useControllerList = ({ address }: { address: string }) => {
  const fetchControllersForUser = async (a: string) => {
    const promises = _.map(chains, (cId: number) =>
      client(cId).request(GET_CONTROLLERS_FOR_USER, { address: a }),
    );

    const data = await Promise.all(promises);

    return _.flatten(data);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['controllerList', address],
    queryFn: () => fetchControllersForUser(address),
    enabled: !!address,
  });

  return { data, isLoading };
};

export default useControllerList;
