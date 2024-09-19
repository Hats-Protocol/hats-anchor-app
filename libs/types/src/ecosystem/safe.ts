interface TokenInfo {
  address: string;
  decimals: number;
  symbol: string;
}

interface Transfer {
  tokenAddress: string;
  tokenId: string;
  tokenInfo: TokenInfo;
  amount: string;
}

export interface SafeTransaction {
  transactionHash?: string;
  txHash?: string;
  executionDate: string;
  value: string;
  transfers: Transfer[];
}
