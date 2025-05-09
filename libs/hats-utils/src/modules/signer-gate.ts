import { AUTHORITY_TYPES } from '@hatsprotocol/constants';
import { HsgMetadata, HsgType } from '@hatsprotocol/hsg-sdk';
import { filter, find, get, includes, map, size, toNumber } from 'lodash';
import { Authority, HatSignerGateV1, HatSignerGateV2, HSGConfig, ModuleFunction, SupportedChains } from 'types';
import { Hex } from 'viem';

export const populateHatsGatesAuthorities = ({
  details,
  gates,
  role,
  chainId,
  hatId,
}: {
  details?: HatSignerGateV1[] | HatSignerGateV2[] | null;
  gates?: { single: HsgMetadata; multi: HsgMetadata } | null;
  role: 'hsgOwner' | 'hsgSigner';
  chainId: SupportedChains | undefined;
  hatId?: Hex;
}) => {
  if (!details || !gates || !chainId) return [];

  return details.map((gate) => createHSGAuthority({ gate, role, gates, chainId, hatId }));
};

const createHSGAuthority = ({
  gate,
  role,
  gates,
  chainId,
  hatId,
}: {
  gate: HatSignerGateV1 | HatSignerGateV2;
  role: 'hsgOwner' | 'hsgSigner';
  gates: { single: HsgMetadata; multi: HsgMetadata };
  chainId: SupportedChains;
  hatId?: Hex;
}) => {
  const v2 = get(gate, 'thresholdType');
  const gateKey = get(gate, 'type') === 'Multi' ? 'multi' : 'single';
  const customRole = find(gates[gateKey].customRoles, { id: role });
  const functions =
    role === 'hsgOwner'
      ? getOwnerFunctions(gates[gateKey].writeFunctions as ModuleFunction[])
      : getSignerFunctions(gates[gateKey].writeFunctions as ModuleFunction[]);
  // const v2functions = []

  return {
    label: `${customRole?.name}`,
    type: AUTHORITY_TYPES.hsg,
    id: gate.id,
    hsgConfig: {
      version: v2 ? 2 : 1,
      type: (get(gate, 'type') === 'Multi' ? 'MHSG' : 'HSG') as HsgType,
      minThreshold: gate.minThreshold,
      targetThreshold: gate.targetThreshold,
      thresholdType: v2 ? get(gate, 'thresholdType') : undefined,
      maxSigners: v2 ? get(gate, 'maxSigners') : undefined,
      ownerHat: gate.ownerHat,
      signerHats: gate.signerHats,
      safe: gate.safe,
    },
    hatId,
    chainId,
    functions: !v2 ? functions : [],
    instanceAddress: gate.id,
  };
};

const getOwnerFunctions = (functions: ModuleFunction[]) => {
  const ownerFns = ['setOwnerHat', 'removeSigner', 'setMinThreshold', 'setTargetThreshold'];

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
  totalMaxSupply,
}: {
  authority: Authority | undefined;
  hsgConfig: HSGConfig | undefined;
  eligibleSigners: Hex[] | undefined;
  totalMaxSupply: number | undefined;
}) => {
  if (!hsgConfig || !eligibleSigners) return undefined;
  if (authority?.label === 'HSG Owner' || !hsgConfig) return 'Edit Safe multisig';
  const minThreshold = toNumber(hsgConfig?.minThreshold);
  const maxThreshold = toNumber(hsgConfig?.targetThreshold);
  const currentSigners = size(eligibleSigners);

  const safeLabel = 'Safe access';

  if (currentSigners < minThreshold) {
    return `${minThreshold}/${totalMaxSupply || 'N'} ${safeLabel}`;
  }
  if (currentSigners > maxThreshold) {
    return `${maxThreshold}/${totalMaxSupply || 'N'} ${safeLabel}`;
  }
  return `${currentSigners}/${totalMaxSupply || 'N'} ${safeLabel}`;
};
