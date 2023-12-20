import { HsgMetadata } from '@hatsprotocol/hsg-sdk';
import { WriteFunction } from '@hatsprotocol/modules-sdk';
import { useQuery } from '@tanstack/react-query';
import { AUTHORITY_TYPES } from 'app-constants';
import { fetchHatsSignerGates, formatAddress } from 'app-utils';
import { HatSignerGate, SupportedChains } from 'hats-types';
import _ from 'lodash';
import { Hex } from 'viem';

import useHatsSignerGatesMetadata from './useHatsSignerGatesMetadata';

const useHatsSignerGatesDetails = ({
  hsgOwnerIds,
  hsgSignerIds,
  chainId,
}: {
  hsgOwnerIds: Hex[];
  hsgSignerIds: Hex[];
  chainId: SupportedChains | undefined;
}) => {
  const { gates } = useHatsSignerGatesMetadata({ chainId });

  const {
    data: hatsOwnerGates,
    error: hatsOwnerGatesError,
    isLoading: isLoadingHatsOwnerGates,
  } = useQuery({
    queryKey: ['hatsOwnerGates', hsgOwnerIds],
    queryFn: () => fetchHatsSignerGates(hsgOwnerIds),
  });

  const {
    data: hatsSignerGates,
    error: errorHatsSignerGates,
    isLoading: isLoadingHatsSignerGates,
  } = useQuery({
    queryKey: ['hatsSignerGates', hsgSignerIds],
    queryFn: () => fetchHatsSignerGates(hsgSignerIds),
  });

  const hatsOwnerGatesAuthorities = populateHatsGatesAuthorities({
    details: hatsOwnerGates,
    gates,
    role: 'hsgOwner',
  });

  const hatsSignerGatesAuthorities = populateHatsGatesAuthorities({
    details: hatsSignerGates,
    gates,
    role: 'hsgSigner',
  });

  return {
    hatsOwnerGates: hatsOwnerGatesAuthorities,
    hatsSignerGates: hatsSignerGatesAuthorities,
    error: hatsOwnerGatesError || errorHatsSignerGates,
    isLoading: isLoadingHatsOwnerGates || isLoadingHatsSignerGates,
  };
};

// could be refactored to be more dry
const populateHatsGatesAuthorities = ({
  details,
  gates,
  role,
}: {
  details?: HatSignerGate[] | null;
  gates?: { single: HsgMetadata; multi: HsgMetadata } | null;
  role: 'hsgOwner' | 'hsgSigner';
}) => {
  if (!details || !gates) return [];
  const singleGates = _.filter(
    details,
    (gate: HatSignerGate) => gate.type === 'Single',
  );

  const multiGates = _.filter(
    details,
    (gate: HatSignerGate) => gate.type === 'Multi',
  );

  const ownerFunctions = _.map(
    gates.single.writeFunctions,
    (func: WriteFunction) => {
      if (func.functionName === 'setMinThreshold') {
        return { ...func, primary: true };
      }
      return func;
    },
  ).filter((func: WriteFunction) =>
    [
      'setOwnerHat',
      'removeSigner',
      'setMinThreshold',
      'setTargetThreshold',
    ].includes(func.functionName),
  );

  const signerFunctions = _.map(
    gates.multi.writeFunctions,
    (func: WriteFunction) => {
      if (func.functionName === 'claimSigner') {
        return { ...func, primary: true };
      }
      return func;
    },
  ).filter((func: WriteFunction) =>
    ['claimSigner', 'removeSigner'].includes(func.functionName),
  );

  const singleGatesAuthorities = _.map(singleGates, (gate: HatSignerGate) => {
    const customRole = _.find(gates.single.customRoles, { id: role });
    const functions = role === 'hsgOwner' ? ownerFunctions : signerFunctions;

    return {
      label: `${customRole?.name} (${formatAddress(gate.id)})`,
      type: AUTHORITY_TYPES.hsg,
      id: gate.id,
      functions,
      description: generateGateDescription(gate),
      insanceAddress: gate.id,
      hgsType: 'HSG',
    };
  });

  const multiGatesAuthorities = _.map(multiGates, (gate: HatSignerGate) => {
    const customRole = _.find(gates.multi.customRoles, { id: role });
    const functions = role === 'hsgOwner' ? ownerFunctions : signerFunctions;

    return {
      label: `${customRole?.name} (${formatAddress(gate.id)})`,
      type: AUTHORITY_TYPES.hsg,
      id: gate.id,
      functions,
      description: generateGateDescription(gate),
      insanceAddress: gate.id,
      hgsType: 'MHSG',
    };
  });

  return [...singleGatesAuthorities, ...multiGatesAuthorities];
};

function generateGateDescription(gate: HatSignerGate) {
  const { safe, minThreshold, targetThreshold, maxSigners } = gate;

  const formattedSafe = formatAddress(safe);
  const formattedGate = formatAddress(gate.id);

  let description = `Wearers of this hat are able to claim signing authority on the Safe at ${formattedSafe} via the attached HatsSignerGate (located at ${formattedGate}).\n\n`;

  description += `Based on the configuration of the HatsSignerGate, this Safe:\n\n`;
  description += `Requires a minimum of ${minThreshold} signers to execute a transaction\n\n`;
  description += `Can have a maximum of ${maxSigners} signers\n\n`;
  description += `Will require ${targetThreshold} signatures to execute a transaction when the number of signers is ${targetThreshold} or more\n\n`;

  // description += `The owner of the HatsSignerGate is Hat ID 2.3 in this tree.`;

  return description;
}

export default useHatsSignerGatesDetails;
