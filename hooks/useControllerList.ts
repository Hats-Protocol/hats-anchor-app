import { DEFAULT_ENDPOINTS_CONFIG } from '@hatsprotocol/sdk-v1-subgraph';
import { useQuery } from '@tanstack/react-query';
import { GraphQLClient } from 'graphql-request';
import _ from 'lodash';

import { GET_CONTROLLERS_FOR_USER } from '@/gql/queries';
import { chainsList } from '@/lib/web3';
import { Hat } from '@/types';

const chains = _.keys(chainsList);

const useControllerList = ({ address }: { address: string }) => {
  const fetchControllersForUser = async (a: string) => {
    const promises = _.map(chains, (cId: number) => {
      const subgraphClient = new GraphQLClient(
        DEFAULT_ENDPOINTS_CONFIG[cId].endpoint,
      );
      if (subgraphClient !== undefined) {
        return subgraphClient.request(GET_CONTROLLERS_FOR_USER, {
          address: _.toLower(a),
        });
      }
      return undefined;
    });

    const data: unknown[] = await Promise.all(promises);

    const mapWithChains = _.map(data, (d: { hats: Hat[] }, i: number) => {
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
