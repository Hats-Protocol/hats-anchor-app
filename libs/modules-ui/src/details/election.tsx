'use client';

import { Box, Icon, Tooltip } from '@chakra-ui/react';
import { hatIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { formatDistanceToNow } from 'date-fns';
import { find, get, keys, map, toNumber } from 'lodash';
import dynamic from 'next/dynamic';
import { BsInfoCircle } from 'react-icons/bs';
import { ModuleDetailRole, ModuleDetails, SupportedChains } from 'types';
import { formatDate } from 'utils';

const InlineHatCard = dynamic(() =>
  import('molecules').then((mod) => mod.InlineHatCard),
);

const ELECTION_ROLES: { [key: string]: ModuleDetailRole } = {
  admin: {
    param: 'Admin Hat ID', // param.label
    label: 'Term Setting Hat',
    tooltip: 'The hat that can set the terms for the election',
  },
  ballotBox: {
    param: 'Ballot Box Hat ID',
    label: 'Submitting Results Hat',
    tooltip: 'The hat that submits the results of the election',
  },
};

export const ElectionEligibilityDetails = (
  moduleInfo: ModuleDetails,
  chainId: SupportedChains,
) => {
  const params = get(moduleInfo, 'liveParameters');
  if (!params) return undefined;

  // Current Term
  const currentTermEnd = get(
    find(params, { label: 'Current Term End' }),
    'value',
  ) as bigint;
  const currentTermEndDate = new Date(
    toNumber(currentTermEnd.toString()) * 1000,
  );
  const currentTermEndLong = formatDate(currentTermEndDate);
  const currentTermEndText = formatDistanceToNow(currentTermEndDate);

  // Next term
  const nextTermEnd = get(
    find(params, { label: 'Next Term End' }),
    'value',
  ) as bigint;
  const nextTermSet = nextTermEnd.toString() !== '0';
  const nextTermEndDate = new Date(toNumber(nextTermEnd.toString()) * 1000);
  const nextTermEndLong = formatDate(nextTermEndDate);
  const nextTermEndText = formatDistanceToNow(nextTermEndDate);

  return (
    <div className='flex flex-col gap-2'>
      {map(keys(ELECTION_ROLES), (role: string) => {
        const value = get(
          find(params, { label: ELECTION_ROLES[role].param }),
          'value',
        ) as bigint;

        if (!value) return null;

        return (
          <div className='flex justify-between' key={role}>
            <div className='flex gap-2 items-center'>
              <div>{ELECTION_ROLES[role].label}</div>

              <Tooltip label={ELECTION_ROLES[role].tooltip} placement='top'>
                <Box as='span' boxSize={4} position='relative'>
                  <Icon as={BsInfoCircle} position='absolute' />
                </Box>
              </Tooltip>
            </div>

            <InlineHatCard hatId={hatIdDecimalToHex(value)} chainId={chainId} />
          </div>
        );
      })}

      <div className='flex justify-between'>
        <div>
          Current term end{new Date() > currentTermEndDate ? 'ed' : 's'}
        </div>

        <Tooltip label={currentTermEndLong}>
          <div>
            {currentTermEndText}{' '}
            {new Date() > currentTermEndDate ? 'ago' : 'from now'}
          </div>
        </Tooltip>
      </div>

      {nextTermSet && (
        <div className='flex justify-between'>
          <div>Next term end{new Date() > nextTermEndDate ? 'ed' : 's'}</div>

          <Tooltip label={nextTermEndLong}>
            <div>
              {nextTermEndText}{' '}
              {new Date() > nextTermEndDate ? 'ago' : 'from now'}
            </div>
          </Tooltip>
        </div>
      )}
    </div>
  );
};
