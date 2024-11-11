'use client';

import { Box, Button, Flex, Heading, Icon, Stack } from '@chakra-ui/react';
import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useTreeForm } from 'contexts';
import { AddressInput, DatePicker, DurationInput, NumberInput } from 'forms';
import { useHatDetails, useProfileDetails, useWearerDetails } from 'hats-hooks';
import { useClipboard } from 'hooks';
import { compact, find, map, pick, toNumber } from 'lodash';
import { useJokeRace } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { get, useForm } from 'react-hook-form';
import { AllowlistProfile, ModuleDetails } from 'types';
import {
  formatAddress,
  getJokeRaceModuleParameters,
  shortDateFormatter,
} from 'utils';
import { Hex } from 'viem';
import { useAccount, useReadContracts, useWriteContract } from 'wagmi';

import {
  AboutModule,
  DevInfo,
  FILTER,
  Filter,
  ManageBar,
  ModuleHistory,
  ModuleModal,
  ProfileList,
} from '../../module-modal';

const CopyAddress = dynamic(() =>
  import('icons').then((icons) => icons.CopyAddress),
);

const transitionPeriodToDuration = (transitionPeriod: string) => {
  const duration = toNumber(transitionPeriod) / 60 / 60 / 24; // convert to days
  return `${duration} days`;
};

export const JokeRaceModal = ({
  eligibilityHatId,
  moduleInfo,
}: {
  eligibilityHatId: Hex | undefined;
  moduleInfo: ModuleDetails;
}) => {
  const { address } = useAccount();
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
  const { watch, reset } = pick(localForm, ['watch', 'reset']);

  const { data: hat, details } = useHatDetails({
    hatId: eligibilityHatId,
    chainId,
  });
  // const { wearers } = useAllWearers({ selectedHat: hat || undefined, chainId });
  const { data: wearerHats } = useWearerDetails({
    wearerAddress: address as Hex,
    chainId,
  });
  const values = watch();

  const { data: currentTerm } = useJokeRace({
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
    addresses: get(currentTerm, 'winners', []),
    chainId,
  });
  const jokeRaceProfiles = map(
    get(currentTerm, 'winners', []),
    (wearer: string) => {
      const profile = find(profileDetails, { id: get(wearer, 'address') });
      return {
        id: wearer,
        ...profile,
      };
    },
  ) as AllowlistProfile[];
  const liveParams = get(moduleInfo, 'liveParameters');
  const { contestAddress, topK, termEnd, adminHat, transitionPeriod } =
    getJokeRaceModuleParameters({
      moduleParameters: liveParams,
      currentTerm: currentTerm || undefined,
    });

  const isAdmin = useMemo(() => {
    return !!find(wearerHats, { id: adminHat });
  }, [wearerHats, adminHat]);

  const { onCopy: copyContest } = useClipboard(contestAddress, {
    toastData: { title: 'Contest Address Copied' },
  });
  // convert to seconds
  const termExpires =
    toNumber(termEnd?.toString()) * 1000 + toNumber(transitionPeriod) * 1000;

  // const filteredProfiles = filterProfiles({
  //   profiles: jokeRaceProfiles,
  //   wearerIds: map(wearers, (wearer) => wearer.id),
  // });

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
      transitionPeriod && {
        label: 'Transition Period',
        descriptor: (
          <div className='text-sm'>
            {transitionPeriodToDuration(transitionPeriod)}
          </div>
        ),
      },
      termExpires && {
        label: 'Term Expires',
        descriptor: (
          <div className='text-sm'>{shortDateFormatter(termExpires)}</div>
        ),
      },
    ]);
  }, [adminHat, eligibilityHatId, topK, termExpires, transitionPeriod]);

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

  const hatId =
    eligibilityHatId && hatIdDecimalToIp(hatIdHexToDecimal(eligibilityHatId));
  const hatName = details?.name || hat?.details;
  const heading = `JokeRace Election for Hat ${hatId} - ${hatName}`;

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
      <ProfileList
        hat={hat}
        heading={heading}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        localForm={localForm}
        profiles={jokeRaceProfiles}
        handleUpdateListAdd={() => {}}
        handleUpdateListRemove={() => {}}
        updating={false}
        updateList={[]}
      />

      <ManageBar
        sections={[
          {
            label: 'Creating next term',
            value: managingNextTerm,
            hasRole: !!isAdmin,
            section: (
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
                      reset();
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
            ),
          },
        ]}
        buttons={compact([
          {
            label: 'Set Next Term',
            onClick: () => setManagingNextTerm(true),
            colorScheme: 'blue.500',
            hasRole: !!isAdmin,
          },
          !!canStartNextTerm && {
            label: 'Start Next Term',
            colorScheme: 'blue.500',
            onClick: handleStartNextTerm,
            hasRole: !!canStartNextTerm,
          },
        ])}
      />

      {/* <Flex
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
      </Flex> */}
    </ModuleModal>
  );
};
