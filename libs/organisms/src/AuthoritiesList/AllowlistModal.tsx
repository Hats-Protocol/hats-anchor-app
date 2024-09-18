'use client';

import {
  Button,
  Card,
  Checkbox,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  Stack,
  Text,
} from '@chakra-ui/react';
import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useTreeForm } from 'contexts';
import { AddressInput, Input } from 'forms';
import { useAllWearers, useHatDetails, useProfileDetails } from 'hats-hooks';
import {
  concat,
  filter,
  find,
  includes,
  isEmpty,
  map,
  pick,
  reject,
  size,
  subtract,
  toString,
} from 'lodash';
import { useAllowlist } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { useCallback, useMemo, useState } from 'react';
import { get, useForm } from 'react-hook-form';
import { Authority, HatWearer } from 'types';
import { formatAddress } from 'utils';
import { Hex } from 'viem';
import { useEnsAvatar } from 'wagmi';

import ModuleModal from './ModuleModal';

const HatIcon = dynamic(() => import('icons').then((mod) => mod.HatIcon));
const WearerIcon = dynamic(() => import('icons').then((mod) => mod.WearerIcon));

interface ExtendedProfile extends HatWearer {
  eligible: boolean;
  badStanding: boolean;
}

const Filters = ({
  allowlistProfiles,
  wearers,
}: {
  allowlistProfiles: ExtendedProfile[] | undefined;
  wearers: HatWearer[] | undefined;
}) => {
  const eligible = filter(allowlistProfiles, (p) => {
    return get(p, 'eligible') && !get(p, 'badStanding');
  });
  const contracts = filter(allowlistProfiles, { isContract: true });
  const multiSigs = filter(allowlistProfiles, {
    contractName: 'GnosisSafeProxy',
  });
  const humanistic = filter(allowlistProfiles, { isContract: false });

  const wearerIds = map(wearers, 'id');
  const wearerProfiles = filter(allowlistProfiles, (p) =>
    includes(wearerIds, p.id),
  );
  const unclaimed = filter(
    allowlistProfiles,
    (p) => !includes(wearerIds, p.id),
  );

  const goodStanding = filter(allowlistProfiles, { badStanding: false });
  const badStanding = filter(allowlistProfiles, { badStanding: true });

  if (!allowlistProfiles || !wearers) return null;

  return (
    <Stack>
      <Heading size='sm'>
        {size(eligible)} allowed addresses{' '}
        <span className='font-normal'>
          of {size(allowlistProfiles)} entries
        </span>
      </Heading>

      <Flex wrap='wrap' gap={2}>
        <Button
          leftIcon={<Icon as={WearerIcon} />}
          size='xs'
          variant='outlineMatch'
          colorScheme='Informative-Human'
        >
          {size(humanistic)} Address{size(humanistic) > 1 ? 'es' : ''}
        </Button>
        {!isEmpty(multiSigs) && (
          <Button
            size='xs'
            variant='outlineMatch'
            colorScheme='Informative-Human'
          >
            {size(multiSigs)} Multi-sigs
          </Button>
        )}
        {!isEmpty(contracts) && (
          <Button
            size='xs'
            variant='outlineMatch'
            colorScheme='Informative-Code'
          >
            {size(contracts)} Contract{size(contracts) > 1 ? 's' : ''}
          </Button>
        )}
        {!isEmpty(wearerProfiles) && (
          <Button size='xs' variant='outlineMatch' colorScheme='blue.500'>
            {size(wearerProfiles)} Wearer{size(wearerProfiles) > 1 ? 's' : ''}
          </Button>
        )}
        {!isEmpty(unclaimed) && (
          <Button size='xs' variant='outlineMatch' colorScheme='gray'>
            {size(unclaimed)} Unclaimed
          </Button>
        )}
        {!isEmpty(goodStanding) && (
          <Button size='xs' variant='outlineMatch' colorScheme='green'>
            {size(goodStanding)} Good Standing
          </Button>
        )}
        {!isEmpty(badStanding) && (
          <Button size='xs' variant='outlineMatch' colorScheme='red'>
            {size(badStanding)} Bad Standing
          </Button>
        )}
      </Flex>
    </Stack>
  );
};

