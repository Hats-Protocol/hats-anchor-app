import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

/**
 * Handles the "details" field of a Hat. If content is pointing to IPFS, fetches the data and checks its schema type.
 * @param {string} detailsField Details field as received from the contract
 * @returns if data is on ipfs and is compatible with a known schema, then returns the schema type with the data. Otherwise, just the data
 */
const useHatDetailsField = (detailsField) => {
  // currently uses this prefix as an indicator for ipfs data
  const isIpfs = detailsField.startsWith('ipfs://');

  const { data, isLoading, error } = useQuery({
    queryKey: ['hatDetailsField', detailsField],
    queryFn: () => fetchDetailsIpfs(detailsField),
    enabled: isIpfs,
  });

  let schemaType;
  if (!!data && data.headers['content-type'] == 'application/json') {
    let schemaTypeField = data.data.type;
    // schema validation
    switch (schemaTypeField) {
      case '1.0':
        if ('name' in data.data.data && 'description' in data.data.data) {
          schemaType = schemaTypeField;
        }
    }
  }

  return { data, isLoading, error, schemaType };
};

const fetchDetailsIpfs = async (detailsField) => {
  const url = 'https://ipfs.io/ipfs/' + detailsField.slice(7);

  const res = await axios.get(url);
  return res;
};

export default useHatDetailsField;
