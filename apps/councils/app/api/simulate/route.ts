import { logger } from 'utils';

interface SimulationRequest {
  chainId: string;
  from: string;
  to: string;
  input: string;
  value?: string;
  gas?: string;
  gasPrice?: string;
  stateOverrides?: Record<string, any>;
}

const { TENDERLY_ACCESS_TOKEN, TENDERLY_ACCOUNT_SLUG, TENDERLY_PROJECT_SLUG } = process.env;

const TENDERLY_API_URL = `https://api.tenderly.co/api/v1/account/${TENDERLY_ACCOUNT_SLUG}/project/${TENDERLY_PROJECT_SLUG}/simulate`;

const HEADERS = { 'Content-Type': 'application/json', 'X-Access-Key': TENDERLY_ACCESS_TOKEN as string };

export async function POST(request: Request) {
  const simulationRequest: SimulationRequest = await request.json();
  const { chainId, from, to, input, gas, gasPrice, value, stateOverrides } = simulationRequest;

  const simulationConfig = {
    save: true, // save so we can link them to it in the UI
    // save_if_fails: false, // if true, reverting simulations show up in the dashboard
    simulation_type: 'quick', // full, abi or quick (full is default)
    network_id: chainId, // network to simulate on
    /* Standard EVM Transaction object */
    from,
    to,
    input,
    gas,
    gas_price: gasPrice,
    value,
    state_objects: stateOverrides,
  };

  return fetch(TENDERLY_API_URL, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(simulationConfig),
  })
    .then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        logger.error('Unknown error', error);
        return Response.json({ error }, { status: response.status });
      }

      const simulationResult = await response.json();
      return Response.json(simulationResult, { status: 200 });
    })
    .catch((error) => {
      logger.error('Simulation error:', error);
      return Response.json({ error: 'Failed to simulate transaction' }, { status: 500 });
    });
}
