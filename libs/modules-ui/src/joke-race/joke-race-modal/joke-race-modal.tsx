'use client';

import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  Stack,
  Text,
} from '@chakra-ui/react';
import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useTreeForm } from 'contexts';
import {
  AddressInput,
  DatePicker,
  DurationInput,
  Input,
  NumberInput,
} from 'forms';
import { useAllWearers, useHatDetails, useProfileDetails } from 'hats-hooks';
import { useClipboard } from 'hooks';
import { compact, find, map, pick, toNumber } from 'lodash';
import { useJokeRace } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { get, useForm } from 'react-hook-form';
import { AllowlistProfile, ModuleDetails } from 'types';
import {
  filterProfiles,
  formatAddress,
  getJokeRaceModuleParameters,
  shortDateFormatter,
} from 'utils';
import { Hex } from 'viem';
import { useReadContracts, useWriteContract } from 'wagmi';

import {
  AboutModule,
  DevInfo,
  EligibilityRow,
  FILTER,
  Filter,
  ModuleHistory,
  ModuleModal,
} from '../../module-modal';

const CopyAddress = dynamic(() =>
  import('icons').then((icons) => icons.CopyAddress),
);

export const JokeRaceModal = ({
  eligibilityHatId,
  moduleInfo,
}: {
  eligibilityHatId: Hex | undefined;
  moduleInfo: ModuleDetails;
}) => {
  const { chainId } = useTreeForm();
  const localForm = useForm({
    defaultValues: {
      contestAddress: undefined,
      termEnd: undefined,
      transitionPeriod: 18000,
      topK: 1,
    },
  });
  const [managingNextTerm, setManagingNextTerm] = useState(false);
  const [activeFilter, setActiveFilter] = useState<Filter>(FILTER.WEARER);
  const { writeContractAsync } = useWriteContract();
  const { watch } = pick(localForm, ['watch']);

  const { data: hat, details } = useHatDetails({
    hatId: eligibilityHatId,
    chainId,
  });
  const { wearers } = useAllWearers({ selectedHat: hat || undefined, chainId });
  const values = watch();

  // const searchInput = watch('search');
  // const addresses = watch('addresses');
  const { data: jokeRaceDetails } = useJokeRace({
    moduleId: moduleInfo.id,
    chainId,
  });
  const { data: eligibilityData } = useReadContracts({
    contracts: [
      {
        address: moduleInfo.id,
        chainId,
        abi: moduleInfo.abi,
        functionName: 'canStartNextTerm',
      },
      // {
      //   address: moduleInfo.id,
      //   chainId,
      //   abi: moduleInfo.abi,
      //   functionName: 'currentTermEnded',
      // },
      // {
      //   address: moduleInfo.id,
      //   chainId,
      //   abi: moduleInfo.abi,
      //   functionName: 'currentTermIndex',
      // },
    ],
  });

  const [canStartNextTerm] = map(eligibilityData, 'result') || [];

  const { data: profileDetails } = useProfileDetails({
    addresses: get(jokeRaceDetails, 'currentTerm.winners', []),
    chainId,
  });
  const jokeRaceProfiles = map(
    get(jokeRaceDetails, 'currentTerm.winners', []),
    (wearer: string) => {
      const profile = find(profileDetails, { id: get(wearer, 'address') });
      return {
        id: wearer,
        ...profile,
      };
    },
  ) as AllowlistProfile[];
  const liveParams = get(moduleInfo, 'liveParameters');
  const { contestAddress, topK, termEnd, adminHat } =
    getJokeRaceModuleParameters({
      moduleParameters: liveParams,
      jokeRaceDetails: jokeRaceDetails || undefined,
    });

  const { onCopy: copyContest } = useClipboard(contestAddress, {
    toastData: { title: 'Contest Address Copied' },
  });

  const filteredProfiles = filterProfiles({
    profiles: jokeRaceProfiles,
    wearerIds: map(wearers, (wearer) => wearer.id),
  });

  const moduleDescriptors = useMemo(() => {
    return compact([
      eligibilityHatId && {
        label: 'Eligibility Rule for this Hat',
        hatId: eligibilityHatId,
      },
      {
        label: 'Admin creates new terms',
        hatId: adminHat,
      },
      topK && {
        label: 'Top K',
        descriptor: <div className='text-sm'>{topK}</div>,
      },
      termEnd && {
        label: 'Term End',
        descriptor: (
          <div className='text-sm'>
            {shortDateFormatter(toNumber(termEnd?.toString()) * 1000)}
          </div>
        ),
      },
    ]);
  }, [adminHat, eligibilityHatId, topK, termEnd]);

  const devInfo = useMemo(() => {
    return compact([
      contestAddress && {
        label: 'Contest Address',
        descriptor: (
          <Button
            onClick={copyContest}
            variant='link'
            size='sm'
            rightIcon={<Icon as={CopyAddress} />}
          >
            {formatAddress(contestAddress as Hex)}
          </Button>
        ),
      },
    ]);
  }, [contestAddress, copyContest]);

  const handleStartNextTerm = async () => {
    return writeContractAsync({
      address: moduleInfo.id,
      chainId,
      abi: moduleInfo.abi,
      functionName: 'startNextTerm',
    })
      .then((data) => {
        console.log('data', data);

        // TODO handle success
      })
      .catch((error) => {
        console.log('error', error);
      });
  };

  const canSetNextTerm = useMemo(() => {
    const {
      contestAddress: newContestAddress,
      termEnd: newTermEnd,
      transitionPeriod: newTransitionPeriod,
      topK: newTopK,
    } = pick(values, ['contestAddress', 'termEnd', 'transitionPeriod', 'topK']);

    if (!newContestAddress || !newTermEnd || !newTransitionPeriod || !newTopK) {
      return false;
    }

    // TODO check errors
    return true;
  }, [values]);

  const handleSetTerm = async () => {
    const {
      contestAddress: newContestAddress,
      termEnd: newTermEnd,
      transitionPeriod: newTransitionPeriod,
      topK: newTopK,
    } = pick(values, ['contestAddress', 'termEnd', 'transitionPeriod', 'topK']);

    const tx = await writeContractAsync({
      address: moduleInfo.id,
      chainId,
      abi: moduleInfo.abi,
      functionName: 'setNextTerm',
      args: [newContestAddress, newTermEnd, newTransitionPeriod, newTopK],
    });

    // TODO handle success
  };

  if (!eligibilityHatId || !hat) return null;

  return (
    <ModuleModal
      name='jokeRaceManager'
      title='Manage JokeRace'
      about={
        <AboutModule
          heading='About this JokeRace Election'
          moduleDescriptors={moduleDescriptors}
        />
      }
      history={<ModuleHistory />}
      devInfo={<DevInfo moduleDescriptors={devInfo} />}
    >
      <Heading size='md'>
        JokeRace Election for Hat{' '}
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

        {map(filteredProfiles[activeFilter], (p: AllowlistProfile) => (
          <EligibilityRow key={p.id} eligibilityAccount={p} wearers={wearers} />
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
        {!managingNextTerm && (
          <Flex w='full' justify='center' align='center'>
            <HStack>
              <Button
                variant='outlineMatch'
                colorScheme='blue.500'
                size='sm'
                onClick={() => setManagingNextTerm(true)}
              >
                Set Next Term
              </Button>
              {!!canStartNextTerm && (
                <Button
                  variant='outlineMatch'
                  colorScheme='red.500'
                  size='sm'
                  onClick={handleStartNextTerm}
                >
                  Start Next Term
                </Button>
              )}
            </HStack>
          </Flex>
        )}

        {managingNextTerm && (
          <Stack w='full' px={{ base: 4, md: 10 }} spacing={6}>
            <Stack spacing={4}>
              <Heading size='lg'>Create next term</Heading>

              <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
                <Box h='100px' w={{ base: '100%', md: '48%' }}>
                  <AddressInput
                    name='contestAddress'
                    label='Contest Address'
                    chainId={chainId}
                    localForm={localForm}
                    hideAddressButtons
                  />
                </Box>

                <Box h='100px' w={{ base: '100%', md: '48%' }}>
                  <NumberInput
                    name='topK'
                    label='Top K'
                    localForm={localForm}
                  />
                </Box>
              </Flex>

              <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
                <Box h='100px' w={{ base: '100%', md: '48%' }}>
                  <DatePicker
                    name='termEnd'
                    label='Term End'
                    localForm={localForm}
                  />
                </Box>

                <Box h='100px' w={{ base: '100%', md: '48%' }}>
                  <DurationInput
                    name='transitionPeriod'
                    label='Transition Period'
                    localForm={localForm}
                  />
                </Box>
              </Flex>
            </Stack>

            <Flex justify='space-between' w='full'>
              <Button
                size='sm'
                variant='outlineMatch'
                colorScheme='blue.500'
                onClick={() => {
                  setManagingNextTerm(false);
                }}
              >
                Cancel
              </Button>

              <Button
                variant='primary'
                size='sm'
                onClick={handleSetTerm}
                isDisabled={!canSetNextTerm}
              >
                Set Term
              </Button>
            </Flex>
          </Stack>
        )}
      </Flex>
    </ModuleModal>
  );
};
