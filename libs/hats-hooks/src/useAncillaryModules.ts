import { useQuery } from '@tanstack/react-query';
import { AUTHORITY_TYPES } from 'app-constants';
import { fetchAncillaryModules, formatAddress } from 'app-utils';
import { HatAuthority, ModuleDetails, SupportedChains } from 'hats-types';
import _ from 'lodash';
import { Hex } from 'viem';

import useModulesDetails from './useModulesDetails';

const useAncillaryModules = ({
  id,
  chainId,
}: {
  id?: string;
  chainId: SupportedChains;
}) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ['ancillaryModules', id],
    queryFn: () => fetchAncillaryModules(id),
    enabled: !!id,
  });

  const extractModuleIds = (hatAuthorities: HatAuthority) => {
    return _.flatMap(_.values(hatAuthorities), (items: { id: Hex }[]) =>
      items.map((item) => item.id),
    );
  };

  const moduleIds = data?.hatAuthority
    ? _.uniq(extractModuleIds(data.hatAuthority))
    : [];

  const { modulesDetails } = useModulesDetails({
    moduleIds,
    chainId,
  });

  const populatedModulesAuthorities = populateModulesAuthorities({
    hatAuthorities: data?.hatAuthority,
    modulesDetails,
  });

  const modulesAuthorities = prepareModuleAuthorities(
    populatedModulesAuthorities,
  );

  return {
    modulesAuthorities,
    error,
    isLoading,
  };
};

function populateModulesAuthorities({
  hatAuthorities,
  modulesDetails,
}: {
  hatAuthorities?: HatAuthority;
  modulesDetails: ModuleDetails[];
}) {
  const updatedHatAuthorities: { [key: string]: any } =
    _.cloneDeep(hatAuthorities) || {};

  _.forEach(modulesDetails, (details: ModuleDetails) => {
    _.forEach(
      updatedHatAuthorities,
      (authorityEntries: { id: Hex }[], authorityKey: string) => {
        const matchingRoles = _.filter(
          details.customRoles,
          (role: any) => role.id === authorityKey,
        );

        const matchingFunctions = _.filter(
          details.writeFunctions,
          (func: any) =>
            _.some(matchingRoles, (role: any) =>
              _.includes(func.roles, role.id),
            ),
        );

        updatedHatAuthorities[authorityKey] = _.map(
          authorityEntries,
          (item: any) => ({
            ...item,
            ..._.head(matchingRoles),
            details: details.details,
            functions: matchingFunctions,
            instanceAddress: item.id,
          }),
        );
      },
    );
  });

  return updatedHatAuthorities;
}

function prepareModuleAuthorities(auths: { [key: string]: any }) {
  return _.flatMap(auths, (authorities: any) =>
    authorities.map((authority: any) => ({
      label: `${authority.name} (${formatAddress(authority.instanceAddress)})`,
      link: authority.id,
      description: Array.isArray(authority.details)
        ? authority.details.join('\n')
        : authority.details,
      type: AUTHORITY_TYPES.modules,
      id: authority.id,
      functions: authority.functions,
      instanceAddress: authority.instanceAddress,
    })),
  );
}

export default useAncillaryModules;
