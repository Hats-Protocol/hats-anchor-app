import { useQuery } from '@tanstack/react-query';
import { compact, filter, flatten, includes, isEmpty, keys, map, omit, pick, size } from 'lodash';
import { AppHat, FormData, HatPinDetails, SupportedChains } from 'types';
import { createHatsClient, fetchToken, handleDetailsPin, processHatForCalls } from 'utils';

type useMulticallCallDataProps = {
  chainId: SupportedChains | undefined;
  treeId: number | undefined; // ! can be removed?
  storedData: Partial<FormData>[] | undefined;
  onchainHats: AppHat[] | undefined;
  treeToDisplay: AppHat[] | undefined;
  isExpanded: boolean;
};

// hats-hooks
const useMulticallCallData = ({
  chainId,
  treeId,
  storedData,
  onchainHats,
  treeToDisplay,
  isExpanded,
}: useMulticallCallDataProps) => {
  const computeMulticallData = async () => {
    if (!chainId || !treeId || !storedData) return undefined;
    const hatsClient = await createHatsClient(chainId);

    const onlyOnchainHats = filter(treeToDisplay, (hat: AppHat) => includes(map(onchainHats, 'id'), hat.id));
    const removeEmptyData = filter(storedData, (hat: Partial<FormData>) => !isEmpty(keys(omit(hat, ['id']))));

    const allCallsPromises = map(removeEmptyData, (hat: Partial<FormData>) =>
      processHatForCalls(hat, onlyOnchainHats, chainId),
    );
    const allCalls = await Promise.all(allCallsPromises);

    const calls = map(flatten(map(allCalls, 'calls') || []), 'callData');

    const detailsToPin = compact(map(allCalls, 'detailsToPin'));

    const token = await fetchToken(size(detailsToPin));
    // TODO [low] handle no token

    const detailsPromises = map(detailsToPin, (hatDetails: HatPinDetails, index: number) => {
      setTimeout(() => {
        const { chainId: localChainId, hatId, details } = pick(hatDetails, ['chainId', 'hatId', 'details']);
        return handleDetailsPin({
          chainId: localChainId,
          hatId,
          details,
          token,
        });
      }, index * 500); // spread these as to not overload the pinning service
    });
    await Promise.all(detailsPromises);

    return Promise.resolve({
      callData: hatsClient?.multicallCallData(calls),
      detailsToPin,
      allCalls,
    });
  };

  const { data, isLoading } = useQuery({
    queryKey: ['multicallData', { treeId, chainId }, storedData],
    queryFn: computeMulticallData,
    enabled: !!treeId && !!chainId && !!storedData && isExpanded,
    staleTime: Infinity, // (only used in edit mode)
  });

  return { data, isLoading };
};

export { useMulticallCallData };
