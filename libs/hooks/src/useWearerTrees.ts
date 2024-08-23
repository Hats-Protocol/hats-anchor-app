import { useQuery } from "@tanstack/react-query";
import { fetchWearerTrees } from "utils";
import { Hex } from "viem";

const useWearerTrees = ({ chainId, wearer, enabled }: UseWearerTreesProps) => {

  return useQuery({
    queryKey: ['wearerTrees', { chainId, wearer }],
    queryFn: () => fetchWearerTrees({ chainId, wearer }),
    enabled,
  })
}

interface UseWearerTreesProps {
  chainId: number | undefined;
  wearer: Hex | undefined;
  enabled: boolean;
}

export default useWearerTrees;
