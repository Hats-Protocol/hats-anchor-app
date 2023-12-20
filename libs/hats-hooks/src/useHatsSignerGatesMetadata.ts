import { HsgMetadata } from '@hatsprotocol/hsg-sdk';
import { useQuery } from '@tanstack/react-query';
import { createHatsSignerGateClient } from 'app-utils';
import { SupportedChains } from 'hats-types';

const useHatsSignerGatesMetadata = ({
  chainId,
}: {
  chainId: SupportedChains | undefined;
}) => {
  const fetchHsgData = async () => {
    const HSGClient = await createHatsSignerGateClient(chainId);
    if (!HSGClient) return [];

    const single = await HSGClient.getMetadata('HSG');
    const multi = await HSGClient.getMetadata('MHSG');
    return {
      single,
      multi,
    };
  };

  const { data, isLoading } = useQuery({
    queryKey: ['hatsSignerGates', chainId],
    queryFn: fetchHsgData,
    enabled: !!chainId,
  });

  return {
    gates: data as { single: HsgMetadata; multi: HsgMetadata },
    isLoading,
  };
};

export default useHatsSignerGatesMetadata;
