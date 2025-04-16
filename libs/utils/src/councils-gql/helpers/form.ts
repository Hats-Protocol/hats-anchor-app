import { logger } from '../../logs';
import { getCouncilsGraphqlClient } from '../client';
import { CREATE_COUNCIL, CREATE_ORGANIZATION, UPDATE_COUNCIL_FORM } from '../mutations';
import { ORGANIZATION_BY_NAME_QUERY, ORGANIZATIONS_QUERY } from '../queries';

export const addCouncilForForm = async ({
  chainId,
  organizationId,
  hsgAddress,
  treeId,
  membersSelectionModule,
  membersCriteriaModule,
  deployed,
  accessToken,
}: {
  chainId: number;
  organizationId: string | undefined;
  hsgAddress: string | undefined;
  treeId: number | undefined;
  membersSelectionModule: string | undefined;
  membersCriteriaModule: string | undefined;
  deployed: boolean;
  accessToken: string | null;
}) => {
  if (!organizationId) throw new Error('Organization ID is required');
  if (!hsgAddress) throw new Error('HSG address is required');
  if (!treeId) throw new Error('Tree ID is required');

  return getCouncilsGraphqlClient(accessToken ?? undefined).request(CREATE_COUNCIL, {
    chainId,
    organizationId,
    hsg: hsgAddress,
    treeId,
    membersSelectionModule,
    membersCriteriaModule,
    deployed,
  });
};

export const createOrganization = async ({ name, accessToken }: { name: string; accessToken: string | null }) => {
  return getCouncilsGraphqlClient(accessToken ?? undefined).request(CREATE_ORGANIZATION, { name });
};

export const updateCouncilForm = async ({
  draftId,
  councilId,
  accessToken,
}: {
  draftId: string | undefined;
  councilId: string | undefined;
  accessToken: string | null;
}) => {
  if (!draftId) throw new Error('Draft ID is required');
  if (!councilId) throw new Error('Council ID is required');

  return getCouncilsGraphqlClient(accessToken ?? undefined).request(UPDATE_COUNCIL_FORM, { id: draftId, councilId });
};

export const getOrganizationByName = async ({ name, accessToken }: { name: string; accessToken: string | null }) => {
  return getCouncilsGraphqlClient(accessToken ?? undefined).request(ORGANIZATION_BY_NAME_QUERY, { name });
};

export const getOrganizations = async ({ accessToken }: { accessToken: string | null }) => {
  return getCouncilsGraphqlClient(accessToken ?? undefined).request(ORGANIZATIONS_QUERY);
};
