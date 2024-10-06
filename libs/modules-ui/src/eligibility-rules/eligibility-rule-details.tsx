'use client';

import {
  As,
  Button,
  Flex,
  HStack,
  Icon,
  IconProps,
  MergeWithAs,
  Skeleton,
  Text,
} from '@chakra-ui/react';
import { useOverlay } from 'contexts';
import dynamic from 'next/dynamic';
import { ComponentType, ReactNode, SVGProps } from 'react';
import { IconType } from 'react-icons';
import { useAccount } from 'wagmi';

import {
  ELIGIBILITY_STATUS,
  EligibilityRuleDetailsProps,
  TOGGLE_STATUS,
} from './utils';

const ChakraNextLink = dynamic(() =>
  import('ui').then((mod) => mod.ChakraNextLink),
);

const EligibilityRuleWrapper = ({
  rule,
  children,
}: {
  rule: ReactNode;
  children: ReactNode;
}) => {
  return (
    <Skeleton isLoaded={!!rule} py={2} px={{ base: 4, md: 0 }}>
      <Flex justify='space-between'>
        {rule}

        {children}
      </Flex>
    </Skeleton>
  );
};

export const EligibilityRuleDetails = ({
  rule,
  status,
  displayStatus,
  displayStatusLink,
  icon,
  isReadyToClaim,
}: EligibilityRuleDetailsProps) => {
  const { setModals } = useOverlay();
  const { address } = useAccount();

  if (displayStatusLink) {
    return (
      <EligibilityRuleWrapper rule={rule}>
        <ChakraNextLink href={displayStatusLink}>
          <HStack spacing={1}>
            <Text>{displayStatus}</Text>
            <Icon as={icon} boxSize={{ base: '14px', md: 4 }} />
          </HStack>
        </ChakraNextLink>
      </EligibilityRuleWrapper>
    );
  }

  if (address) {
    return (
      <EligibilityRuleWrapper rule={rule}>
        <HStack
          spacing={1}
          color={
            status === ELIGIBILITY_STATUS.eligible ||
            status === ELIGIBILITY_STATUS.pending ||
            status === TOGGLE_STATUS.active
              ? 'green.600'
              : 'red.600'
          }
        >
          <Text>{displayStatus}</Text>
          <Icon as={icon as As} boxSize={{ base: '14px', md: 4 }} />
        </HStack>
      </EligibilityRuleWrapper>
    );
  }

  return (
    <EligibilityRuleWrapper rule={rule}>
      <Button
        size='xs'
        fontWeight='medium'
        color='blue.500'
        variant='ghost'
        onClick={() => setModals?.({ checkEligibility: true })}
      >
        Check Eligibility
      </Button>
    </EligibilityRuleWrapper>
  );
};
