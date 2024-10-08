'use client';

import {
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  Stack,
  Text,
} from '@chakra-ui/react';
import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useTreeForm } from 'contexts';
import { AddressInput, Input } from 'forms';
import { useAllWearers, useHatDetails, useProfileDetails } from 'hats-hooks';
import {
  concat,
  find,
  get,
  isEmpty,
  map,
  reject,
  size,
  subtract,
} from 'lodash';
import { useAllowlist } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AllowlistProfile, ModuleDetails } from 'types';
import { formatAddress } from 'utils';
import { Hex } from 'viem';

import {
  AboutModule,
  EligibilityRow,
  ModuleHistory,
  ModuleModal,
} from '../../module-modal';

const Card = dynamic(() => import('ui').then((mod) => mod.Card));

export const StakingModal = ({
  eligibilityHatId,
  moduleInfo,
}: {
  eligibilityHatId: Hex | undefined;
  moduleInfo: ModuleDetails;
}) => {
  const { chainId } = useTreeForm();
  const localForm = useForm();
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateList, setUpdateList] = useState<AllowlistProfile[]>([]);
  // const { watch } = pick(localForm, ['watch']);

  const { data: hat, details } = useHatDetails({
    hatId: eligibilityHatId,
    chainId,
  });
  const { wearers } = useAllWearers({ selectedHat: hat || undefined, chainId });

  // const searchInput = watch('search');
  // const addresses = watch('addresses');
  const { data: allowlist } = useAllowlist({
    id: moduleInfo.id,
    chainId,
  });
  const { data: profileDetails } = useProfileDetails({
    addresses: map(allowlist, (wearer) => get(wearer, 'id') as Hex), // TODO was 'address' ? works in allowlist
    chainId,
  });
  const allowlistProfiles = map(allowlist, (wearer: object) => {
    const profile = find(profileDetails, { id: get(wearer, 'address') });
    return {
      ...wearer,
      ...profile,
    };
    // TODO fix type
  }) as unknown as AllowlistProfile[];
  // const liveParams = get(moduleInfo, 'liveParameters');
  // const ownerHat = toString(
  //   get(find(liveParams, { label: 'Owner Hat' }), 'value'),
  // );
  // const judgeHat = toString(
  //   get(find(liveParams, { label: 'Arbitrator Hat' }), 'value'),
  // );

  const filteredProfiles = useMemo(() => {
    return allowlistProfiles;
  }, [allowlistProfiles]);

  const handleAdd = useCallback(
    (address: Hex) => {
      const profile = find(allowlistProfiles, { id: address });
      if (!profile) return;
      setUpdateList(concat(updateList, [profile]));
    },
    [updateList, allowlistProfiles],
  );

  const handleRemove = useCallback(
    (address: Hex) => {
      setUpdateList(reject(updateList, (p) => p.id === address));
    },
    [updateList],
  );

  return (
    <ModuleModal
      name='stakingManager'
      title='Manage Stakers'
      about={
        <AboutModule
          heading='About this Staking Module'
          moduleDescriptors={[]}
        />
      }
      history={<ModuleHistory />}
    >
      <Heading size='md'>
        Staking for Hat{' '}
        {eligibilityHatId
          ? hatIdDecimalToIp(hatIdHexToDecimal(eligibilityHatId))
          : ''}{' '}
        - {details?.name || hat?.details}
      </Heading>

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

        {map(filteredProfiles, (p: AllowlistProfile) => (
          <EligibilityRow
            key={p.id}
            eligibilityAccount={p}
            wearers={wearers}
            updating={updating}
            updateList={updateList}
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
        {!adding && !updating && (
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
                onClick={() => setUpdating(true)}
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
                  setUpdateList([]);
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

        {updating && (
          <Stack w='full' px={{ base: 4, md: 10 }} spacing={6}>
            <Stack spacing={4}>
              <Heading size='md'>Addresses selected for removal</Heading>
              <Card>
                <Flex m={2} mx={4}>
                  {isEmpty(updateList) ? (
                    <Text color='gray.500'>Select an address to remove</Text>
                  ) : (
                    <Text>
                      {map(
                        updateList,
                        (profile, index) =>
                          `${profile.ensName || formatAddress(profile.id)}${
                            index < subtract(size(updateList), 1) ? ', ' : ''
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
                  setUpdateList([]);
                  setUpdating(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant='filled'
                colorScheme='red.500'
                size='sm'
                isDisabled={isEmpty(updateList)}
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
