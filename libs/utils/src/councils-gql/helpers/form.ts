import { councilsGraphqlClient } from '../client';
import { CREATE_COUNCIL, CREATE_ORGANIZATION, UPDATE_COUNCIL_FORM } from '../mutations';

export const addCouncilForForm = async ({
  chainId,
  organizationId,
  hsgAddress,
  treeId,
  membersSelectionModule,
  membersCriteriaModule,
  deployed,
}: {
  chainId: number;
  organizationId: string | undefined;
  hsgAddress: string | undefined;
  treeId: number | undefined;
  membersSelectionModule: string | undefined;
  membersCriteriaModule: string | undefined;
  deployed: boolean;
}) => {
  if (!organizationId) throw new Error('Organization ID is required');
  if (!hsgAddress) throw new Error('HSG address is required');
  if (!treeId) throw new Error('Tree ID is required');

  return councilsGraphqlClient.request(CREATE_COUNCIL, {
    chainId,
    organizationId,
    hsg: hsgAddress,
    treeId,
    membersSelectionModule,
    membersCriteriaModule,
    deployed,
  });
};

export const createOrganization = async ({ name }: { name: string }) => {
  return councilsGraphqlClient.request(CREATE_ORGANIZATION, { name });
};

export const updateCouncilForm = async ({
  draftId,
  councilId,
}: {
  draftId: string | undefined;
  councilId: string | undefined;
}) => {
  if (!draftId) throw new Error('Draft ID is required');
  if (!councilId) throw new Error('Council ID is required');

  return councilsGraphqlClient.request(UPDATE_COUNCIL_FORM, { id: draftId, councilId });
};
