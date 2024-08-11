import { AUTHORITY_TYPES } from '@hatsprotocol/constants';
import { HsgMetadata, HsgType } from '@hatsprotocol/hsg-sdk';
import { filter, find, includes, map, size, toNumber } from 'lodash';
import {
  Authority,
  HatSignerGate,
  HSGConfig,
  ModuleFunction,
  SupportedChains,
} from 'types';
import { Hex } from 'viem';

export const populateHatsGatesAuthorities = ({
  details,
  gates,
  role,
  chainId,
  hatId,
}: {
  details?: HatSignerGate[] | null;
  gates?: { single: HsgMetadata; multi: HsgMetadata } | null;
  role: 'hsgOwner' | 'hsgSigner';
  chainId: SupportedChains | undefined;
  hatId?: Hex;
}) => {
  if (!details || !gates || !chainId) return [];

  return details.map((gate) =>
    createHSGAuthority({ gate, role, gates, chainId, hatId }),
  );
};

const createHSGAuthority = ({
  gate,
  role,
  gates,
  chainId,
  hatId,
}: {
  gate: HatSignerGate;
  role: 'hsgOwner' | 'hsgSigner';
  gates: { single: HsgMetadata; multi: HsgMetadata };
  chainId: SupportedChains;
  hatId?: Hex;
}) => {
  const gateKey = gate.type === 'Single' ? 'single' : 'multi';
  const customRole = find(gates[gateKey].customRoles, { id: role });
  const functions =
    role === 'hsgOwner'
      ? getOwnerFunctions(gates[gateKey].writeFunctions as ModuleFunction[])
      : getSignerFunctions(gates[gateKey].writeFunctions as ModuleFunction[]);

  return {
    label: `${customRole?.name}`,
    type: AUTHORITY_TYPES.hsg,
    id: gate.id,
    hsgConfig: {
      type: (gate.type === 'Single' ? 'HSG' : 'MHSG') as HsgType,
      minThreshold: gate.minThreshold,
      targetThreshold: gate.targetThreshold,
      maxSigners: gate.maxSigners,
      ownerHat: gate.ownerHat,
      signerHats: gate.signerHats,
      safe: gate.safe,
    },
    hatId,
    chainId,
    functions,
    instanceAddress: gate.id,
  };
};

const getOwnerFunctions = (functions: ModuleFunction[]) => {
  const ownerFns = [
    'setOwnerHat',
    'removeSigner',
    'setMinThreshold',
    'setTargetThreshold',
  ];

  return filter(
    map(functions, (func: ModuleFunction) => {
      if (func.functionName === 'setMinThreshold') {
        return { ...func, primary: true };
      }
      return func;
    }),
    (func: ModuleFunction) => includes(ownerFns, func.functionName),
  );
};

const getSignerFunctions = (functions: ModuleFunction[]) => {
  const signerFns = ['claimSigner', 'removeSigner'];
  return filter(
    map(functions, (func: ModuleFunction) => {
      if (func.functionName === 'claimSigner') {
        return { ...func, primary: true };
      }
      return func;
    }),
    (func: ModuleFunction) => includes(signerFns, func.functionName),
  );
};

export const currentHsgThreshold = ({
  authority,
  hsgConfig,
  eligibleSigners,
}: {
  authority: Authority | undefined;
  hsgConfig: HSGConfig | undefined;
  eligibleSigners: Hex[] | undefined;
}) => {
  if (!hsgConfig || !eligibleSigners) return undefined;
  if (authority?.label === 'HSG Owner' || !hsgConfig)
    return 'Edit Safe multisig';
  const minThreshold = toNumber(hsgConfig?.minThreshold);
  const maxThreshold = toNumber(hsgConfig?.targetThreshold);
  const currentSigners = size(eligibleSigners);
  if (currentSigners < minThreshold) {
    return `${minThreshold}/N Safe multisig access`;
  }
  if (currentSigners > maxThreshold) {
    return `${maxThreshold}/${currentSigners} Safe multisig access`;
  }
  return `${currentSigners}/${currentSigners} Safe multisig access`;
};
