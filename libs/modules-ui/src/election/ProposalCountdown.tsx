import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useEligibility } from 'contexts';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { BsFileCode } from 'react-icons/bs';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { explorerUrl } from 'utils';

const ChakraNextLink = dynamic(() =>
  import('ui').then((mod) => mod.ChakraNextLink),
);

interface TimeUntilStart {
  days: number;
  hours: number;
  minutes: number;
}

interface ProposalCountdownProps {
  start: number;
  title: string;
  proposalId: string;
  spaceId: string;
}

const ProposalCountdown: React.FC<ProposalCountdownProps> = ({
  start,
  title,
  proposalId,
  spaceId,
}) => {
  const [timeUntilStart, setTimeUntilStart] = useState<TimeUntilStart>();
  const { chainId, moduleDetails } = useEligibility();

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const startTime = new Date(start * 1000);
      const timeLeft = startTime.getTime() - now.getTime();
      if (timeLeft < 0) {
        return;
      }
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

      setTimeUntilStart({ days, hours, minutes });
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 5000);

    return () => clearInterval(intervalId);
  }, [start]);

  return (
    <VStack spacing={4}>
      <Flex justify='space-between' w='full'>
        <Stack>
          <Badge textTransform='uppercase'>Upcoming</Badge>
          <Heading size='md'>{title}</Heading>
        </Stack>
        {moduleDetails && (
          <ChakraNextLink
            href={`${explorerUrl(chainId)}/address/${
              moduleDetails?.implementationAddress
            }`}
            isExternal
          >
            <HStack gap={1}>
              <Icon as={BsFileCode} w={4} h={4} color='teal' />
              <Text color='teal' size='sm'>
                Election
              </Text>
            </HStack>
          </ChakraNextLink>
        )}
      </Flex>
      <Grid templateColumns='repeat(3, 1fr)' gap={4}>
        {timeUntilStart &&
          _.map(timeUntilStart, (value, unit) => (
            <VStack key={unit} gap={1}>
              <Box
                border='1px solid'
                borderColor='gray.200'
                px={3}
                py={4}
                borderRadius='md'
              >
                <Text size='4xl'>{value}</Text>
              </Box>
              <Text size='sm'>{unit}</Text>
            </VStack>
          ))}
      </Grid>
      <Button
        as='a'
        href={`https://snapshot.org/#/${spaceId}/proposal/${proposalId}`}
        target='_blank'
        borderColor='blackAlpha.300'
        variant='outline'
        size='sm'
        rightIcon={<Icon as={FaExternalLinkAlt} w='12px' />}
      >
        Preview on Snapshot
      </Button>
    </VStack>
  );
};

export default ProposalCountdown;
