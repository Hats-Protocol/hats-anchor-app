'use client';

import { CONTROLLER_TYPES } from '@hatsprotocol/constants';
import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { AppHat, ModuleDetails, ValueOf } from 'types';
import { ModuleDetailsHandler } from 'utils';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

import { DEFAULT_TOGGLE_RULE_DETAILS, ToggleRuleDetails } from './general';
import { handlePassthroughModule, handleSeasonToggle } from './modules';

const TOGGLE_MODULES = {
  passthrough: 'Passthrough Module',
  season: 'Season Toggle',
};

const TOGGLE_HANDLERS: {
  [key: ValueOf<typeof TOGGLE_MODULES>]: ({
    moduleDetails,
    moduleParameters,
    wearer,
    chainId,
    selectedHat,
    moduleType,
  }: ModuleDetailsHandler) => Promise<ToggleRuleDetails>;
} = {
  [TOGGLE_MODULES.passthrough]: handlePassthroughModule,
  [TOGGLE_MODULES.season]: handleSeasonToggle,
};

const fetchToggleRuleDetails = async ({
  moduleDetails,
  moduleParameters,
  chainId,
  wearer,
  selectedHat,
}: {
  moduleDetails: ModuleDetails | undefined;
  moduleParameters: ModuleParameter[] | undefined;
  wearer: Hex | undefined;
  chainId: number | undefined;
  selectedHat: AppHat | undefined;
}): Promise<ToggleRuleDetails> => {
  if (!moduleDetails || !moduleParameters || !chainId) {
    return Promise.resolve(DEFAULT_TOGGLE_RULE_DETAILS);
  }

  if (!_.has(TOGGLE_HANDLERS, moduleDetails.name)) {
    // eslint-disable-next-line no-console
    console.log('Unknown module', moduleDetails.name, moduleDetails);
    return Promise.resolve(DEFAULT_TOGGLE_RULE_DETAILS);
  }

  return TOGGLE_HANDLERS[moduleDetails.name]({
    moduleDetails,
    moduleParameters,
    wearer,
    chainId,
    selectedHat,
    moduleType: CONTROLLER_TYPES.toggle,
  });
};

const useToggleRuleDetails = ({
  moduleDetails,
  parameters,
  chainId,
  selectedHat,
}: {
  moduleDetails: ModuleDetails | undefined;
  parameters: ModuleParameter[] | undefined;
  chainId: number | undefined;
  selectedHat: AppHat | undefined;
}) => {
  const { address, status } = useAccount();
  const { data, isLoading, error } = useQuery({
    queryKey: [
      'toggleRuleDetails',
      moduleDetails,
      _.map(parameters, (p: ModuleParameter) => _.omit(p, ['value'])),
      selectedHat,
      { address, chainId },
    ],
    queryFn: () =>
      fetchToggleRuleDetails({
        moduleDetails,
        moduleParameters: parameters,
        wearer: address,
        chainId,
        selectedHat,
      }),
    enabled:
      !!moduleDetails &&
      !!parameters &&
      (status === 'disconnected' || status === 'connected'),
  });

  return { data, isLoading, error };
};

export default useToggleRuleDetails;
