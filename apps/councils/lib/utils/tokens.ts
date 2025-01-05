export interface TokenInfo {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
}

export interface ChainTokens {
  [chainId: number]: TokenInfo[];
}

export const CHAIN_TOKENS: ChainTokens = {
  10: [
    {
      chainId: 10,
      address: '0xd3594E879B358F430E20F82bea61e83562d49D48',
      symbol: 'PSP',
      name: 'ParaSwap',
      decimals: 18,
      logoURI: 'ipfs://QmXdG7bQvRfiXLWS6wRReoe3CxEY6WhZZa2nsv6kQXg3xH',
    },
    {
      chainId: 10,
      address: '0xcB59a0A753fDB7491d5F3D794316F1adE197B21E',
      symbol: 'TUSD',
      name: 'TrueUSD',
      decimals: 18,
      logoURI: 'ipfs://QmdcuKBFVn8KEoN6QW7mmGgd38dtF4aL6qTGTqMiDeQfRz',
    },
  ],
  1: [
    {
      chainId: 1,
      address: '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB',
      symbol: 'COW',
      name: 'CoW Protocol Token',
      decimals: 18,
      logoURI: 'ipfs://QmRPWRx47t4ZD1dwQicjnP1njk8b91q6ApxcP755N7dbEY',
    },
    {
      chainId: 1,
      address: '0xe541504417670FB76b612B41B4392d967a1956c7',
      symbol: 'BSC',
      name: 'Bitsonic',
      decimals: 18,
      logoURI: 'ipfs://QmScXyiSaTNqCJXbCHmgGRN1vw99Rob5pHbRosCs2FtBVr',
    },
  ],
  42161: [
    {
      chainId: 42161,
      address: '0x82e3A8F066a6989666b031d916c43672085b1582',
      symbol: 'YFI',
      name: 'yearn.finance',
      decimals: 18,
      logoURI: 'ipfs://QmRQq6tqSDu6pvZPmYHhZsF9dvUqzudAnfn6cKPurWzQbF',
    },
    {
      chainId: 42161,
      address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      logoURI: 'ipfs://QmWbGfqePP3uAvPNHdYSP69aDznHGknsypTPRaiJT9NZF8',
    },
  ],
  100: [
    {
      chainId: 100,
      address: '0x7838796B6802B18D7Ef58fc8B757705D6c9d12b3',
      symbol: 'MANA',
      name: 'Decentraland',
      decimals: 18,
      logoURI: 'ipfs://QmegBB4rahDngvjwbTuoKwz1k4tLkRF78NtLtPPPziV5u9',
    },
    {
      chainId: 100,
      address: '0x177127622c4A00F3d409B75571e12cB3c8973d3c',
      symbol: 'COW',
      name: 'CoW Protocol',
      decimals: 18,
      logoURI: 'ipfs://QmTD982XV5pRnKeJPCpb5aAhBykEn9JB32t6VPNNAJuxkX',
    },
  ],
  8453: [
    {
      chainId: 8453,
      address: '0x78a087d713Be963Bf307b18F2Ff8122EF9A63ae9',
      symbol: 'BSWAP',
      name: 'BaseSwap',
      decimals: 18,
      logoURI: 'ipfs://QmaHZa1Zr7Rk8PYvKr3AqGH4G7i3iRNYEMgKnXtZDPdgh6',
    },
    {
      chainId: 8453,
      address: '0x22e6966B799c4D5B13BE962E1D117b56327FDa66',
      symbol: 'SNX',
      name: 'Synthetix Network',
      decimals: 18,
      logoURI: 'ipfs://QmX3ov1SgUvUJ64HuEn19RsDkVE91zbUuaCfozReqbbMx5',
    },
  ],
  137: [
    {
      chainId: 137,
      address: '0x6f8a06447Ff6FcF75d803135a7de15CE88C1d4ec',
      symbol: 'SHIB',
      name: 'Shiba Inu',
      decimals: 18,
      logoURI: 'ipfs://QmXqUo2jJkGMw5CTfqX6VCwErykY2LY8JGHzXscEZLH68j',
    },
    {
      chainId: 137,
      address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      decimals: 8,
      logoURI: 'ipfs://QmShKNVRby1WZeyFyhjpiBkby8LLFDGH7equKUVMfjm3mp',
    },
  ],
  42220: [
    {
      chainId: 42220,
      address: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',
      symbol: 'USDC',
      name: 'USDC',
      decimals: 6,
      logoURI: 'ipfs://QmS7rV584ATvEk5Skugr78GyAEFBuEo5eMp2rDNRCRNSmr',
    },
    {
      chainId: 42220,
      address: '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A',
      symbol: 'G$',
      name: 'GoodDollar',
      decimals: 18,
      logoURI: 'ipfs://Qme79FTB61xZNVHvcbmCr3MjazgLEtvHpGVUAkZgeDej71',
    },
  ],
};

export function getChainTokens(chainId: number): TokenInfo[] {
  return CHAIN_TOKENS[chainId] || [];
}
