/* eslint-disable default-case */
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { PINATA_GATEWAY_TOKEN } from '../lib/ipfs';

const fetchDetailsIpfs = async (detailsField) => {
  const url = `https://indigo-selective-coral-505.mypinata.cloud/ipfs/${detailsField.slice(
    7,
  )}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;

  // timeout is due to Pinata's gateway taking long time to return an error when file doesn't exist
  const res = await axios.get(url, { timeout: 5000 });
  return res;
};

/**
 * Handles the "details" field of a Hat. If content is pointing to IPFS, fetches the data and checks its schema type.
 * @param {string} detailsField Details field as received from the contract
 * @returns If data is on ipfs and is compatible with a known schema, then returns the schema type with the data. Otherwise, just the fetched data.
 * If not ipfs, returns undefined.
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
  if (!!data && data.headers['content-type'] === 'application/json') {
    const schemaTypeField = data.data.type;
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

export default useHatDetailsField;
