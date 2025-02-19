'use client';

import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToHex, hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import { useOverlay } from 'contexts';
import { DurationInput, Form } from 'forms';
import { useAllWearers, useWearerDetails } from 'hats-hooks';
import { useIpfsData, useWaitForSubgraph } from 'hooks';
import { compact, find, first, get, isEmpty, map, pick, size, subtract, toLower } from 'lodash';
import { useMultiClaimsHatterCheck } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { useCallback, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { AllowlistProfile, AppHat, ModuleDetails, SupportedChains } from 'types';
import { Button, Card } from 'ui';
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
  const { handlePendingTx } = useOverlay();
  const waitForSubgraph = useWaitForSubgraph({ chainId });
  const { writeContractAsync } = useWriteContract();
  const queryClient = useQueryClient();
  const currentAgreement = get(find(moduleParameters, { label: 'Current Agreement' }), 'value');
  const { data: agreementData } = useIpfsData(currentAgreement as string);
  const agreementContent = get(agreementData, 'data');
  const { openConnectModal } = useConnectModal();

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

  const isWearing = !!find(wearers, { id: toLower(address) });

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
    // TODO handle remove many (v0.3.0 and above)
    const removeAddresses = map(removeList, (p) => p.id);
    const hash = await writeContractAsync({
      address: moduleInfo.instanceAddress,
      abi: moduleInfo.abi,
      functionName: 'revoke',
      args: [first(removeAddresses)],
    });
    handlePendingTx?.({
      hash,
      txChainId: chainId,
      txDescription: `Removed Address from Agreement`,
      waitForSubgraph,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['eligibilityRules'] });
      },
    });
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
    const hash = await writeContractAsync({
      address: moduleInfo.instanceAddress,
      abi: moduleInfo.abi,
      functionName: 'signAgreementAndClaimHat',
      args: [instanceAddress],
    });

    handlePendingTx?.({
      hash,
      txChainId: chainId,
      txDescription: `Signed Agreement and claimed Hat ${
        hat?.detailsObject ? get(hat, 'detailsObject.name') : hat?.id && `Hat ${hatIdDecimalToIp(BigInt(hat.id))}`
      }`,
      waitForSubgraph,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['eligibilityRules'] });
      },
    });
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
    !address &&
      openConnectModal && {
        label: 'Connect Wallet to Sign',
        onClick: openConnectModal,
        colorScheme: 'blue.500',
        section: 'Signature',
        hasRole: !address,
      },
    selectedOption === 'Agreement' &&
      address &&
      !isWearing && {
        label: 'Sign Agreement & Claim',
        onClick: handleSignAgreement,
        colorScheme: 'blue.500',
        section: 'Signature',
        hasRole: !!address && !isWearing,
      },
    selectedOption === 'Agreement' &&
      !!address &&
      isOwner && {
        label: 'Update Agreement',
        onClick: prepUpdateAgreement,
        colorScheme: 'blue.500',
        section: 'Agreement',
        hasRole: !!address && isOwner,
      },
    selectedOption === 'Signatures' &&
      !!address &&
      isJudge && {
        label: 'Remove Address',
        onClick: () => setRemoving(true),
        colorScheme: 'red.500',
        section: 'Signatures',
        hasRole: !!address && isJudge,
      },
  ]);

  const handleUpdateAgreement = async () => {
    if (!newAgreementContent || !hat?.id || !moduleInfo.instanceAddress) {
      return '0x';
    }

    const token = await fetchToken();
    // TODO handle error

    const ipfsHash = await pinFileToIpfs({
      file: newAgreementContent,
      fileName: `agreement_${hatIdDecimalToIp(BigInt(hat.id))}_${chainId}`,
      token,
    });

    const hash = await writeContractAsync({
      address: moduleInfo.instanceAddress,
      abi: moduleInfo.abi,
      functionName: 'setAgreement',
      args: [ipfsHash, gracePeriod],
    });
    handlePendingTx?.({
      hash,
      txChainId: chainId,
      txDescription: `Updated Agreement for ${
        hat?.detailsObject ? get(hat, 'detailsObject.name') : hat?.id && `Hat ${hatIdDecimalToIp(BigInt(hat.id))}`
      }`,
      waitForSubgraph,
      onSuccess: () => {
        setUpdatingAgreement(false);
        queryClient.invalidateQueries({ queryKey: ['eligibilityRules'] });
      },
    });

    return hash;
  };

  const sections = useMemo(() => {
    return [
      {
        label: 'Signatures',
        value: removing,
        hasRole: isJudge,
        section: (
          <div className='flex w-full flex-col gap-6 px-4 md:px-10'>
            <div className='flex flex-col gap-4'>
              <h3 className='text-lg font-semibold'>Addresses selected for removal</h3>

              <Card className='rounded-md'>
                <div className='m-2 mx-4'>
                  {isEmpty(removeList) ? (
                    <p className='text-gray-500'>Select an address to remove</p>
                  ) : (
                    <p>
                      {map(
                        removeList,
                        (profile, index) =>
                          `${profile.ensName || formatAddress(profile.id)}${
                            index < subtract(size(removeList), 1) ? ', ' : ''
                          }`,
                      )}
                    </p>
                  )}
                </div>
              </Card>
            </div>

            <div className='flex w-full justify-between'>
              <Button
                variant='outline-blue'
                size='sm'
                onClick={() => {
                  setRemoveList([]);
                  setRemoving(false);
                }}
              >
                Cancel
              </Button>
              <Button variant='destructive' size='sm' disabled={isEmpty(removeList)} onClick={handleRemoveWearers}>
                Remove
              </Button>
            </div>
          </div>
        ),
      },
      {
        label: 'Agreement',
        value: updatingAgreement,
        hasRole: isOwner,
        section: (
          <Form {...localForm}>
            <div className='flex w-full flex-col gap-4 px-4 md:px-10'>
              <DurationInput name='gracePeriod' label='Grace Period' localForm={localForm} />

              <div className='flex w-full justify-between'>
                <Button variant='outline-blue' size='sm' onClick={() => setUpdatingAgreement(false)}>
                  Cancel
                </Button>

                <TransactionButton
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
                  disabled={isEmpty(agreementContent)}
                  onClick={handleUpdateAgreement}
                >
                  Update Agreement
                </TransactionButton>
              </div>
            </div>
          </Form>
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
