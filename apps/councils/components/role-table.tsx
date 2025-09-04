'use client';

import { hatIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { usePrivy } from '@privy-io/react-auth';
import { useQueryClient } from '@tanstack/react-query';
import { useHatDetails } from 'hats-hooks';
import { filter, find, flatten, get, includes, isEmpty, map, pick, split, toLower } from 'lodash';
import { useAllowlist, useCallModuleFunction, useEligibilityRules, useErc20Details } from 'modules-hooks';
import posthog from 'posthog-js';
import { AppHat, CouncilMember, EligibilityRule, ExtendedHSGV2, ModuleFunction, OffchainCouncilData, SupportedChains } from 'types';
import { formatUnits, getAddress, Hex, zeroAddress } from 'viem';
import { useAccount } from 'wagmi';

import { MemberRow } from './member-row';

interface Erc20Details {
  userBalance: bigint;
  userBalanceDisplay: string;
  tokenDetails: {
    symbol: string;
    name: string;
    decimals: number;
  };
}

const ModuleDisplay = ({
  rule,
  chainId,
  offchainCouncilData,
}: {
  rule: EligibilityRule;
  chainId: SupportedChains;
  offchainCouncilData: OffchainCouncilData;
}) => {
  const tokenParam = rule.module.id.includes('erc20') ? find(rule.liveParams, { displayType: 'erc20' }) : undefined;
  const amountParameter = rule.module.id.includes('erc20')
    ? find(rule.liveParams, { displayType: 'amountWithDecimals' })
    : undefined;
  const tokenAddress = tokenParam?.value as string;

  const { data: erc20Details, isLoading: isErc20Loading } = useErc20Details({
    contractAddress: tokenAddress ? (tokenAddress.toLowerCase() as Hex) : undefined,
    wearerAddress: zeroAddress,
    chainId,
  });

  if (toLower(rule.address) === toLower(offchainCouncilData?.membersCriteriaModule)) {
    return (
      <div className='flex h-full w-28 items-center justify-center'>
        <p className='text-center'>Compliance</p>
      </div>
    );
  }

  // ERC20 Module:
  if (rule.module.id.includes('erc20')) {
    if (isErc20Loading) {
      return (
        <div className='flex h-full w-28 items-center justify-center'>
          <p className='text-center'>ERC20</p>
        </div>
      );
    }

    const { tokenDetails } = pick(erc20Details || {}, ['tokenDetails']) as Partial<Erc20Details>;

    if (tokenDetails?.symbol && amountParameter?.value && tokenDetails.decimals !== undefined) {
      const minimumBalanceDisplay = formatUnits(amountParameter.value as bigint, tokenDetails.decimals);
      const minimumBalanceNumber = parseFloat(minimumBalanceDisplay);

      return (
        <div className='flex h-full w-28 items-center justify-center'>
          <p className='text-center'>
            Hold {minimumBalanceNumber === 1 ? '1' : minimumBalanceDisplay} {tokenDetails.symbol}
          </p>
        </div>
      );
    }

    // Show 'ERC20' as a fallback if token details aren't available/loaded
    return (
      <div className='flex h-full w-28 items-center justify-center'>
        <p className='text-center'>ERC20</p>
      </div>
    );
  }

  return (
    <div className='flex h-full w-28 items-center justify-center'>
      <p className='text-center'>{split(rule.module.name, ' ')[0]}</p>
    </div>
  );
};

interface RoleTableProps {
  signerHat: AppHat;
  chainId: SupportedChains;
  offchainCouncilData: OffchainCouncilData;
  councilDetails: ExtendedHSGV2;
  showRoleHeader?: boolean;
}

const RoleTable = ({ 
  signerHat, 
  chainId, 
  offchainCouncilData, 
  councilDetails,
  showRoleHeader = false 
}: RoleTableProps) => {
  const { address: userAddress } = useAccount();
  const { user } = usePrivy();
  const queryClient = useQueryClient();

  const { data: eligibilityRules, isLoading: eligibilityRulesLoading } = useEligibilityRules({
    address: toLower(get(signerHat, 'eligibility')) as Hex,
    chainId,
  });

  const isDev = posthog.isFeatureEnabled('dev') || process.env.NODE_ENV !== 'production';

  // support selected module or only module
  const allowlistModule = offchainCouncilData?.membersSelectionModule || get(signerHat, 'eligibility');
  const { data: rawAllowlist } = useAllowlist({
    id: allowlistModule,
    chainId,
  });
  const filteredAllowlist = filter(rawAllowlist, (member) => member.eligible && !member.badStanding);
  const allowlist = isDev ? rawAllowlist : filteredAllowlist;

  const remainingModules = filter(
    flatten(eligibilityRules), // TODO hardcoded "flatten" outer Rulesets
    (rule) => toLower(rule.address) !== toLower(allowlistModule),
  );

  const selectionModule = find(flatten(eligibilityRules), (rule) => toLower(rule.address) === toLower(allowlistModule));
  const addAccount = find(get(selectionModule, 'module.writeFunctions'), {
    functionName: 'addAccount',
  });

  const allowlistManagerHatId = get(
    find(get(selectionModule, 'liveParams'), {
      label: 'Owner Hat',
    }),
    'value',
  ) as bigint;
  const { data: allowlistManagerHat } = useHatDetails({
    chainId,
    hatId: allowlistManagerHatId ? hatIdDecimalToHex(allowlistManagerHatId) : undefined,
  });
  const userIsAllowlistManager = includes(map(get(allowlistManagerHat, 'wearers'), 'id'), toLower(userAddress));

  if (eligibilityRulesLoading) {
    return null; // Let parent handle loading state
  }

  return (
    <div className='mb-8'>
      {showRoleHeader && (
        <div className='mb-4'>
          <h3 className='text-lg font-semibold'>{signerHat.details?.name || `Role ${signerHat.id}`}</h3>
        </div>
      )}
      
      <div className='min-w-fit'>
        <div className='flex h-14 items-center justify-between'>
          <div className='flex items-center'>
            <div className='flex h-full w-[250px] items-center p-2'>
              <p>Council Member</p>
            </div>
          </div>

          <div className='flex items-center'>
            <div className='flex h-full w-28 items-center justify-center'>
              <p className='text-center'>Appointed</p>
            </div>

            {map(remainingModules, (rule) => (
              <ModuleDisplay
                key={rule.address}
                rule={rule}
                chainId={chainId}
                offchainCouncilData={offchainCouncilData}
              />
            ))}

            <div className='flex h-full w-28 items-center justify-center'>
              <p className='text-center'>Onboarded</p>
            </div>

            <div className='flex h-full w-48 items-center justify-center'>
              <p className='text-center'>Manager Controls</p>
            </div>
          </div>
        </div>

        {!isEmpty(allowlist) ? (
          <>
            {map(allowlist, (member: CouncilMember) => {
              const offchainDetails = find(get(offchainCouncilData, 'creationForm.members'), {
                address: getAddress(member.address),
              });

              return (
                <MemberRow
                  key={member.address}
                  member={{ ...member, ...offchainDetails }}
                  remainingModules={remainingModules}
                  chainId={chainId}
                  signerHat={signerHat}
                  eligibilityRules={eligibilityRules || undefined}
                  offchainCouncilData={offchainCouncilData}
                  councilData={councilDetails}
                  inAllowlist={includes(map(filteredAllowlist, 'address'), toLower(member.address))}
                />
              );
            })}
          </>
        ) : (
          <div className='flex h-20 items-center justify-center gap-4'>
            <p>No members found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export { RoleTable };