'use client';

import { Ruleset } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToHex, hatIdToTreeId, treeIdToTopHatId } from '@hatsprotocol/sdk-v1-core';
import { usePrivy } from '@privy-io/react-auth';
import { useQueryClient } from '@tanstack/react-query';
import { useOverlay } from 'contexts';
import { useHatDetails } from 'hats-hooks';
import { useCouncilDetails, useOffchainCouncilDetails, useSafeDetails, useWaitForSubgraph } from 'hooks';
import { concat, filter, find, flatten, get, includes, map, reject, size, toLower, toNumber } from 'lodash';
import { useEligibilityRules } from 'modules-hooks';
import { useState } from 'react';
import { idToIp } from 'shared';
import { CouncilMember, SupportedChains } from 'types';
import { Button } from 'ui';
import { MemberAvatar } from 'ui';
import {
  createHatsClient,
  formatAddress,
  getAllWearers,
  getKnownEligibilityModule,
  logger,
  parseCouncilSlug,
  sendTelegramMessage,
  tgFormatAddress,
} from 'utils';
import { getAddress, Hex } from 'viem';
import { useAccount, useWalletClient } from 'wagmi';

import { AddUserModal } from './add-user-modal';
import { ModuleManager } from './modules/module-manager';
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
    label: 'Organization Owner',
  },
];

const filterRulesWithoutAdmin = (rules: Ruleset) => {
  return reject(
    rules,
    (rule) =>
      getKnownEligibilityModule(rule.module.implementationAddress as Hex) === 'erc20' ||
      getKnownEligibilityModule(rule.module.implementationAddress as Hex) === 'erc721' ||
      getKnownEligibilityModule(rule.module.implementationAddress as Hex) === 'erc1155',
  );
};

const eligibilityRuleMenuLabels = (rule: any, offchainCouncilDetails: any) => {
  if (rule.address === offchainCouncilDetails?.membersCriteriaModule) {
    return 'Compliance Management';
  }
  if (getKnownEligibilityModule(rule.module.implementationAddress as Hex) === 'agreement') {
    return 'Agreement Management';
  }

  return rule.module.name;
};

const SectionMenu = ({ sections }: { sections: { value: string; label: string }[] }) => {
  return (
    <div className='flex flex-col gap-4'>
      {map(sections, (section) => (
        <a key={section.value} href={`#${section.value}`} className='text-sm'>
          {section.label}
        </a>
      ))}
    </div>
  );
};

