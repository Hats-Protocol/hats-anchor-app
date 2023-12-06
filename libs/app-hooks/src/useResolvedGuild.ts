import { useEffect, useState } from 'react';

import useDebounce from './useDebounce';

const useResolveGuild = ({ guildName }: { guildName: string }) => {
  const [isResolved, setIsResolved] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // new isLoading state
  const debouncedGuildName = useDebounce(guildName, 500);

  useEffect(() => {
    const fetchGuild = async () => {
      setIsLoading(true); // start loading when the request is being sent
      try {
        const response = await fetch(
          `https://api.guild.xyz/v1/guild/${debouncedGuildName}`,
        );
        const guildData = await response.json();

        if (guildData && !guildData?.errors) {
          setIsResolved(true);
        } else {
          setIsResolved(false);
        }
      } catch (error) {
        setIsResolved(false);
      }
      setIsLoading(false); // end loading after the request is complete
    };

    // Only fetch guild when guildName is not empty
    if (debouncedGuildName) {
      fetchGuild();
    } else {
      setIsResolved(false);
    }
  }, [debouncedGuildName]);

  return { isResolved, isLoading };
};

export default useResolveGuild;
