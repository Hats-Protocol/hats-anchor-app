import { useEffect, useState } from 'react';
import _ from 'lodash';
import {
  createGuild as saveGuildToIpfs,
  fetchGuild,
  deleteGuild as deleteAssociatedGuild,
  updateGuild as updateAssociatedGuild,
} from '../lib/ipfs';
import { decimalId } from '../lib/hats';

// currently works for only one guild per chainId/treeId
// guild.xyz plan to add support to query all the guilds you could join based on an NFT address
// we can create/update/delete a guild for the given treeId
// if one of the guild's roles is gated by the current hat's NFT, we show that in authorities tab
const useHatGuild = ({ chainId, treeId, hatId }) => {
  const [guildNames, setGuildNames] = useState([]);
  const [guildData, setGuildData] = useState([]);
  const [hatRoles, setHatRoles] = useState([]);

  const fetchGuildName = async () => {
    try {
      const response = await fetchGuild(chainId, treeId);

      const names = _.map(
        _.filter(response, (obj) => !obj.date_unpinned),
        (obj) => _.get(obj, 'metadata.keyvalues.guildName'),
      );
      setGuildNames(names);

      return names;
    } catch (error) {
      console.error('Error fetching guild names:', error.message);
      return [];
    }
  };

  const fetchGuilds = async () => {
    try {
      const names = await fetchGuildName();

      const data = await Promise.all(
        _.map(names, async (guildName) => {
          const guildResponse = await fetch(
            `https://api.guild.xyz/v1/guild/${guildName}`,
          );
          if (!guildResponse.ok) {
            throw new Error(
              `Error fetching guild data: ${guildResponse.status}`,
            );
          }
          const response = await guildResponse.json();

          return response;
        }),
      );

      setGuildData(data);
    } catch (error) {
      console.error('Error fetching guilds:', error.message);
    }
  };

  const createGuild = async (guildName) =>
    saveGuildToIpfs(chainId, treeId, guildName);

  const updateGuild = async (guildName) => {
    await updateAssociatedGuild(chainId, treeId, guildName);
    fetchGuilds();
  };

  const deleteGuild = async (guildName) => {
    try {
      await deleteAssociatedGuild(chainId, treeId, guildName);

      // optimistic update to avoid another API call
      setGuildData([]);
      setHatRoles([]);
    } catch (error) {
      console.error('Error deleting guild:', error.message);
    }
  };

  const extractRoles = (data) => {
    const extractedRoles = [];

    _.forEach(data, (guild) => {
      const { urlName, roles } = guild;

      _.forEach(roles, (role) => {
        const { name, requirements } = role;

        if (requirements && _.isArray(requirements)) {
          const requirementIds = _.map(requirements, (req) => req.data?.id);

          extractedRoles.push({
            role: name,
            guild: urlName,
            requirements: requirementIds,
          });
        }
      });
    });

    return extractedRoles;
  };

  useEffect(() => {
    if (guildData?.length > 0) {
      const extractedRoles = extractRoles(guildData);

      const rolesWithRequirement = [];

      _.forEach(extractedRoles, (role) => {
        const { requirements } = role;

        const hasMatchingRequirement = _.some(
          requirements,
          (req) => req === decimalId(hatId),
        );

        if (hasMatchingRequirement) {
          rolesWithRequirement.push(role);
        }
      });

      setHatRoles(rolesWithRequirement);
    }
  }, [guildData, guildNames, hatId]);

  useEffect(() => {
    fetchGuilds();
  }, []);

  return {
    guildNames,
    createGuild,
    deleteGuild,
    updateGuild,
    hatRoles,
  };
};

export default useHatGuild;
