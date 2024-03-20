import { Flex, HStack, Icon, Skeleton, Text, Tooltip } from '@chakra-ui/react';
import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { useQuery } from '@tanstack/react-query';
import { useSelectedHat } from 'contexts';
import { useModuleDetails } from 'hats-hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import { BsCheckSquareFill } from 'react-icons/bs';
import { ModuleDetails } from 'types';
import { formatAddress } from 'utils';
import { formatUnits, Hex } from 'viem';
import { useAccount } from 'wagmi';
import { fetchBalance, fetchToken } from 'wagmi/actions';

import ControllerWearer from './ControllerWearer';

const ELIGIBILITY_STATUS = {
  eligible: 'eligible',
  ineligible: 'ineligible',
};

const HatIcon = dynamic(() => import('icons').then((i) => i.HatIcon));
const RemovedWearer = dynamic(() =>
  import('icons').then((i) => i.RemovedWearer),
);

type EligibilityRuleDetails = {
  rule: JSX.Element;
  displayStatus: string;
  status: string;
  icon: ComponentType<object>;
};

const DEFAULT_ELIGIBILITY_DETAILS: EligibilityRuleDetails = {
  rule: <Text>Comply with 1 rule to keep this Hat</Text>,
  status: 'ineligible',
  displayStatus: 'Ineligible',
  icon: RemovedWearer,
};

const TOKEN_PARAM_DISPLAY_TYPES = {
  erc20: 'erc20',
  erc721: 'erc721',
  erc1155: 'erc1155',
};

const handleErc20Eligibility = async ({
  tokenParam,
  moduleParameters,
  wearer,
  chainId,
}: {
  tokenParam: ModuleParameter;
  moduleParameters: ModuleParameter[];
  wearer: Hex;
  chainId: number;
}) => {
  const tokenDetails = await fetchToken({
    address: tokenParam.value as Hex,
    chainId,
  });
  const userBalance = await fetchBalance({
    address: wearer,
    token: tokenParam.value as Hex,
    chainId,
  });
  const amountParameter = _.find(moduleParameters, [
    'displayType',
    'amountWithDecimals',
  ]);
  const userBalanceDisplay = formatUnits(
    userBalance?.value || BigInt(0),
    tokenDetails?.decimals,
  );
  // calculate eligibility
  if (userBalance.value >= amountParameter?.value) {
    return {
      rule: (
        <Text>
          Retain at least{' '}
          {formatUnits(
            amountParameter?.value || BigInt(0),
            tokenDetails?.decimals,
          )}{' '}
          <Tooltip label={tokenDetails?.name}>
            <Text as='span' variant='cashtag'>
              ${tokenDetails?.symbol}
            </Text>
          </Tooltip>
        </Text>
      ),
      displayStatus: userBalanceDisplay,
      status: ELIGIBILITY_STATUS.eligible,
      icon: BsCheckSquareFill,
    };
  }

  return {
    rule: (
      <Text>
        Hold at least {formatUnits(amountParameter?.value || 0, 18)}{' '}
        <Tooltip label={tokenDetails?.name}>
          <Text as='span' variant='cashtag'>
            ${tokenDetails?.symbol}
          </Text>
        </Tooltip>
      </Text>
    ),
    displayStatus: userBalanceDisplay,
    status: ELIGIBILITY_STATUS.ineligible,
    icon: RemovedWearer,
  };
};

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
  console.log(tokenParam);
  // fetch token details
  if (tokenParam) {
    console.log('fetch token details');
    // ERC20
    if (
      moduleDetails.name.includes(_.toUpper(TOKEN_PARAM_DISPLAY_TYPES.erc20))
    ) {
      console.log('fetch erc20 details');
      return handleErc20Eligibility({
        tokenParam,
        moduleParameters,
        wearer,
        chainId,
      });
    }
    // ERC721
    // ERC1155
  }
  // HAT WEARING
  // STAKING
  // ELECTION
  // ALLOWLIST
  // JOKERACE
  // AGREEMENT

  return DEFAULT_ELIGIBILITY_DETAILS;
};

const Eligibility = () => {
  const { selectedHat, chainId } = useSelectedHat();
  const { address, status } = useAccount();
  const { extendedEligibility: eligibilityData } = _.pick(selectedHat, [
    'extendedEligibility',
  ]);
  const { details: moduleDetails, parameters } = useModuleDetails({
    address: eligibilityData?.id,
    chainId,
    enabled: eligibilityData?.isContract, // ? is this reliable enough?
  });
  const multipleModules = false; // TODO enable with multiple modules (~2.8)
  const isHatsAccount = false; // TODO enable with Hat ID reverse lookup (~2.9)

  const name = eligibilityData?.ensName || formatAddress(eligibilityData?.id);

  const { data: eligibilityRuleDetails, isLoading: loadingEligibilityRules } =
    useQuery({
      queryKey: [
        'eligibilityRuleDetails',
        moduleDetails,
        _.map(parameters, (p: ModuleParameter) => _.omit(p, ['value'])),
        address,
        chainId,
      ],
      queryFn: () =>
        fetchEligibilityRuleDetails(
          moduleDetails,
          parameters,
          address,
          chainId,
        ),
      enabled:
        !!moduleDetails &&
        !!parameters &&
        (status === 'disconnected' || status === 'connected'),
    });

  if (multipleModules) {
    // * shouldn't be hitting this flow
    return (
      <Flex justify='space-between' py={1}>
        <Text>Comply with 2 rules to keep this Hat</Text>
      </Flex>
    );
  }

  if (moduleDetails && eligibilityRuleDetails) {
    return (
      <Flex justify='space-between' py={1}>
        <Text>{eligibilityRuleDetails?.rule}</Text>

        <HStack
          spacing={1}
          color={
            eligibilityRuleDetails?.status === 'eligible'
              ? 'green.600'
              : 'gray.600'
          }
        >
          <Text>{eligibilityRuleDetails?.displayStatus}</Text>
          <Icon as={eligibilityRuleDetails?.icon} />
        </HStack>
      </Flex>
    );
  }

  if (isHatsAccount) {
    // * shouldn't be hitting this flow
    return (
      <Flex justify='space-between' py={1}>
        <Text>Another Hat can remove wearers</Text>
        <HStack spacing={1}>
          <Text>Hat ID</Text>
          <Icon as={HatIcon} />
        </HStack>
      </Flex>
    );
  }

  return (
    <Skeleton isLoaded={!loadingEligibilityRules || !moduleDetails}>
      <Flex justify='space-between' py={2}>
        <Text>One address can remove Wearers</Text>

        <ControllerWearer address={eligibilityData.id} name={name} />
      </Flex>
    </Skeleton>
  );
};

export default Eligibility;
