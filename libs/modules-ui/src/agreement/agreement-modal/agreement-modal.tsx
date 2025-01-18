'use client';

import { Heading, Stack } from '@chakra-ui/react';
import { hatIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { useTreeForm } from 'contexts';
import { ControlledRadioBox, Textarea } from 'forms';
import { useAllWearers, useHatDetails, useProfileDetails } from 'hats-hooks';
import { useIpfsData } from 'hooks';
import { compact, concat, filter, find, includes, map, pick, reject, toString } from 'lodash';
import { useAgreementDetails } from 'modules-hooks';
import { useCallback, useMemo, useState } from 'react';
import { get, useForm } from 'react-hook-form';
import { AllowlistProfile, ModuleDetails } from 'types';
import { Markdown } from 'ui';
import { filterProfiles } from 'utils';
import { Hex } from 'viem';

import { AboutModule, FILTER, Filter, ModuleHistory, ModuleModal, ProfileList } from '../../module-modal';
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
  const [activeFilter, setActiveFilter] = useState<Filter>(FILTER.WEARER);
  const [selectedOption, setSelectedOption] = useState<string>('Agreement');
  const [updatingAgreement, setUpdatingAgreement] = useState(false);
  const { watch } = pick(localForm, ['watch']);

  const { data: hat } = useHatDetails({
    hatId: eligibilityHatId,
    chainId,
  });
  const { wearers } = useAllWearers({ selectedHat: hat || undefined, chainId });

  const searchInput = watch('search');
  const { data: agreementDetails } = useAgreementDetails({
    id: moduleInfo.instanceAddress,
    chainId,
  });
  const { data: agreementProfiles } = useProfileDetails({
    addresses: get(agreementDetails, 'agreements.0.signers'),
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

  const filteredProfiles = filterProfiles({
    profiles: mappedProfiles || [],
    wearerIds: map(wearers, (wearer) => wearer.id),
  });
  const currentFilteredProfiles = filter(
    filteredProfiles[activeFilter],
    (p) => !searchInput || includes(toString(p.id), searchInput) || includes(toString(p.ensName), searchInput),
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
      <ControlledRadioBox
        options={['Agreement', 'Signatures']}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
        size='sm'
      />

      {selectedOption === 'Agreement' &&
        (updatingAgreement ? (
          <Stack w='100%'>
            <Heading size='md'>Update Agreement</Heading>

            <Textarea name='agreementContent' localForm={localForm} minH='350px' />
          </Stack>
        ) : (
          <Stack w='100%' spacing={4} pt={10} overflowY='auto' pb='150px'>
            <Markdown>{agreementContent as string}</Markdown>
          </Stack>
        ))}

      {selectedOption === 'Signatures' && (
        <ProfileList
          hat={hat}
          profiles={currentFilteredProfiles}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
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
