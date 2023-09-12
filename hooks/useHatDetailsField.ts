import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

import { fetchDetailsIpfs } from '@/lib/ipfs';
import { HatDetails } from '@/types';

/**
 * Handles the "details" field of a Hat. If content is pointing to IPFS, fetches the data and checks its schema type.
 * @param {string} detailsField Details field as received from the contract
 * @returns If data is on ipfs and is compatible with a known schema, then returns the schema type with the data. Otherwise, just the fetched data.
 * If not ipfs, returns undefined.
 */
const useHatDetailsField = (detailsField?: string) => {
  // currently uses this prefix as an indicator for ipfs data
  const isIpfs = detailsField?.startsWith('ipfs://');

  const { data, isLoading, error } = useQuery({
    queryKey: ['hatDetailsField', detailsField],
    queryFn: async () => {
      const result = await fetchDetailsIpfs(detailsField);
      return result;
    },
    enabled: !!detailsField && isIpfs,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
  const detailsData: HatDetails | undefined = _.get(data, 'data.data.data');

  let schemaType;
  if (!!data && data.headers?.['content-type'] === 'application/json') {
    const schemaTypeField = data.data.type;
    // schema validation
    switch (schemaTypeField) {
      case '1.0':
        if (
          _.includes(_.keys(detailsData), 'name') ||
          _.includes(_.keys(detailsData), 'description') ||
          _.includes(_.keys(detailsData), 'guilds') ||
          _.includes(_.keys(detailsData), 'responsibilities') ||
          _.includes(_.keys(detailsData), 'authorities') ||
          _.includes(_.keys(detailsData), 'eligibility') ||
          _.includes(_.keys(detailsData), 'toggle')
        ) {
          schemaType = schemaTypeField;
        }
        break;
      default:
        schemaType = undefined;
    }
  }

  return { data: detailsData, isLoading, error, schemaType };
};

export default useHatDetailsField;
