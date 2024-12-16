'use client';

import { Button, HStack, Icon, Stack, Text } from '@chakra-ui/react';
import { useEligibility } from 'contexts';
import { first, flatten, get, map, pick } from 'lodash';
import { ReactNode } from 'react';
import {
  BsCheckSquare,
  BsCheckSquareFill,
  BsFillXOctagonFill,
} from 'react-icons/bs';
import { EligibilityRule } from 'types';

// TODO hardcode
const selectionModule = '0x8250a44405C4068430D3B3737721D47bB614E7D2';
const criteriaModule = '0x03aB59ff1Ab959F2663C38408dD2578D149e4cd5';

const EligibilityStatus = ({
  isReadyToClaim,
  isEligible,
  customYesNo,
}: {
  isReadyToClaim: boolean | undefined;
  isEligible: boolean | undefined;
  customYesNo?: { yes: string; no: string };
}) => {
  const { yes, no } = pick(customYesNo, ['yes', 'no']);

  if (isEligible) {
    return (
      <HStack spacing={1}>
        <Icon as={BsCheckSquareFill} color='green.500' />

        <Text color='green.500'>{yes || 'Yes'}</Text>
      </HStack>
    );
  }

  if (isReadyToClaim) {
    return (
      <HStack spacing={1}>
        <Icon as={BsCheckSquare} color='green.500' />

        <Text color='green.500'>Pending</Text>
      </HStack>
    );
  }

  return (
    <HStack spacing={1}>
      <Icon as={BsFillXOctagonFill} color='red.500' />

      <Text color='red.500'>{no || 'No'}</Text>
    </HStack>
  );
};

const WrapperButton = ({ rule, customYesNo, children }: WrapperButtonProps) => {
  const { currentEligibility, activeRule, setActiveRule, isReadyToClaim } =
    useEligibility();
  const isEligible =
    get(currentEligibility, `[${rule.address}].eligible`) &&
    get(currentEligibility, `[${rule.address}].goodStanding`);

  return (
    <Button
      variant='outline'
      onClick={() => setActiveRule(rule)}
      whiteSpace='normal'
      height='auto'
      blockSize='auto'
      p={4}
      bg={activeRule?.address === rule.address ? 'white' : 'gray.50'}
      border={activeRule?.address === rule.address ? '2px solid' : '1px solid'}
      borderColor={
        activeRule?.address === rule.address ? 'gray.800' : 'gray.300'
      }
      key={rule.address}
    >
      <Stack spacing={1}>
        <Text textAlign='left'>{children}</Text>

        <EligibilityStatus
          isEligible={isEligible}
          isReadyToClaim={get(isReadyToClaim, rule.address, false)}
          customYesNo={customYesNo}
        />
      </Stack>
    </Button>
  );
};

interface WrapperButtonProps {
  rule: EligibilityRule;
  customYesNo?: { yes: string; no: string };
  isReadyToClaim?: boolean;
  children: ReactNode;
}

const ModuleChainClaimButton = ({
  rule,
  // TODO pass through module labels
}: ModuleChainClaimButtonProps) => {
  if (rule.address === selectionModule) {
    return <WrapperButton rule={rule}>Appointed</WrapperButton>;
  }

  if (rule.address === criteriaModule) {
    return <WrapperButton rule={rule}>Compliant</WrapperButton>;
  }

  const shortName = first(get(rule, 'module.name').split(' Eligibility'));

  return <WrapperButton rule={rule}>{shortName}</WrapperButton>;
};

interface ModuleChainClaimButtonProps {
  rule: EligibilityRule;
}

export const ModuleChainClaimButtons = () => {
  const { eligibilityRules } = useEligibility();

  return (
    <div className='flex gap-2'>
      {map(flatten(eligibilityRules), (rule) => (
        <ModuleChainClaimButton
          key={`${rule.module.id}-${rule.address}`}
          rule={rule}
        />
      ))}
    </div>
  );
};
