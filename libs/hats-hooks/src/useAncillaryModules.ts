import { Role, WriteFunction } from '@hatsprotocol/modules-sdk';
import { useQuery } from '@tanstack/react-query';
import { AUTHORITY_TYPES } from 'app-constants';
import { fetchAncillaryModules, formatAddress } from 'app-utils';
import {
  Authority,
  HatAuthority,
  ModuleDetails,
  SupportedChains,
} from 'hats-types';
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
  const {
    data,
    error,
    isLoading: isHatAuthoritiesLoading,
  } = useQuery({
    queryKey: ['ancillaryModules', id],
    queryFn: () => fetchAncillaryModules(id),
    enabled: !!id,
  });

  const extractModuleIds = (hatAuthorities: HatAuthority) => {
    return _.flatMap(_.values(hatAuthorities), (items: { id: Hex }[]) =>
      _.map(items, 'id'),
    );
  };

  const moduleIds = data?.hatAuthority
    ? _.uniq(extractModuleIds(data.hatAuthority))
    : [];

  const { modulesDetails, isLoading: isModulesDetailsLoading } =
    useModulesDetails({
      moduleIds,
      chainId,
    });

  if (isHatAuthoritiesLoading || isModulesDetailsLoading) {
    return {
      modulesAuthorities: [],
      error,
      isLoading: true,
    };
  }

  const modulesAuthorities = populateAndPrepareModulesAuthorities({
    hatAuthorities: data?.hatAuthority,
    modulesDetails,
  });

  return {
    modulesAuthorities,
    error,
    isLoading: false,
  };
};

function populateAndPrepareModulesAuthorities({
  hatAuthorities,
  modulesDetails,
}: {
  hatAuthorities?: HatAuthority;
  modulesDetails: ModuleDetails[];
}) {
  const updatedHatAuthorities: Authority[] = [];

  _.forEach(modulesDetails, (details: ModuleDetails) => {
    _.forEach(
      hatAuthorities,
      (authorityEntries: { id: Hex }[], authorityKey: string) => {
        const matchingRoles = _.filter(
          details.customRoles,
          (role: Role) => role.id === authorityKey,
        );
        const matchingFunctions = _.filter(
          details.writeFunctions,
          (func: WriteFunction) =>
            _.some(matchingRoles, (role: Role) =>
              _.includes(func.roles, role.id),
            ),
        );

        const transformedAuthorities = authorityEntries.map(
          (item: { id: Hex }) => {
            const role = _.head(matchingRoles);
            if (role) {
              return {
                label: `${role.name} (${formatAddress(item.id)})`,
                link: role.id,
                description: Array.isArray(details.details)
                  ? details.details.join('\n')
                  : details.details,
                type: AUTHORITY_TYPES.modules,
                id: role.id,
                functions: matchingFunctions,
                instanceAddress: item.id,
                moduleAddress: details.implementationAddress as Hex,
              };
            }
            return null;
          },
        );

        updatedHatAuthorities.push(..._.compact(transformedAuthorities));
      },
    );
  });

  return updatedHatAuthorities;
}

export default useAncillaryModules;
