export interface Stream {
  receiver: {
    id: string;
  };
  sender: {
    id: string;
  };
  streamedUntilUpdatedAt: string;
  currentFlowRate: string;
  token: {
    id: string;
    name: string;
    symbol: string;
    decimals: number;
  };
}
