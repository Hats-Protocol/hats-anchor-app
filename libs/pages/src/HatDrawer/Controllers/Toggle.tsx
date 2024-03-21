import { Flex, HStack, Icon, Skeleton, Text } from '@chakra-ui/react';
import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { useQuery } from '@tanstack/react-query';
import { useSelectedHat } from 'contexts';
import { useModuleDetails } from 'hats-hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { formatAddress } from 'utils';

import ControllerWearer from './ControllerWearer';

const WearerIcon = dynamic(() => import('icons').then((i) => i.WearerIcon));
const HatIcon = dynamic(() => import('icons').then((i) => i.HatIcon));

const DEFAULT_TOGGLE_RULE_DETAILS = {
  rule: 'One address can deactivate this Hat',
  status: 'Ineligible',
  icon: WearerIcon,
};

const fetchToggleRuleDetails = async (
  moduleDetails: any,
  parameters: ModuleParameter[],
  chainId: number,
) => {
  // TODO
  return DEFAULT_TOGGLE_RULE_DETAILS;
};

const Toggle = () => {
  const { selectedHat, chainId } = useSelectedHat();

  const { extendedToggle: toggleData } = _.pick(selectedHat, [
    'extendedToggle',
  ]);
  const { details: moduleDetails, parameters } = useModuleDetails({
    address: toggleData?.id,
    chainId,
    enabled: toggleData?.isContract, // ? is this reliable enough?
  });
  const isHatsAccount = false; // TODO enable with Hat ID reverse lookup (~2.9)

  const name = toggleData?.ensName || formatAddress(toggleData?.id);

  const { data: toggleRuleDetails, isLoading: loadingToggleRules } = useQuery({
    queryKey: [
      'toggleRuleDetails',
      moduleDetails,
      _.map(parameters, (p: ModuleParameter) => _.omit(p, ['value'])),
      chainId,
    ],
    queryFn: () => fetchToggleRuleDetails(moduleDetails, parameters, chainId),
    enabled: !!moduleDetails && !!parameters && !!chainId,
  });

  if (moduleDetails && toggleRuleDetails) {
    return (
      <Flex justify='space-between' py={1}>
        <Text>{toggleRuleDetails?.rule}</Text>

        <HStack
          spacing={1}
          color={
            toggleRuleDetails?.status?.includes('days left')
              ? 'green.600'
              : 'gray.600'
          }
        >
          <Text as='span'>{toggleRuleDetails?.status}</Text>
          <Icon as={toggleRuleDetails?.icon} />
        </HStack>
      </Flex>
    );
  }

  if (isHatsAccount) {
    return (
      <Flex justify='space-between' py={1}>
        <Text>Another Hat can remove wearers</Text>
        <HStack spacing={1}>
          <Text as='span'>Hat ID</Text>
          <Icon as={HatIcon} />
        </HStack>
      </Flex>
    );
  }

  return (
    <Skeleton isLoaded={!loadingToggleRules || !moduleDetails}>
      <Flex justify='space-between' py={1}>
        <Text>One address can deactivate this Hat</Text>

        <ControllerWearer
          address={toggleData?.id}
          isContract={toggleData?.isContract}
          name={name}
        />
      </Flex>
    </Skeleton>
  );
};

export default Toggle;
