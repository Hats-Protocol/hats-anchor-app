'use client';

import {
  Button,
  Card,
  Divider,
  Flex,
  Heading,
  HStack,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useTreeForm } from 'contexts';
import { AddressInput, Input } from 'forms';
import { useAllWearers, useHatDetails, useProfileDetails } from 'hats-hooks';
import {
  concat,
  find,
  isEmpty,
  map,
  // pick,
  reject,
  size,
  subtract,
  toString,
} from 'lodash';
import { useAllowlist } from 'modules-hooks';
import { useCallback, useMemo, useState } from 'react';
import { get, useForm } from 'react-hook-form';
import { ExtendedProfile, ModuleDetails } from 'types';
import { formatAddress } from 'utils';
import { Hex } from 'viem';

import {
  EligibilityRow,
  ModuleHistory,
  ModuleModal,
  WearerFilters,
} from '../../module-modal';
import AboutAllowlist from './about';

export const AllowlistModal = ({
  eligibilityHatId,
  moduleInfo,
}: {
  eligibilityHatId: Hex | undefined;
  moduleInfo: ModuleDetails;
}) => {
  const { chainId } = useTreeForm();
  const localForm = useForm();
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [removeList, setRemoveList] = useState<ExtendedProfile[]>([]);
  // const { watch } = pick(localForm, ['watch']);

  const { data: hat } = useHatDetails({ hatId: eligibilityHatId, chainId });
  const { wearers } = useAllWearers({ selectedHat: hat || undefined, chainId });

  // const searchInput = watch('search');
  // const addresses = watch('addresses');
  const { data: allowlist } = useAllowlist({
    id: moduleInfo.id,
    chainId,
  });
  const { data: profileDetails } = useProfileDetails({
    addresses: map(allowlist, (wearer) => get(wearer, 'address')),
    chainId,
  });
  const allowlistProfiles = map(allowlist, (wearer: object) => {
    const profile = find(profileDetails, { id: get(wearer, 'address') });
    return {
      ...wearer,
      ...profile,
    };
  }) as ExtendedProfile[];
  const liveParams = get(moduleInfo, 'liveParameters');
  const ownerHat = toString(
    get(find(liveParams, { label: 'Owner Hat' }), 'value'),
  );
  const judgeHat = toString(
    get(find(liveParams, { label: 'Arbitrator Hat' }), 'value'),
  );

  const filteredProfiles = useMemo(() => {
    return allowlistProfiles;
  }, [allowlistProfiles]);

  const handleAdd = useCallback(
    (address: Hex) => {
      const profile = find(allowlistProfiles, { id: address });
      if (!profile) return;
      setRemoveList(concat(removeList, [profile]));
    },
    [removeList, allowlistProfiles],
  );

  const handleRemove = useCallback(
    (address: Hex) => {
      setRemoveList(reject(removeList, (p) => p.id === address));
    },
    [removeList],
  );

  return (
    <ModuleModal
      name='allowlistManager'
      title='Manage Allowlist'
      filters={
        <WearerFilters extendedProfiles={allowlistProfiles} wearers={wearers} />
      }
      about={
        <AboutAllowlist
          eligibilityHat={eligibilityHatId}
          ownerHat={ownerHat as Hex}
          judgeHat={judgeHat as Hex}
        />
      }
      history={<ModuleHistory />}
    >
      <Heading size='md'>Allowlist for Hat 1.2.1.2 - Hats Contributor</Heading>

      <Flex>
        <Input
          name='search'
          minW='350px'
          placeholder='Find by address (0x) or ENS (.eth)'
          localForm={localForm}
        />
      </Flex>

      <Stack w='100%' spacing={4} pt={10} overflowY='auto' pb='150px'>
        <Stack spacing={1}>
          <Flex justify='space-between'>
            <Text size='sm'>Address</Text>
            <Text size='sm'>Status</Text>
          </Flex>

          <Divider borderColor='black' />
        </Stack>

        {map(filteredProfiles, (p: ExtendedProfile) => (
          <EligibilityRow
            key={p.id}
            eligibilityAccount={p}
            wearers={wearers}
            removing={removing}
            removeList={removeList}
            handleAdd={handleAdd}
            handleRemove={handleRemove}
          />
        ))}
      </Stack>

      <Flex
        position='absolute'
        bottom={0}
        minH='100px'
        bg='whiteAlpha.900'
        w='100%'
        borderBottomRightRadius='md'
        borderBottomLeftRadius={{ base: 'md', md: 'none' }}
        borderTop='1px solid'
        borderColor='blackAlpha.200'
        py={{ base: 4, md: 10 }}
      >
        {!adding && !removing && (
          <Flex w='full' justify='center' align='center'>
            <HStack>
              <Button
                variant='outlineMatch'
                colorScheme='blue.500'
                size='sm'
                onClick={() => setAdding(true)}
              >
                Add Address
              </Button>
              <Button
                variant='outlineMatch'
                colorScheme='red.500'
                size='sm'
                onClick={() => setRemoving(true)}
              >
                Remove Address
              </Button>
            </HStack>
          </Flex>
        )}

        {adding && (
          <Stack w='full' px={{ base: 4, md: 10 }} spacing={6}>
            <Stack spacing={1}>
              <Heading size='md'>Add an address</Heading>

              <AddressInput
                name='addresses'
                chainId={chainId}
                localForm={localForm}
                hideAddressButtons
              />
            </Stack>

            <Flex justify='space-between' w='full'>
              <Button
                size='sm'
                variant='outlineMatch'
                colorScheme='blue.500'
                onClick={() => {
                  setRemoveList([]);
                  setAdding(false);
                }}
              >
                Cancel
              </Button>
              <Button variant='primary' size='sm'>
                Add
              </Button>
            </Flex>
          </Stack>
        )}

        {removing && (
          <Stack w='full' px={{ base: 4, md: 10 }} spacing={6}>
            <Stack spacing={4}>
              <Heading size='md'>Addresses selected for removal</Heading>
              <Card>
                <Flex m={2} mx={4}>
                  {isEmpty(removeList) ? (
                    <Text color='gray.500'>Select an address to remove</Text>
                  ) : (
                    <Text>
                      {map(
                        removeList,
                        (profile, index) =>
                          `${profile.ensName || formatAddress(profile.id)}${
                            index < subtract(size(removeList), 1) ? ', ' : ''
                          }`,
                      )}
                    </Text>
                  )}
                </Flex>
              </Card>
            </Stack>

            <Flex justify='space-between' w='full'>
              <Button
                variant='outlineMatch'
                colorScheme='blue.500'
                size='sm'
                onClick={() => {
                  setRemoveList([]);
                  setRemoving(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant='filled'
                colorScheme='red.500'
                size='sm'
                isDisabled={isEmpty(removeList)}
              >
                Remove
              </Button>
            </Flex>
          </Stack>
        )}
      </Flex>
    </ModuleModal>
  );
};
