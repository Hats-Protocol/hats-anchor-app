import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Stack,
} from '@chakra-ui/react';
import { isEmpty, map, pick, size } from 'lodash';
import dynamic from 'next/dynamic';
import { Dispatch, SetStateAction, useMemo } from 'react';
import { BsHandThumbsDown, BsHandThumbsUp } from 'react-icons/bs';
import { AllowlistProfile, HatWearer } from 'types';

const WearerIcon = dynamic(() => import('icons').then((mod) => mod.WearerIcon));
const CodeIcon = dynamic(() => import('icons').then((mod) => mod.CodeIcon));
const HatIcon = dynamic(() => import('icons').then((mod) => mod.HatIcon));
const Safe = dynamic(() => import('icons').then((mod) => mod.Safe));

export type Filter =
  | 'wearer' // all
  | 'goodStanding' // eligible
  | 'badStanding'
  // address type
  | 'contracts'
  | 'multiSigs'
  | 'humanistic'
  // eligible but not wearing
  | 'unclaimed';

export enum FILTER {
  WEARER = 'wearer',
  GOOD_STANDING = 'goodStanding',
  BAD_STANDING = 'badStanding',
  // address type
  CONTRACTS = 'contract',
  MULTISIGS = 'multiSig',
  HUMANISTIC = 'humanistic',
  // eligible but not wearing
  UNCLAIMED = 'unclaimed',
}

export const WearerFilters = ({
  filteredProfiles,
  wearers,
  activeFilter,
  setActiveFilter,
}: {
  filteredProfiles: { [keys: string]: AllowlistProfile[] | undefined };
  wearers: HatWearer[] | undefined;
  activeFilter: string;
  setActiveFilter: Dispatch<SetStateAction<Filter>>;
}) => {
  const {
    humanistic,
    multiSig,
    contract,
    wearer,
    unclaimed,
    goodStanding,
    badStanding,
    all,
  } = pick(filteredProfiles, [
    'humanistic',
    'multiSig',
    'contract',
    'wearer',
    'unclaimed',
    'goodStanding',
    'badStanding',
    'all',
  ]);

  const filterButtons = useMemo(() => {
    return [
      {
        filter: FILTER.HUMANISTIC,
        label: 'Address',
        profiles: humanistic,
        icon: WearerIcon,
        colorScheme: 'Informative-Human',
        plural: 'Addresses',
      },
      {
        filter: FILTER.MULTISIGS,
        label: 'Multisig',
        profiles: multiSig,
        icon: Safe,
        colorScheme: 'Informative-Human',
        plural: 'Multisigs',
      },
      {
        filter: FILTER.CONTRACTS,
        label: 'Contract',
        profiles: contract,
        icon: CodeIcon,
        colorScheme: 'Informative-Code',
        plural: 'Contracts',
      },
      {
        filter: FILTER.WEARER,
        label: 'Wearer',
        profiles: wearer,
        icon: HatIcon,
        colorScheme: 'blue.500',
        plural: 'Wearers',
      },

      {
        filter: FILTER.GOOD_STANDING,
        label: 'Good Standing',
        icon: BsHandThumbsUp,
        profiles: goodStanding,
        colorScheme: 'green',
      },
      {
        filter: FILTER.UNCLAIMED,
        label: 'Unclaimed',
        profiles: unclaimed,
        icon: HatIcon,
        colorScheme: 'gray',
      },
      {
        filter: FILTER.BAD_STANDING,
        label: 'Bad Standing',
        icon: BsHandThumbsDown,
        profiles: badStanding,
        colorScheme: 'red',
      },
    ];
  }, [
    humanistic,
    multiSig,
    contract,
    wearer,
    unclaimed,
    goodStanding,
    badStanding,
  ]);

  if (!wearers) return null;

  return (
    <Stack>
      <Heading size='sm'>
        {size(goodStanding)} allowed
        {size(goodStanding) > 1 || size(goodStanding) === 0
          ? ' addresses'
          : ' address'}{' '}
        <span className='font-normal'>
          of {size(all)}{' '}
          {size(all) > 1 || size(all) === 0 ? 'entries' : 'entry'}
        </span>
      </Heading>

      <Flex wrap='wrap' gap={2}>
        {map(
          filterButtons,
          ({ profiles, label, plural, icon, colorScheme, filter }) => {
            const usePlural = size(profiles) > 1;
            const localPlural = plural || label;

            if (isEmpty(profiles)) return null;

            return (
              <Button
                size='xs'
                variant={activeFilter === filter ? 'filled' : 'outlineMatch'}
                onClick={() => setActiveFilter(filter as Filter)}
                colorScheme={colorScheme}
                key={filter}
              >
                <HStack spacing={1}>
                  <Icon as={icon} />

                  <Box>
                    {size(profiles)} {usePlural ? localPlural : label}
                  </Box>
                </HStack>
              </Button>
            );
          },
        )}
      </Flex>
    </Stack>
  );
};
