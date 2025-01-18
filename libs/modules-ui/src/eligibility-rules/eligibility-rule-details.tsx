'use client';

import { Button, Flex, HStack, Icon, Skeleton, Text } from '@chakra-ui/react';
import { useOverlay } from 'contexts';
import dynamic from 'next/dynamic';
import { ReactNode } from 'react';
import { useAccount } from 'wagmi';

import { ELIGIBILITY_STATUS, EligibilityRuleDetailsProps, TOGGLE_STATUS } from './utils';

const Link = dynamic(() => import('ui').then((mod) => mod.Link));

const IS_CLAIMS_APP = process.env.NEXT_PUBLIC_CLAIMS_APP === 'true';

const EligibilityRuleWrapper = ({ rule, children }: { rule: ReactNode; children: ReactNode }) => {
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

  let statusColor = 'red.500';
  if (status === ELIGIBILITY_STATUS.expiring) {
    statusColor = 'orange.500';
  } else if (
    status === ELIGIBILITY_STATUS.eligible ||
    status === ELIGIBILITY_STATUS.pending ||
    status === TOGGLE_STATUS.active
  ) {
    statusColor = 'green.500';
  }

  // TODO handle tooltip on displayStatus

  if (displayStatusLink) {
    return (
      <EligibilityRuleWrapper rule={rule}>
        <Link href={displayStatusLink}>
          <HStack spacing={1}>
            <Text>{displayStatus}</Text>
            <Icon as={icon} boxSize={{ base: '14px', md: 4 }} />
          </HStack>
        </Link>
      </EligibilityRuleWrapper>
    );
  }

  if (address) {
    return (
      <EligibilityRuleWrapper rule={rule}>
        <HStack spacing={1} color={statusColor}>
          <Text>{displayStatus}</Text>
          <Icon as={icon as any} boxSize={{ base: '14px', md: 4 }} />
        </HStack>
      </EligibilityRuleWrapper>
    );
  }

  if (IS_CLAIMS_APP) {
    return (
      <EligibilityRuleWrapper rule={rule}>
        <HStack spacing={1} color={statusColor}>
          <Text>{displayStatus}</Text>
          <Icon as={icon as any} boxSize={{ base: '14px', md: 4 }} />
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
