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
import { ComponentType, ReactNode, SVGProps } from 'react';
import { IconType } from 'react-icons';
import { ChakraNextLink } from 'ui';
import { useAccount } from 'wagmi';

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

const EligibilityRule = ({
  rule,
  status,
  displayStatus,
  displayStatusLink,
  icon,
}: EligibilityRuleProps) => {
  const { setModals } = useOverlay();
  const { address } = useAccount();

  if (displayStatusLink) {
    return (
      <EligibilityRuleWrapper rule={rule}>
        <ChakraNextLink href={displayStatusLink}>
          <HStack spacing={1}>
            <Text fontSize={{ base: 'sm', md: 'md' }}>{displayStatus}</Text>
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
          color={status === 'eligible' ? 'green.600' : 'gray.600'}
        >
          <Text fontSize={{ base: 'sm', md: 'md' }}>{displayStatus}</Text>
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

interface EligibilityRuleProps {
  rule: ReactNode | undefined;
  status: string | undefined;
  displayStatus: string | undefined;
  displayStatusLink?: string | undefined;
  icon:
    | ComponentType<MergeWithAs<SVGProps<SVGSVGElement>, object, IconProps, As>>
    | IconType
    | undefined;
}

export default EligibilityRule;
