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
import {
  hatIdDecimalToHex,
  hatIdDecimalToIp,
  hatIdHexToDecimal,
} from '@hatsprotocol/sdk-v1-core';
import { useTreeForm } from 'contexts';
import { Input, MultiAddressInput } from 'forms';
import { useAllWearers, useHatDetails, useProfileDetails } from 'hats-hooks';
import {
  compact,
  concat,
  filter,
  find,
  includes,
  isEmpty,
  map,
  pick,
  reject,
  size,
  some,
  subtract,
  toLower,
  toString,
} from 'lodash';
import { useAllowlist } from 'modules-hooks';
import { useCallback, useMemo, useState } from 'react';
import { get, useForm } from 'react-hook-form';
import { AllowlistProfile, ModuleDetails } from 'types';
import { filterProfiles, formatAddress } from 'utils';
import { Hex } from 'viem';
import { useAccount, useWriteContract } from 'wagmi';

import {
  AboutModule,
  EligibilityRow,
  FILTER,
  Filter,
  ModuleHistory,
  ModuleModal,
  WearerFilters,
} from '../../module-modal';

export const AllowlistModal = ({
  eligibilityHatId,
  moduleInfo,
}: {
  eligibilityHatId: Hex | undefined;
  moduleInfo: ModuleDetails;
}) => {
  const { chainId } = useTreeForm();
  const localForm = useForm();
  const { address } = useAccount();
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [removeList, setRemoveList] = useState<AllowlistProfile[]>([]);
  const [activeFilter, setActiveFilter] = useState<Filter>(FILTER.HUMANISTIC);
  const { setValue, watch } = pick(localForm, ['setValue', 'watch']);
  const { writeContractAsync } = useWriteContract();

  const { data: hat, details } = useHatDetails({
    hatId: eligibilityHatId,
    chainId,
  });
  const { wearers } = useAllWearers({ selectedHat: hat || undefined, chainId });

  const searchInput = watch('search');
  const addressesToAdd = watch('addresses');
  console.log('addressesToAdd', addressesToAdd);
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
  }) as AllowlistProfile[];
  const liveParams = get(moduleInfo, 'liveParameters');
  const ownerHat = toString(
    get(find(liveParams, { label: 'Owner Hat' }), 'value'),
  );
  const judgeHat = toString(
    get(find(liveParams, { label: 'Arbitrator Hat' }), 'value'),
  );
  const { data: ownerHatDetails } = useHatDetails({
    hatId: hatIdDecimalToHex(BigInt(ownerHat)),
    chainId,
  });
  const { data: judgeHatDetails } = useHatDetails({
    hatId: hatIdDecimalToHex(BigInt(judgeHat)),
    chainId,
  });
  console.log(
    'ownerHatDetails',
    ownerHat,
    ownerHatDetails,
    'judgeHatDetails',
    judgeHat,
    judgeHatDetails,
  );
  const { wearers: ownerHatWearers } = useAllWearers({
    selectedHat: ownerHatDetails || undefined,
    chainId,
  });
  const { wearers: judgeHatWearers } = useAllWearers({
    selectedHat: judgeHatDetails || undefined,
    chainId,
  });
  console.log(
    'ownerHatWearers',
    ownerHatWearers,
    'judgeHatWearers',
    judgeHatWearers,
  );
  const isOwner = some(ownerHatWearers, { id: toLower(address) });
  const isJudge = some(judgeHatWearers, { id: toLower(address) });
  console.log('isOwner', isOwner, 'isJudge', isJudge);

  const filteredProfiles = filterProfiles({
    profiles: allowlistProfiles,
    wearerIds: map(wearers, (wearer) => wearer.id),
  });

  const handleRemoveListAdd = useCallback(
    (address: Hex) => {
      const profile = find(allowlistProfiles, { id: address });
      if (!profile) return;
      setRemoveList(concat(removeList, [profile]));
    },
    [removeList, allowlistProfiles],
  );

  const handleRemoveListRemove = useCallback(
    (address: Hex) => {
      setRemoveList(reject(removeList, (p) => p.id === address));
    },
    [removeList],
  );

  const handleRemoveWearers = useCallback(async () => {
    const removeAddresses = map(removeList, (p) => p.id);
    const tx = await writeContractAsync({
      address: moduleInfo.id,
      abi: moduleInfo.abi,
      functionName: 'removeAccounts',
      args: [removeAddresses],
    });
    console.log('tx', tx);
    setRemoveList([]);
    setRemoving(false);
  }, [
    setRemoveList,
    moduleInfo.abi,
    moduleInfo.id,
    removeList,
    // writeContractAsync,
    setRemoving,
  ]);

  const handleAddWearers = useCallback(async () => {
    const addresses = map(addressesToAdd, (account) => get(account, 'address'));
    const tx = await writeContractAsync({
      address: moduleInfo.id,
      abi: moduleInfo.abi,
      functionName: 'addAccounts',
      args: [addresses],
    });
    console.log('tx', tx);
    setValue('addresses', []);
    setAdding(false);
  }, [
    addressesToAdd,
    setAdding,
    // writeContractAsync,
    // setValue,
    moduleInfo.abi,
    moduleInfo.id,
  ]);

  const handleClose = useCallback(() => {
    setActiveFilter(FILTER.HUMANISTIC);
    setRemoveList([]);
    setAdding(false);
    setRemoving(false);
    setValue('addresses', []);
    setValue('search', undefined);
  }, [setValue]);

  const currentFilteredProfiles = filter(
    filteredProfiles[activeFilter],
    (p) =>
      !searchInput ||
      includes(toString(p.id), searchInput) ||
      includes(toString(p.ensName), searchInput),
  );

  const moduleDescriptors = useMemo(() => {
    return compact([
      eligibilityHatId && {
        label: 'Eligibility Rule for this Hat',
        hatId: eligibilityHatId,
      },
      {
        label: 'Owner edits the allowlist',
        hatId: ownerHat as Hex,
      },
      {
        label: 'Judge determines wearer standing',
        hatId: judgeHat as Hex,
      },
    ]);
  }, [ownerHat, judgeHat, eligibilityHatId]);

  if (!hat || !eligibilityHatId) return null;

  return (
    <ModuleModal
      name='allowlistManager'
      title='Manage Allowlist'
      filters={
        <WearerFilters
          filteredProfiles={filteredProfiles}
          wearers={wearers}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />
      }
      about={
        <AboutModule
          heading='About this Allowlist'
          moduleDescriptors={moduleDescriptors}
        />
      }
      history={<ModuleHistory />}
      onClose={handleClose}
    >
      <Heading size='md'>
        Allowlist for Hat{' '}
        {hatIdDecimalToIp(hatIdHexToDecimal(eligibilityHatId))} -{' '}
        {details?.name || hat?.details}
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

        {map(currentFilteredProfiles, (p: AllowlistProfile) => (
          <EligibilityRow
            key={p.id}
            eligibilityAccount={p}
            wearers={wearers}
            removing={removing}
            removeList={removeList}
            handleAdd={handleRemoveListAdd}
            handleRemove={handleRemoveListRemove}
          />
        ))}
        {isEmpty(currentFilteredProfiles) && (
          <Flex justify='center' align='center' w='full' h='100px'>
            <Text color='gray.500'>No addresses found</Text>
          </Flex>
        )}
      </Stack>

      {/* TODO: must be wearer of owner hat to add/remove */}
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

              <MultiAddressInput
                name='addresses'
                localForm={localForm}
                checkEligibility={false}
                btnSize='xs'
              />
            </Stack>

            <Flex justify='space-between' w='full'>
              <Button
                size='sm'
                variant='outlineMatch'
                colorScheme='blue.500'
                onClick={() => {
                  setRemoveList([]);
                  setValue('addresses', []);
                  setAdding(false);
                }}
              >
                Cancel
              </Button>
              <Button variant='primary' size='sm' onClick={handleAddWearers}>
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
                onClick={handleRemoveWearers}
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
