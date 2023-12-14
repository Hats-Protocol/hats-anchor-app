import { useQuery } from '@tanstack/react-query';
import { fetchAncillaryModules } from 'app-utils';
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

  const populatedHatAuthorities = populateHatAuthorities({
    hatAuthorities: data?.hatAuthority,
    modulesDetails,
  });

  return {
    hatAuthorities: populatedHatAuthorities,
    modulesDetails,
    error,
    isLoading,
  };
};

function populateHatAuthorities({
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
            functions: matchingFunctions,
          }),
        );
      },
    );
  });

  return updatedHatAuthorities;
}

export default useAncillaryModules;
