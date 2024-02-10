import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Progress,
  Stack,
  Tag,
  Text,
  VStack,
} from '@chakra-ui/react';
import { explorerUrl } from 'app-utils';
import { useEligibility } from 'contexts';
import _ from 'lodash';
import { useMemo } from 'react';
import { BsFileCode } from 'react-icons/bs';
import { FaExternalLinkAlt } from 'react-icons/fa';

import { ChakraNextLink } from '../atoms';

const ProposalDetails = ({ proposal }: { proposal: any }) => {
  const { chainId, moduleDetails } = useEligibility();

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

  const hasProposalEnded = proposal && proposal.end * 1000 < Date.now();

  const voteResults = useMemo(() => {
    if (!proposal) return [];
    const totalVotes = proposal.scores_total;
    return proposal.choices.map((choice: string, index: number) => {
      const votes = proposal.scores[index];
      const percentage =
        totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(2) : 0;
      return { choice, votes, percentage };
    });
  }, [proposal]);

  return (
    <Stack spacing={4}>
      <Box>
        <Tag borderRadius={0} size='sm'>
          {proposal.state.toUpperCase()}
        </Tag>
      </Box>
      <HStack gap={6} align='start' w='full'>
        <VStack spacing={4} align='start' flex='1'>
          <Heading size='lg'>{proposal.title}</Heading>
          <Text noOfLines={[3, 5]} size='sm'>
            {proposal.body}
          </Text>
        </VStack>
        <VStack align='start' flex='1' fontSize='sm'>
          <HStack justify='space-between' w='full'>
            <Heading size='sm'>About</Heading>
            {moduleDetails && (
              <ChakraNextLink
                href={`${explorerUrl(chainId)}/address/${
                  moduleDetails?.implementationAddress
                }`}
                isExternal
              >
                <HStack gap={1}>
                  <Icon as={BsFileCode} w={4} h={4} color='teal' />
                  <Text color='teal' fontSize='sm'>
                    Election
                  </Text>
                </HStack>
              </ChakraNextLink>
            )}
          </HStack>
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

      {!_.isEmpty(voteResults) && (
        <VStack spacing={2} align='stretch'>
          <Heading size='sm'>Current Results</Heading>

          {_.map(voteResults, (result: any) => (
            <Stack key={result.choice} width='100%' gap={1}>
              <HStack justify='space-between' w='full'>
                <Text>{result.choice}</Text>
                <Text
                  color='gray.500'
                  fontSize='sm'
                  fontWeight='medium'
                  textAlign='right'
                >
                  {result.votes} VOTES ({result.percentage}%)
                </Text>
              </HStack>
              <Progress
                colorScheme='blue'
                borderRadius={4}
                size='sm'
                value={Number(result.percentage)}
              />
            </Stack>
          ))}
        </VStack>
      )}

      {!hasProposalEnded && (
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
      )}
    </Stack>
  );
};

export default ProposalDetails;
