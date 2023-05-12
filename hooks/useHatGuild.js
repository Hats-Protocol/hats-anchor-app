import { useEffect, useState } from 'react';
import _ from 'lodash';
import {
  pinJson,
  searchGuild,
  deleteGuild as deleteAssociatedGuild,
} from '../lib/ipfs';
import { decimalId } from '../lib/hats';

const useHatGuild = ({ chainId, treeId, hatId }) => {
  const [guildNames, setGuildNames] = useState([]);
  const [guildData, setGuildData] = useState([]);
  const [hatRoles, setHatRoles] = useState([]);

  const fetchGuildNames = async () => {
    try {
      const response = await searchGuild(chainId, treeId); // Replace with your desired chainId and treeId

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
      const names = await fetchGuildNames();

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
      return data;
    } catch (error) {
      console.error('Error fetching guilds:', error.message);
      return [];
    }
  };

  const saveGuild = async (guildName) => {
    try {
      await pinJson(
        { type: '1.0' },
        {
          name: `network_${chainId}_treeId_${treeId}`,
          keyvalues: { guildName },
        },
      );
      fetchGuilds();
    } catch (error) {
      console.error('Error saving guild:', error.message);
    }
  };

  const deleteGuild = async (guildName) => {
    try {
      await deleteAssociatedGuild(chainId, treeId, guildName);
      fetchGuilds();
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
  }, [guildData, hatId]);

  useEffect(() => {
    fetchGuilds();
  }, []);

  return {
    guildNames,
    saveGuild,
    deleteGuild,
    hatRoles,
  };
};

export default useHatGuild;
