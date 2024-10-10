import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { AppHat, FormData, SupportedChains } from 'types';
import {
  createHatsClient,
  fetchToken,
  handleDetailsPin,
  processHatForCalls,
} from 'utils';

import { HatPinDetails } from './useMulticallManyHats';

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

    const onlyOnchainHats = _.filter(treeToDisplay, (hat: AppHat) =>
      _.includes(_.map(onchainHats, 'id'), hat.id),
    );
    const removeEmptyData = _.filter(
      storedData,
      (hat: Partial<FormData>) => !_.isEmpty(_.keys(_.omit(hat, ['id']))),
    );

    const allCallsPromises = _.map(removeEmptyData, (hat: Partial<FormData>) =>
      processHatForCalls(hat, onlyOnchainHats, chainId),
    );
    const allCalls = await Promise.all(allCallsPromises);

    const calls = _.map(_.flatten(_.map(allCalls, 'calls') || []), 'callData');

    const detailsToPin = _.map(allCalls, 'detailsToPin');

    const token = await fetchToken(_.size(detailsToPin));
    // TODO [low] handle no token

    const detailsPromises = _.map(
      _.compact(detailsToPin),
      (hatDetails: HatPinDetails, index: number) => {
        setTimeout(() => {
          const {
            chainId: localChainId,
            hatId,
            details,
          } = _.pick(hatDetails, ['chainId', 'hatId', 'details']);
          return handleDetailsPin({
            chainId: localChainId,
            hatId,
            details,
            token,
          });
        }, index * 500); // spread these as to not overload the pinning service
      },
    );
    await Promise.all(detailsPromises);

    return Promise.resolve(hatsClient?.multicallCallData(calls));
  };

  const { data, isLoading } = useQuery({
    queryKey: ['multicallData', { treeId, chainId }, storedData],
    queryFn: computeMulticallData,
    enabled: !!treeId && !!chainId && !!storedData && isExpanded,
    staleTime: Infinity, // (only used in edit mode)
  });

  return { data, isLoading };
};

export default useMulticallCallData;
