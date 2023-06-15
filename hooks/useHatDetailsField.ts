/* eslint-disable default-case */
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import _ from 'lodash';

import { PINATA_GATEWAY_TOKEN } from '@/lib/ipfs';
import CONFIG from '@/constants';

export const fetchDetailsIpfs = async (detailsField: string | undefined) => {
  if (!detailsField) return null;
  // todo config value
  const url = `${CONFIG.ipfsGateway}${detailsField?.slice(
    7,
  )}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;

  // timeout is due to Pinata's gateway taking long time to return an error when file doesn't exist
  const res = await axios.get(url, { timeout: 5000 });
  return res;
};

export const fetchMultipleHatsDetails = async (detailsFields: string[]) => {
  const details = await detailsFields.reduce<Promise<any[]>>(
    async (accPromise, detailsField) => {
      const acc = await accPromise;
      if (detailsField?.startsWith('ipfs://')) {
        try {
          const res = await fetchDetailsIpfs(detailsField);
          acc.push(res?.data);
        } catch (e) {
          console.log(e);
          acc.push({});
        }
      } else {
        acc.push(detailsField);
      }
      return acc;
    },
    Promise.resolve([]),
  );

  return details;
};

/**
 * Handles the "details" field of a Hat. If content is pointing to IPFS, fetches the data and checks its schema type.
 * @param {string} detailsField Details field as received from the contract
 * @returns If data is on ipfs and is compatible with a known schema, then returns the schema type with the data. Otherwise, just the fetched data.
 * If not ipfs, returns undefined.
 */
const useHatDetailsField = (detailsField: string) => {
  // currently uses this prefix as an indicator for ipfs data
  const isIpfs = detailsField?.startsWith('ipfs://');

  const { data, isLoading, error } = useQuery({
    queryKey: ['hatDetailsField', detailsField],
    queryFn: () => fetchDetailsIpfs(detailsField),
    enabled: isIpfs,
  });
  const detailsData = data?.data?.data;

  let schemaType;
  if (!!data && data.headers['content-type'] === 'application/json') {
    const schemaTypeField = data.data.type;
    // schema validation
    switch (schemaTypeField) {
      case '1.0':
        if (
          _.includes(_.keys(detailsData), 'name') ||
          _.includes(_.keys(detailsData), 'description') ||
          _.includes(_.keys(detailsData), 'guilds')
        ) {
          schemaType = schemaTypeField;
        }
    }
  }

  return { data: detailsData, isLoading, error, schemaType };
};

export default useHatDetailsField;
