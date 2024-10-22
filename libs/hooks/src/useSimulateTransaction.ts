import { CONFIG } from '@hatsprotocol/constants';
import { useCallback, useState } from 'react';

export const useSimulateTransaction = ({
  chainId,
  callData,
}: {
  chainId: number | undefined;
  callData: string | undefined;
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResponse, setSimulationResponse] = useState<any>(null);

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
        to: CONFIG.hatsAddress,
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
    [chainId, callData],
  );

  return { handleSimulate, isSimulating, simulationResponse };
};
