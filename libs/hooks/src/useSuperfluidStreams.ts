import { useQuery } from '@tanstack/react-query';
import { isEmpty } from 'lodash';
import { fetchSuperfluidStreams } from 'utils';
import { Hex } from 'viem';

const useSuperfluidStreams = ({
  addresses,
  chainId,
}: {
  addresses: Hex[] | undefined;
  chainId: number | undefined;
}) => {
  return useQuery({
    queryKey: ['superfluidStreams', { addresses, chainId }],
    queryFn: () => fetchSuperfluidStreams({ addresses, chainId }),
    enabled: !!addresses && !isEmpty(addresses) && !!chainId,
  });
};

export default useSuperfluidStreams;
