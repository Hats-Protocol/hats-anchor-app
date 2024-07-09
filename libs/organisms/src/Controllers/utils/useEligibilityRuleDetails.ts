'use client';

import { CONTROLLER_TYPES } from '@hatsprotocol/constants';
import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { useQuery } from '@tanstack/react-query';
import { useWearerDetails } from 'hats-hooks';
import _ from 'lodash';
import { useMemo } from 'react';
import { AppHat, ModuleDetails, ValueOf } from 'types';
import { ModuleDetailsHandler } from 'utils';
import { useAccount } from 'wagmi';

import { DEFAULT_ELIGIBILITY_DETAILS, EligibilityRuleDetails } from './general';
import {
  handleAgreementEligibility,
  handleAllowlistEligibility,
  handleElectionEligibility,
  handleErc20Eligibility,
  handleErc721Eligibility,
  handleErc1155Eligibility,
  handleHatWearingEligibility,
  handleJokeRaceEligibility,
  handlePassthroughModule,
  handleStakingEligibility,
} from './modules';

// TODO Identifying modules based on ID would be more reliable

const eligibilityModule = (name: string) => `${name} Eligibility`;
const ELIGIBILITY_MODULES = {
  agreement: eligibilityModule('Agreement'),
  allowlist: eligibilityModule('Allowlist'),
  election: eligibilityModule('Hats Election'),
  erc20: eligibilityModule('ERC20'),
  erc721: eligibilityModule('ERC721'),
  erc1155: eligibilityModule('ERC1155'),
  hatWearing: eligibilityModule('Hat Wearing'),
  jokerace: eligibilityModule('JokeRace'),
  passthrough: 'Passthrough Module',
  staking: eligibilityModule('Staking'),
};

const ELIGIBILITY_HANDLERS: {
  [key: ValueOf<typeof ELIGIBILITY_MODULES>]: ({
    moduleDetails,
    moduleParameters,
    wearer,
    chainId,
    selectedHat,
    isWearer,
  }: ModuleDetailsHandler) => Promise<EligibilityRuleDetails>;
} = {
  [ELIGIBILITY_MODULES.agreement]: handleAgreementEligibility,
  [ELIGIBILITY_MODULES.allowlist]: handleAllowlistEligibility,
  [ELIGIBILITY_MODULES.election]: handleElectionEligibility,
  [ELIGIBILITY_MODULES.erc20]: handleErc20Eligibility,
  [ELIGIBILITY_MODULES.erc721]: handleErc721Eligibility,
  [ELIGIBILITY_MODULES.erc1155]: handleErc1155Eligibility,
  [ELIGIBILITY_MODULES.hatWearing]: handleHatWearingEligibility,
  [ELIGIBILITY_MODULES.jokerace]: handleJokeRaceEligibility,
  [ELIGIBILITY_MODULES.passthrough]: handlePassthroughModule,
  [ELIGIBILITY_MODULES.staking]: handleStakingEligibility,
};

// TODO identifying modules based on ID would likely be more reliable

const fetchEligibilityRuleDetails = async ({
  moduleDetails,
  moduleParameters,
  wearer,
  chainId,
  selectedHat,
  isWearer,
}: ModuleDetailsHandler) => {
  if (!moduleDetails || !moduleParameters) {
    // TODO check dynamic eligibility status
    return Promise.resolve(DEFAULT_ELIGIBILITY_DETAILS({}));
  }

  if (!_.has(ELIGIBILITY_HANDLERS, moduleDetails.name)) {
    // eslint-disable-next-line no-console
    console.error('Unknown eligibility module', moduleDetails);
    return Promise.resolve(DEFAULT_ELIGIBILITY_DETAILS({}));
  }

  return ELIGIBILITY_HANDLERS[moduleDetails.name]({
    moduleDetails,
    moduleParameters,
    chainId,
    wearer,
    selectedHat,
    isWearer,
    moduleType: CONTROLLER_TYPES.eligibility,
  });
};

const useEligibilityRuleDetails = ({
  selectedHat,
  moduleDetails,
  parameters,
  chainId,
}: {
  selectedHat: AppHat | undefined;
  moduleDetails: ModuleDetails | undefined;
  parameters: ModuleParameter[] | undefined;
  chainId: number | undefined;
}) => {
  const { address, status } = useAccount();

  const { data: wearerDetails, fetchStatus: wearerStatus } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });
  const isWearer = useMemo(
    () =>
      !!_.find(_.get(wearerDetails, 'currentHats'), {
        id: selectedHat?.id,
      }),
    [wearerDetails, selectedHat?.id],
  );

  const { data, isLoading, error } = useQuery({
    queryKey: [
      'eligibilityRuleDetails',
      moduleDetails,
      _.map(parameters, (p: ModuleParameter) => _.omit(p, ['value'])),
      selectedHat,
      { address, chainId, isWearer },
    ],
    queryFn: () =>
      fetchEligibilityRuleDetails({
        moduleDetails,
        moduleParameters: parameters,
        wearer: address,
        chainId,
        selectedHat,
        isWearer,
      }),
    enabled:
      !!moduleDetails &&
      !!parameters &&
      !!selectedHat?.id &&
      wearerStatus === 'idle' &&
      (status === 'disconnected' || status === 'connected'),
  });

  return { data, isLoading, error };
};

export default useEligibilityRuleDetails;
