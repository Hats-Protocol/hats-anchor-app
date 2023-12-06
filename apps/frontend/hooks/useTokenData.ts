import _ from 'lodash';
import { erc20ABI, useContractReads } from 'wagmi';

const useTokenData = (tokenAddress) => {
  const { data: tokenData } = useContractReads({
    contracts: [
      {
        abi: erc20ABI,
        address: tokenAddress,
        functionName: 'name',
      },
      { abi: erc20ABI, address: tokenAddress, functionName: 'decimals' },
      { abi: erc20ABI, address: tokenAddress, functionName: 'symbol' },
    ],
    enabled: !!tokenAddress,
  });

  return {
    tokenName: _.get(tokenData, '[0].result'),
    tokenDecimals: _.get(tokenData, '[1].result'),
    tokenSymbol: _.get(tokenData, '[2].result'),
  };
};

export default useTokenData;
