'use client';

import { Ruleset } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToHex, hatIdToTreeId, treeIdToTopHatId } from '@hatsprotocol/sdk-v1-core';
import { usePrivy } from '@privy-io/react-auth';
import { useQueryClient } from '@tanstack/react-query';
import { Modal, useOverlay } from 'contexts';
import { CouncilTransferForm } from 'forms';
import { useAllWearers, useHatDetails } from 'hats-hooks';
import { useAuthGuard, useCouncilDetails, useOffchainCouncilDetails, useSafeDetails, useWaitForSubgraph } from 'hooks';
import { concat, filter, find, flatten, get, includes, map, reduce, reject, size, toLower, toNumber } from 'lodash';
import { useEligibilityRules } from 'modules-hooks';
import { useState } from 'react';
import { idToIp } from 'shared';
import { CouncilMember, EligibilityRule, OffchainCouncilData, SupportedChains } from 'types';
import { AppHat } from 'types';
import { Button, cn, Skeleton } from 'ui';
import { MemberAvatar } from 'ui';
import {
  chainsMap,
  createHatsClient,
  currentThreshold,
  formatAddress,
  getAllWearers,
  getKnownEligibilityModule,
  logger,
  parseCouncilSlug,
  // sendTelegramMessage,
  // tgFormatAddress,
} from 'utils';
import { getAddress, Hex } from 'viem';
import { useAccount, useChainId, useSwitchChain, useWalletClient } from 'wagmi';

import { AddUserModal } from './add-user-modal';
import { ModuleManager } from './modules/module-manager';
import { SignerThresholdModal } from './signer-threshold-modal';
import { SignersIndicator } from './signers-indicator';

const DEFAULT_SECTIONS = [
  { value: 'threshold', label: 'Signer Threshold' },
  { value: 'admin', label: 'Organization Management' },
];

const OWNER_SECTIONS = [{ value: 'ownership', label: 'Organization Owner' }];

const filterRulesWithoutAdmin = (rules: Ruleset) => {
  return reject(
    rules,
    (rule) =>
      getKnownEligibilityModule(rule.module.implementationAddress as Hex) === 'erc20' ||
      getKnownEligibilityModule(rule.module.implementationAddress as Hex) === 'erc721' ||
      getKnownEligibilityModule(rule.module.implementationAddress as Hex) === 'erc1155',
  );
};

const eligibilityRuleMenuLabels = (rule: EligibilityRule, offchainCouncilDetails: OffchainCouncilData | undefined) => {
  if (rule.address === offchainCouncilDetails?.membersCriteriaModule) {
    return 'Compliance Management';
  }
  if (getKnownEligibilityModule(rule.module.implementationAddress as Hex) === 'agreement') {
    return 'Agreement Management';
  }

  return rule.module.name;
};

const SectionMenu = ({ sections, isLoading }: { sections: { value: string; label: string }[]; isLoading: boolean }) => {
  if (typeof window === 'undefined' || isLoading) {
    return (
      <div className='hidden min-w-40 flex-col gap-4 md:flex'>
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-full' />
      </div>
    );
  }

  return (
    <div className='hidden flex-col gap-4 md:flex'>
      {map(sections, (section) => (
        <a key={section.value} href={`#${section.value}`} className='text-sm'>
          {section.label}
        </a>
      ))}
    </div>
  );
};