const AboutAllowlist = ({
  eligibilityHat,
  ownerHat,
  judgeHat,
}: {
  eligibilityHat: Hex | undefined;
  ownerHat: Hex | undefined;
  judgeHat: Hex | undefined;
}) => {
  if (!eligibilityHat || !ownerHat || !judgeHat) return null;

  return (
    <Stack>
      <Heading size='sm'>About this Allowlist</Heading>

      <Flex justify='space-between'>
        <Text size='sm'>Eligibility Rule for this Hat</Text>

        <HStack spacing={1}>
          <Text size='sm'>
            {hatIdDecimalToIp(hatIdHexToDecimal(eligibilityHat))}
          </Text>
          <Icon as={HatIcon} boxSize={4} />
        </HStack>
      </Flex>
      <Flex justify='space-between'>
        <Text size='sm'>Owner edits the allowlist</Text>

        <HStack spacing={1}>
          <Text size='sm'>{hatIdDecimalToIp(hatIdHexToDecimal(ownerHat))}</Text>
          <Icon as={HatIcon} boxSize={4} />
        </HStack>
      </Flex>

      <Flex justify='space-between'>
        <Text size='sm'>Judge determines wearer standing</Text>

        <HStack spacing={1}>
          <Text size='sm'>{hatIdDecimalToIp(hatIdHexToDecimal(judgeHat))}</Text>
          <Icon as={HatIcon} boxSize={4} />
        </HStack>
      </Flex>
    </Stack>
  );
};

const History = () => {
  return null;

  // TODO get history from ancillary subgraph

  return (
    <Stack>
      <Heading size='sm'>History</Heading>

      <Flex justify='space-between'>
        <Text size='sm'>10 addresses added</Text>

        <Text size='sm'>4 days ago</Text>
      </Flex>
    </Stack>
  );
};

const EligibilityRow = ({
  eligibilityAccount,
  wearers,
  removing,
  removeList,
  handleAdd,
  handleRemove,
}: {
  eligibilityAccount: ExtendedProfile;
  wearers: HatWearer[] | undefined;
  removing: boolean;
  removeList: ExtendedProfile[] | undefined;
  handleAdd: (account: Hex) => void;
  handleRemove: (address: Hex) => void;
}) => {
  console.log(removeList);
  const { data: ensAvatar } = useEnsAvatar({
    name: get(eligibilityAccount, 'ensName'),
    chainId: 1,
  });
  const isWearer = includes(map(wearers, 'id'), eligibilityAccount.id);

  let color = 'Informative-Human';
  if (eligibilityAccount.isContract) color = 'Informative-Code';
  const isChecked = includes(map(removeList, 'id'), eligibilityAccount.id);

  const handleRemoveToggle = useCallback(() => {
    if (isChecked) {
      handleRemove(eligibilityAccount.id);
    } else {
      handleAdd(eligibilityAccount.id);
    }
  }, [isChecked, handleAdd, handleRemove, eligibilityAccount.id]);

  const AddressProfile = () => (
    <HStack color={color}>
      {ensAvatar ? (
        <Image
          w={{ base: '11px', md: 3 }}
          h={{ base: '14px', md: 4 }}
          ml='2px'
          mr={{ base: '1px', md: 1 }} // sometimes only ml? oh when the current user isn't a wearer in the list?
          src={ensAvatar}
          borderRadius='2px'
          objectFit='cover'
        />
      ) : (
        <Icon as={WearerIcon} boxSize={{ base: '14px', md: 4 }} />
      )}
      <Text size='sm'>
        {eligibilityAccount.ensName || formatAddress(eligibilityAccount.id)}
      </Text>
    </HStack>
  );

  return (
    <Flex justify='space-between'>
      {removing ? (
        <Checkbox isChecked={isChecked} onChange={handleRemoveToggle}>
          <AddressProfile />
        </Checkbox>
      ) : (
        <AddressProfile />
      )}

      <HStack spacing={1} color={isWearer ? 'Informative-Human' : 'gray.500'}>
        <Text size='sm'>{isWearer ? 'Wearer' : 'Unclaimed'}</Text>
      </HStack>
    </Flex>
  );
};

const AllowlistModal = ({ authority }: { authority: Authority }) => {
  const { chainId } = useTreeForm();
  const localForm = useForm();
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [removeList, setRemoveList] = useState<ExtendedProfile[]>([]);
  const { watch } = pick(localForm, ['watch']);
  console.log(removeList);

  const { data: hat } = useHatDetails({ hatId: authority.hatId, chainId });
  const { wearers } = useAllWearers({ selectedHat: hat || undefined, chainId });

  const searchInput = watch('search');
  const addresses = watch('addresses');
  const { data: allowlist } = useAllowlist({
    id: authority.instanceAddress,
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
  const liveParams = get(authority, 'moduleInfo.liveParameters');
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
  console.log(addresses);

  return (
    <ModuleModal
      name='allowlistManager'
      title='Manage Allowlist'
      filters={
        <Filters allowlistProfiles={allowlistProfiles} wearers={wearers} />
      }
      about={
        <AboutAllowlist
          eligibilityHat={authority.hatId}
          ownerHat={ownerHat as Hex}
          judgeHat={judgeHat as Hex}
        />
      }
      history={<History />}
    >
      <Heading size='md'>Allowlist for Hat 1.2.1.2 - Hats Contributor</Heading>

      <Flex>
        <Input
          name='search'
          minW='300px'
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
                          `${profile.ensName || formatAddress(profile.id)}${index < subtract(size(removeList), 1) ? ', ' : ''}`,
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

export default AllowlistModal;
