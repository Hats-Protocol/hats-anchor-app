import { first, get } from 'lodash';

import { Chain } from './zeus';

const MESH_API_URL = process.env.NEXT_PUBLIC_MESH_API;
if (!MESH_API_URL) {
  throw new Error('NEXT_PUBLIC_MESH_API is not set');
}

// Create a Chain client instance with the endpoint
const chain = Chain(`${MESH_API_URL}/graphql`);

// TODO lookup by hsg or safe address
export const getCouncilData = async ({ id }: { id: string }) => {
  const result = await chain('query')({
    Sep_hatsSignerGates: [
      // @ts-expect-error subgraphError is not included in schema but expected by type
      { where: { id } }, // or safe address
      {
        signerHats: [{ first: 5 }, { id: true }],
        ownerHat: { id: true },
        safe: true,
        minThreshold: true,
        targetThreshold: true,
        maxSigners: true,
      },
    ],
  });

  // TODO handle other chains
  return first(get(result, 'Sep_hatsSignerGates', undefined));
};

export const getHatsDetails = async ({ ids }: { ids: string[] }) => {
  const result = await chain('query')({
    Sep_hats: [
      // @ts-expect-error subgraphError is not included in schema but expected by type
      { where: { id_in: ids } },
      {
        id: true,
        details: true,
        detailsMetadata: true,
        wearers: [{ first: 10 }, { id: true, ensName: true, isContract: true }],
      },
    ],
  });

  return get(result, 'Sep_hats', undefined);
};