// Component for managing modules for a specific role in MHSG councils
const RoleModuleManager = ({
  signerHat,
  chainId,
  offchainCouncilDetails,
  slug,
}: {
  signerHat: AppHat;
  chainId: number;
  offchainCouncilDetails: OffchainCouncilData | undefined;
  slug: string;
}) => {
  const { details: hatDetails } = useHatDetails({
    chainId: chainId as SupportedChains,
    hatId: signerHat.id ? hatIdDecimalToHex(BigInt(signerHat.id)) : undefined,
  });

  const { data: eligibilityRules, isLoading: eligibilityRulesLoading } = useEligibilityRules({
    address: toLower(signerHat.eligibility) as Hex,
    chainId: chainId as SupportedChains,
  });

  const allowlistModule = offchainCouncilDetails?.membersSelectionModule || signerHat.eligibility;
  const allRules = flatten(eligibilityRules) as EligibilityRule[];
  const rulesWithoutSelectionModule = filter(allRules, (rule) => toLower(rule.address) !== toLower(allowlistModule));

  // For MHSG councils, we want to show the allowlist/selection module management
  const selectionModuleRule = find(allRules, (rule) => toLower(rule.address) === toLower(allowlistModule));

  // Check if this role only has hat-wearing eligibility (no direct admin operations)
  const isOnlyHatWearing = allRules.length === 1 && allRules[0]?.module?.id.includes('hat-wearing');

  if (eligibilityRulesLoading) {
    return (
      <div className='space-y-6'>
        <div className='flex flex-col gap-6'>
          <Skeleton className='h-10 w-1/4' />
          <Skeleton className='h-14 w-1/2' />
        </div>
      </div>
    );
  }

  // Always show the role header, and check if we have modules to manage (including selection module)
  const hasAdditionalModules = rulesWithoutSelectionModule.length > 0;
  const hasSelectionModule = !!selectionModuleRule && !isOnlyHatWearing;

  return (
    <div className='space-y-6'>
      <div className='border-l-4 border-blue-500 pl-4'>
        <h3 className='text-lg font-semibold'>
          {hatDetails?.name || signerHat.detailsObject?.data.name || signerHat.name || `Role ${signerHat.prettyId}`}
        </h3>
        <p className='text-muted-foreground text-sm'>
          {isOnlyHatWearing
            ? 'This role is filled by holders of another role. No admin operations.'
            : hasSelectionModule || hasAdditionalModules
              ? 'Manage eligibility criteria and modules for this role'
              : 'No eligibility modules configured for this role'}
        </p>
      </div>

      {/* Show special message for hat-wearing only roles */}
      {isOnlyHatWearing && (
        <div className='rounded-lg p-4'>
          <h4 className='mb-2 font-medium'>Role Holding Eligibility</h4>
          <p className='text-sm text-gray-500'>
            This role is automatically filled by members who hold another specific hat/role. To manage who can fill this
            role, you need to manage the eligibility of the criterion hat that this role depends on.
          </p>
        </div>
      )}

      {/* Show allowlist/selection module management */}
      {hasSelectionModule && (
        <ModuleManager
          rule={selectionModuleRule!}
          chainId={chainId}
          key={`${signerHat.id}-${selectionModuleRule!.address}`}
          primarySignerHat={signerHat.id}
          criteriaModule={offchainCouncilDetails?.membersCriteriaModule as Hex}
          offchainCouncilDetails={offchainCouncilDetails}
          slug={slug}
        />
      )}

      {/* Show additional modules (criteria, compliance, etc.) */}
      {hasAdditionalModules &&
        map(rulesWithoutSelectionModule, (rule) => (
          <ModuleManager
            rule={rule}
            chainId={chainId}
            key={`${signerHat.id}-${rule.address}`}
            primarySignerHat={signerHat.id}
            criteriaModule={offchainCouncilDetails?.membersCriteriaModule as Hex}
            offchainCouncilDetails={offchainCouncilDetails}
            slug={slug}
          />
        ))}
    </div>
  );
};

