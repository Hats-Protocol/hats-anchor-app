import { map } from 'lodash';
import { ModuleDetails, SupportedChains } from 'types';
import { createHatsModulesClient } from 'utils';

const ROLE_LABELS: { [key: string]: string } = {
  agreementOwner: 'Manage agreement',
  agreementArbitrator: 'Arbitrate agreement adherence',

  allowListOwner: 'Modify allowlist',
  allowListArbitrator: 'Remove from allowlist',

  electionsAdmin: 'Set election terms',
  electionsBallotBox: 'Submit & recall election results',

  jokeraceAdmin: 'Set election terms',

  stakingJudge: 'Slash stakes',
  stakingRecipient: 'Withdraw slashed stakes',
  stakingAdmin: 'Set staking terms', // ADMIN_HAT
};

export const fetchModulesParameters = async (
  modules: ModuleDetails[] | undefined,
  chainId: SupportedChains | undefined,
): Promise<ModuleDetails[]> => {
  if (!modules || !chainId) return [];

  const modulesClient = await createHatsModulesClient(chainId);

  const promises = map(modules, (m) => {
    return modulesClient?.getInstanceParameters(m.id);
  });

  const moduleParameters = await Promise.all(promises);

  return Promise.resolve(
    map(modules, (m, i) => ({
      ...m,
      customRoles: map(m.customRoles, (r) => ({
        ...r,
        label: ROLE_LABELS[r.id],
      })),
      liveParameters: moduleParameters[i],
    })),
  );
};
