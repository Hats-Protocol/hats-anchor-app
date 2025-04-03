'use client';

import { hatIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { useTreeForm } from 'contexts';
import { ControlledRadioBox, Form, Textarea } from 'forms';
import { useHatDetails, useProfileDetails } from 'hats-hooks';
import { useIpfsData } from 'hooks';
import { compact, concat, find, map, reject } from 'lodash';
import { useAgreementEligibility } from 'modules-hooks';
import { useCallback, useMemo, useState } from 'react';
import { get, useForm } from 'react-hook-form';
import { AllowlistProfile, ModuleDetails } from 'types';
import { DialogDescription, DialogTitle, Markdown, ScrollArea, VisuallyHidden } from 'ui';
import { Hex } from 'viem';

import { AboutModule, ModuleHistory, ModuleModal, ProfileList } from '../../module-modal';
import { AgreementForms } from './agreement-forms';

export const AgreementModal = ({
  eligibilityHatId,
  moduleInfo,
}: {
  eligibilityHatId: Hex | undefined;
  moduleInfo: ModuleDetails;
}) => {
  const { chainId, onchainHats } = useTreeForm();
  const localForm = useForm();
  const [removing, setRemoving] = useState(false);
  const [removeList, setRemoveList] = useState<AllowlistProfile[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('Agreement');
  const [updatingAgreement, setUpdatingAgreement] = useState(false);

  const { data: hat } = useHatDetails({
    hatId: eligibilityHatId,
    chainId,
  });

  const { data: agreementDetails } = useAgreementEligibility({
    id: moduleInfo.instanceAddress,
    chainId,
  });
  const { data: agreementProfiles } = useProfileDetails({
    addresses: get(agreementDetails, 'agreements.0.signers'), // TODO Get current agreement
    chainId,
  });
  const liveParams = get(moduleInfo, 'liveParameters');
  const ownerHat = get(find(liveParams, { label: 'Owner Hat' }), 'value');
  const judgeHat = get(find(liveParams, { label: 'Arbitrator Hat' }), 'value');
  const currentAgreement = get(find(liveParams, { label: 'Current Agreement' }), 'value');
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

  // const filteredProfiles = filterProfiles({
  //   profiles: mappedProfiles || [],
  //   wearerIds: map(wearers, (wearer) => wearer.id),
  // });
  // const currentFilteredProfiles = filter(
  //   filteredProfiles[activeFilter],
  //   (p) => !searchInput || includes(toString(p.id), searchInput) || includes(toString(p.ensName), searchInput),
  // );

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
        hatId: eligibilityHatId as Hex,
      },
      ownerHat && {
        label: 'Owner edits the agreement',
        hatId: hatIdDecimalToHex(ownerHat),
      },
      judgeHat && {
        label: 'Judge determines wearer standing',
        hatId: hatIdDecimalToHex(judgeHat),
      },
    ]);
  }, [ownerHat, judgeHat, eligibilityHatId]);

  if (!eligibilityHatId) return null;

  return (
    <ModuleModal
      name={`${moduleInfo.instanceAddress}-agreementManager`}
      title='Agreement Signers'
      about={<AboutModule heading='About this Agreement' moduleDescriptors={moduleDescriptors} />}
      history={<ModuleHistory />}
    >
      <VisuallyHidden>
        <DialogTitle>Agreement for Hat</DialogTitle>
        <DialogDescription>
          Includes a list of the current agreement signers and forms for updating the agreement or the associated
          wearers
        </DialogDescription>
      </VisuallyHidden>
      <ControlledRadioBox
        options={['Agreement', 'Signatures']}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
        size='sm'
      />

      {selectedOption === 'Agreement' &&
        (updatingAgreement ? (
          <Form {...localForm}>
            <div className='mt-8 w-full space-y-2'>
              <h3 className='text-md'>Update Agreement</h3>

              <Textarea name='agreementContent' className='h-[370px]' localForm={localForm} />
            </div>
          </Form>
        ) : (
          <ScrollArea className='mt-8 h-3/4'>
            <div className='prose w-full space-y-2'>
              <Markdown>{agreementContent as string}</Markdown>
            </div>
          </ScrollArea>
        ))}

      {selectedOption === 'Signatures' && (
        <ProfileList
          hat={hat}
          profiles={mappedProfiles}
          localForm={localForm}
          handleUpdateListAdd={handleAdd}
          handleUpdateListRemove={handleRemove}
          updating={removing}
          updateList={removeList}
        />
      )}

      <AgreementForms
        hat={hat}
        chainId={chainId}
        onchainHats={onchainHats}
        moduleInfo={moduleInfo}
        selectedOption={selectedOption as 'Agreement' | 'Signatures'}
        moduleParameters={liveParams}
        updatingAgreement={updatingAgreement}
        setUpdatingAgreement={setUpdatingAgreement}
        setRemoveList={setRemoveList}
        removeList={removeList}
        setRemoving={setRemoving}
        removing={removing}
        localForm={localForm}
      />
    </ModuleModal>
  );
};
