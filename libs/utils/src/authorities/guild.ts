import { AUTHORITY_TYPES } from '@hatsprotocol/constants';
import { hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { Authority } from 'types';
import { Hex } from 'viem';

export const fetchGuildsData = async (guilds?: string[]) => {
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

export const processGuildRolesForHat = ({
  guildData,
  hatId,
}: {
  guildData: Guild[] | undefined;
  hatId: Hex | undefined;
}): Authority[] | undefined => {
  if (!guildData || _.isEmpty(guildData) || !hatId) return [];
  // console.log('processGuildRolesForHat', guildData, hatId);

  return _.flatMap(guildData, (guild: Guild) => {
    return _.flatMap(
      _.filter(guild.roles, (role: Role) =>
        _.some(
          role.requirements,
          (req: Requirement) =>
            req.data?.id === _.toString(hatIdHexToDecimal(hatId)), // TODO might need to handle alternate ID matching
        ),
      ),
      (role: Role) => {
        return _.compact(
          _.map(role.rolePlatforms, (rolePlatform: RolePlatform) => {
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
              // imageUrl: guild.imageUrl, // IMAGE BEING RETURNED FOR GUILD
              type: AUTHORITY_TYPES.gate,
            } as Authority;
          }),
        );
      },
    );
  }) as Authority[];
};

export type GuildPlatform = {
  id: string;
  platformId: string;
  platformGuildName: string;
  invite: string;
};

export type Guild = {
  roles: Role[];
  guildPlatforms: GuildPlatform[];
  name: string;
  urlName: string;
  imageUrl: string;
};

export type RolePlatform = {
  guildPlatformId: string;
};

export type Role = {
  requirements: Requirement[];
  description: string;
  rolePlatforms: RolePlatform[];
};

export type Requirement = {
  data: {
    id: string;
  };
};
