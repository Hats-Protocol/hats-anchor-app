import { useQuery } from '@tanstack/react-query';
import {
  createHatsClient,
  fetchToken,
  handleDetailsPin,
  processHatForCalls,
} from 'app-utils';
import { FormData, Hat, SupportedChains } from 'hats-types';
import _ from 'lodash';
import { Hex } from 'viem';

import { HatPinDetails } from './useMulticallManyHats';

type useMulticallCallDataProps = {
  chainId: SupportedChains | undefined;
  treeId: Hex;
  storedData: Partial<FormData>[];
  onchainHats: Hat[];
  treeToDisplay: Hat[];
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
    const hatsClient = createHatsClient(chainId);

    const onlyOnchainHats = _.filter(treeToDisplay, (hat: Hat) =>
      _.includes(_.map(onchainHats, 'id'), hat.id),
    );
    const allCallsPromises = _.map(storedData, (hat: Partial<FormData>) =>
      processHatForCalls(hat, onlyOnchainHats, chainId),
    );
    const allCalls = await Promise.all(allCallsPromises);

    const calls = _.map(_.flatten(_.map(allCalls, 'calls') || []), 'callData');

    const detailsToPin = _.map(allCalls, 'detailsToPin');

    const token = await fetchToken(_.size(detailsToPin));
    // TODO handle no token

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
  });

  return { data, isLoading };
};

export default useMulticallCallData;
