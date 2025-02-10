import { useQuery } from '@tanstack/react-query';
import { filter, map } from 'lodash';
import { SupportedChains } from 'types';
import { createHatsClient } from 'utils';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

// TODO duplicate code from use-hats-admin-of.ts

const useAdminOfHats = ({ hatIds, chainId }: { hatIds: Hex[]; chainId: SupportedChains | undefined }) => {
  const { address: user } = useAccount();

  const fetchAdminStatus = async () => {
    const hatsClient = await createHatsClient(chainId);
    if (!hatsClient) {
      throw new Error('Unable to initialize hatsClient');
    }

    if (!user) return [];

    // TODO convert to promise batch to multicall rpc
    const results: (Hex | null)[] = await Promise.all(
      map(hatIds, async (hatId: Hex) => {
        try {
          const isAdmin = await hatsClient.isAdminOfHat({
            user,
            hatId: BigInt(hatId),
          });
          return isAdmin ? hatId : null;
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(`Error checking admin status for hatId ${hatId}`, err);
          return null;
        }
      }),
    );

    return filter(results, Boolean) as Hex[];
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

export { useAdminOfHats };
