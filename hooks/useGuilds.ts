import _ from 'lodash';
import { useEffect, useState } from 'react';

import { useTreeForm } from '@/contexts/TreeFormContext';
import { decimalId } from '@/lib/hats';
import { HatRole } from '@/types';

const useHatGuilds = () => {
  const { selectedHat, selectedHatDetails } = useTreeForm();

  const hatId = selectedHat?.id;
  const guilds = selectedHatDetails?.guilds;
  const [hatRoles, setHatRoles] = useState<HatRole[]>([]);

  useEffect(() => {
    const fetchAndProcessGuilds = async () => {
      try {
        const guildData = await Promise.all(
          _.map(guilds, async (guildName: string) => {
            const guildResponse = await fetch(
              `https://api.guild.xyz/v1/guild/${guildName}`,
            );
            const response = await guildResponse.json();
            return response;
          }),
        );

        const roles = _.flatMap(guildData, (guild) => {
          return _.map(
            _.filter(guild.roles, (role) =>
              _.some(
                role.requirements,
                (req) => req.data?.id === decimalId(hatId),
              ),
            ),
            (role) => ({
              role: role.name,
              guild: guild.urlName,
              requirements: _.map(role.requirements, (req) => req.data?.id),
            }),
          );
        });

        if (hatId) {
          setHatRoles(roles);
        }
      } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error('Error fetching guilds:', error.message);
      }
    };

    fetchAndProcessGuilds();
  }, [guilds, hatId]);

  return { hatRoles };
};

export default useHatGuilds;
