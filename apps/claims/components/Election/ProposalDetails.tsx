import {
  Box,
  Button,
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
          <Heading size='md'>{proposal.title}</Heading>
          <Text noOfLines={[3, 5]}>{proposal.body}</Text>
        </VStack>
        <VStack spacing={4} align='start' flex='1' fontSize='sm'>
          <Text fontWeight='bold'>About</Text>
          <HStack justifyContent='space-between' width='100%'>
            <Text>Strategies:</Text>
            <Text fontWeight='bold' textAlign='right'>
              {proposal.strategies.length === 1
                ? '1 strategy'
                : `${proposal.strategies.length} strategies`}
            </Text>
          </HStack>
          <HStack justifyContent='space-between' width='100%'>
            <Text>Voting system:</Text>
            <Text fontWeight='bold' textAlign='right'>
              Ranked Choice
            </Text>
          </HStack>
          <HStack justifyContent='space-between' width='100%'>
            <Text>Started:</Text>
            <Text fontWeight='bold' textAlign='right'>
              {new Date(proposal.start * 1000).toLocaleString()}
            </Text>
          </HStack>
          <HStack justifyContent='space-between' width='100%'>
            <Text>Ends:</Text>
            <Text fontWeight='bold' textAlign='right'>
              {new Date(proposal.end * 1000).toLocaleString()}
            </Text>
          </HStack>
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
