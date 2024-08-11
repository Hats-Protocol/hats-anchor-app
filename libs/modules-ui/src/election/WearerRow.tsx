'use client';

import { Flex, Icon, Text } from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { useEligibility } from 'contexts';
import _ from 'lodash';
import { useModuleDetails } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { BsFileCode } from 'react-icons/bs';
import { FaUser } from 'react-icons/fa';
import { HatWearer } from 'types';
import { formatAddress, isSameAddress } from 'utils';
import { useAccount } from 'wagmi';

const HatIcon = dynamic(() => import('icons').then((i) => i.HatIcon));

const WearerRow = ({ wearer }: WearerRowProps) => {
  const { address } = useAccount();
  const { chainId } = useEligibility();

  const { details: moduleDetails } = useModuleDetails({
    address: wearer.id,
    chainId,
    enabled: wearer.isContract,
  });

  let icon = <Icon as={FaUser} color='gray.500' />;
  if (isSameAddress(wearer.id, address)) {
    icon = <Icon as={HatIcon} color='gray.500' />;
  } else if (wearer.isContract) {
    icon = <Icon as={BsFileCode} color='gray.500' />;
  }

  // could look up by Id to be more resilient?
  let moduleName = _.get(moduleDetails, 'name');
  if (moduleName === CONFIG.modules.claimsHatter) {
    moduleName = 'Autonomous Admin';
  }

  return (
    <Flex key={wearer.id} justifyContent='space-between' alignItems='center'>
      <Flex
        alignItems='center'
        gap={2}
        backgroundColor={
          isSameAddress(wearer.id, address) ? 'green.100' : 'transparent'
        }
      >
        {icon}

        <Text>
          {_.get(wearer, 'ensName') ||
            moduleName ||
            formatAddress(_.get(wearer, 'id'))}
        </Text>
      </Flex>
    </Flex>
  );
};

export default WearerRow;

interface WearerRowProps {
  wearer: HatWearer;
}
