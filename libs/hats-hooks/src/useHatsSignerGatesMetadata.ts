'use client';

import { HsgMetadata } from '@hatsprotocol/hsg-sdk';
import { useQuery } from '@tanstack/react-query';
import { SupportedChains } from 'types';
import { createHatsSignerGateClient } from 'utils';

const useHatsSignerGatesMetadata = ({
  chainId,
  editMode,
}: {
  chainId: SupportedChains | undefined;
  editMode?: boolean;
}) => {
  const fetchHsgData = async () => {
    const HSGClient = await createHatsSignerGateClient(chainId);
    if (!HSGClient) return [];

    const single = HSGClient.getMetadata('HSG');
    const multi = HSGClient.getMetadata('MHSG');

    return { single, multi };
  };

  const { data, isLoading } = useQuery({
    queryKey: ['hatsSignerGates', { chainId }],
    queryFn: fetchHsgData,
    enabled: !!chainId,
    staleTime: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });

  return {
    gates: data as { single: HsgMetadata; multi: HsgMetadata },
    isLoading,
  };
};

export default useHatsSignerGatesMetadata;
