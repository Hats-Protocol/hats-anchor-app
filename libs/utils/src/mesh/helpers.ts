import { GraphQLClient } from 'graphql-request';
import { first, get } from 'lodash';

import { NETWORKS_PREFIX } from '../subgraph/mesh/queries/';
import { Chain } from './zeus';
export const getMeshApiUrl = () => {
  const MESH_API_URL = process.env.NEXT_PUBLIC_MESH_API;
  if (!MESH_API_URL && typeof window !== 'undefined') {
    throw new Error('NEXT_PUBLIC_MESH_API is not set');
  }
  return MESH_API_URL;
};

export const createMeshClient = () => {
  return new GraphQLClient(`${getMeshApiUrl()}/graphql` as string);
};

// Create a Chain client instance with the endpoint
const getChain = () => {
  const MESH_API_URL = getMeshApiUrl();
  if (!MESH_API_URL) {
    throw new Error('NEXT_PUBLIC_MESH_API is not set');
  }
  return Chain(`${MESH_API_URL}/graphql`);
};

/**
 * Fetch council data from Ancillary subgraph via the Mesh API
 * @param id - The Safe Address or Hat Signer Gate address of the council
 * @param chainId - The chain ID of the council
 * @returns The council data
 */
export const getCouncilData = async ({ id, chainId }: { id: string; chainId: number }) => {
  if (!id || !chainId) return Promise.resolve(null);
  const networkPrefix = NETWORKS_PREFIX[chainId];
  // @ts-expect-error how to catch network prefix as key?
  return getChain()('query')({
    [`${networkPrefix}_hatsSignerGateV2S` as string]: [
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
  })
    .then((result) => {
      return Promise.resolve(first(get(result, `${networkPrefix}_hatsSignerGateV2S`, null)) || null);
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      return Promise.resolve(null);
    });
};

export const getHatsDetails = async ({ ids, chainId }: { ids: string[]; chainId: number }) => {
  const networkPrefix = NETWORKS_PREFIX[chainId];
  // @ts-expect-error how to catch network prefix as key?
  const result = await getChain()('query')({
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
