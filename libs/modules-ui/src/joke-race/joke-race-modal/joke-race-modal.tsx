'use client';

import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useTreeForm } from 'contexts';
import { AddressInput, DatePicker, DurationInput, NumberInput } from 'forms';
import { useHatDetails, useProfileDetails, useWearerDetails } from 'hats-hooks';
import { useClipboard } from 'hooks';
import { CopyAddress } from 'icons';
import { compact, find, map, pick, toNumber } from 'lodash';
import { useJokeRace } from 'modules-hooks';
import { useMemo, useState } from 'react';
import { get, useForm } from 'react-hook-form';
import { AllowlistProfile, ModuleDetails } from 'types';
import { Button } from 'ui';
import { formatAddress, getJokeRaceModuleParameters, shortDateFormatter } from 'utils';
import { Hex } from 'viem';
import { useAccount, useReadContracts, useWriteContract } from 'wagmi';

import { AboutModule, DevInfo, ManageBar, ModuleHistory, ModuleModal, ProfileList } from '../../module-modal';

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
    moduleId: moduleInfo.instanceAddress,
    chainId,
  });
  const { data: eligibilityData } = useReadContracts({
    contracts: [
      {
        address: moduleInfo.instanceAddress,
        chainId,
        abi: moduleInfo.abi,
        functionName: 'canStartNextTerm',
      },
      // {
      //   address: moduleInfo.instanceAddress,
      //   chainId,
      //   abi: moduleInfo.abi,
      //   functionName: 'currentTermEnded',
      // },
      // {
      //   address: moduleInfo.instanceAddress,
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
  const jokeRaceProfiles = map(get(currentTerm, 'winners', []), (wearer: string) => {
    const profile = find(profileDetails, { id: get(wearer, 'address') });
    return {
      id: wearer,
      ...profile,
    };
  }) as AllowlistProfile[];
  const liveParams = get(moduleInfo, 'liveParameters');
  const { contestAddress, topK, termEnd, adminHat, transitionPeriod } = getJokeRaceModuleParameters({
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
  const termExpires = toNumber(termEnd?.toString()) * 1000 + toNumber(transitionPeriod) * 1000;

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
        descriptor: <div className='text-sm'>{transitionPeriodToDuration(transitionPeriod)}</div>,
      },
      termExpires && {
        label: 'Term Expires',
        descriptor: <div className='text-sm'>{shortDateFormatter(termExpires)}</div>,
      },
    ]);
  }, [adminHat, eligibilityHatId, topK, termExpires, transitionPeriod]);

  const devInfo = useMemo(() => {
    return compact([
      contestAddress && {
        label: 'Contest Address',
        descriptor: (
          <Button onClick={copyContest} variant='link' size='sm'>
            {formatAddress(contestAddress as Hex)}
            <CopyAddress />
          </Button>
        ),
      },
    ]);
  }, [contestAddress, copyContest]);

  const handleStartNextTerm = async () => {
    if (!moduleInfo.instanceAddress) return;
    return writeContractAsync({
      address: moduleInfo.instanceAddress,
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
    if (!moduleInfo.instanceAddress) return;
    const {
      contestAddress: newContestAddress,
      termEnd: newTermEnd,
      transitionPeriod: newTransitionPeriod,
      topK: newTopK,
    } = pick(values, ['contestAddress', 'termEnd', 'transitionPeriod', 'topK']);

    const tx = await writeContractAsync({
      address: moduleInfo.instanceAddress,
      chainId,
      abi: moduleInfo.abi,
      functionName: 'setNextTerm',
      args: [newContestAddress, newTermEnd, newTransitionPeriod, newTopK],
    });

    // TODO handle success
  };

  const hatId = eligibilityHatId && hatIdDecimalToIp(hatIdHexToDecimal(eligibilityHatId));
  const hatName = details?.name || hat?.details;
  const heading = `JokeRace Election for Hat ${hatId} - ${hatName}`;

  if (!eligibilityHatId || !hat) return null;

  return (
    <ModuleModal
      name={`${moduleInfo.instanceAddress}-jokeRaceManager`}
      title='Manage JokeRace'
      about={<AboutModule heading='About this JokeRace Election' moduleDescriptors={moduleDescriptors} />}
      history={<ModuleHistory />}
      devInfo={<DevInfo moduleDescriptors={devInfo} />}
    >
      <ProfileList
        hat={hat}
        heading={heading}
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
              <div className='w-full space-y-6 px-4 md:px-10'>
                <div className='flex flex-col gap-4'>
                  <h2 className='text-2xl font-bold'>Create next term</h2>

                  <div className='flex flex-col gap-4 md:flex-row'>
                    <div className='h-10 w-full md:w-1/2'>
                      <AddressInput
                        name='contestAddress'
                        label='Contest Address'
                        chainId={chainId}
                        localForm={localForm}
                        hideAddressButtons
                      />
                    </div>

                    <div className='h-10 w-full md:w-1/2'>
                      <NumberInput name='topK' label='Top K' localForm={localForm} />
                    </div>
                  </div>

                  <div className='flex flex-col gap-4 md:flex-row'>
                    <div className='h-10 w-full md:w-1/2'>
                      <DatePicker name='termEnd' label='Term End' localForm={localForm} />
                    </div>

                    <div className='h-10 w-full md:w-1/2'>
                      <DurationInput name='transitionPeriod' label='Transition Period' localForm={localForm} />
                    </div>
                  </div>
                </div>

                <div className='flex w-full justify-between'>
                  <Button
                    size='sm'
                    variant='outline-blue'
                    onClick={() => {
                      setManagingNextTerm(false);
                      reset();
                    }}
                  >
                    Cancel
                  </Button>

                  <Button size='sm' onClick={handleSetTerm} disabled={!canSetNextTerm}>
                    Set Term
                  </Button>
                </div>
              </div>
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
        chainId={chainId}
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
