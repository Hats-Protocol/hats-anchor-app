'use client';

import { CONFIG } from '@hatsprotocol/config';
import { CONTROLLER_TYPES, FORM_FIELDS, HATS_MODULES_FACTORY_ABI } from '@hatsprotocol/constants';
import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useHatForm, useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { AuthoritiesListForm, HatBasicsForm, HatManagementForm, HatWearerForm, ResponsibilitiesForm } from 'forms';
import { isMutableNotTopHat, isTopHat, isTopHatOrMutable } from 'hats-utils';
import { useClipboard, useToast } from 'hooks';
import { compact, concat, find, get, map, toLower, uniq } from 'lodash';
import { useHatsModules, useMultiClaimsHatterCheck } from 'modules-hooks';
import { HatFormAccordion } from 'molecules';
import { useState } from 'react';
import { BsKey, BsListUl } from 'react-icons/bs';
import { FaCopy } from 'react-icons/fa';
import { Button, Link, Slide, Tooltip } from 'ui';
import { ipfsUrl, viemPublicClient } from 'utils';
import { encodeAbiParameters, Hex, parseEventLogs } from 'viem';
import { useWriteContract } from 'wagmi';

import { ModuleDrawer } from '../module-drawer';

const EditMode = () => {
  const { drawers, setDrawers } = useOverlay();
  const { treeToDisplay, chainId } = useTreeForm();
  const { toast } = useToast();
  const { selectedHat, isDraft } = useSelectedHat();
  const { getDirtyFieldsForAccordion, handleSave: onSave } = useHatForm();
  const { modules } = useHatsModules({ chainId: selectedHat?.chainId });
  const [isStandaloneHatterDeploy, setIsStandAloneHatterDeploy] = useState(false);

  const { onCopy: copyHatId } = useClipboard(selectedHat?.id || '', {
    toastData: { title: 'Copied Hat ID to clipboard' },
  });

  const { claimableHats, claimableForHats, mchV2, instanceAddress } = useMultiClaimsHatterCheck({
    chainId: selectedHat?.chainId,
    selectedHatId: selectedHat?.id,
    onchainHats: treeToDisplay,
  });

  const { writeContractAsync } = useWriteContract();

  const name = get(find(treeToDisplay, { id: selectedHat?.id }), 'displayName');

  if (!selectedHat) return null;

  const openModuleDrawer = (type: string) => {
    onSave(false);
    setDrawers?.({ [toLower(type) || 'eligibility']: true });
  };

  const isDev = false || process.env.NODE_ENV !== 'production';

  const migrateMchV2 = async () => {
    const mchModule = find(modules, { implementationAddress: CONFIG.modules.claimsHatterV2 });
    if (!mchModule) {
      toast({
        title: 'MCH v2 module not found',
        description: 'Please deploy the MCH v2 module first',
      });
      return;
    }
    if (!chainId) return; // TODO better return

    const getClaimableHats = (claimableHats: Hex[] | undefined, claimableForHats: Hex[] | undefined) => {
      const allHats = compact(uniq(concat(claimableHats, claimableForHats))).sort();
      return map(compact(allHats), (hat) => hatIdHexToDecimal(hat));
    };
    const getClaimabilityTypes = (claimableHats: Hex[] | undefined, claimableForHats: Hex[] | undefined) => {
      const allHats = compact(uniq(concat(claimableHats, claimableForHats))).sort();
      const result = map(allHats, (hat) => {
        if (claimableForHats?.includes(hat)) {
          return 2;
        }
        return 1; // not handling non-claimable hats rn
      });
      return result;
    };

    const initArgs = encodeAbiParameters(
      [{ type: 'uint256[]' }, { type: 'uint8[]' }],
      [getClaimableHats(claimableHats, claimableForHats), getClaimabilityTypes(claimableHats, claimableForHats)],
    );

    const hash = await writeContractAsync({
      address: CONFIG.modules.factoryV7,
      abi: HATS_MODULES_FACTORY_ABI,
      functionName: 'createHatsModule',
      args: [CONFIG.modules.claimsHatterV2, hatIdHexToDecimal(selectedHat?.id), '0x', initArgs, BigInt(1)],
    });

    const client = viemPublicClient(chainId);
    const txData = await client.waitForTransactionReceipt({ hash });

    const events = parseEventLogs({
      logs: txData.logs,
      abi: HATS_MODULES_FACTORY_ABI,
      eventName: 'HatsModuleFactory_ModuleDeployed',
    });
    const mchAddress = get(events, '[0].args.instance');
    console.log({ mchAddress });
    // TODO: assign mch v2 as wearer, user can handle removing old mch
  };

  return (
    <>
      <div className='relative h-[calc(100%-100px)] w-full space-y-10 overflow-scroll p-10 pb-20'>
        <div className='flex flex-col'>
          <div className='flex items-center justify-between'>
            <h2 className='text-3xl font-medium'>
              {name ||
                (isDraft
                  ? `Add hat ${hatIdDecimalToIp(BigInt(selectedHat?.id))} to this tree`
                  : selectedHat?.detailsObject?.data?.name ||
                    selectedHat?.details ||
                    (selectedHat && hatIdDecimalToIp(BigInt(selectedHat?.id))))}
            </h2>
            <Tooltip label='Copy Hat ID'>
              <Button onClick={copyHatId} aria-label='Copy Hat ID' variant='outline-blue' size='sm'>
                <FaCopy className='size-4' />
              </Button>
            </Tooltip>
          </div>
          <p>All changes are local until you deploy to chain.</p>
        </div>

        {isTopHatOrMutable(selectedHat) && (
          <HatFormAccordion
            title='Hat Basics'
            subtitle='The fundamentals of the hat, including name, image, and description.'
            dirtyFieldsList={getDirtyFieldsForAccordion(FORM_FIELDS.basics)}
            open
          >
            <div className='mx-8 mt-4 space-y-4'>
              <HatBasicsForm />
            </div>
          </HatFormAccordion>
        )}

        {!isTopHat(selectedHat) && (
          <HatFormAccordion
            title='Wearers'
            subtitle='Individual, multisig, DAO, or contract addresses that hold this token.'
            dirtyFieldsList={getDirtyFieldsForAccordion(FORM_FIELDS.wearer)}
          >
            <div className='mx-8 mt-4 space-y-4'>
              <HatWearerForm />
            </div>
          </HatFormAccordion>
        )}

        {isTopHatOrMutable(selectedHat) && (
          <HatFormAccordion
            title='Responsibilities'
            subtitle='Specific work that wearers of this hat will be held accountable for.'
            dirtyFieldsList={getDirtyFieldsForAccordion(FORM_FIELDS.responsibilities)}
          >
            <div className='mx-8 mt-4 space-y-4'>
              <ResponsibilitiesForm
                formName='responsibilities'
                title='RESPONSIBILITIES'
                label='Responsibility'
                subtitle={
                  <p className='text-sm text-gray-500'>
                    Tasks and responsibilities associated with this hat. More details in the{' '}
                    <Link href={CONFIG.docsLinks.authorities} className='underline' isExternal>
                      docs
                    </Link>
                    .
                  </p>
                }
                Icon={BsListUl}
              />
            </div>
          </HatFormAccordion>
        )}

        {isTopHatOrMutable(selectedHat) && (
          <HatFormAccordion
            title='Authorities'
            subtitle='Authorities and rights that are controlled by wearers of this hat.'
            dirtyFieldsList={getDirtyFieldsForAccordion(FORM_FIELDS.powers)}
          >
            <div className='mx-8 mt-4 space-y-4'>
              <AuthoritiesListForm
                formName='authorities'
                title='AUTHORITIES'
                subtitle={
                  <p className='text-sm text-gray-500'>
                    Actions this hat enables its wearer to take. More details in the{' '}
                    <Link href={CONFIG.docsLinks.authorities} className='underline' isExternal>
                      docs
                    </Link>
                    .
                  </p>
                }
                label='Authority'
                Icon={BsKey}
              />
            </div>
          </HatFormAccordion>
        )}

        {isMutableNotTopHat(selectedHat) && (
          <HatFormAccordion
            title='Revocation & Eligibility'
            subtitle='The people or logic that determine when a wearer should have a hat.'
            dirtyFieldsList={getDirtyFieldsForAccordion(FORM_FIELDS.revocation)}
          >
            <div className='mx-8 mt-4 space-y-4'>
              <HatManagementForm
                title={CONTROLLER_TYPES.eligibility}
                formName='revocationsCriteria'
                radioBoxConfig={{
                  name: 'isEligibilityManual',
                  label: 'Hat Revocation',
                  subLabel: 'How should revocation from wearers be handled?',
                }}
                inputConfig={{
                  label: 'ACCOUNTABILITY',
                  description: [
                    <p key='manual' className='text-sm text-gray-500'>
                      The address of the person or group that can manually revoke this hat from specific wearers. More
                      details in the{' '}
                      <Link href={CONFIG.docsLinks.eligibility} className='underline' isExternal>
                        docs
                      </Link>
                      .
                    </p>,
                    <p key='automatic' className='text-sm text-gray-500'>
                      The address of the smart contract containing the logic about when a wearer should have this hat.
                      More details in the{' '}
                      <Link href={CONFIG.docsLinks.eligibility} className='underline' isExternal>
                        docs
                      </Link>
                      .
                    </p>,
                  ],
                }}
                criteriaConfig={{
                  label: 'ACCOUNTABILITY REQUIREMENTS',
                  description: 'A written description of the logic in the Accountability Contract',
                }}
                onOpenModuleDrawer={() => openModuleDrawer(CONTROLLER_TYPES.eligibility)}
                setIsStandAloneHatterDeploy={setIsStandAloneHatterDeploy}
              />
            </div>
          </HatFormAccordion>
        )}

        {isMutableNotTopHat(selectedHat) && (
          <HatFormAccordion
            title='Deactivation & Reactivation'
            subtitle='The people and contracts that control this Hat.'
            dirtyFieldsList={getDirtyFieldsForAccordion(FORM_FIELDS.deactivation)}
          >
            <div className='mx-8 mt-4 space-y-4'>
              <HatManagementForm
                title={CONTROLLER_TYPES.toggle}
                formName='deactivationsCriteria'
                radioBoxConfig={{
                  name: 'isToggleManual',
                  label: 'Hat Deactivation',
                  subLabel: 'How should hat deactivation and reactivation be handled?',
                }}
                inputConfig={{
                  label: 'DEACTIVATOR',
                  description: [
                    <p key='manual' className='text-sm text-gray-500'>
                      The address of the person or group that can manually deactivate and reactive this hat. More
                      details in the{' '}
                      <Link href={CONFIG.docsLinks.toggle} className='underline' isExternal>
                        docs
                      </Link>
                      .
                    </p>,
                    <p key='automatic' className='text-sm text-gray-500'>
                      The address of the smart contract containing the logic about when this hat should be active. More
                      details in the{' '}
                      <Link href={CONFIG.docsLinks.toggle} className='underline' isExternal>
                        docs
                      </Link>
                      .
                    </p>,
                  ],
                }}
                criteriaConfig={{
                  label: 'ACTIVATION REQUIREMENTS',
                  description:
                    'List any criteria that should be considered in the process of deactivating or reactivating this hat',
                }}
                onOpenModuleDrawer={() => openModuleDrawer(CONTROLLER_TYPES.toggle)}
                setIsStandAloneHatterDeploy={setIsStandAloneHatterDeploy}
              />
            </div>
          </HatFormAccordion>
        )}

        {isDev && (
          <div className='w-full space-y-4'>
            <div className='flex items-center gap-2'>
              <p className='text-sm font-medium'>Image URI:</p>
              <Link href={ipfsUrl(selectedHat?.imageUri)} className='underline' isExternal>
                <p className='max-w-[350px] truncate'>
                  {selectedHat?.imageUri !== '' ? selectedHat?.imageUri : 'Empty'}
                </p>
              </Link>
            </div>
            <div className='flex items-center gap-2'>
              <p className='text-sm font-medium'>Details URI:</p>
              <Link href={ipfsUrl(selectedHat?.details)} className='underline' isExternal>
                <p className='max-w-[350px] truncate'>{selectedHat?.details !== '' ? selectedHat?.details : 'Empty'}</p>
              </Link>
            </div>

            {instanceAddress && !mchV2 && (
              <div>
                <Button onClick={() => migrateMchV2()} variant='outline-blue' size='sm'>
                  Migrate MCH v0.2
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <Slide
        open={!!drawers?.eligibility || !!drawers?.toggle}
        className='max-w-[864px]'
        onClose={() => setDrawers?.({})}
        title={drawers?.eligibility ? 'Eligibility Module' : drawers?.toggle ? 'Toggle Module' : 'Module Details'}
      >
        {(drawers?.eligibility || drawers?.toggle) && (
          <ModuleDrawer
            onCloseModuleDrawer={() => setDrawers?.({})}
            isStandaloneHatterDeploy={isStandaloneHatterDeploy}
            title={drawers?.eligibility ? 'eligibility' : drawers?.toggle ? 'toggle' : undefined}
          />
        )}
      </Slide>
    </>
  );
};

export { EditMode };
