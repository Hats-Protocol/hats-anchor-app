import { useQueries, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import _ from 'lodash';

import CONFIG from '@/constants';
import { PINATA_GATEWAY_TOKEN } from '@/lib/ipfs';
import { IHat } from '@/types';

export const fetchDetailsIpfs = async (detailsField: string | undefined) => {
  if (!detailsField) return null;
  const url = `${CONFIG.ipfsGateway}${detailsField?.slice(
    7,
  )}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;

  try {
    // timeout is due to Pinata's gateway taking long time to return an error when file doesn't exist
    const res = await axios.get(url, { timeout: 5000 });
    return Promise.resolve(res);
  } catch (error) {
    console.log(error);
    return null;
  }
};

const useManyHatsDetailsField = ({ hats }: { hats: IHat[] }) => {
  const detailsFields = useQueries({
    queries: _.map(hats, (hat) => ({
      queryKey: ['hatDetailsField', hat?.details],
      queryFn: () => fetchDetailsIpfs(hat?.details),
      enabled: !!hat?.details && hat?.details?.startsWith('ipfs://'),
    })),
  });

  return _.map(hats, (hat, i) => ({
    ...hat,
    detailsObject: detailsFields[i]?.data?.data,
  }));
};

export default useManyHatsDetailsField;
