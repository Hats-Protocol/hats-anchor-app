import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

import client from '@/gql/client';
import { SEARCH_QUERY } from '@/gql/queries';
import {
  idToPrettyId,
  ipToPrettyId,
  prettyIdToIp,
  prettyIdToUrlId,
  toTreeId,
  decimalIdToId,
} from '@/lib/hats';
import { chainsList } from '@/lib/web3';
import { ITree, IHat } from '@/types';

const keyIcons: { [key: string]: string } = {
  trees: 'UserGroupIcon',
  hats: 'UserPlusIcon',
};

const processForCommandPalette = (key: string, record: any) => {
  const parts = _.split(_.get(record, 'id'), '.');
  const treeId = prettyIdToUrlId(idToPrettyId(_.first(parts)), true);
  let href = '#';
  if (key === 'trees') {
    href = `/trees/${_.get(record, 'network.id')}/${prettyIdToUrlId(
      _.get(record, 'id'),
      true,
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

  const { status, error, data, isLoading } = useQuery(
    ['searchResults', localSearch],
    searchQueryResult,
    { enabled: !!localSearch },
  );

  return { status, error, data, isLoading };
};

export default useSearchResults;
