import { useQuery } from '@tanstack/react-query';
import { SupportedChains } from 'types';
import { createHatsSignerGateClient } from 'utils';
import { Hex } from 'viem';

const useHsgSigner = ({
  instance,
  signer,
  chainId,
  enabled,
  editMode,
}: {
  instance: Hex | undefined;
  signer: Hex | undefined;
  chainId: SupportedChains | undefined;
  enabled: boolean;
  editMode?: boolean;
}) => {
  const checkClaimedSignerRights = async () => {
    const signerGateClient = await createHatsSignerGateClient(chainId);
    if (!signerGateClient) throw new Error('Failed to create module client');
    if (!instance || !signer || !chainId) return null;
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
    return null;
  };

  const { data, isLoading } = useQuery({
    queryKey: ['hsgSigner', { instance, signer, chainId }],
    queryFn: checkClaimedSignerRights,
    enabled: enabled && !!instance && !!signer && !!chainId,
    staleTime: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });

  return { data, isLoading };
};

export default useHsgSigner;
