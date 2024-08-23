'use client';

import { Box, Flex, Icon, Text, Tooltip } from '@chakra-ui/react';
import { hatIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { formatDistanceToNow } from 'date-fns';
import { find, get, toNumber } from 'lodash';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { BsInfoCircle } from 'react-icons/bs';
import { ModuleDetailRole, ModuleDetails, SupportedChains } from 'types';
import { formatAddress, formatDate, jokeRaceUrl } from 'utils';

const CodeIcon = dynamic(() => import('icons').then((m) => m.CodeIcon));
const InlineHatCard = dynamic(() =>
  import('molecules').then((mod) => mod.InlineHatCard),
);

const JOKE_RACE_ROLE: { [key: string]: ModuleDetailRole } = {
  admin: {
    param: 'Module Admin Hat ID', // param.label
    label: 'Term setting Hat',
    tooltip:
      'The hat that can slash stakers that have not completed their terms',
  },
};

const JOKE_RACE_PARAMS = {
  topK: {
    param: 'Number Of Elected Hat Wearers', // param.label
    label: 'Qualifying condition',
    tooltip:
      'The number of wearers that will be elected from the result of the contest',
  },
  contest: {
    param: 'Contest Address', // param.label
    label: 'Contest Address',
    tooltip:
      'The specific contest that will be used to determine the elected wearers',
  },
  termEnd: {
    param: 'Term End', // param.label
    label: 'Term End',
    tooltip: 'The end of the current term set for the contest',
  },
};

// TODO [md] handle indexed electees

export const JokeRaceEligibilityDetails = (
  moduleInfo: ModuleDetails,
  chainId: SupportedChains,
) => {
  const params = get(moduleInfo, 'liveParameters');
  if (!params) return undefined;

  // Admin Hat
  const adminValue = get(
    find(params, { label: JOKE_RACE_ROLE.admin.param }),
    'value',
  ) as bigint;

  // if (!adminValue) return null;

  const topK = get(
    find(params, { label: JOKE_RACE_PARAMS.topK.param }),
    'value',
  ) as bigint;
  const contest = get(
    find(params, { label: JOKE_RACE_PARAMS.contest.param }),
    'value',
  ) as string;

  const termEnd = get(
    find(params, { label: JOKE_RACE_PARAMS.termEnd.param }),
    'value',
  ) as bigint;
  const termEndDate = new Date(toNumber(termEnd.toString()) * 1000);
  const termEndLong = formatDate(termEndDate);
  const termEndText = formatDistanceToNow(termEndDate);

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex justify-between'>
        <div className='flex gap-2 items-center'>
          <div>{JOKE_RACE_ROLE.admin.label}</div>

          <Tooltip label={JOKE_RACE_ROLE.admin.tooltip} placement='top'>
            <Box as='span' boxSize={4} position='relative'>
              <Icon as={BsInfoCircle} position='absolute' />
            </Box>
          </Tooltip>
        </div>

        <InlineHatCard
          hatId={hatIdDecimalToHex(adminValue)}
          chainId={chainId}
        />
      </div>

      <div className='flex justify-between'>
        <div className='flex gap-2 items-center'>
          <div>{JOKE_RACE_PARAMS.topK.label}</div>

          <Tooltip label={JOKE_RACE_PARAMS.topK.tooltip} placement='top'>
            <Box as='span' boxSize={4} position='relative'>
              <Icon as={BsInfoCircle} position='absolute' />
            </Box>
          </Tooltip>
        </div>

        <div>Top {topK.toString()}</div>
      </div>

      <div className='flex  justify-between'>
        <div className='flex gap-2 items-center'>
          <div>{JOKE_RACE_PARAMS.contest.label}</div>

          <Tooltip label={JOKE_RACE_PARAMS.contest.tooltip} placement='top'>
            <Box as='span' boxSize={4} position='relative'>
              <Icon as={BsInfoCircle} position='absolute' />
            </Box>
          </Tooltip>
        </div>

        <Link href={jokeRaceUrl({ chainId, address: contest })}>
          <Flex gap={1} color='Informative-Code' alignItems='center'>
            <Text>{formatAddress(contest)}</Text>
            <Icon as={CodeIcon} />
          </Flex>
        </Link>
      </div>

      <div className='flex  justify-between'>
        <div className='flex gap-2 items-center'>
          <div>
            {JOKE_RACE_PARAMS.termEnd.label}
            {new Date() > termEndDate ? 'ed' : 's'}
          </div>

          <Tooltip label={JOKE_RACE_PARAMS.termEnd.tooltip} placement='top'>
            <Box as='span' boxSize={4} position='relative'>
              <Icon as={BsInfoCircle} position='absolute' />
            </Box>
          </Tooltip>
        </div>

        <Tooltip label={termEndLong} placement='top'>
          <Box>
            {termEndText} {new Date() > termEndDate ? 'ago' : 'from now'}
          </Box>
        </Tooltip>
      </div>
    </div>
  );
};
