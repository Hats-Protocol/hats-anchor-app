import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import client from '@/gql/client';
import { SEARCH_QUERY } from '@/gql/queries';
import { chainsList } from '@/lib/web3';
import {
  idToPrettyId,
  ipToPrettyId,
  prettyIdToIp,
  prettyIdToUrlId,
  toTreeId,
  decimalIdToId,
} from '@/lib/hats';

const keyIcons = {
  trees: 'UserGroupIcon',
  hats: 'UserPlusIcon',
};

const processForCommandPalette = (key, record) => {
  const parts = _.split(_.get(record, 'id'), '.');
  const treeId = prettyIdToUrlId(idToPrettyId(_.first(parts)), true);
  let href = '#';
  if (key === 'trees') {
    href = `/trees/${_.get(record, 'network.id')}/${prettyIdToUrlId(
      _.get(record, 'id'),
      true,
    )}/${prettyIdToUrlId(_.get(record, 'id'))}`;
  }
  if (key === 'hats') {
    href = `/trees/${_.get(record, 'network.id')}/${treeId}/${prettyIdToUrlId(
      _.get(record, 'prettyId', _.get(record, 'id')),
    )}`;
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

const useSearchResults = ({ search }) => {
  let localSearch = toTreeId(search);
  if (_.includes(search, '.')) {
    localSearch = ipToPrettyId(search);
  }
  if (_.gt(_.size(search), 10) && !_.startsWith(search, '0x')) {
    localSearch = decimalIdToId(search);
  }

  const searchQueryResult = async () => {
    if (!search) return { trees: [], hats: [] };
    // check if decimal??
    // check if IP id

    // check if prettyId
    // _.startsWith(search, '0x')

    const promises = _.map(_.keys(chainsList), (chainId) =>
      client(chainId).request(SEARCH_QUERY, {
        search: `${localSearch}`, // `%${search}%`,
      }),
    );

    const result = await Promise.all(promises);

    const allNetworkResults = {};
    _.forEach(result, (network, i) => {
      allNetworkResults.trees = _.concat(
        _.map(_.get(network, 'trees'), (tree) => ({
          ...tree,
          network: _.values(chainsList)[i],
        })),
        allNetworkResults?.trees || [],
      );
      allNetworkResults.hats = _.concat(
        _.map(_.get(network, 'hats'), (hat) => ({
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