const ManagePage = ({ slug }: { slug: string }) => {
  const { chainId, address } = parseCouncilSlug(slug);
  const { setModals, handlePendingTx } = useOverlay();
  const { address: userAddress } = useAccount();
  const { user } = usePrivy();
  const { data: walletClient } = useWalletClient();
  const waitForSubgraph = useWaitForSubgraph({ chainId: chainId ?? 11155111 });
  const queryClient = useQueryClient();

  const { data: councilDetails, isLoading: councilDetailsLoading } = useCouncilDetails({
    chainId: chainId ?? 11155111,
    address,
  });
  const { data: offchainCouncilDetails } = useOffchainCouncilDetails({
    chainId: chainId ?? 11155111,
    hsg: address as Hex,
  });
  const allWearers = getAllWearers(offchainCouncilDetails || undefined);

  const primarySignerHat = get(councilDetails, 'signerHats[0]');
  const ownerHat = get(councilDetails, 'ownerHat');
  const topHatId = ownerHat?.id && treeIdToTopHatId(hatIdToTreeId(BigInt(ownerHat.id)));
  const { data: eligibilityRules, isLoading: eligibilityRulesLoading } = useEligibilityRules({
    address: toLower(get(primarySignerHat, 'eligibility')) as Hex,
    chainId: (chainId ?? 11155111) as SupportedChains,
  });
  const rulesWithoutSelectionModule = filter(
    flatten(eligibilityRules),
    (rule) => toLower(rule.address) !== toLower(offchainCouncilDetails?.membersSelectionModule),
  );
  const { data: topHatDetails, isLoading: topHatDetailsLoading } = useHatDetails({
    chainId: (chainId ?? 11155111) as SupportedChains,
    hatId: topHatId ? hatIdDecimalToHex(topHatId) : undefined,
  });
  const userIsTopHat = !!find(topHatDetails?.wearers, { id: toLower(userAddress) });
  const extendedOwnerHatWearers = map(ownerHat?.wearers, (wearer) => ({
    ...wearer,
    ...find(allWearers, { address: getAddress(wearer.id) }),
  })); // transform includes address as wearer identifier
  const userIsManager = !!find(extendedOwnerHatWearers, { address: userAddress });
  logger.debug('offchainCouncilDetails', offchainCouncilDetails);
  const { data: safeSigners } = useSafeDetails({
    safeAddress: councilDetails?.safe as Hex,
    chainId: (chainId ?? 11155111) as SupportedChains,
  });
  const signers = filter(safeSigners, (signer) => includes(map(primarySignerHat?.wearers, 'id'), toLower(signer)));

  // TODO remove erc20 `getKnownEligibilityModule(rule.module.implementationAddress as Hex) !== 'erc20',`
  const menuOptions = concat(
    DEFAULT_SECTIONS,
    map(filterRulesWithoutAdmin(rulesWithoutSelectionModule), (rule) => ({
      value: rule.address,
      // TODO handle more mappings here
      label: eligibilityRuleMenuLabels(rule, offchainCouncilDetails),
      module: rule.module,
    })),
    OWNER_SECTIONS,
  );

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
        sendTelegramMessage(
          `New council manager added: ${tgFormatAddress(user.address)} https://pro.hatsprotocol.xyz/council/${slug}/manage`,
        );

        setModals?.({});
      },
    });
  };
  console.log({ userIsManager, userIsTopHat });

  return (
    <div className='flex gap-4 pt-10'>
      <div className='flex w-1/5'>
        <SectionMenu sections={menuOptions} />
      </div>

      <div className='flex w-4/5 flex-col gap-10'>
        <div className='flex flex-col gap-4' id='threshold'>
          <h2 className='text-2xl font-bold'>Signer Threshold</h2>

          <div className='mt-2'>
            <SignersIndicator
              threshold={toNumber(get(councilDetails, 'minThreshold'))}
              signers={size(signers)}
              maxSigners={toNumber(get(primarySignerHat, 'maxSupply'))}
            />
          </div>

          {user && userIsManager && (
            <div className='mt-2 flex'>
              <Button variant='outline-blue' rounded='full' onClick={() => setModals?.({ hsgThreshold: true })}>
                Change Threshold
              </Button>
            </div>
          )}

          <SignerThresholdModal
            signer={councilDetails || undefined}
            signerHat={primarySignerHat}
            chainId={chainId ?? 11155111}
          />
        </div>

        {/* TOP HAT CAN EDIT MANAGERS */}
        <div className='space-y-6' id='admin'>
          <h2 className='text-2xl font-semibold'>Council Management</h2>

          <div className='space-y-4'>
            <div className='space-y-1'>
              <h3 className='font-bold'>Council Managers</h3>
              <p className='text-sm'>Can select Council Members</p>
            </div>

            <div className='flex flex-col gap-2'>
              {map(ownerHat?.wearers, (owner) => {
                const offchainDetails = find(getAllWearers(offchainCouncilDetails || undefined), {
                  address: getAddress(owner.id),
                });
                return <MemberAvatar member={{ ...offchainDetails, ...owner } as CouncilMember} key={owner?.id} />;
              })}
            </div>

            {user && userIsTopHat && (
              <div className='mt-2 flex'>
                <Button variant='outline-blue' rounded='full' onClick={() => setModals?.({ 'addUser-admin': true })}>
                  Add a Council Manager
                </Button>
              </div>
            )}
          </div>

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
        {map(rulesWithoutSelectionModule, (rule) => (
          <ModuleManager
            rule={rule}
            chainId={chainId ?? 11155111}
            key={rule.address}
            criteriaModule={offchainCouncilDetails?.membersCriteriaModule as Hex}
            offchainCouncilDetails={offchainCouncilDetails || undefined}
            slug={slug}
          />
        ))}

        {/* TOP HAT CAN TRANSFER */}
        <div className='space-y-6' id='ownership'>
          <h2 className='text-2xl font-bold'>Organization Ownership</h2>

          <div className='space-y-4'>
            <div className='space-y-1'>
              <h3 className='font-bold'>Organization Owner</h3>
              <p className='text-sm'>Can change all councils and admins</p>
            </div>

            <div className='space-y-2'>
              {map(topHatDetails?.wearers, (owner) => {
                // there will only be one wearer
                const offchainDetails = find(getAllWearers(offchainCouncilDetails || undefined), {
                  address: getAddress(owner.id),
                });

                return <MemberAvatar member={{ ...offchainDetails, ...owner } as CouncilMember} key={owner.id} />;
              })}
            </div>

            {user && userIsTopHat && (
              <div className='mt-2 flex'>
                <Button variant='outline-blue' rounded='full' disabled>
                  Transfer Ownership
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { ManagePage };
