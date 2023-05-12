import { useEffect, useState } from 'react';
import _ from 'lodash';
import {
  pinJson,
  searchGuild,
  deleteGuild as deleteAssociatedGuild,
} from '../lib/ipfs';

const useHatGuild = ({ chainId, treeId }) => {
  const [guildNames, setGuildNames] = useState([]);
  const [guildsData, setGuildsData] = useState([]);

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

  // https://api.guild.xyz/v1/guild/{guildName}

  const fetchGuilds = async () => {
    try {
      const names = await fetchGuildNames();

      const data = await Promise.all(
        _.map(names, async (guildName) => {
          const guildResponse = await fetch(
            `https://api.guild.xyz/v1/guild/${guildName}`,
          );
          const guildData = await guildResponse.json();

          return guildData;
        }),
      );

      setGuildsData(data);
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

  useEffect(() => {
    fetchGuilds();
  }, []);

  return {
    guildNames,
    saveGuild,
    deleteGuild,
    guildsData,
  };
};

export default useHatGuild;
