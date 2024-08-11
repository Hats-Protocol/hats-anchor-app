'use client';

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
import { useEligibility } from 'contexts';
import { useMediaStyles } from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { BsFileCode } from 'react-icons/bs';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { explorerUrl } from 'utils';

const ChakraNextLink = dynamic(() =>
  import('ui').then((mod) => mod.ChakraNextLink),
);

const ProposalDetails = ({ proposal }: { proposal: any }) => {
  const { chainId, moduleDetails } = useEligibility();
  const { isMobile } = useMediaStyles();

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
        // TODO handle different relative time labels
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
    const choices = _.map(proposal.choices, (choice: string, index: number) => {
      const votes = _.toNumber(proposal.scores[index].toFixed(2));
      const percentage =
        totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(2) : 0;
      return { choice, votes, percentage };
    });

    return _.orderBy(choices, ['votes'], ['desc']);
  }, [proposal]);

  const snapshotLink = `https://snapshot.org/#/${proposal.space.id}/proposal/${proposal.id}`;

  return (
    <Stack spacing={4}>
      <Box>
        <Tag borderRadius={0} size='sm' textTransform='uppercase'>
          {proposal.state}
        </Tag>
      </Box>
      <Flex
        gap={6}
        align='start'
        w='full'
        direction={{ base: 'column', md: 'row' }}
      >
        <VStack spacing={4} align='start' flex='1'>
          <ChakraNextLink href={snapshotLink} isExternal>
            <Heading size='lg'>{proposal.title}</Heading>
          </ChakraNextLink>
          <Text noOfLines={[3, 5]} size='sm'>
            {proposal.body}
          </Text>
        </VStack>
        <VStack align='start' flex='1' w={{ base: '100%', md: 'auto' }}>
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
                  <Text color='teal' size='sm'>
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
      </Flex>

      {!_.isEmpty(voteResults) && (
        <VStack spacing={2} align='stretch'>
          <Heading size='sm'>Current Results</Heading>

          {_.map(voteResults, (result: any) => (
            <Stack key={result.choice} width='100%' gap={1}>
              <HStack justify='space-between' w='full'>
                <Text>{result.choice}</Text>
                {!isMobile ? (
                  <Text
                    color='gray.500'
                    fontSize='sm'
                    fontWeight='medium'
                    textAlign='right'
                  >
                    {result.votes} VOTES ({result.percentage}%)
                  </Text>
                ) : (
                  <Text
                    color='gray.500'
                    fontSize='sm'
                    fontWeight='medium'
                    textAlign='right'
                  >
                    {result.percentage}%
                  </Text>
                )}
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

      <Box alignSelf='center'>
        <ChakraNextLink href={snapshotLink}>
          <Button
            colorScheme='blue'
            size='sm'
            rightIcon={<Icon as={FaExternalLinkAlt} w='12px' />}
          >
            {!hasProposalEnded ? 'Vote now' : 'View'} on Snapshot
          </Button>
        </ChakraNextLink>
      </Box>
    </Stack>
  );
};

export default ProposalDetails;
