'use client';

import { Button } from '@chakra-ui/react';
import { hatIdDecimalToHex, hatIdToTreeId, treeIdToTopHatId } from '@hatsprotocol/sdk-v1-core';
import { useOverlay } from 'contexts';
import { useHatDetails } from 'hats-hooks';
import { useCouncilDetails, useOffchainCouncilDetails } from 'hooks';
import { concat, filter, flatten, get, map, size, toLower, toNumber } from 'lodash';
import { useEligibilityRules } from 'modules-hooks';
import { HatWearer, SupportedChains } from 'types';
import { ManagerAvatar } from 'ui';
import { logger, parseCouncilSlug } from 'utils';
import { Hex } from 'viem';

import { AddUserModal } from './add-user-modal';
import ModuleManager from './modules/module-manager';
import { SignerThresholdModal } from './signer-threshold-modal';
import { SignersIndicator } from './signers-indicator';

const DEFAULT_SECTIONS = [
  {
    value: 'threshold',
    label: 'Signer Threshold',
  },
  {
    value: 'admin',
    label: 'Council Management',
  },
];

const OWNER_SECTIONS = [
  {
    value: 'ownership',
    label: 'Ownership',
  },
];

const SectionMenu = ({ sections }: { sections: { value: string; label: string }[] }) => {
  return (
    <div className='flex flex-col gap-4'>
      {map(sections, (section) => (
        <div key={section.value} className='text-sm'>
          {section.label}
        </div>
      ))}
    </div>
  );
};

const ManagePage = ({ slug }: { slug: string }) => {
  const { chainId, address } = parseCouncilSlug(slug);
  const { setModals } = useOverlay();

  const { data: councilDetails, isLoading: councilDetailsLoading } = useCouncilDetails({
    chainId: chainId ?? 11155111,
    address,
  });
  const { data: offchainCouncilDetails } = useOffchainCouncilDetails({
    chainId: chainId ?? 11155111,
    hsg: address,
  });
  const primarySignerHat = get(councilDetails, 'signerHats[0]');
  const ownerHat = get(councilDetails, 'ownerHat');
  const topHatId = ownerHat?.id && treeIdToTopHatId(hatIdToTreeId(BigInt(ownerHat.id)));
  const { data: eligibilityRules, isLoading: eligibilityRulesLoading } = useEligibilityRules({
    address: toLower(get(primarySignerHat, 'eligibility')) as Hex,
    chainId: (chainId ?? 11155111) as SupportedChains,
  });
  const rulesWithoutSelectionModule = filter(
    flatten(eligibilityRules),
    (rule) => rule.address !== offchainCouncilDetails?.membersSelectionModule,
  );
  const { data: topHatDetails, isLoading: topHatDetailsLoading } = useHatDetails({
    chainId: (chainId ?? 11155111) as SupportedChains,
    hatId: topHatId ? hatIdDecimalToHex(topHatId) : undefined,
  });
  logger.debug('offchainCouncilDetails', offchainCouncilDetails);

  const sections = concat(
    DEFAULT_SECTIONS,
    map(rulesWithoutSelectionModule, (rule) => ({
      value: rule.address,
      label:
        rule.address === offchainCouncilDetails?.membersCriteriaModule ? 'Compliance Management' : rule.module.name,
      module: rule.module,
    })),
    OWNER_SECTIONS,
  );

  return (
    <div className='flex gap-4 pt-10'>
      <div className='flex w-1/5'>
        <SectionMenu sections={sections} />
      </div>

      <div className='flex w-4/5 flex-col gap-8'>
        <div className='flex flex-col gap-4'>
          <h2 className='text-lg font-semibold'>Signer Threshold</h2>

          <SignersIndicator
            threshold={toNumber(get(councilDetails, 'minThreshold'))}
            signers={size(get(primarySignerHat, 'wearers'))}
            maxSigners={toNumber(get(primarySignerHat, 'maxSupply'))}
          />

          <div className='flex'>
            <Button variant='outline' onClick={() => setModals?.({ hsgThreshold: true })}>
              Change Threshold
            </Button>
          </div>

          <SignerThresholdModal signer={councilDetails || undefined} signerHat={primarySignerHat} />
        </div>

        {/* TOP HAT CAN EDIT MANAGERS */}
        <div className='flex flex-col gap-4'>
          <h2 className='text-lg font-semibold'>Council Management</h2>

          <div className='flex flex-col gap-2'>
            {map(ownerHat?.wearers, (owner) => (
              <ManagerAvatar manager={owner as HatWearer} key={owner?.id} />
            ))}
          </div>

          <div className='flex'>
            <Button variant='outline' onClick={() => setModals?.({ 'addUser-admin': true })}>
              Add Council Manager
            </Button>
          </div>

          <AddUserModal type='admin' userLabel='Council Manager' chainId={chainId as SupportedChains} />
        </div>

        {/* MANAGERS CAN MANAGE OTHER MODULES */}
        {map(rulesWithoutSelectionModule, (rule) => (
          <ModuleManager
            rule={rule}
            chainId={chainId ?? 11155111}
            key={rule.address}
            criteriaModule={offchainCouncilDetails?.membersCriteriaModule as Hex}
          />
        ))}

        {/* TOP HAT CAN TRANSFER */}
        <div className='flex flex-col gap-4'>
          <h2 className='text-lg font-semibold'>Ownership</h2>

          <div className='flex flex-col gap-2'>
            {map(topHatDetails?.wearers, (owner) => (
              <ManagerAvatar manager={owner} key={owner.id} />
            ))}
          </div>

          <div className='flex'>
            <Button variant='outline' isDisabled>
              Transfer Ownership
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagePage;
