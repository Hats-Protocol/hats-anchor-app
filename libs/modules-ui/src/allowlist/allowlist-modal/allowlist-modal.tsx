'use client';

import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useTreeForm } from 'contexts';
import { useHatDetails, useProfileDetails } from 'hats-hooks';
import { compact, concat, find, map, pick, reject, toString } from 'lodash';
import { useAllowlist } from 'modules-hooks';
import { useCallback, useMemo, useState } from 'react';
import { get, useForm } from 'react-hook-form';
import { AllowlistProfile, ModuleDetails } from 'types';
import { Link } from 'ui';
import { explorerUrl, formatAddress } from 'utils';
import { Hex } from 'viem';

import { AboutModule, DevInfo, FILTER, Filter, ModuleHistory, ModuleModal, ProfileList } from '../../module-modal';
import { AllowlistForms } from './allowlist-forms';

const AllowlistModal = ({
  eligibilityHatId,
  moduleInfo,
}: {
  eligibilityHatId: Hex | undefined;
  moduleInfo: ModuleDetails;
}) => {
  const { chainId } = useTreeForm();
  const localForm = useForm();
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [updateList, setUpdateList] = useState<AllowlistProfile[]>([]);
  const [activeFilter, setActiveFilter] = useState<Filter>(FILTER.WEARER);
  const { setValue } = pick(localForm, ['setValue']);

  const { data: hat, details } = useHatDetails({
    hatId: eligibilityHatId,
    chainId,
  });

  const { data: allowlist } = useAllowlist({
    id: moduleInfo.instanceAddress,
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

  const handleUpdateListAdd = useCallback(
    (address: Hex) => {
      const profile = find(allowlistProfiles, { id: address });
      if (!profile) return;
      setUpdateList(concat(updateList, [profile]));
    },
    [updateList, allowlistProfiles],
  );

  const handleUpdateListRemove = useCallback(
    (address: Hex) => {
      setUpdateList(reject(updateList, (p) => p.id === address));
    },
    [updateList],
  );

  const liveParams = get(moduleInfo, 'liveParameters');
  const ownerHat = toString(get(find(liveParams, { label: 'Owner Hat' }), 'value'));
  const judgeHat = toString(get(find(liveParams, { label: 'Arbitrator Hat' }), 'value'));

  const handleClose = useCallback(() => {
    setActiveFilter(FILTER.WEARER);
    setUpdateList([]);
    setAdding(false);
    setUpdating(false);
    setValue('addresses', []);
    setValue('search', undefined);
  }, [setValue]);

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

  const devInfo = useMemo(() => {
    return compact([
      moduleInfo.instanceAddress && {
        label: 'Allowlist Module',
        descriptor: (
          <Link href={`${explorerUrl(chainId)}/address/${moduleInfo.instanceAddress}`}>
            {formatAddress(moduleInfo.instanceAddress as Hex)}
          </Link>
        ),
      },
    ]);
  }, [moduleInfo.instanceAddress, chainId]);

  if (!hat || !eligibilityHatId) return null;

  const hatId = hatIdDecimalToIp(hatIdHexToDecimal(eligibilityHatId));
  const hatName = details?.name || hat?.details;
  const heading = `Allowlist for Hat ${hatId} - ${hatName}`;

  return (
    <ModuleModal
      name={`${moduleInfo.instanceAddress}-allowlistManager`}
      title='Manage Allowlist'
      about={<AboutModule heading='About this Allowlist' moduleDescriptors={moduleDescriptors} />}
      history={<ModuleHistory />}
      devInfo={<DevInfo moduleDescriptors={devInfo} />}
      onClose={handleClose}
    >
      <ProfileList
        hat={hat}
        heading={heading}
        profiles={allowlistProfiles}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        localForm={localForm}
        handleUpdateListAdd={handleUpdateListAdd}
        handleUpdateListRemove={handleUpdateListRemove}
        updating={updating}
        updateList={updateList}
      />

      <AllowlistForms
        localForm={localForm}
        setUpdateList={setUpdateList}
        setUpdating={setUpdating}
        adding={adding}
        setAdding={setAdding}
        updateList={updateList}
        updating={updating}
        moduleInfo={moduleInfo}
        moduleParameters={liveParams}
      />
    </ModuleModal>
  );
};

export { AllowlistModal };
