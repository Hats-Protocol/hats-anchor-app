import { first, get } from 'lodash';

import { logger } from '../logs';
import { NETWORKS_PREFIX } from '../subgraph';
import { Chain } from './zeus';
const MESH_API_URL = process.env.NEXT_PUBLIC_MESH_API;
if (!MESH_API_URL) {
  throw new Error('NEXT_PUBLIC_MESH_API is not set');
}

// Create a Chain client instance with the endpoint
const chain = Chain(`${MESH_API_URL}/graphql`);

/**
 * Fetch council data from Ancillary subgraph via the Mesh API
 * @param id - The Safe Address or Hat Signer Gate address of the council
 * @param chainId - The chain ID of the council
 * @returns The council data
 */
export const getCouncilData = async ({ id, chainId }: { id: string; chainId: number }) => {
  // TODO handle other chains
  logger.info('getCouncilData', { id, chainId });
  const networkPrefix = NETWORKS_PREFIX[chainId];
  // @ts-expect-error how to catch network prefix as key?
  const result = await chain('query')({
    [`${networkPrefix}_hatsSignerGateV2S` as string]: [
      // ts-expect-error subgraphError is not included in schema but expected by type
      { where: { or: [{ id }, { safe: id }] } },
      {
        signerHats: [{ first: 5 }, { id: true }],
        ownerHat: { id: true },
        safe: true,
        minThreshold: true,
        targetThreshold: true,
        id: true,
        thresholdType: true,
      },
    ],
  });
  logger.info('result', result);

  // TODO handle other chains
  return first(get(result, `${networkPrefix}_hatsSignerGateV2S`, undefined));
};

export const getHatsDetails = async ({ ids, chainId }: { ids: string[]; chainId: number }) => {
  const networkPrefix = NETWORKS_PREFIX[chainId];
  // @ts-expect-error how to catch network prefix as key?
  const result = await chain('query')({
    [`${networkPrefix}_hats`]: [
      // ts-expect-error subgraphError is not included in schema but expected by type
      { where: { id_in: ids } },
      {
        id: true,
        details: true,
        detailsMetadata: true,
        eligibility: true,
        toggle: true,
        maxSupply: true,
        wearers: [{ first: 20 }, { id: true, ensName: true, isContract: true }],
      },
    ],
  });

  return get(result, `${networkPrefix}_hats`, undefined);
};
