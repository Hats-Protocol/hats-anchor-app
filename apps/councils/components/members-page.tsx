'use client';

import { useCouncilDetails } from 'hooks';
import { get, toLower } from 'lodash';
import { useEligibilityRules } from 'modules-hooks';
import { SupportedChains } from 'types';
import { parseCouncilSlug } from 'utils';
import { Hex } from 'viem';

const MembersPage = ({ slug }: { slug: string }) => {
  const { chainId, address } = parseCouncilSlug(slug);
  const { data } = useCouncilDetails({
    chainId: chainId ?? 11155111,
    address,
  });
  const primarySignerHat = get(data, 'signerHats[0]');
  const { data: eligibilityRules } = useEligibilityRules({
    address: toLower(get(primarySignerHat, 'eligibility')) as Hex,
    chainId: (chainId ?? 11155111) as SupportedChains,
  });
  console.log('eligibilityRules', eligibilityRules);

  if (!data) return null;

  return <div>Members</div>;
};

export default MembersPage;
