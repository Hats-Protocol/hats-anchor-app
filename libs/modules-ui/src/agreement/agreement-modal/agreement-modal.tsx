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
import { hatIdDecimalToHex, hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useTreeForm } from 'contexts';
import { DurationInput, Input, Textarea } from 'forms';
import {
  useAllWearers,
  useHatDetails,
  useProfileDetails,
  useWearerDetails,
} from 'hats-hooks';
import { useIpfsData } from 'hooks';
import {
  compact,
  concat,
  filter,
  find,
  first,
  includes,
  isEmpty,
  map,
  pick,
  reject,
  size,
  subtract,
  toLower,
  toString,
} from 'lodash';
import { useAgreementDetails, useMultiClaimsHatterCheck } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { useCallback, useMemo, useState } from 'react';
import { get, useForm } from 'react-hook-form';
import { AllowlistProfile, ModuleDetails } from 'types';
import {
  fetchToken,
  filterProfiles,
  formatAddress,
  pinFileToIpfs,
} from 'utils';
import { Hex } from 'viem';
import { useAccount, useWriteContract } from 'wagmi';

import {
  AboutModule,
  EligibilityRow,
  FILTER,
  Filter,
  ModuleHistory,
  ModuleModal,
} from '../../module-modal';

const ControlledRadioBox = dynamic(() =>
  import('ui').then((ui) => ui.ControlledRadioBox),
);
const Markdown = dynamic(() => import('ui').then((ui) => ui.Markdown));
const TransactionButton = dynamic(() =>
  import('molecules').then((mod) => mod.TransactionButton),
);

const DEFAULT_GRACE_PERIOD = 4;
const DEFAULT_GRACE_PERIOD_UNIT = 'weeks';

