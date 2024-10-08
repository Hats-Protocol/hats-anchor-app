'use client';

import {
  Button,
  Divider,
  Flex,
  Heading,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useTreeForm } from 'contexts';
import { Input } from 'forms';
import { useAllWearers } from 'hats-hooks';
import {
  capitalize,
  filter,
  includes,
  isEmpty,
  map,
  pick,
  size,
  toString,
} from 'lodash';
import { UseFormReturn } from 'react-hook-form';
import { AiOutlineFilter } from 'react-icons/ai';
import { BsChevronDown } from 'react-icons/bs';
import { AllowlistProfile, AppHat } from 'types';
import { filterProfiles } from 'utils';

import { EligibilityRow } from './eligibility-row';
import { FILTER, Filter } from './types';

export const ProfileList = ({
  hat,
  heading,
  profiles,
  activeFilter,
  setActiveFilter,
  localForm,
  handleUpdateListAdd,
  handleUpdateListRemove,
  updating,
  updateList,
}: {
  heading: string;
  hat: AppHat;
  profiles: AllowlistProfile[];
  activeFilter: Filter;
  setActiveFilter: (filter: Filter) => void;
  localForm: UseFormReturn<any>;
  handleUpdateListAdd: (account: `0x${string}`) => void;
  handleUpdateListRemove: (account: `0x${string}`) => void;
  updating: boolean;
  updateList: AllowlistProfile[];
}) => {
  const { chainId } = useTreeForm();
  const { wearers } = useAllWearers({ selectedHat: hat || undefined, chainId });
  const filteredProfiles = filterProfiles({
    profiles,
    wearerIds: map(wearers, (wearer) => wearer.id),
  });
  const { watch } = pick(localForm, ['watch']);

  const searchInput = watch('search');

  const currentFilteredProfiles = filter(
    filteredProfiles[activeFilter],
    (p: AllowlistProfile) =>
      !searchInput ||
      includes(toString(p.id), searchInput) ||
      includes(toString(p.ensName), searchInput),
  );

  return (
    <Stack w='full' h='full' align='center'>
      <Heading size='md'>{heading}</Heading>

      <Flex w='full' justify='space-between' align='end'>
        <Input
          name='search'
          w='350px'
          placeholder='Find by address (0x) or ENS (.eth)'
          localForm={localForm}
        />

        <Menu placement='bottom-end'>
          <MenuButton
            as={Button}
            size='sm'
            variant='outlineMatch'
            colorScheme='blue.500'
            leftIcon={<Icon as={AiOutlineFilter} />}
            rightIcon={<Icon as={BsChevronDown} />}
          >
            {capitalize(activeFilter)} ({size(filteredProfiles[activeFilter])})
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => setActiveFilter(FILTER.WEARER)}>
              Wearer ({size(filteredProfiles.wearer)})
            </MenuItem>
            <MenuItem onClick={() => setActiveFilter(FILTER.ELIGIBLE)}>
              Eligible ({size(filteredProfiles.eligible)})
            </MenuItem>
            <MenuItem onClick={() => setActiveFilter(FILTER.INELIGIBLE)}>
              Ineligible ({size(filteredProfiles.ineligible)})
            </MenuItem>
            <MenuItem onClick={() => setActiveFilter(FILTER.ALL)}>
              All ({size(filteredProfiles.all)})
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>

      <Stack w='100%' spacing={4} pt={10} overflowY='auto' pb='150px'>
        <Stack spacing={1}>
          <Flex justify='space-between'>
            <Text size='sm'>Address</Text>
            <Text size='sm'>Status</Text>
          </Flex>

          <Divider borderColor='black' />
        </Stack>

        {map(currentFilteredProfiles, (p: AllowlistProfile) => (
          <EligibilityRow
            key={p.id}
            eligibilityAccount={p}
            wearers={wearers}
            updating={updating}
            updateList={updateList}
            handleAdd={handleUpdateListAdd}
            handleRemove={handleUpdateListRemove}
          />
        ))}
        {isEmpty(currentFilteredProfiles) && (
          <Flex justify='center' align='center' w='full' h='100px'>
            <Text color='gray.500'>No addresses found</Text>
          </Flex>
        )}
      </Stack>
    </Stack>
  );
};
