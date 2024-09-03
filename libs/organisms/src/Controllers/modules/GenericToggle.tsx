'use client';

import { Text } from '@chakra-ui/react';
import { useHatStatus } from 'hats-hooks';
import { BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { SupportedChains } from 'types';
import { ModuleDetailsHandler } from 'utils';

import { TOGGLE_STATUS } from '../utils';
import EligibilityRule from './EligibilityRule';

const GenericToggle = ({
  chainId,
  wearer,
  selectedHat,
}: ModuleDetailsHandler) => {
  const { data: isActive } = useHatStatus({
    selectedHat,
    chainId: chainId as SupportedChains,
  });

  return (
    <EligibilityRule
      rule={
        <Text size={{ base: 'sm', md: 'md' }}>
          Comply with 1 eligibility rule
        </Text>
      }
      status={isActive ? TOGGLE_STATUS.active : TOGGLE_STATUS.inactive}
      displayStatus={isActive ? 'Active' : 'Inactive'}
      icon={isActive ? BsCheckSquareFill : BsFillXOctagonFill}
    />
  );
};

export default GenericToggle;
