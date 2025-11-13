'use client';

import { hatIdDecimalToHex, hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useHatDetails } from 'hats-hooks';
import { filter, find, flatten, get, includes, isEmpty, map, pick, split, toLower } from 'lodash';
import { useAllowlist, useEligibilityRules, useErc20Details, useHatWearingEligibility } from 'modules-hooks';
import { AppHat, CouncilMember, EligibilityRule, ExtendedHSGV2, OffchainCouncilData, SupportedChains } from 'types';
import { Link } from 'ui';
import { eligibilityRuleToModuleDetails, formatAddress, getKnownEligibilityModule, hatLink } from 'utils';
import { formatUnits, getAddress, Hex, zeroAddress } from 'viem';

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

  // Check if this is a known module by using the same logic as claims
  const moduleDetails = eligibilityRuleToModuleDetails(rule);
  const knownModule = moduleDetails?.implementationAddress
    ? getKnownEligibilityModule(moduleDetails.implementationAddress as Hex)
    : undefined;

  if (!knownModule) {
    return (
      <div className='flex h-full w-28 items-center justify-center'>
        <p className='text-center'>Unknown</p>
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
  showRoleHeader = false,
}: RoleTableProps) => {
  const { data: hatData, details: hatDetails } = useHatDetails({
    chainId,
    hatId: signerHat.id ? hatIdDecimalToHex(BigInt(signerHat.id)) : undefined,
  });

  // Load eligibility rules specific to this hat (not shared across roles)
  const { data: eligibilityRules, isLoading: eligibilityRulesLoading } = useEligibilityRules({
    address: toLower(get(signerHat, 'eligibility')) as Hex,
    chainId,
  });

  const isDev = false || process.env.NODE_ENV !== 'production';

  // Get hat wearers for this specific role
  const hatWearers = hatData?.wearers || [];

  // Convert hat wearers to the expected CouncilMember format
  const roleMembers = map(hatWearers, (wearer) => ({
    id: wearer.id,
    address: wearer.id,
    email: '', // Default empty email for hat wearers
    eligible: true,
    badStanding: false,
  }));

  // Get first module in eligibility chain or the only module
  const flattenedRules = flatten(eligibilityRules) as EligibilityRule[];
  const firstModule = flattenedRules[0];
  const firstModuleAddress = firstModule?.address;

  // Check if first module is an allowlist module
  const { data: rawAllowlist } = useAllowlist({
    id: firstModuleAddress,
    chainId,
  });
  const filteredAllowlist = filter(rawAllowlist, (member) => member.eligible && !member.badStanding);

  // Check if first module is a hat wearing eligibility module
  const isHatWearingModule = firstModule?.module?.id.includes('hat-wearing');
  const { data: rawHatWearingEligibility } = useHatWearingEligibility({
    id: isHatWearingModule ? firstModuleAddress : undefined,
    chainId,
  });
  const filteredHatWearingEligibility = filter(
    rawHatWearingEligibility,
    (member) => member.eligible && !member.badStanding,
  );

  // Determine labeled modules context (similar to member-status-modal)
  const labeledModules = {
    selection: get(offchainCouncilData, 'membersSelectionModule', '0x') as Hex,
    criteria: get(offchainCouncilData, 'membersCriteriaModule', '0x') as Hex,
  };

  // Check if first module should be treated as "Appointed" based on context
  // Similar logic to allowlist-status-manager for masking
  const shouldShowFirstModuleAsAppointed =
    firstModule &&
    (firstModule.address === labeledModules?.selection ||
      (!firstModule.address || firstModule.address === labeledModules?.criteria
        ? false // Don't show criteria module as appointed
        : flattenedRules.length === 1 || // Single module - show as appointed
          flattenedRules[0] === firstModule)); // First in chain - show as appointed

  // Determine which eligibility list to use for "Appointed" status
  let appointedList: CouncilMember[] = [];
  if (shouldShowFirstModuleAsAppointed && rawAllowlist && rawAllowlist.length > 0) {
    // Allowlist module takes precedence - map to CouncilMember format
    const sourceList = isDev ? rawAllowlist : filteredAllowlist;
    appointedList = map(sourceList, (member) => ({
      ...member,
      address: member.address || member.id,
      email: '', // Default empty email for allowlist members
    }));
  } else if (shouldShowFirstModuleAsAppointed && rawHatWearingEligibility && rawHatWearingEligibility.length > 0) {
    // Hat wearing eligibility as fallback - map to CouncilMember format
    const sourceList = isDev ? rawHatWearingEligibility : filteredHatWearingEligibility;
    appointedList = map(sourceList, (member) => ({
      ...member,
      address: member.address || member.id,
      email: '', // Default empty email for hat wearing members
    }));
  }

  // Use hat wearers for display, but use appointment list for "Appointed" status when available
  const allowlist = roleMembers.length > 0 ? roleMembers : appointedList;

  // Remove the first module from remaining modules only if it's being shown as "Appointed" status
  const remainingModules = shouldShowFirstModuleAsAppointed
    ? filter(flattenedRules, (rule) => toLower(rule.address) !== toLower(firstModuleAddress))
    : flattenedRules;

  if (eligibilityRulesLoading) {
    return null; // Let parent handle loading state
  }

  return (
    <div className='mb-8'>
      {showRoleHeader && (
        <div className='mb-4'>
          <h3 className='text-lg font-semibold'>
            {hatDetails?.name ||
              signerHat.detailsObject?.data?.name ||
              `Role ${hatIdDecimalToHex(BigInt(signerHat.id))}`}
          </h3>
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
            {shouldShowFirstModuleAsAppointed && (
              <div className='flex h-full w-28 items-center justify-center'>
                <p className='text-center'>Appointed</p>
              </div>
            )}

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
                address: getAddress(member.id),
              });

              return (
                <MemberRow
                  key={member.id}
                  // ? member row expects address also
                  member={{ ...member, address: member.id, ...offchainDetails }}
                  remainingModules={remainingModules}
                  chainId={chainId}
                  signerHat={signerHat}
                  eligibilityRules={eligibilityRules || undefined}
                  offchainCouncilData={offchainCouncilData}
                  councilData={councilDetails}
                  inAllowlist={includes(map(filteredAllowlist, 'address'), toLower(member.id))}
                  inHatWearingEligibility={includes(map(filteredHatWearingEligibility, 'address'), toLower(member.id))}
                  firstModule={firstModule}
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

      {/* Dev debugging information */}
      {isDev && (
        <div className='mt-4 rounded-lg bg-gray-100 p-4 text-xs'>
          <h4 className='mb-2 font-semibold'>
            🔍 Debug - ID:{' '}
            <Link href={hatLink({ chainId, hatId: signerHat.id })}>{hatIdDecimalToIp(BigInt(signerHat.id))}</Link>
          </h4>

          <div className='grid grid-cols-2 gap-4'>
            {/* Left Column - Full Role Information */}
            <div>
              <h5 className='mb-2 font-semibold text-blue-600'>Full Role Information</h5>
              <p>
                <strong>Hat Eligibility:</strong> {get(signerHat, 'eligibility')}
              </p>
              <p>
                <strong>Hat Wearers Count:</strong> {hatWearers?.length || 0}
              </p>

              {eligibilityRules && (
                <div className='mt-3'>
                  <p>
                    <strong>All Eligibility Modules:</strong>
                  </p>
                  <ul className='ml-4'>
                    {flatten(eligibilityRules).map((rule, idx) => (
                      <li key={idx}>
                        {idx === 0 ? '🎯 ' : '• '}
                        {formatAddress(rule.address)} - {rule.module?.name} ({rule.module?.id})
                        {idx === 0 ? ' (Appointed)' : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {hatWearers && hatWearers.length > 0 && (
                <div className='mt-3'>
                  <p>
                    <strong>All Hat Wearers:</strong>
                  </p>
                  <ul className='ml-4'>
                    {hatWearers.map((wearer, idx) => (
                      <li key={idx}>• {wearer.id}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Column - First/Appointed Module Information */}
            <div>
              <h5 className='mb-2 font-semibold text-green-600'>Appointed Module (First Module)</h5>
              <p>
                <strong>Module Address:</strong> {firstModule?.address || 'None'}
              </p>
              <p>
                <strong>Module Type:</strong> {firstModule?.module?.name || 'Unknown'} (
                {firstModule?.module?.id || 'N/A'})
              </p>

              {/* Allowlist Module Information */}
              {rawAllowlist && rawAllowlist.length > 0 && (
                <>
                  <p>
                    <strong>Is Allowlist Module:</strong> Yes
                  </p>
                  <p>
                    <strong>Raw Allowlist Count:</strong> {rawAllowlist?.length || 0}
                  </p>
                  <p>
                    <strong>Filtered Allowlist Count:</strong> {filteredAllowlist?.length || 0}
                  </p>
                  <div className='mt-3'>
                    <p>
                      <strong>Allowlist Members:</strong>
                    </p>
                    <ul className='ml-4'>
                      {rawAllowlist.map((member, idx) => (
                        <li key={idx}>
                          • {member.address} - Eligible: {member.eligible ? 'Yes' : 'No'}, Bad Standing:{' '}
                          {member.badStanding ? 'Yes' : 'No'}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {/* Hat Wearing Eligibility Module Information */}
              {rawHatWearingEligibility && rawHatWearingEligibility.length > 0 && (
                <>
                  <p>
                    <strong>Is Hat Wearing Module:</strong> Yes
                  </p>
                  <p>
                    <strong>Raw Hat Wearing Count:</strong> {rawHatWearingEligibility?.length || 0}
                  </p>
                  <p>
                    <strong>Filtered Hat Wearing Count:</strong> {filteredHatWearingEligibility?.length || 0}
                  </p>
                  <div className='mt-3'>
                    <p>
                      <strong>Hat Wearing Eligible Members:</strong>
                    </p>
                    <ul className='ml-4'>
                      {rawHatWearingEligibility.map((member, idx) => (
                        <li key={idx}>
                          • {member.address} - Eligible: {member.eligible ? 'Yes' : 'No'}, Bad Standing:{' '}
                          {member.badStanding ? 'Yes' : 'No'}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {/* No appointment module */}
              {!firstModule && (
                <p className='text-gray-500'>
                  <em>No appointment module detected</em>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { RoleTable };
