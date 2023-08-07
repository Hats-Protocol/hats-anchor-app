import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

import client from '@/gql/client';
import { SEARCH_QUERY } from '@/gql/queries';
import {
  decimalIdToId,
  idToPrettyId,
  ipToPrettyId,
  prettyIdToIp,
  toTreeId,
} from '@/lib/hats';
import { chainsList } from '@/lib/web3';
import { IHat, ITree } from '@/types';

const keyIcons: { [key: string]: string } = {
  trees: 'UserGroupIcon',
  hats: 'UserPlusIcon',
};

// TODO refactor without prettyId

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processForCommandPalette = (key: string, record: any) => {
  const parts = _.split(_.get(record, 'id'), '.');
  const treeId = prettyIdToIp(idToPrettyId(_.first(parts)));
  let href = '#';
  if (key === 'trees') {
    href = `/trees/${_.get(record, 'network.id')}/${prettyIdToIp(
      _.get(record, 'id'),
    )}`;
  }
  if (key === 'hats') {
    href = `/trees/${_.get(record, 'network.id')}/${treeId}`;
  }

  return {
    id: `${key}-${_.get(record, 'id')}-${_.get(record, 'network.id')}`,
    children: `${_.get(record, 'network.name')} - #${prettyIdToIp(
      _.get(record, 'prettyId', _.get(record, 'id')),
    )}`,
    icon: keyIcons[key],
    href,
  };
};

const useSearchResults = ({ search }: { search: string | undefined }) => {
  let localSearch = toTreeId(search);
  if (_.includes(search, '.')) {
    localSearch = ipToPrettyId(search);
  }
  if (_.gt(_.size(search), 10) && !_.startsWith(search, '0x')) {
    localSearch = decimalIdToId(Number(search));
  }

  const searchQueryResult = async () => {
    if (!search) return { trees: [], hats: [] };

    const promises = _.map(_.keys(chainsList), (chainId: number) =>
      client(chainId).request(SEARCH_QUERY, {
        search: `${localSearch}`, // `%${search}%`,
      }),
    );

    const result = await Promise.all(promises);

    const allNetworkResults: { trees: ITree[]; hats: IHat[] } = {
      trees: [],
      hats: [],
    };
    _.forEach(result, (network, i) => {
      allNetworkResults.trees = _.concat(
        _.map(_.get(network, 'trees'), (tree: ITree) => ({
          ...tree,
          network: _.values(chainsList)[i],
        })),
        allNetworkResults?.trees || [],
      );
      allNetworkResults.hats = _.concat(
        _.map(_.get(network, 'hats'), (hat: IHat) => ({
          ...hat,
          network: _.values(chainsList)[i],
        })),
        allNetworkResults?.hats || [],
      );
    });

    return _.mapValues(allNetworkResults, (o, k) =>
      _.map(o, (r) => processForCommandPalette(k, r)),
    );
  };

  const { status, error, data, isLoading } = useQuery({
    queryKey: ['searchResults', localSearch],
    queryFn: searchQueryResult,
    enabled: !!localSearch,
  });

  return { status, error, data, isLoading };
};

export default useSearchResults;
