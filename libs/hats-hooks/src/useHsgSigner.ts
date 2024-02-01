import { useQuery } from '@tanstack/react-query';
import { createHatsSignerGateClient } from 'app-utils';
import { SupportedChains } from 'hats-types';
import { Hex } from 'viem';

const useHsgSigner = ({
  instance,
  signer,
  chainId,
  enabled,
  editMode,
}: {
  instance: Hex;
  signer: Hex;
  chainId: SupportedChains;
  enabled: boolean;
  editMode?: boolean;
}) => {
  const checkClaimedSignerRights = async () => {
    const signerGateClient = await createHatsSignerGateClient(chainId);
    if (!signerGateClient) throw new Error('Failed to create module client');

    try {
      const result = await signerGateClient.claimedAndStillValid({
        instance,
        address: signer,
      });
      return result;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
    return undefined;
  };

  const { data, isLoading } = useQuery({
    queryKey: ['hsgSigner', instance, signer],
    queryFn: checkClaimedSignerRights,
    enabled,
    staleTime: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });

  return { data, isLoading };
};

export default useHsgSigner;
