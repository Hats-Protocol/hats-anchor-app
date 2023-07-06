import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

import client from '@/gql/client';
import { GET_CONTROLLERS_FOR_USER } from '@/gql/queries';
import { chainsList } from '@/lib/web3';
import { IHat } from '@/types';

const chains = _.keys(chainsList);

const useControllerList = ({ address }: { address: string }) => {
  const fetchControllersForUser = async (a: string) => {
    const promises = _.map(chains, (cId: number) =>
      client(cId).request(GET_CONTROLLERS_FOR_USER, { address: _.toLower(a) }),
    );

    const data: unknown[] = await Promise.all(promises);

    const mapWithChains = _.map(data, (d: { hats: IHat[] }, i: number) => {
      const hats = _.map(d.hats, (h) => ({
        ...h,
        chainId: _.toNumber(chains[i]),
      }));

      return { hats };
    });

    return _.flatten(_.map(mapWithChains, 'hats'));
  };

  const { data, isLoading } = useQuery({
    queryKey: ['controllerList', address],
    queryFn: () => fetchControllersForUser(address),
    enabled: !!address,
  });

  return { data, isLoading };
};

export default useControllerList;
