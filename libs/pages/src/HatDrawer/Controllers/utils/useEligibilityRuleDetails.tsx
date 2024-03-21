import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { ModuleDetails } from 'types';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

import {
  DEFAULT_ELIGIBILITY_DETAILS,
  TOKEN_PARAM_DISPLAY_TYPES,
} from './general';
import {
  handleErc20Eligibility,
  handleErc721Eligibility,
  handleErc1155Eligibility,
  handleHatWearingEligibility,
} from './modules';

// TODO identifying modules based on ID would be more reliable

const fetchEligibilityRuleDetails = async (
  moduleDetails: ModuleDetails,
  moduleParameters: ModuleParameter[],
  wearer: Hex,
  chainId: number,
) => {
  // check for token types, to fetch additional details
  const tokenDisplayTypes = _.values(TOKEN_PARAM_DISPLAY_TYPES);
  const tokenParam = _.find(moduleParameters, (p: ModuleParameter) =>
    _.includes(tokenDisplayTypes, p.displayType),
  );
  // fetch token details
  if (tokenParam) {
    // ERC20
    if (
      moduleDetails.name.includes(_.toUpper(TOKEN_PARAM_DISPLAY_TYPES.erc20))
    ) {
      return handleErc20Eligibility({
        tokenParam,
        moduleParameters,
        wearer,
        chainId,
      });
    }
    // ERC721
    if (
      moduleDetails.name.includes(_.toUpper(TOKEN_PARAM_DISPLAY_TYPES.erc721))
    ) {
      return handleErc721Eligibility({
        tokenParam,
        moduleParameters,
        wearer,
        chainId,
      });
    }
    // ERC1155
    if (
      moduleDetails.name.includes(_.toUpper(TOKEN_PARAM_DISPLAY_TYPES.erc1155))
    ) {
      return handleErc1155Eligibility({
        tokenParam,
        moduleParameters,
        wearer,
        chainId,
      });
    }
  }
  // HAT WEARING
  if (moduleDetails.name.includes('Hat Wearing')) {
    return handleHatWearingEligibility({
      moduleParameters,
      wearer,
      chainId,
    });
  }
  // STAKING
  // ELECTION
  // ALLOWLIST
  // JOKERACE
  // AGREEMENT

  return DEFAULT_ELIGIBILITY_DETAILS;
};

const useEligibilityRuleDetails = ({
  moduleDetails,
  parameters,
  chainId,
}: {
  moduleDetails: ModuleDetails;
  parameters: ModuleParameter[];
  chainId: number;
}) => {
  const { address, status } = useAccount();
  const { data, isLoading, error } = useQuery({
    queryKey: [
      'eligibilityRuleDetails',
      moduleDetails,
      _.map(parameters, (p: ModuleParameter) => _.omit(p, ['value'])),
      address,
      chainId,
    ],
    queryFn: () =>
      fetchEligibilityRuleDetails(moduleDetails, parameters, address, chainId),
    enabled:
      !!moduleDetails &&
      !!parameters &&
      (status === 'disconnected' || status === 'connected'),
  });

  return { data, isLoading, error };
};

export default useEligibilityRuleDetails;
