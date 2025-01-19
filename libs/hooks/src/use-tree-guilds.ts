import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { AppHat, SupportedChains } from 'types';
import { fetchGuildsData } from 'utils';

const getGuilds = (orgChartTree: AppHat[] | null | undefined) => {
  return _.compact(_.flatten(_.map(orgChartTree, 'detailsObject.data.guilds')));
};

const useTreeGuilds = ({
  orgChartTree,
  editMode = false,
}: {
  orgChartTree: AppHat[] | null | undefined;
  chainId?: SupportedChains;
  editMode: boolean;
}) => {
  const guilds = getGuilds(orgChartTree);

  return useQuery({
    queryKey: ['treeGuilds', guilds],
    queryFn: () => fetchGuildsData(guilds),
    enabled: !_.isEmpty(guilds),
    staleTime: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });
};

export { useTreeGuilds };
