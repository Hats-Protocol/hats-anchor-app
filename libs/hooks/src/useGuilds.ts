import { AUTHORITY_TYPES } from '@hatsprotocol/constants';
import { useQuery } from '@tanstack/react-query';
import { decimalId } from 'hats-utils';
import _ from 'lodash';
import { Authority } from 'types';

const fetchGuildsData = async (guilds?: string[]) => {
  if (!guilds) return [];
  const guildData = await Promise.all(
    _.map(guilds, async (guildName: string) => {
      const guildResponse = await fetch(
        `https://api.guild.xyz/v1/guild/${guildName}`,
      );
      const response = await guildResponse.json();
      return response;
    }),
  );

  return guildData;
};

type GuildPlatform = {
  id: string;
  platformId: string;
  platformGuildName: string;
  invite: string;
};

type Guild = {
  roles: Role[];
  guildPlatforms: GuildPlatform[];
  name: string;
  urlName: string;
  imageUrl: string;
};

type RolePlatform = {
  guildPlatformId: string;
};

type Role = {
  requirements: Requirement[];
  description: string;
  rolePlatforms: RolePlatform[];
};

type Requirement = {
  data: {
    id: string;
  };
};

// TODO pass guildData in from SelectedFormContext after calculating on TreePage

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

  const selectedHatGuildRoles: Authority[] = _.flatMap(
    guildData,
    (guild: Guild) => {
      return _.flatMap(
        _.filter(guild.roles, (role: Role) =>
          _.some(
            role.requirements,
            (req: Requirement) => req.data?.id === decimalId(hatId),
          ),
        ),
        (role: Role) => {
          return role.rolePlatforms.map((rolePlatform: RolePlatform) => {
            const platform = _.find(guild.guildPlatforms, {
              id: rolePlatform.guildPlatformId,
            });
            // we index manual details against link/`invite`, so don't return if that is missing
            // an invite might be invalid if the platform connection has expired but not been removed
            if (!platform?.invite) return null;

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
    },
  ) as unknown[] as Authority[];

  return {
    selectedHatGuildRoles: _.compact(selectedHatGuildRoles),
    error,
    isLoading,
  };
};

export default useHatGuilds;
