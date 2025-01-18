import { Button, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToHex, hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { DurationInput } from 'forms';
import { useAllWearers, useWearerDetails } from 'hats-hooks';
import { useIpfsData } from 'hooks';
import { compact, find, first, get, isEmpty, map, pick, size, subtract } from 'lodash';
import { useMultiClaimsHatterCheck } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { useCallback, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { AllowlistProfile, AppHat, ModuleDetails, SupportedChains } from 'types';
import { Card } from 'ui';
import { fetchToken, formatAddress, pinFileToIpfs } from 'utils';
import { Hex } from 'viem';
import { useAccount, useWriteContract } from 'wagmi';

import { ManageBar } from '../../module-modal';

const TransactionButton = dynamic(() => import('molecules').then((mod) => mod.TransactionButton));

const DEFAULT_GRACE_PERIOD = 4;
const DEFAULT_GRACE_PERIOD_UNIT = 'weeks';

export const AgreementForms = ({
  hat,
  chainId,
  onchainHats,
  localForm,
  moduleParameters,
  updatingAgreement,
  setUpdatingAgreement,
  setRemoveList,
  removeList,
  setRemoving,
  removing,
  moduleInfo,
  selectedOption,
}: AgreementFormsProps) => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const currentAgreement = get(find(moduleParameters, { label: 'Current Agreement' }), 'value');
  const { data: agreementData } = useIpfsData(currentAgreement as string);
  const agreementContent = get(agreementData, 'data');

  const { watch, reset } = pick(localForm, ['watch', 'reset']);

  const newAgreementContent = watch('agreementContent');
  const gracePeriod = watch('gracePeriod');

  const { wearers } = useAllWearers({
    selectedHat: hat || undefined,
    chainId: chainId as SupportedChains,
  });
  const { data: wearerHats } = useWearerDetails({
    wearerAddress: address as Hex,
    chainId,
  });
  const { instanceAddress } = useMultiClaimsHatterCheck({
    chainId: chainId as SupportedChains,
    selectedHat: hat,
    onchainHats,
  });

  const isWearing = !!find(wearers, { id: hat?.id });

  const ownerHat = get(find(moduleParameters, { label: 'Owner Hat' }), 'value');
  const judgeHat = get(find(moduleParameters, { label: 'Arbitrator Hat' }), 'value');

  const isJudge = !!find(wearerHats, {
    id: hatIdDecimalToHex(judgeHat as bigint),
  });
  const isOwner = !!find(wearerHats, {
    id: hatIdDecimalToHex(ownerHat as bigint),
  });

  const handleRemoveWearers = useCallback(async () => {
    if (!moduleInfo.instanceAddress) return;
    // TODO handle remove many
    const removeAddresses = map(removeList, (p) => p.id);
    const tx = await writeContractAsync({
      address: moduleInfo.instanceAddress,
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
    moduleInfo.instanceAddress,
    removeList,
    // writeContractAsync,
    setRemoving,
  ]);

  const handleSignAgreement = async () => {
    if (!moduleInfo.instanceAddress) return;
    const tx = await writeContractAsync({
      address: moduleInfo.instanceAddress,
      abi: moduleInfo.abi,
      functionName: 'signAgreementAndClaimHat',
      args: [instanceAddress],
    });

    console.log('tx', tx);
    // TODO handle success
  };

  const prepUpdateAgreement = () => {
    const localValues = {
      agreementContent,
      'gracePeriod-time-value': DEFAULT_GRACE_PERIOD,
      'gracePeriod-time-unit': DEFAULT_GRACE_PERIOD_UNIT,
    };
    reset(localValues, { keepDefaultValues: false });
    setUpdatingAgreement(true);
  };

  const agreementButtons = compact([
    selectedOption === 'Agreement' &&
      !isWearing && {
        label: 'Sign Agreement & Claim',
        onClick: handleSignAgreement,
        colorScheme: 'blue.500',
        section: 'Signature',
        hasRole: !isWearing,
      },
    selectedOption === 'Agreement' &&
      isOwner && {
        label: 'Update Agreement',
        onClick: prepUpdateAgreement,
        colorScheme: 'blue.500',
        section: 'Agreement',
        hasRole: isOwner,
      },
    selectedOption === 'Signatures' &&
      isJudge && {
        label: 'Remove Address',
        onClick: () => setRemoving(true),
        colorScheme: 'red.500',
        section: 'Signatures',
        hasRole: isJudge,
      },
  ]);

  const handleUpdateAgreement = async () => {
    if (!newAgreementContent || !hat?.id || !moduleInfo.instanceAddress) {
      return '0x';
    }

    const token = await fetchToken();
    // TODO handle error
    console.log('token', token);
    const ipfsHash = await pinFileToIpfs({
      file: newAgreementContent,
      fileName: `agreement_${hatIdDecimalToIp(BigInt(hat.id))}_${chainId}`,
      token,
    });

    console.log('ipfsHash', ipfsHash);
    const tx = await writeContractAsync({
      address: moduleInfo.instanceAddress,
      abi: moduleInfo.abi,
      functionName: 'setAgreement',
      args: [ipfsHash, gracePeriod],
    });
    console.log('tx', tx);
    // TODO handle success
    setUpdatingAgreement(false);
    return tx;
  };

  const sections = useMemo(() => {
    return [
      {
        label: 'Signatures',
        value: removing,
        hasRole: isJudge,
        section: (
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
        ),
      },
      {
        label: 'Agreement',
        value: updatingAgreement,
        hasRole: isOwner,
        section: (
          <Stack w='full' px={{ base: 4, md: 10 }} spacing={4}>
            <DurationInput name='gracePeriod' label='Grace Period' localForm={localForm} />

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
                  hat?.detailsObject
                    ? get(hat, 'detailsObject.name')
                    : hat?.id && `Hat ${hatIdDecimalToIp(BigInt(hat.id))}`
                }`}
                sendTx={handleUpdateAgreement}
                afterSuccess={() => {
                  setUpdatingAgreement(false);
                }}
                isDisabled={isEmpty(agreementContent)}
                onClick={handleUpdateAgreement}
              >
                Update Agreement
              </TransactionButton>
            </Flex>
          </Stack>
        ),
      },
    ];
  }, [
    selectedOption,
    isWearing,
    handleSignAgreement,
    isOwner,
    isJudge,
    removeList,
    handleRemoveWearers,
    localForm,
    chainId,
    hat?.id,
    handleUpdateAgreement,
    agreementContent,
    // reset,
  ]);
  console.log(agreementButtons);

  return <ManageBar sections={sections} buttons={agreementButtons} />;
};

interface AgreementFormsProps {
  hat: AppHat | undefined;
  chainId: number | undefined;
  onchainHats: AppHat[] | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  moduleParameters: ModuleParameter[];
  updatingAgreement: boolean;
  setUpdatingAgreement: (value: boolean) => void;
  setRemoveList: (value: AllowlistProfile[]) => void;
  removeList: AllowlistProfile[];
  setRemoving: (value: boolean) => void;
  removing: boolean;
  moduleInfo: ModuleDetails;
  selectedOption: 'Agreement' | 'Signatures';
}
