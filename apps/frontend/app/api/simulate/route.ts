import axios from 'axios';
import { get } from 'lodash';

const { TENDERLY_ACCOUNT_SLUG, TENDERLY_PROJECT_SLUG, TENDERLY_ACCESS_TOKEN } =
  process.env;

const HEADERS = { 'X-Access-Key': TENDERLY_ACCESS_TOKEN as string };

export async function POST(request: Request) {
  // TODO check signed in/token/role
  const { chainId, from, to, input, gas, gasPrice, value } =
    await request.json();

  const tenderlyBaseUrl = `https://api.tenderly.co/api/v1/account/${TENDERLY_ACCOUNT_SLUG}/project/${TENDERLY_PROJECT_SLUG}`;

  const tenderlySimulateUrl = `${tenderlyBaseUrl}/simulate`;

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
  };

  // simulate the transaction
  return axios
    .post(tenderlySimulateUrl, simulationConfig, { headers: HEADERS })
    .then(async (simulationData) => {
      const simulationId = get(simulationData, 'data.simulation.id');

      const tenderlyShareUrl = `${tenderlyBaseUrl}/simulations/${simulationId}/share`;

      // make the simulation shareable
      return axios
        .post(tenderlyShareUrl, {}, { headers: HEADERS })
        .then(() => {
          // check if share was successful?

          return Response.json(get(simulationData, 'data'), { status: 200 });
        })
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.log(get(e, 'response.data'));

          return Response.json(
            { error: get(e, 'response.data') },
            { status: 502 },
          );
        });
    })
    .catch((e) => {
      // TODO check error response
      // eslint-disable-next-line no-console
      console.log(get(e, 'response.data'));

      return Response.json({ error: get(e, 'response.data') }, { status: 502 });
    });
}
