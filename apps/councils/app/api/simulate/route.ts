interface SimulationRequest {
  networkId: string;
  from: string;
  to: string;
  input: string;
  value?: string;
  gasPrice?: string;
  stateOverrides?: Record<string, any>;
}

const { TENDERLY_ACCESS_KEY, TENDERLY_ACCOUNT_SLUG, TENDERLY_PROJECT_SLUG } = process.env;

const TENDERLY_API_URL = `https://api.tenderly.co/api/v1/account/${TENDERLY_ACCOUNT_SLUG}/project/${TENDERLY_PROJECT_SLUG}/simulate`;

export async function POST(request: Request) {
  try {
    const simulationRequest: SimulationRequest = await request.json();

    const response = await fetch(TENDERLY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': TENDERLY_ACCESS_KEY as string,
      },
      body: JSON.stringify({
        /* Tenderly expected parameters */
        network_id: simulationRequest.networkId,
        from: simulationRequest.from,
        to: simulationRequest.to,
        input: simulationRequest.input,
        value: simulationRequest.value || '0',
        save: true, // Save simulation for debugging
        gas_price: simulationRequest.gasPrice,
        state_objects: simulationRequest.stateOverrides,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return Response.json({ error }, { status: response.status });
    }

    const simulationResult = await response.json();
    return Response.json(simulationResult, { status: 200 });
  } catch (error) {
    console.error('Simulation error:', error);
    return Response.json({ error: 'Failed to simulate transaction' }, { status: 500 });
  }
}
