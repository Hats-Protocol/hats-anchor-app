import { AUTHORITY_TYPES } from '@hatsprotocol/constants';
import { HsgMetadata, HsgType } from '@hatsprotocol/hsg-sdk';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import {
  filter,
  find,
  first,
  get,
  gt,
  includes,
  map,
  size,
  toNumber,
} from 'lodash';
import {
  AppWriteFunction,
  Authority,
  HatSignerGate,
  SupportedChains,
} from 'types';
import { explorerUrl, formatAddress } from 'utils';
import { Hex } from 'viem';

import { safeUrl } from '../authorities';
import { formHatUrl } from '../hats';

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
      ? getOwnerFunctions(gates[gateKey].writeFunctions)
      : getSignerFunctions(gates[gateKey].writeFunctions);

  return {
    label: `${customRole?.name}`,
    subLabel: formatAddress(gate.safe),
    type: AUTHORITY_TYPES.hsg,
    id: gate.id,
    hsgConfig: {
      type: (gate.type === 'Single' ? 'HSG' : 'MHSG') as HsgType,
      minThreshold: gate.minThreshold,
      targetThreshold: gate.targetThreshold,
      maxSigners: gate.maxSigners,
    },
    hatId,
    functions,
    description: generateGateDescription(gate, chainId),
    instanceAddress: gate.id,
    ownerHat: gate.ownerHat,
    signerHats: gate.signerHats,
    safe: gate.safe,
  };
};

const getOwnerFunctions = (functions: AppWriteFunction[]) => {
  const ownerFns = [
    'setOwnerHat',
    'removeSigner',
    'setMinThreshold',
    'setTargetThreshold',
  ];

  return filter(
    map(functions, (func: AppWriteFunction) => {
      if (func.functionName === 'setMinThreshold') {
        return { ...func, primary: true };
      }
      return func;
    }),
    (func: AppWriteFunction) => includes(ownerFns, func.functionName),
  );
};

const getSignerFunctions = (functions: AppWriteFunction[]) => {
  const signerFns = ['claimSigner', 'removeSigner'];
  return filter(
    map(functions, (func: AppWriteFunction) => {
      if (func.functionName === 'claimSigner') {
        return { ...func, primary: true };
      }
      return func;
    }),
    (func: AppWriteFunction) => includes(signerFns, func.functionName),
  );
};

export const generateGateDescription = (
  gate: HatSignerGate,
  chainId: SupportedChains,
) => {
  const { safe, minThreshold, targetThreshold, maxSigners } = gate;

  const formattedSafe = formatAddress(safe);
  const formattedGate = formatAddress(gate.id);

  let description =
    'Wearers of this hat are able to claim signing authority on the Safe ';
  if (gate.signerHats) {
    description =
      'Wearers of this hat are able to update the Safe configuration ';
  }
  description += `([${formattedSafe}](${safeUrl(
    chainId,
    safe,
  )})) via the attached HatsSignerGate ([${formattedGate}](${explorerUrl(
    chainId,
  )}/address/${gate.id})).\n\n`;

  description += `Based on the configuration of the HatsSignerGate, this Safe:\n\n`;
  description += `- Requires a minimum of ${minThreshold} signers to execute a transaction\n\n`;
  description += `- Can have a maximum of ${maxSigners} signers\n\n`;
  description += `- Will require ${targetThreshold} signatures to execute a transaction when the number of signers is ${targetThreshold} or more\n\n`;

  if (gate.ownerHat) {
    description += `The owner of the HatsSignerGate is [Hat #${hatIdDecimalToIp(
      BigInt(gate.ownerHat.id),
    )}](${formHatUrl({
      hatId: gate.ownerHat.id,
      chainId,
    })}) in this tree.`;
  }
  if (gate.signerHats) {
    if (gt(size(gate.signerHats), 1)) {
      description += `The signers of the HSG Safe include Hats ${map(
        gate.signerHats,
        (h: any, i: number) =>
          // [#123.1](link), [#123.2](link), and [#123.3](link).
          `${i === size(gate.signerHats) - 1 ? 'and ' : ''}[#${hatIdDecimalToIp(
            BigInt(h.id),
          )}](${formHatUrl({
            hatId: h.id,
            chainId,
          })})${i === size(gate.signerHats) - 1 ? '.' : ', '}`,
      )}`;
    } else {
      const signerHatId = get(first(gate.signerHats), 'id') as Hex;
      if (!signerHatId) return description;
      description += `The signer of the HSG safe is [Hat #${hatIdDecimalToIp(
        BigInt(signerHatId),
      )}](${formHatUrl({ hatId: signerHatId, chainId })})`;
    }
  }

  return description;
};

export const currentHsgThreshold = ({
  authority,
  hsgConfig,
  eligibleSigners,
}: {
  authority: Authority | undefined;
  hsgConfig: any;
  eligibleSigners: any[];
}) => {
  if (authority?.label === 'HSG Owner' || !hsgConfig) return undefined;
  const minThreshold = toNumber(hsgConfig?.minThreshold);
  const maxThreshold = toNumber(hsgConfig?.targetThreshold);
  const currentSigners = size(eligibleSigners);
  if (currentSigners < minThreshold) {
    return `needs ${minThreshold} signer${minThreshold > 1 ? 's' : ''}`;
  }
  if (currentSigners > maxThreshold) {
    return `${maxThreshold}/${currentSigners} signer${
      currentSigners > 1 ? 's' : ''
    }`;
  }
  return `${currentSigners}/${currentSigners} signer${
    currentSigners > 1 ? 's' : ''
  }`;
};
