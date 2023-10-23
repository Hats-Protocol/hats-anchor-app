import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

import { useTreeForm } from '@/contexts/TreeFormContext';
import { createHatsClient } from '@/lib/web3';

const useAdminOfHats = (hatIds: Hex[]) => {
  const { chainId } = useTreeForm();
  const { address: user } = useAccount();

  const fetchAdminStatus = async () => {
    const hatsClient = await createHatsClient(chainId);
    if (!hatsClient) {
      throw new Error('Unable to initialize hatsClient');
    }

    if (!user) return [];

    const results: (Hex | null)[] = await Promise.all(
      _.map(hatIds, async (hatId) => {
        try {
          const isAdmin = await hatsClient.isAdminOfHat({
            user,
            hatId: BigInt(hatId),
          });
          return isAdmin ? hatId : null;
        } catch (err) {
          console.error(`Error checking admin status for hatId ${hatId}`, err);
          return null;
        }
      }),
    );

    return _.filter(results, Boolean) as Hex[];
  };

  const {
    data: adminHatIds,
    isLoading,
    isError,
    error,
  } = useQuery<Hex[]>({
    queryKey: ['adminOfHats', chainId, user, ...hatIds],
    queryFn: fetchAdminStatus,
    enabled: !!chainId && !!user && hatIds.length > 0,
  });

  return { adminHatIds, isLoading, isError, error };
};

export default useAdminOfHats;
