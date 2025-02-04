'use client';

import { Module, Ruleset } from '@hatsprotocol/modules-sdk';
import { useQueryClient } from '@tanstack/react-query';
import { Modal, useOverlay } from 'contexts';
import { Form, RadioBox } from 'forms';
import { useSafeDetails } from 'hooks';
import { compact, find, flatten, forEach, get, has, includes, map, toLower } from 'lodash';
import { useCallModuleFunction } from 'modules-hooks';
import { useEffect, useMemo, useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import type {
  CouncilMember,
  CurrentEligibility,
  ExtendedHSGV2,
  ModuleFunction,
  OffchainCouncilData,
  SupportedChains,
} from 'types';
import { Button, MemberAvatar } from 'ui';
import { getKnownEligibilityModule, logger, sendTelegramMessage, tgFormatAddress } from 'utils';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

interface RemoveReasonFormProps {
  reason: Hex; // address of the rule/module used for removal // TODO handle multiple potential reasons for removal
}

type RemoveUserModalProps = {
  chainId: number;
  type: 'member'; // | 'admin' | 'compliance' | 'allowlist' | 'agreement';
  userLabel: string;
  user?: CouncilMember | null;
  eligibilityRules?: Ruleset[];
  currentEligibility?: CurrentEligibility;
  offchainCouncilData?: OffchainCouncilData;
  councilData?: ExtendedHSGV2;
  afterSuccess?: (user: CouncilMember | undefined) => Promise<void>;
};

const KNOWN_REMOVE_FUNCTIONS = {
  agreement: 'revoke',
  allowlist: 'removeAccount',
};

const removeFunctionForModule = (module: Module) => {
  const moduleKey = getKnownEligibilityModule(module.implementationAddress as Hex);
  if (!moduleKey || !has(KNOWN_REMOVE_FUNCTIONS, moduleKey)) return null;

  return find(module.writeFunctions, { functionName: KNOWN_REMOVE_FUNCTIONS[moduleKey] }) as ModuleFunction;
};

const removeFunctionsForModules = (rules: Ruleset[] | undefined) => {
  const newObj: { [key: Hex]: ModuleFunction | null } = {};
  if (!rules) return newObj;

  forEach(flatten(rules), (rule) => {
    newObj[rule.address] = removeFunctionForModule(rule.module);
  });

  return newObj as { [key: Hex]: ModuleFunction | null };
};

const getRemoveFunctionArgs = (module: Module | undefined, user: CouncilMember | undefined) => {
  if (!module || !user) return {};
  const moduleKey = getKnownEligibilityModule(module.implementationAddress as Hex);
  if (!moduleKey) return {};

  if (moduleKey === 'allowlist') return { Account: user?.address };
  if (moduleKey === 'agreement') return { Wearer: user?.address };

  return { Account: user?.address };
};

function RemoveUserModal({
  chainId = 11155111,
  type,
  userLabel,
  user,
  eligibilityRules,
  currentEligibility,
  offchainCouncilData,
  councilData,
  afterSuccess,
}: RemoveUserModalProps) {
  const [formPending, setFormPending] = useState(false); // TODO handle loading state
  const form = useForm<RemoveReasonFormProps>();
  const queryClient = useQueryClient();
  const { setModals } = useOverlay();
  const { handleSubmit, reset } = form;
  const { address: userAddress } = useAccount();
  const { data: safeOwners } = useSafeDetails({
    safeAddress: councilData?.safe as Hex,
    chainId: chainId as SupportedChains,
  });
  const isSigner = includes(safeOwners, user?.address);
  const isSelectionAdmin = includes(
    get(
      find(flatten(eligibilityRules), (rule) => rule.address === offchainCouncilData?.membersSelectionModule),
      'wearers',
    ),
    toLower(userAddress),
  );
  const isComplianceAdmin = includes(
    get(
      find(flatten(eligibilityRules), (rule) => rule.address === offchainCouncilData?.membersCriteriaModule),
      'wearers',
    ),
    toLower(userAddress),
  );
  const isAgreementAdmin = includes(
    get(
      find(
        flatten(eligibilityRules),
        (rule) => getKnownEligibilityModule(rule.module.implementationAddress as Hex) === 'agreement',
      ),
      'wearers',
    ),
    toLower(userAddress),
  );
  const { mutateAsync: callModuleFn } = useCallModuleFunction({ chainId: chainId as SupportedChains });
  const removeFunctions = removeFunctionsForModules(eligibilityRules);

  const onSubmit = async (data: FieldValues) => {
    setFormPending(true);
    const rule = find(flatten(eligibilityRules), { address: data.reason }); // TODO hardcode flatten(eligibilityRules)
    if (!rule) return;
    const moduleEligibility = get(currentEligibility, rule.address, { eligible: false, goodStanding: false });
    const moduleEligible = moduleEligibility.eligible && moduleEligibility.goodStanding;

    let updateFunction = rule?.address ? get(removeFunctions, rule?.address) : null;
    const updateFunctionArgs = getRemoveFunctionArgs(rule?.module, user || undefined);
    if (rule?.address === offchainCouncilData?.membersCriteriaModule && !moduleEligible) {
      updateFunction = rule?.module.writeFunctions.find((fn) => fn.functionName === 'addAccount') as ModuleFunction;
    }

    if (!rule || !updateFunction) return;

    callModuleFn({
      moduleId: rule.module.implementationAddress,
      instance: data.reason,
      func: updateFunction,
      args: updateFunctionArgs,
      onSuccess: () => {
        if (user) {
          sendTelegramMessage(
            `${userLabel} ${user.name} (${tgFormatAddress(user.address)}) removed from council via ${rule.module.name}`,
          );
        }

        // TODO handle removing user from offchain council records

        logger.info('successfully removed user');
        setModals?.({});
        queryClient.invalidateQueries({ queryKey: ['offchainCouncilDetails'] });
        queryClient.invalidateQueries({ queryKey: ['allowlistDetails'] });
        queryClient.invalidateQueries({ queryKey: ['readContract'] });
        queryClient.invalidateQueries({ queryKey: ['currentEligibility'] });
        afterSuccess?.(user || undefined);
        setFormPending(false);
      },
      // onError: (error) => {
      //   logger.error(error);
      //   setFormPending(false);
      // },
      onDecline: () => {
        setFormPending(false);
      },
    });
  };

  const reasonOptions = useMemo(() => {
    if (!eligibilityRules || !offchainCouncilData || !currentEligibility) return [];

    // TODO check if user is respective admin
    return compact(
      map(flatten(eligibilityRules), (rule) => {
        // check if user is admin
        if (rule.address === offchainCouncilData?.membersSelectionModule && isSelectionAdmin) {
          const moduleEligibility = get(currentEligibility, rule.address, { eligible: false, goodStanding: false });
          return {
            label: 'No longer a council member',
            value: rule.address,
            isDisabled: !moduleEligibility.eligible || !moduleEligibility.goodStanding,
          };
        }

        // check if user is compliance admin and selected user is compliant
        if (rule.address === offchainCouncilData?.membersCriteriaModule && isComplianceAdmin) {
          const moduleEligibility = get(currentEligibility, rule.address, { eligible: false, goodStanding: false });
          const moduleEligible = moduleEligibility.eligible && moduleEligibility.goodStanding;
          return {
            label: moduleEligible ? 'Violated compliance' : 'Mark as compliant',
            value: rule.address,
            // isDisabled: !moduleEligible,
          };
        }

        // check if user is agreement admin and has signed the agreement
        if (getKnownEligibilityModule(rule.module.implementationAddress as Hex) === 'agreement' && isAgreementAdmin) {
          const moduleEligibility = get(currentEligibility, rule.address, { eligible: false, goodStanding: false });
          return {
            label: 'Violated the agreement',
            value: rule.address,
            isDisabled: !moduleEligibility.eligible || !moduleEligibility.goodStanding,
          };
        }
        if (
          getKnownEligibilityModule(rule.module.implementationAddress as Hex) === 'erc20' ||
          getKnownEligibilityModule(rule.module.implementationAddress as Hex) === 'erc721' ||
          getKnownEligibilityModule(rule.module.implementationAddress as Hex) === 'erc1155'
        ) {
          return undefined;
        }
        return { label: rule.module.name, value: rule.address };
      }),
    );
  }, [
    eligibilityRules,
    offchainCouncilData,
    currentEligibility,
    isSelectionAdmin,
    isComplianceAdmin,
    isAgreementAdmin,
  ]);

  useEffect(() => {
    if (!reasonOptions) return;

    reset({ reason: get(reasonOptions, '[0].value', '') as Hex });
  }, [reasonOptions, reset]);

  return (
    <Modal
      name={`removeUser-${type}-${user?.address}`}
      title={`${isSigner ? 'Remove' : 'Update'} ${userLabel || 'Council Member'}`}
    >
      <div className='flex flex-col gap-6'>
        <MemberAvatar member={user} stack />

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <RadioBox
              name='reason'
              label={`Why are you ${isSigner ? 'removing' : 'updating'} this ${userLabel || 'Council Member'}?`}
              options={reasonOptions}
              localForm={form}
            />

            <div className='mt-8'>
              <div className='flex justify-end'>
                <Button
                  type='submit'
                  rounded='full'
                  variant={isSigner ? 'destructive' : 'default'}
                  disabled={formPending}
                >
                  {isSigner ? (formPending ? 'Removing…' : 'Remove') : formPending ? 'Updating…' : 'Update'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </Modal>
  );
}

export { RemoveUserModal };