export const ManagePage = ({ slug }: { slug: string }) => {
  const { chainId, address } = parseCouncilSlug(slug);
  const { setModals, handlePendingTx } = useOverlay();
  const { address: userAddress } = useAccount();
  const { user } = usePrivy();
  const { data: walletClient } = useWalletClient();
  const waitForSubgraph = useWaitForSubgraph({ chainId: chainId ?? 11155111 });
  const queryClient = useQueryClient();
  const { switchChain } = useSwitchChain();
  const currentChainId = useChainId();
  useAuthGuard();

  const { data: councilDetails, isLoading: councilDetailsLoading } = useCouncilDetails({
    chainId: chainId ?? 11155111,
    address,
  });
  const { data: offchainCouncilDetails } = useOffchainCouncilDetails({
    hsg: councilDetails?.id ? (getAddress(councilDetails?.id) as Hex) : undefined,
    chainId: chainId ?? 11155111,
    enabled: !!councilDetails?.id && !!chainId,
  });
  const allWearers = getAllWearers(offchainCouncilDetails?.creationForm || undefined);

  const signerHats = get(councilDetails, 'signerHats', []);
  const primarySignerHat = get(signerHats, '[0]');
  const isMultiHatSignerGroup = signerHats.length > 1;
  const ownerHat = get(councilDetails, 'ownerHat');
  const topHatId = ownerHat?.id && treeIdToTopHatId(hatIdToTreeId(BigInt(ownerHat.id)));

  // Load eligibility rules for the primary signer hat (maintains backward compatibility)
  const { data: eligibilityRules, isLoading: eligibilityRulesLoading } = useEligibilityRules({
    address: toLower(get(primarySignerHat, 'eligibility')) as Hex,
    chainId: (chainId ?? 11155111) as SupportedChains,
  });
  const allowlistModule = offchainCouncilDetails?.membersSelectionModule || get(primarySignerHat, 'eligibility');
  const rulesWithoutSelectionModule = filter(
    flatten(eligibilityRules),
    (rule) => toLower(rule.address) !== toLower(allowlistModule),
  );
  const { data: topHatDetails, isLoading: topHatDetailsLoading } = useHatDetails({
    chainId: (chainId ?? 11155111) as SupportedChains,
    hatId: topHatId ? hatIdDecimalToHex(topHatId) : undefined,
  });

  // Load hat details for each signer hat to get proper names for menu
  // We need to call useHatDetails for each hat individually to follow Rules of Hooks
  const signerHat1Details = useHatDetails({
    chainId: (chainId ?? 11155111) as SupportedChains,
    hatId: signerHats[0]?.id ? hatIdDecimalToHex(BigInt(signerHats[0].id)) : undefined,
  });
  const signerHat2Details = useHatDetails({
    chainId: (chainId ?? 11155111) as SupportedChains,
    hatId: signerHats[1]?.id ? hatIdDecimalToHex(BigInt(signerHats[1].id)) : undefined,
  });
  const signerHat3Details = useHatDetails({
    chainId: (chainId ?? 11155111) as SupportedChains,
    hatId: signerHats[2]?.id ? hatIdDecimalToHex(BigInt(signerHats[2].id)) : undefined,
  });
  const signerHat4Details = useHatDetails({
    chainId: (chainId ?? 11155111) as SupportedChains,
    hatId: signerHats[3]?.id ? hatIdDecimalToHex(BigInt(signerHats[3].id)) : undefined,
  });

  // Create lookup for hat details by hat ID
  const signerHatDetailsLookup = {
    [signerHats[0]?.id]: signerHat1Details.details,
    [signerHats[1]?.id]: signerHat2Details.details,
    [signerHats[2]?.id]: signerHat3Details.details,
    [signerHats[3]?.id]: signerHat4Details.details,
  };
  const userIsTopHat = !!find(topHatDetails?.wearers, { id: toLower(userAddress) });
  const { wearers: ownerHatWearers } = useAllWearers({
    selectedHat: ownerHat,
    chainId: (chainId ?? 11155111) as SupportedChains,
  });
  const extendedOwnerHatWearers = map(ownerHatWearers, (wearer) => ({
    ...wearer,
    ...find(allWearers, { address: getAddress(wearer.id) }),
  })); // transform includes address as wearer identifier
  const userIsManager = !!find(extendedOwnerHatWearers, { address: userAddress });
  const { data: safeSigners } = useSafeDetails({
    safeAddress: councilDetails?.safe as Hex,
    chainId: (chainId ?? 11155111) as SupportedChains,
  });
  const allHatWearers = map(flatten(concat(map(councilDetails?.signerHats, 'wearers'))), 'id');
  const signers = filter(safeSigners, (signer) => includes(allHatWearers, toLower(signer)));
  const totalMaxSupply = reduce(map(councilDetails?.signerHats, 'maxSupply'), (acc, curr) => acc + toNumber(curr), 0);

  // For single-hat councils, use existing logic
  // For multi-hat councils, generate role-specific menu options
  const baseMenuOptions = concat(
    DEFAULT_SECTIONS,
    map(filterRulesWithoutAdmin(rulesWithoutSelectionModule), (rule) => ({
      value: rule.address,
      // TODO handle more mappings here
      label: eligibilityRuleMenuLabels(rule, offchainCouncilDetails || undefined),
      module: rule.module,
    })),
    OWNER_SECTIONS,
  );

  // For MHSG councils, show roles instead of individual modules
  const mhsgMenuOptions = concat(
    DEFAULT_SECTIONS,
    map(signerHats, (hat, index) => {
      const hatDetails = signerHatDetailsLookup[hat.id];
      return {
        value: `role-${hat.id}`,
        label: hatDetails?.name || hat.detailsObject?.data?.name || hat.name || `Role ${index + 1}`,
      };
    }),
    OWNER_SECTIONS,
  );

  const menuOptions = isMultiHatSignerGroup ? mhsgMenuOptions : baseMenuOptions;

  const addManagerLoading = useState(false);
  const [, setAddManagerLoading] = addManagerLoading;

  const onAddManagerSuccess = async (user: CouncilMember | undefined) => {
    logger.debug({ user, userAddress, ownerHat, walletClient });
    if (!user?.address || !userAddress || !ownerHat?.id) return;
    const hatsClient = await createHatsClient(chainId ?? 11155111, walletClient);
    const result = await hatsClient?.mintHat({
      account: userAddress,
      hatId: BigInt(ownerHat?.id),
      wearer: user.address,
    });

    if (!result?.transactionHash) return;

    handlePendingTx?.({
      hash: result?.transactionHash,
      txChainId: chainId ?? 11155111,
      txDescription: `Minted hat ${idToIp(ownerHat?.id)} to ${user.name || formatAddress(user.address)}`,
      waitForSubgraph,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['councilDetails'] });
        queryClient.invalidateQueries({ queryKey: ['offchainCouncilDetails'] });
        setAddManagerLoading(false);

        // sendTelegramMessage(
        //   `New council manager added: ${tgFormatAddress(user.address)} https://pro.hatsprotocol.xyz/council/${slug}/manage`,
        // );

        setModals?.({});
      },
    });
  };

  const isDev = process.env.NODE_ENV !== 'production';

  return (
    <div className='mx-auto flex gap-20 px-4 pt-10 lg:max-w-[1000px]'>
      <div className='hidden w-1/3 justify-end md:flex'>
        <SectionMenu
          sections={menuOptions}
          isLoading={councilDetailsLoading || !councilDetails || eligibilityRulesLoading}
        />
      </div>

      <div className='flex w-full flex-col gap-10 px-2 md:w-2/3 md:px-0'>
        <div className='flex flex-col gap-4' id='threshold'>
          {typeof window === 'undefined' || councilDetailsLoading ? (
            <div className='flex flex-col gap-6'>
              <Skeleton className='h-10 w-1/4' />
              <Skeleton className='h-20 w-1/2' />
            </div>
          ) : (
            <>
              <h2 className='text-2xl font-bold'>Signer Threshold</h2>

              <div className='mt-2'>
                <SignersIndicator
                  threshold={currentThreshold(councilDetails, signers)}
                  signers={size(signers)}
                  maxSigners={totalMaxSupply}
                />
                {user && userIsManager && (
                  <div className='mt-4 flex'>
                    {currentChainId === chainId ? (
                      <Button variant='outline-blue' rounded='full' onClick={() => setModals?.({ hsgThreshold: true })}>
                        Change Threshold
                      </Button>
                    ) : (
                      <Button
                        variant='outline'
                        rounded='full'
                        onClick={() => switchChain({ chainId: chainId ?? 11155111 })}
                      >
                        Switch to {chainsMap(chainId ?? 11155111)?.name}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
          <SignerThresholdModal
            signer={councilDetails || undefined}
            signerHat={primarySignerHat}
            chainId={chainId ?? 11155111}
          />
        </div>

        {/* ONLY TOP HAT CAN EDIT ORGANIZATION MANAGERS */}
        <div className='space-y-6' id='admin'>
          {typeof window === 'undefined' || councilDetailsLoading || eligibilityRulesLoading ? (
            <div className='flex flex-col gap-6'>
              <Skeleton className='h-10 w-1/4' />
              <Skeleton className='h-14 w-1/2' />
              <div className='flex flex-col gap-2'>
                <Skeleton className='h-5 w-1/2' />
                <Skeleton className='h-5 w-1/2' />
                <Skeleton className='h-5 w-1/2' />
                <Skeleton className='h-5 w-1/2' />
              </div>
            </div>
          ) : (
            <>
              <h2 className='text-2xl font-semibold'>Organization Management</h2>

              <div className='space-y-4'>
                <div className='space-y-1'>
                  <h3 className='font-bold'>Organization Managers</h3>
                  <p className='text-sm'>
                    Can appoint and remove Managers and Members, change all Membership Criteria and edit any Council
                  </p>
                </div>

                <div className='flex flex-col gap-4'>
                  {map(ownerHat?.wearers, (owner) => {
                    const offchainDetails = find(allWearers, { address: getAddress(owner.id) });
                    return (
                      <div key={owner?.id} className={cn(isDev && !offchainDetails && 'bg-functional-link-primary/10')}>
                        <MemberAvatar member={{ ...offchainDetails, ...owner } as CouncilMember} />
                      </div>
                    );
                  })}
                </div>

                {user && userIsTopHat && (
                  <div className='mt-2 flex'>
                    {currentChainId === chainId ? (
                      <Button
                        variant='outline-blue'
                        rounded='full'
                        onClick={() => setModals?.({ 'addUser-admin': true })}
                      >
                        Add a Council Manager
                      </Button>
                    ) : (
                      <Button
                        variant='outline'
                        rounded='full'
                        onClick={() => switchChain({ chainId: chainId ?? 11155111 })}
                      >
                        Switch to {chainsMap(chainId ?? 11155111)?.name}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          <AddUserModal
            type='admin'
            userLabel='Council Manager'
            chainId={chainId as SupportedChains}
            afterSuccess={onAddManagerSuccess}
            councilId={offchainCouncilDetails?.creationForm?.id}
            existingUsers={extendedOwnerHatWearers as CouncilMember[]}
            addUserLoading={addManagerLoading}
          />
        </div>

        {/* MANAGERS CAN MANAGE OTHER MODULES */}
        {isMultiHatSignerGroup ? (
          // Multi-Hat Signer Group: Show separate module management for each role
          <div className='space-y-12'>
            {map(signerHats, (hat) => (
              <div key={hat.id} id={`role-${hat.id}`}>
                <RoleModuleManager
                  signerHat={hat}
                  chainId={chainId ?? 11155111}
                  offchainCouncilDetails={offchainCouncilDetails || undefined}
                  slug={slug}
                />
              </div>
            ))}
          </div>
        ) : (
          // Single-Hat Council: Use existing single module management
          <>
            {map(rulesWithoutSelectionModule, (rule) => (
              <ModuleManager
                rule={rule}
                chainId={chainId ?? 11155111}
                key={rule.address}
                primarySignerHat={primarySignerHat?.id}
                criteriaModule={offchainCouncilDetails?.membersCriteriaModule as Hex}
                offchainCouncilDetails={offchainCouncilDetails || undefined}
                slug={slug}
              />
            ))}
          </>
        )}

        {(councilDetailsLoading || eligibilityRulesLoading) && (
          <div className='space-y-6'>
            <div className='flex flex-col gap-6'>
              <Skeleton className='h-10 w-1/4' />
              <Skeleton className='h-14 w-1/2' />
              <div className='flex flex-col gap-2'>
                <Skeleton className='h-5 w-1/2' />
                <Skeleton className='h-5 w-1/2' />
                <Skeleton className='h-5 w-1/2' />
                <Skeleton className='h-5 w-1/2' />
              </div>
            </div>
          </div>
        )}

        {/* TOP HAT CAN TRANSFER */}
        <div className='space-y-6' id='ownership'>
          {councilDetailsLoading || topHatDetailsLoading ? (
            <div className='flex flex-col gap-6'>
              <Skeleton className='h-10 w-1/4' />
              <Skeleton className='h-14 w-1/2' />
              <div className='flex flex-col gap-2'>
                <Skeleton className='h-5 w-1/2' />
                <Skeleton className='h-5 w-1/2' />
                <Skeleton className='h-5 w-1/2' />
                <Skeleton className='h-5 w-1/2' />
              </div>
            </div>
          ) : (
            <>
              <h2 className='text-2xl font-bold'>Organization Ownership</h2>

              <div className='space-y-4'>
                <div className='space-y-1'>
                  <h3 className='font-bold'>Organization Owner</h3>
                  <p className='text-sm'>Can change all councils and admins</p>
                </div>

                <div className='space-y-2'>
                  {map(topHatDetails?.wearers, (owner) => {
                    // there will only be one wearer
                    const offchainDetails = find(allWearers, { address: getAddress(owner.id) });

                    return <MemberAvatar member={{ ...offchainDetails, ...owner } as CouncilMember} key={owner.id} />;
                  })}
                </div>

                {user && userIsTopHat && (
                  <div className='mt-2 flex'>
                    {currentChainId === chainId ? (
                      <Button
                        variant='outline-blue'
                        rounded='full'
                        onClick={() => setModals?.({ 'transfer-ownership': true })}
                      >
                        Transfer Ownership
                      </Button>
                    ) : (
                      <Button
                        variant='outline'
                        rounded='full'
                        onClick={() => switchChain({ chainId: chainId ?? 11155111 })}
                      >
                        Switch to {chainsMap(chainId ?? 11155111)?.name}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <Modal name='transfer-ownership' title='Transfer Ownership' size='lg'>
          <CouncilTransferForm
            hatId={primarySignerHat?.id}
            topHatWearerAddress={get(topHatDetails, 'wearers[0].id')}
            chainId={chainId as SupportedChains}
          />
        </Modal>
      </div>
    </div>
  );
};
