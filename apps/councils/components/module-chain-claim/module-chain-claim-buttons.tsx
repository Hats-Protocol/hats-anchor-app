'use client';

import { Button, HStack, Icon, Stack, Text } from '@chakra-ui/react';
import { useEligibility } from 'contexts';
import { first, get, map, pick } from 'lodash';
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

const WrapperButton = ({
  rule,
  activeRule,
  setActiveRule,
  isEligible,
  customYesNo,
  isReadyToClaim,
  children,
}: WrapperButtonProps) => {
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
          isReadyToClaim={isReadyToClaim}
          customYesNo={customYesNo}
        />
      </Stack>
    </Button>
  );
};

interface WrapperButtonProps {
  rule: EligibilityRule;
  activeRule: EligibilityRule | undefined;
  setActiveRule: (rule: EligibilityRule | undefined) => void;
  isEligible: boolean | undefined;
  customYesNo?: { yes: string; no: string };
  isReadyToClaim?: boolean;
  children: React.ReactNode;
}

const ModuleChainClaimButton = ({
  rule,
  activeRule,
  setActiveRule,
  isReadyToClaim,
  // TODO pass through module labels
}: ModuleChainClaimButtonProps) => {
  const { currentEligibility } = useEligibility();
  const isEligible =
    get(currentEligibility, `[${rule.address}].eligible`) &&
    get(currentEligibility, `[${rule.address}].goodStanding`);

  if (rule.address === selectionModule) {
    return (
      <WrapperButton
        rule={rule}
        activeRule={activeRule}
        setActiveRule={setActiveRule}
        isEligible={isEligible}
      >
        Appointed
      </WrapperButton>
    );
  }

  if (rule.address === criteriaModule) {
    return (
      <WrapperButton
        rule={rule}
        activeRule={activeRule}
        setActiveRule={setActiveRule}
        isEligible={isEligible}
      >
        Compliant
      </WrapperButton>
    );
  }

  const shortName = first(get(rule, 'module.name').split(' Eligibility'));

  return (
    <WrapperButton
      rule={rule}
      activeRule={activeRule}
      setActiveRule={setActiveRule}
      isEligible={isEligible}
      isReadyToClaim={isReadyToClaim}
    >
      {shortName}
    </WrapperButton>
  );
};

interface ModuleChainClaimButtonProps {
  rule: EligibilityRule;
  activeRule: EligibilityRule | undefined;
  setActiveRule: (rule: EligibilityRule | undefined) => void;
  isReadyToClaim: boolean;
}

const ModuleChainClaimButtons = ({
  eligibilityRules,
  activeRule,
  setActiveRule,
  isReadyToClaim,
}: ModuleChainClaimButtonsProps) => {
  return (
    <div className='flex gap-2'>
      {map(eligibilityRules, (rule) => (
        <ModuleChainClaimButton
          key={`${rule.module.id}-${rule.address}`}
          rule={rule}
          activeRule={activeRule}
          setActiveRule={setActiveRule}
          isReadyToClaim={get(isReadyToClaim, rule.address, false)}
        />
      ))}
    </div>
  );
};

interface ModuleChainClaimButtonsProps {
  eligibilityRules: EligibilityRule[];
  activeRule: EligibilityRule | undefined;
  setActiveRule: (rule: EligibilityRule | undefined) => void;
  isReadyToClaim: { [key: string]: boolean } | undefined;
}

export default ModuleChainClaimButtons;
