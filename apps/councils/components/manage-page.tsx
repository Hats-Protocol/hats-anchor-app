'use client';

import { Button } from '@chakra-ui/react';
import { hatIdDecimalToHex, hatIdToTreeId, treeIdToTopHatId } from '@hatsprotocol/sdk-v1-core';
import { useQueryClient } from '@tanstack/react-query';
import { useOverlay } from 'contexts';
import { useHatDetails } from 'hats-hooks';
import { useCouncilDetails, useOffchainCouncilDetails, useWaitForSubgraph } from 'hooks';
import { concat, filter, find, flatten, get, map, size, toLower, toNumber } from 'lodash';
import { useEligibilityRules } from 'modules-hooks';
import { idToIp } from 'shared';
import { CouncilMember, SupportedChains } from 'types';
import { MemberAvatar } from 'ui';
import { createHatsClient, formatAddress, getAllWearers, logger, parseCouncilSlug, sendTelegramMessage } from 'utils';
import { getAddress, Hex } from 'viem';
import { useAccount, useWalletClient } from 'wagmi';

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
  const { setModals, handlePendingTx } = useOverlay();
  const { address: currentUser } = useAccount();
  const { data: walletClient } = useWalletClient();
  const waitForSubgraph = useWaitForSubgraph({ chainId: chainId ?? 11155111 });
  const queryClient = useQueryClient();

  const { data: councilDetails, isLoading: councilDetailsLoading } = useCouncilDetails({
    chainId: chainId ?? 11155111,
    address,
  });
  const { data: offchainCouncilDetails } = useOffchainCouncilDetails({
    chainId: chainId ?? 11155111,
    hsg: address,
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
    (rule) => rule.address !== offchainCouncilDetails?.membersSelectionModule,
  );
  const { data: topHatDetails, isLoading: topHatDetailsLoading } = useHatDetails({
    chainId: (chainId ?? 11155111) as SupportedChains,
    hatId: topHatId ? hatIdDecimalToHex(topHatId) : undefined,
  });
  const extendedOwnerHatWearers = map(ownerHat?.wearers, (wearer) => ({
    ...wearer,
    ...find(allWearers, { address: getAddress(wearer.id) }),
  }));
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

  const onAddManagerSuccess = async (user: CouncilMember | undefined) => {
    logger.debug({ user, currentUser, ownerHat, walletClient });
    if (!user?.address || !currentUser || !ownerHat?.id) return;
    const hatsClient = await createHatsClient(chainId ?? 11155111, walletClient);
    const result = await hatsClient?.mintHat({
      account: currentUser,
      hatId: BigInt(ownerHat?.id),
      wearer: user.address,
    });

    if (!result?.transactionHash) return;

    handlePendingTx?.({
      hash: result?.transactionHash,
      txChainId: chainId ?? 11155111,
      txDescription: `Minted hat ${idToIp(ownerHat?.id)} to ${user.address}`,
      waitForSubgraph,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['councilDetails'] });
        queryClient.invalidateQueries({ queryKey: ['offchainCouncilDetails'] });

        sendTelegramMessage(
          `New council manager added: ${formatAddress(user.address)} https://pro.hatsprotocol.xyz/council/${slug}`,
        );

        setModals?.({});
      },
    });
  };

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

          <SignerThresholdModal
            signer={councilDetails || undefined}
            signerHat={primarySignerHat}
            chainId={chainId ?? 11155111}
          />
        </div>

        {/* TOP HAT CAN EDIT MANAGERS */}
        <div className='flex flex-col gap-4'>
          <h2 className='text-lg font-semibold'>Council Management</h2>

          <div className='flex flex-col gap-2'>
            {map(ownerHat?.wearers, (owner) => {
              const offchainDetails = find(getAllWearers(offchainCouncilDetails || undefined), {
                address: getAddress(owner.id),
              });
              return <MemberAvatar member={{ ...offchainDetails, ...owner } as CouncilMember} key={owner?.id} />;
            })}
          </div>

          <div className='flex'>
            <Button variant='outline' onClick={() => setModals?.({ 'addUser-admin': true })}>
              Add Council Manager
            </Button>
          </div>

          <AddUserModal
            type='admin'
            userLabel='Council Manager'
            chainId={chainId as SupportedChains}
            afterSuccess={onAddManagerSuccess}
            councilId={offchainCouncilDetails?.creationForm?.id}
            existingUsers={extendedOwnerHatWearers as CouncilMember[]}
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
          />
        ))}

        {/* TOP HAT CAN TRANSFER */}
        <div className='flex flex-col gap-4'>
          <h2 className='text-lg font-semibold'>Ownership</h2>

          <div className='flex flex-col gap-2'>
            {map(topHatDetails?.wearers, (owner) => {
              const offchainDetails = find(getAllWearers(offchainCouncilDetails || undefined), {
                address: getAddress(owner.id),
              });

              return <MemberAvatar member={{ ...offchainDetails, ...owner } as CouncilMember} key={owner.id} />;
            })}
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
