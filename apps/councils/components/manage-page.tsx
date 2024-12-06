'use client';

import { useCouncilDetails } from 'hooks';
import { concat, flatten, get, map, toLower } from 'lodash';
import { useEligibilityRules } from 'modules-hooks';
import { SupportedChains } from 'types';
import { parseCouncilSlug } from 'utils';
import { Hex } from 'viem';

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
  const { data: eligibilityRules, isLoading: eligibilityRulesLoading } =
    useEligibilityRules({
      address: toLower(get(primarySignerHat, 'eligibility')) as Hex,
      chainId: (chainId ?? 11155111) as SupportedChains,
    });

  const sections = concat(
    DEFAULT_SECTIONS,
    flatten(
      map(eligibilityRules, (ruleSet) =>
        map(ruleSet, (rule) => ({
          value: rule.address,
          label: rule.module.name,
          module: rule.module,
        })),
      ),
    ),
    OWNER_SECTIONS,
  );

  return (
    <div className='flex gap-4'>
      <div className='flex w-1/5'>
        <SectionMenu sections={sections} />
      </div>

      <div className='flex w-4/5 flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <h2 className='text-lg font-semibold'>Signer Threshold</h2>

          <div className='flex gap-2'>
            {/* TODO info indicator */}
            <p>4</p>
            <p>confirmations required of</p>
            <p>7</p>
            <p>council members</p>
          </div>

          <p>4 confirmations required of 7 council members</p>
        </div>

        <div>
          <h2 className='text-lg font-semibold'>Council Management</h2>
        </div>

        {flatten(
          map(eligibilityRules, (ruleSets) =>
            map(ruleSets, (rule) => (
              <div key={rule.address}>
                <h2 className='text-lg font-semibold'>{rule.module.name}</h2>
              </div>
            )),
          ),
        )}

        <div>
          <h2 className='text-lg font-semibold'>Ownership</h2>
        </div>
      </div>
    </div>
  );
};

export default ManagePage;
