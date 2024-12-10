'use client';

import { Button } from '@chakra-ui/react';
import {
  hatIdDecimalToHex,
  hatIdToTreeId,
  treeIdToTopHatId,
} from '@hatsprotocol/sdk-v1-core';
import { useHatDetails } from 'hats-hooks';
import { useCouncilDetails } from 'hooks';
import { concat, filter, flatten, get, map, toLower } from 'lodash';
import { useEligibilityRules } from 'modules-hooks';
import { HatWearer, SupportedChains } from 'types';
import { parseCouncilSlug } from 'utils';
import { Hex } from 'viem';

import { ManagerAvatar } from './manager-avatar';
import ModuleManager from './modules/module-manager';
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

const selectionModule = '0x8250a44405C4068430D3B3737721D47bB614E7D2';
const criteriaModule = '0x03aB59ff1Ab959F2663C38408dD2578D149e4cd5';

const SectionMenu = ({
  sections,
}: {
  sections: { value: string; label: string }[];
}) => {
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

  const { data: councilDetails, isLoading: councilDetailsLoading } =
    useCouncilDetails({
      chainId: chainId ?? 11155111,
      address,
    });
  const primarySignerHat = get(councilDetails, 'signerHats[0]');
  const ownerHat = get(councilDetails, 'ownerHat');
  const topHatId =
    ownerHat && treeIdToTopHatId(hatIdToTreeId(BigInt(ownerHat.id)));
  const { data: eligibilityRules, isLoading: eligibilityRulesLoading } =
    useEligibilityRules({
      address: toLower(get(primarySignerHat, 'eligibility')) as Hex,
      chainId: (chainId ?? 11155111) as SupportedChains,
    });
  const rulesWithoutSelectionModule = filter(
    flatten(eligibilityRules),
    (rule) => rule.address !== selectionModule,
  );
  const { data: topHatDetails, isLoading: topHatDetailsLoading } =
    useHatDetails({
      chainId: (chainId ?? 11155111) as SupportedChains,
      hatId: topHatId ? hatIdDecimalToHex(topHatId) : undefined,
    });

  const sections = concat(
    DEFAULT_SECTIONS,
    map(rulesWithoutSelectionModule, (rule) => ({
      value: rule.address,
      label: rule.module.name,
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

          <SignersIndicator threshold={4} signers={7} />

          <div className='flex'>
            <Button variant='outline'>Change Threshold</Button>
          </div>
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
            <Button variant='outline'>Add Council Manager</Button>
          </div>
        </div>

        {/* MANAGERS CAN MANAGE OTHER MODULES */}
        {map(rulesWithoutSelectionModule, (rule) => (
          <ModuleManager rule={rule} chainId={chainId ?? 11155111} />
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
            <Button variant='outline'>Transfer Ownership</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagePage;
