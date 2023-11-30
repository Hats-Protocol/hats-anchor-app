import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

import { AUTHORITY_TYPES } from '@/constants';
import { decimalId } from '@/lib/hats';
import { Authority } from '@/types';

const fetchGuildsData = async (guilds?: string[]) => {
  if (!guilds) return [];
  const guildData = await Promise.all(
    _.map(guilds, async (guildName) => {
      const guildResponse = await fetch(
        `https://api.guild.xyz/v1/guild/${guildName}`,
      );
      const response = await guildResponse.json();
      return response;
    }),
  );

  return guildData;
};

const useHatGuilds = ({
  hatId,
  guilds,
  editMode = false,
}: {
  hatId?: string;
  guilds?: string[];
  editMode?: boolean;
}) => {
  const {
    data: guildData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['hatGuilds', guilds],
    queryFn: () => (guilds ? fetchGuildsData(guilds) : []),
    enabled: !!hatId && !!guilds?.length,
    staleTime: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });

  const selectedHatGuildRoles: Authority[] = _.flatMap(guildData, (guild) => {
    return _.flatMap(
      _.filter(guild.roles, (role) =>
        _.some(role.requirements, (req) => req.data?.id === decimalId(hatId)),
      ),
      (role) => {
        return role.rolePlatforms.map((rolePlatform: any) => {
          const platform = _.find(guild.guildPlatforms, {
            id: rolePlatform.guildPlatformId,
          });
          return {
            label: platform ? platform.platformGuildName : guild.name,
            link: platform ? platform.invite : 'No invite available',
            id: platform?.platformId,
            description: role.description,
            gate: `https://guild.xyz/${guild.urlName}`,
            imageUrl: guild.imageUrl,
            type: AUTHORITY_TYPES.gate,
          };
        });
      },
    );
  });

  return { selectedHatGuildRoles, error, isLoading };
};

export default useHatGuilds;