export const AgreementModal = ({
  eligibilityHatId,
  moduleInfo,
}: {
  eligibilityHatId: Hex | undefined;
  moduleInfo: ModuleDetails;
}) => {
  const { address } = useAccount();
  const { chainId, onchainHats } = useTreeForm();
  const { writeContractAsync } = useWriteContract();
  const localForm = useForm();
  const [removing, setRemoving] = useState(false);
  const [removeList, setRemoveList] = useState<AllowlistProfile[]>([]);
  const [activeFilter, setActiveFilter] = useState<Filter>(FILTER.WEARER);
  const [selectedOption, setSelectedOption] = useState<string>('Agreement');
  const [updatingAgreement, setUpdatingAgreement] = useState(false);
  const { watch, reset } = pick(localForm, ['watch', 'reset']);
  const localHat = find(onchainHats, { id: eligibilityHatId });

  const gracePeriod = watch('gracePeriod');
  const newAgreementContent = watch('agreementContent');
  const { data: hat } = useHatDetails({
    hatId: eligibilityHatId,
    chainId,
  });
  const { wearers } = useAllWearers({ selectedHat: hat || undefined, chainId });
  const { data: wearerHats } = useWearerDetails({
    wearerAddress: address as Hex,
    chainId,
  });
  const { instanceAddress } = useMultiClaimsHatterCheck({
    chainId,
    selectedHat: hat,
    onchainHats,
  });

  const isWearing = find(wearers, { id: toLower(address) });

  const searchInput = watch('search');
  const { data: agreementDetails } = useAgreementDetails({
    id: moduleInfo.id,
    chainId,
  });
  const { data: agreementProfiles } = useProfileDetails({
    addresses: get(agreementDetails, 'agreements.0.signers'),
    chainId,
  });
  const liveParams = get(moduleInfo, 'liveParameters');
  const ownerHat = toString(
    get(find(liveParams, { label: 'Owner Hat' }), 'value'),
  );
  const judgeHat = toString(
    get(find(liveParams, { label: 'Arbitrator Hat' }), 'value'),
  );
  const isJudge = !!find(wearerHats, {
    id: hatIdDecimalToHex(BigInt(judgeHat)),
  });
  const isOwner = !!find(wearerHats, {
    id: hatIdDecimalToHex(BigInt(ownerHat)),
  });
  const currentAgreement = get(
    find(liveParams, { label: 'Current Agreement' }),
    'value',
  );
  const { data: agreementData } = useIpfsData(currentAgreement);
  const agreementContent = get(agreementData, 'data');

  const badStandings = get(agreementDetails, 'badStandings');
  const mappedProfiles = map(agreementProfiles, (profile) => {
    const badStanding = find(badStandings, { id: profile.id });
    return {
      ...profile,
      eligible: true,
      badStanding: badStanding ? true : false,
    };
  });

  const handleRemoveWearers = useCallback(async () => {
    // TODO handle remove many
    const removeAddresses = map(removeList, (p) => p.id);
    const tx = await writeContractAsync({
      address: moduleInfo.id,
      abi: moduleInfo.abi,
      functionName: 'revoke',
      args: [first(removeAddresses)],
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

  const filteredProfiles = filterProfiles({
    profiles: mappedProfiles || [],
    wearerIds: map(wearers, (wearer) => wearer.id),
  });
  const currentFilteredProfiles = filter(
    filteredProfiles[activeFilter],
    (p) =>
      !searchInput ||
      includes(toString(p.id), searchInput) ||
      includes(toString(p.ensName), searchInput),
  );

  const handleAdd = useCallback(
    (address: Hex) => {
      const profile = find(agreementProfiles, { id: address });
      if (!profile) return;
      // TODO should be returning bad standing
      // @ts-expect-error should be returning bad standing
      setRemoveList(concat(removeList, [profile]));
    },
    [removeList, agreementProfiles],
  );

  const handleRemove = useCallback(
    (address: Hex) => {
      setRemoveList(reject(removeList, (p) => p.id === address));
    },
    [removeList],
  );

  const moduleDescriptors = useMemo(() => {
    return compact([
      eligibilityHatId && {
        label: 'Eligibility Rule for this Hat',
        hatId: eligibilityHatId,
      },
      {
        label: 'Owner edits the agreement',
        hatId: ownerHat as Hex,
      },
      {
        label: 'Judge determines wearer standing',
        hatId: judgeHat as Hex,
      },
    ]);
  }, [ownerHat, judgeHat, eligibilityHatId]);

  const handleSignAgreement = async () => {
    console.log('sign agreement');
    const tx = await writeContractAsync({
      address: moduleInfo.id,
      abi: moduleInfo.abi,
      functionName: 'signAgreementAndClaimHat',
      args: [instanceAddress],
    });

    console.log('tx', tx);
    // TODO handle success
  };

  if (!eligibilityHatId) return null;

  const handleUpdateAgreement = async () => {
    const token = await fetchToken();
    // TODO handle error
    console.log('token', token);
    const ipfsHash = await pinFileToIpfs({
      file: newAgreementContent,
      fileName: `agreement_${hatIdDecimalToIp(BigInt(eligibilityHatId))}_${chainId}`,
      token,
    });

    console.log('ipfsHash', ipfsHash);
    const tx = await writeContractAsync({
      address: moduleInfo.id,
      abi: moduleInfo.abi,
      functionName: 'setAgreement',
      args: [ipfsHash, gracePeriod],
    });
    console.log('tx', tx);
    // TODO handle success
    setUpdatingAgreement(false);
    return tx;
  };

  return (
    <ModuleModal
      name='agreementManager'
      title='Agreement Signers'
      about={
        <AboutModule
          heading='About this Agreement'
          moduleDescriptors={moduleDescriptors}
        />
      }
      history={<ModuleHistory />}
    >
      <ControlledRadioBox
        options={['Agreement', 'Signatures']}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
        size='sm'
      />

      {selectedOption === 'Agreement' && !updatingAgreement && (
        <Stack w='100%' spacing={4} pt={10} overflowY='auto' pb='150px'>
          <Markdown>{agreementContent as string}</Markdown>
        </Stack>
      )}

      {selectedOption === 'Agreement' && updatingAgreement && (
        <Stack w='100%'>
          <Heading size='md'>Update Agreement</Heading>

          <Textarea
            name='agreementContent'
            localForm={localForm}
            minH='350px'
          />
        </Stack>
      )}

      {selectedOption === 'Signatures' && (
        <>
          <Flex w='full' mt={4}>
            <Flex w='350px'>
              <Input
                name='search'
                placeholder='Find by address (0x) or ENS (.eth)'
                localForm={localForm}
              />
            </Flex>

            <Button>Wearer Filters</Button>
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
                updating={removing}
                updateList={removeList}
                handleAdd={handleAdd}
                handleRemove={handleRemove}
              />
            ))}

            {isEmpty(currentFilteredProfiles) && (
              <Flex justify='center' align='center' w='full' h='100px'>
                <Text color='gray.500'>No addresses found</Text>
              </Flex>
            )}
          </Stack>
        </>
      )}

      {((selectedOption === 'Signatures' && isJudge) ||
        (selectedOption === 'Agreement' && (!isWearing || isOwner))) && (
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
          {!removing && !updatingAgreement && (
            <Flex w='full' justify='center' align='center'>
              <HStack>
                {selectedOption === 'Agreement' && !isWearing && (
                  <Button
                    variant='outlineMatch'
                    colorScheme='blue.500'
                    size='sm'
                    onClick={handleSignAgreement}
                  >
                    Sign Agreement & Claim
                  </Button>
                )}
                {selectedOption === 'Agreement' && isOwner && (
                  <Button
                    variant='outlineMatch'
                    colorScheme='blue.500'
                    size='sm'
                    onClick={() => {
                      reset(
                        {
                          agreementContent,
                          'gracePeriod-time-value': DEFAULT_GRACE_PERIOD,
                          'gracePeriod-time-unit': DEFAULT_GRACE_PERIOD_UNIT,
                        },
                        { keepDefaultValues: false },
                      );
                      setUpdatingAgreement(true);
                    }}
                  >
                    Update Agreement
                  </Button>
                )}
                {selectedOption === 'Signatures' && isJudge && (
                  <Button
                    variant='outlineMatch'
                    colorScheme='red.500'
                    size='sm'
                    onClick={() => setRemoving(true)}
                  >
                    Remove Address
                  </Button>
                )}
              </HStack>
            </Flex>
          )}

          {updatingAgreement && (
            <Stack w='full' px={{ base: 4, md: 10 }} spacing={4}>
              <DurationInput
                name='gracePeriod'
                label='Grace Period'
                localForm={localForm}
              />

              <Flex w='full' justify='space-between'>
                <Button
                  variant='outlineMatch'
                  colorScheme='blue.500'
                  size='sm'
                  onClick={() => setUpdatingAgreement(false)}
                >
                  Cancel
                </Button>

                <TransactionButton
                  variant='primary'
                  size='sm'
                  chainId={chainId}
                  txDescription={`Updated Agreement for ${
                    localHat?.detailsObject
                      ? get(localHat, 'detailsObject.name')
                      : `Hat ${hatIdDecimalToIp(BigInt(eligibilityHatId))}`
                  }`}
                  sendTx={handleUpdateAgreement}
                  onReceipt={() => {}}
                  isDisabled={isEmpty(agreementContent)}
                  onClick={handleUpdateAgreement}
                >
                  Update Agreement
                </TransactionButton>
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
      )}
    </ModuleModal>
  );
};
