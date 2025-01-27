'use client';

import { Module, Ruleset } from '@hatsprotocol/modules-sdk';
import { useQueryClient } from '@tanstack/react-query';
import { Modal, useOverlay } from 'contexts';
import { RadioBox } from 'forms';
import { find, flatten, forEach, get, has, map } from 'lodash';
import { useCallModuleFunction } from 'modules-hooks';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { CouncilMember, CurrentEligibility, ModuleFunction, OffchainCouncilData, SupportedChains } from 'types';
import { Button } from 'ui';
import { formatAddress, getKnownEligibilityModule, logger, sendTelegramMessage } from 'utils';
import { Hex } from 'viem';

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
  afterSuccess,
}: RemoveUserModalProps) {
  const [formPending, setFormPending] = useState(false); // TODO handle loading state
  const form = useForm<RemoveReasonFormProps>();
  const queryClient = useQueryClient();
  const { setModals } = useOverlay();
  const { handleSubmit, reset } = form;

  const { mutateAsync: callModuleFn } = useCallModuleFunction({ chainId: chainId as SupportedChains });
  const removeFunctions = removeFunctionsForModules(eligibilityRules);

  const onSubmit = async (data: any) => {
    setFormPending(true);
    const rule = find(flatten(eligibilityRules), { address: data.reason }); // TODO hardcode flatten(eligibilityRules)
    const removeFunction = rule?.address ? get(removeFunctions, rule?.address) : null;
    const removeFunctionArgs = getRemoveFunctionArgs(rule?.module, user || undefined);
    if (!rule || !removeFunction) return;

    callModuleFn({
      moduleId: rule.module.implementationAddress,
      instance: data.reason,
      func: removeFunction,
      args: removeFunctionArgs,
      onSuccess: () => {
        if (user) {
          sendTelegramMessage(
            `${userLabel} ${user.name} (${formatAddress(user.address)}) removed from council via ${rule.module.name}`,
          );
        }

        // TODO handle removing user from offchain council records

        logger.info('successfully removed user');
        setModals?.({});
        queryClient.invalidateQueries({ queryKey: ['offchainCouncilDetails'] });
        queryClient.invalidateQueries({ queryKey: ['allowlistDetails'] });
        setFormPending(false);
      },
    });
  };

  const reasonOptions = useMemo(() => {
    if (!eligibilityRules || !offchainCouncilData || !currentEligibility) return [];

    // TODO check if user is respective admin
    return map(flatten(eligibilityRules), (rule) => {
      // check if user is admin
      if (rule.address === offchainCouncilData?.membersSelectionModule) {
        const moduleEligibility = get(currentEligibility, rule.address, { eligible: false, goodStanding: false });
        return {
          label: 'No longer a council member',
          value: rule.address,
          isDisabled: !moduleEligibility.eligible || !moduleEligibility.goodStanding,
        };
      }

      // check if user is compliance admin and selected user is compliant
      if (rule.address === offchainCouncilData?.membersCriteriaModule) {
        const moduleEligibility = get(currentEligibility, rule.address, { eligible: false, goodStanding: false });
        return {
          label: 'Violated compliance',
          value: rule.address,
          isDisabled: !moduleEligibility.eligible || !moduleEligibility.goodStanding,
        };
      }

      // check if user is agreement admin and has signed the agreement
      if (getKnownEligibilityModule(rule.module.implementationAddress as Hex) === 'agreement') {
        const moduleEligibility = get(currentEligibility, rule.address, { eligible: false, goodStanding: false });
        return {
          label: 'Violated the agreement',
          value: rule.address,
          isDisabled: !moduleEligibility.eligible || !moduleEligibility.goodStanding,
        };
      }
      return { label: rule.module.name, value: rule.address };
    });
  }, [eligibilityRules, offchainCouncilData, currentEligibility]);

  useEffect(() => {
    if (!reasonOptions) return;

    reset({ reason: get(reasonOptions, '[0].value', '') as Hex });
  }, [reasonOptions, reset]);

  return (
    <Modal name={`removeUser-${type}-${user?.address}`} title={`Remove ${userLabel || 'Council Member'}`}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <RadioBox
          name='reason'
          label={`Why are you removing this ${userLabel || 'Council Member'}?`}
          options={reasonOptions}
          localForm={form}
        />

        <div className='mt-8'>
          <div className='flex justify-end'>
            <Button type='submit'>Remove</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export { RemoveUserModal };
