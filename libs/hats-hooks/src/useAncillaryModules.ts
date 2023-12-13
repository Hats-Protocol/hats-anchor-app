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

  const { modulesDetails: details } = useModulesDetails({
    moduleIds,
    chainId,
  });

  console.log('data?.hatAuthority', data?.hatAuthority);
  const populatedHatAuthorities = populateHatAuthorities({
    hatAuthorities: data?.hatAuthority,
    modulesDetails: details,
  });

  return {
    hatAuthorities: populatedHatAuthorities,
    modulesDetails: details,
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
  const updatedHatAuthorities = _.cloneDeep(hatAuthorities) || {};

  _.forEach(modulesDetails, (moduleDetail: ModuleDetails) => {
    _.forEach(
      updatedHatAuthorities,
      (authorityEntries: { id: Hex }[], authorityKey: string) => {
        const matchingRoles = _.filter(
          moduleDetail.customRoles,
          (role: any) => role.id === authorityKey,
        );

        const matchingFunctions = _.filter(
          moduleDetail.writeFunctions,
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
