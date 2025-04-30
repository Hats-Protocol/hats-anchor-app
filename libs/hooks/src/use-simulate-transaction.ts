import { HATS_V1 } from '@hatsprotocol/sdk-v1-core';
import { useCallback, useState } from 'react';

// TODO handle from at the hook?
export const useSimulateTransaction = ({
  chainId,
  callData,
  to,
}: {
  chainId: number | undefined;
  callData: string | undefined;
  to?: string | undefined;
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResponse, setSimulationResponse] = useState<unknown>(null);

  const handleSimulate = useCallback(
    async (from: string) => {
      if (!chainId || !callData) {
        // TODO toast?
        // eslint-disable-next-line no-console
        console.error('chainId or callData is undefined');
        return;
      }
      setIsSimulating(true);

      const body = JSON.stringify({
        chainId,
        from,
        to: to || HATS_V1,
        input: callData,
        gas: 8000000,
        gasPrice: 0,
        value: 0,
      });

      return fetch('/api/simulate', {
        method: 'POST',
        body,
      })
        .then((resp) => resp.json())
        .then((simulationData) => {
          setSimulationResponse(simulationData);
          setIsSimulating(false);
        })
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.error(e);
          setIsSimulating(false);
        });
    },
    [chainId, callData, to],
  );

  return { handleSimulate, isSimulating, simulationResponse };
};
