import { FALLBACK_ADDRESS } from '@hatsprotocol/constants';
import { useQuery } from '@tanstack/react-query';
import { SupportedChains } from 'types';
import { createHatsModulesClient } from 'utils';
import { Hex, zeroAddress } from 'viem';

const getEligibilityRules = async ({
  address,
  chainId,
}: {
  address: Hex | undefined;
  chainId: SupportedChains | undefined;
}) => {
  if (!chainId || !address) return Promise.resolve(null);

  return createHatsModulesClient(chainId).then(async (modulesClient) => {
    if (!modulesClient) return Promise.resolve(null);

    return modulesClient
      .getRulesets(address, { includeLiveParams: true })
      .then((ruleSets) => {
        return Promise.resolve(ruleSets || null);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error(err);
        return Promise.resolve(null);
      });
  });
};

const useEligibilityRules = ({
  address,
  chainId,
  enabled = true,
  editMode,
}: {
  address: Hex | undefined;
  chainId: SupportedChains | undefined;
  enabled?: boolean;
  editMode?: boolean;
}) => {
  const { data, isLoading, fetchStatus } = useQuery({
    queryKey: ['eligibilityRules', { address, chainId }],
    queryFn: () => getEligibilityRules({ address, chainId }),
    enabled: !!address && !!chainId && address !== FALLBACK_ADDRESS && address !== zeroAddress && enabled,
    staleTime: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });

  return {
    data,
    isLoading: isLoading && fetchStatus !== 'idle',
  };
};

export { getEligibilityRules, useEligibilityRules };
