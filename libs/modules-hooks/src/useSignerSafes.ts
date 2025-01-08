import { useQuery } from '@tanstack/react-query';
import { isEmpty } from 'lodash';
import { SupportedChains } from 'types';
import { fetchHsgSigners } from 'utils';
import { Hex } from 'viem';

const useSignerSafes = ({ hatIds, chainId }: { hatIds: Hex[] | undefined; chainId: SupportedChains | undefined }) => {
  return useQuery({
    queryKey: ['hsgSigners', { hatIds, chainId }],
    queryFn: () => fetchHsgSigners({ hatIds, chainId }),
    enabled: !isEmpty(hatIds) && !!chainId,
  });
};

export default useSignerSafes;
