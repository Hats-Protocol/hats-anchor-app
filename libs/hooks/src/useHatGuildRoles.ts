import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { SupportedChains } from 'types';
import { Guild, processGuildRolesForHat } from 'utils';
import { Hex } from 'viem';

const useHatGuildRoles = ({
  hatId,
  guildData,
  chainId,
  editMode = false,
}: {
  hatId: Hex | undefined;
  guildData: Guild[] | undefined;
  chainId: SupportedChains | undefined;
  editMode?: boolean;
}) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ['hatGuildRoles', guildData, hatId],
    queryFn: () => processGuildRolesForHat({ guildData, hatId }),
    enabled: !_.isEmpty(guildData) && !!hatId,
    staleTime: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });

  return {
    data,
    error,
    isLoading,
  };
};

export default useHatGuildRoles;
