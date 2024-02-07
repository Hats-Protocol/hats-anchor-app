import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Spinner,
  Stack,
  Tag,
  Text,
  VStack,
} from '@chakra-ui/react';
import { PROPOSALS } from '@hatsprotocol/constants';
import { useProposalDetails } from 'app-hooks';
import _ from 'lodash';
import { useMemo } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { idToIp } from 'shared';
import { useChainId } from 'wagmi';

import { useEligibility } from '../../contexts/EligibilityContext';

const ProposalDetails = () => {
  const { selectedHat, chainId } = useEligibility();
  const currentChainId = useChainId();

  // TODO handle election term end
  // Assuming the structure of PROPOSALS is corrected as needed
  const proposalId =
    chainId &&
    PROPOSALS?.[chainId]?.[idToIp(selectedHat?.id)]?.[107187481]?.elect;
  const { data: proposal, isLoading, error } = useProposalDetails(proposalId);

  const proposalDetails = useMemo(() => {
    if (!proposal) return [];
    return [
      {
        label: 'Strategies:',
        value:
          proposal.strategies.length === 1
            ? '1 strategy'
            : `${proposal.strategies.length} strategies`,
      },
      {
        label: 'Voting system:',
        value: 'Ranked Choice',
      },
      {
        label: 'Started:',
        value: new Date(proposal.start * 1000).toLocaleString(),
      },
      {
        label: 'Ends:',
        value: new Date(proposal.end * 1000).toLocaleString(),
      },
    ];
  }, [proposal]);

  if (isLoading) return <Spinner />;
  if (error || !proposal) return <Text>Failed to load proposal details.</Text>;

  return (
    <Stack spacing={4}>
      <Box>
        <Tag borderRadius={0} size='sm'>
          {proposal.state.toUpperCase()}
        </Tag>
      </Box>
      <HStack gap={6} align='start'>
        <VStack spacing={4} align='start' flex='1'>
          <Heading size='lg'>{proposal.title}</Heading>
          <Text noOfLines={[3, 5]} size='sm'>
            {proposal.body}
          </Text>
        </VStack>
        <VStack align='start' flex='1' fontSize='sm'>
          <Heading size='sm'>About</Heading>

          {_.map(_.compact(proposalDetails), (detail: any) => (
            <Flex
              justifyContent='space-between'
              width='100%'
              gap={1}
              key={detail.label}
            >
              <Text size='sm'>{detail.label}</Text>
              <Text size='sm' variant='medium'>
                {detail.value}
              </Text>
            </Flex>
          ))}
        </VStack>
      </HStack>
      <Box alignSelf='center'>
        <Button
          as='a'
          href={`https://snapshot.org/#/${proposal.space.id}/proposal/${proposal.id}`}
          target='_blank'
          colorScheme='blue'
          size='sm'
          rightIcon={<Icon as={FaExternalLinkAlt} w='12px' />}
        >
          Vote now on Snapshot
        </Button>
      </Box>
    </Stack>
  );
};

export default ProposalDetails;
