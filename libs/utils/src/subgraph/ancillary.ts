import { get, map, toLower } from 'lodash';
import { ElectionsAuthority, HatAuthorityResponse, HatElectionResponse, HatSignerGateV2, SupportedChains } from 'types';
import { Hex } from 'viem';

import { createMeshClient } from '../mesh/helpers';
import {
  getAllowlistEntriesQuery,
  getElectionAuthoritiesQuery,
  getHsgSignersQuery,
  getModuleAuthoritiesQuery,
  NETWORKS_PREFIX,
} from './mesh/queries';

export const fetchAncillaryModules = async (
  id: string,
  chainId: SupportedChains | undefined,
): Promise<HatAuthorityResponse | null> => {
  if (!id || !chainId) return null;

  try {
    const client = createMeshClient();
    const query = getModuleAuthoritiesQuery(chainId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await client.request(query, { id });

    const networkPrefix = NETWORKS_PREFIX[chainId];
    const hatAuthority = response[`${networkPrefix}_hatAuthority`];

    return hatAuthority ? { hatAuthority } : null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching ancillary modules:', error);
    return null;
  }
};

export const fetchElectionData = async (id: string, chainId: SupportedChains): Promise<ElectionsAuthority | null> => {
  if (!id) return null;

  try {
    const client = createMeshClient();
    const query = getElectionAuthoritiesQuery(chainId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await client.request(query, { id });

    const networkPrefix = NETWORKS_PREFIX[chainId];
    return response?.[`${networkPrefix}_hatsElectionEligibility`] || null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching ancillary modules:', error);
    return null;
  }
};

export const fetchHsgSigners = async ({
  hatIds,
  chainId,
}: {
  hatIds: Hex[] | undefined;
  chainId: SupportedChains | undefined;
}) => {
  if (!hatIds || !chainId) return null;

  try {
    const client = createMeshClient();
    const query = getHsgSignersQuery(chainId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await client.request(query, { ids: hatIds });

    const networkPrefix = NETWORKS_PREFIX[chainId];
    return (response?.[`${networkPrefix}_hatsSignerGateV2S`] as HatSignerGateV2[]) || null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching ancillary modules:', error);
    return null;
  }
};

export const fetchAllowlistEntries = async (address: string, chainId: SupportedChains): Promise<any | null> => {
  if (!address || !chainId) return null;

  try {
    const client = createMeshClient();
    const query = getAllowlistEntriesQuery(chainId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await client.request(query, {
      address: toLower(address),
    });

    const networkPrefix = NETWORKS_PREFIX[chainId];
    const allowlistEntries = map(get(response, `${networkPrefix}_allowListEligibilityDatas`), 'allowListEligibility');

    return allowlistEntries || null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching ancillary modules:', error);
    return null;
  }
};
