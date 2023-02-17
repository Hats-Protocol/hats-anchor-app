import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import client from '../gql/client';
import { SEARCH_QUERY } from '../gql/queries';

const keyIcons = {
  trees: 'UserGroupIcon',
  hats: 'UserPlusIcon',
};

const processForCommandPalette = (key, record) => ({
  id: `${key}-${_.get(record, 'id')}`,
  children: _.get(record, 'id'),
  icon: keyIcons[key],
  href: `/${key}/${_.get(record, 'id')}`,
});

const useSearchResults = ({ token, search }) => {
  const searchQueryResult = async () => {
    if (!search) return null;

    const result = await client({ token }).request(SEARCH_QUERY, {
      search: `${search}`, // `%${search}%`,
    });

    return _.mapValues(result, (o, k) =>
      _.map(o, (r) => processForCommandPalette(k, r)),
    );
  };

  const { status, error, data, isLoading } = useQuery(
    ['searchResults', search],
    searchQueryResult,
    { enabled: !!search },
  );

  return { status, error, data, isLoading };
};

export default useSearchResults;
