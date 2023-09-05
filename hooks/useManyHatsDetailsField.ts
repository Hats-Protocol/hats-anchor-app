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

const useManyHatsDetailsField = ({
  hats,
  onchainHats,
}: {
  hats: IHat[];
  onchainHats?: IHat[];
}) => {
  let onlyOnchainHats = hats;
  if (onchainHats) {
    onlyOnchainHats = _.filter(hats, (hat) =>
      _.includes(_.map(onchainHats, 'id'), hat?.id),
    );
  }

  const filteredDetails = _.reject(
    onlyOnchainHats,
    (hat) => !_.startsWith(_.get(hat, 'details'), 'ipfs://'),
  );

  const detailsFields = useQueries({
    queries: _.map(filteredDetails, (hat) => ({
      queryKey: ['hatDetailsField', hat?.details],
      queryFn: () => fetchDetailsIpfs(hat?.details),
      enabled: !!hat?.details,
    })),
  });

  return {
    data: _.map(onlyOnchainHats, (hat, i) => ({
      id: hat?.details,
      detailsObject: detailsFields[i]?.data?.data,
    })),
    isLoading: _.some(detailsFields, 'isLoading'),
  };
};

export default useManyHatsDetailsField;
